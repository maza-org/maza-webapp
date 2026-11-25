const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.codex-tmp/certificate-verification-20261125');
const cache = new Map();
let generatedPdf;
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localRequire = name => {
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
    if (name === 'react-native') return { Platform: { OS: 'ios' }, Alert: { alert() {} } };
    if (name === 'expo-print' || name === 'expo-sharing') return {};
    if (name === 'jspdf') return { jsPDF: function (...args) {
      const pdf = new (require('jspdf').jsPDF)(...args);
      pdf.save = () => { generatedPdf = Buffer.from(pdf.output('arraybuffer')); };
      return pdf;
    } };
    return require(name);
  };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { console, URL, Buffer })(localRequire, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}

test('certificate links are allowlisted and QR/PDF use only the verified link', async () => {
  const helper = load('src/utils/certificateVerification.ts');
  const url = 'https://backend.mazas.org/api/certificates/verify/93b56449-0000-4000-8000-000000000001.' + 'A'.repeat(43);
  assert.equal(helper.safeVerificationUrl(url), url);
  for (const bad of ['javascript:alert(1)', 'https://evil.invalid/a', url + '?tracking=1', url.replace('https:', 'http:'), 'https://backend.mazas.org.evil.invalid/a', 'https://user@backend.mazas.org/a']) {
    assert.equal(helper.safeVerificationUrl(bad), null);
    assert.equal(helper.certificateQr(bad), null);
  }
  const data = { studentName: 'Titular de Teste', courseTitle: 'Conceitos Básicos sobre Mudanças Climáticas', instructor: 'MAZA', issuedAt: '2026-11-25T10:00:00Z', courseId: 'test', certificateId: '93b56449-0000-4000-8000-000000000001', verificationUrl: url };
  const native = load('src/utils/certificateGenerator.ts');
  const html = native.buildCertificateHTML(data);
  assert(html.includes('<svg'));
  assert(html.includes(url));
  assert(!native.buildCertificateHTML({ ...data, verificationUrl: undefined }).includes('<svg'));
  assert(native.buildCertificateHTML({ ...data, studentName: '<script>bad</script>' }).includes('&lt;script&gt;'));
  await load('src/utils/certificateGenerator.web.ts').downloadCertificatePDF(data);
  assert(generatedPdf?.subarray(0, 4).toString() === '%PDF');
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'native-certificate.html'), html);
  fs.writeFileSync(path.join(output, 'web-certificate.pdf'), generatedPdf);
  fs.writeFileSync(path.join(output, 'expected-url.txt'), url);
  await require('sharp')(Buffer.from(helper.certificateQr(url).createSvgTag({ cellSize: 8 }))).png().toFile(path.join(output, 'qr.png'));
  console.log('Synthetic PDF/HTML/QR evidence: ' + output);
});
