const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const url = 'https://backend.mazas.org/api/certificates/verify/93b56449-0000-4000-8000-000000000001.' + 'A'.repeat(43);
function fixture(platform, browserShare) {
  const calls = [];
  const module = { exports: {} };
  const helper = { exports: {} };
  const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${compile('src/utils/certificateVerification.ts')}})`, { URL })(require, helper, helper.exports);
  const dependencies = {
    'react-native': { Platform: { OS: platform }, Alert: { alert: (...args) => calls.push(['alert', ...args]) }, Share: { share: async data => calls.push(['share', data]) } },
    'expo-clipboard': { setStringAsync: async value => calls.push(['copy', value]) },
    '../utils/certificateVerification': helper.exports,
  };
  vm.runInNewContext(`(function(require,module,exports){${compile('src/services/certificateSharing.ts')}})`, { navigator: browserShare ? { share: browserShare } : {} })(name => dependencies[name], module, module.exports);
  return { calls, share: module.exports.shareCertificateLink };
}
test('shared certificate actions copy exact URL and use platform share payloads', async () => {
  for (const platform of ['ios', 'android', 'web']) {
    const f = fixture(platform);
    const certificate = { verificationUrl: url, course: { title: 'Curso' } };
    await f.share(certificate, true);
    assert.equal(f.calls[0][1], url);
    f.calls.length = 0;
    await f.share(certificate);
    if (platform === 'web') assert.equal(f.calls[0][0], 'copy');
    else if (platform === 'ios') assert.equal(f.calls[0][1].url, url);
    else assert(f.calls[0][1].message.includes(url));
    f.calls.length = 0;
    await f.share({ verificationUrl: 'https://evil.invalid' });
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0][0], 'alert');
  }
});
test('cancelled browser share is silent and does not copy unexpectedly', async () => {
  const f = fixture('web', async () => { const error = new Error('cancelled'); error.name = 'AbortError'; throw error; });
  await f.share({ verificationUrl: url });
  assert.equal(f.calls.length, 0);
});
