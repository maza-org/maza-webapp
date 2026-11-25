const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const stage = 'https://staging-api.146.190.134.62.sslip.io';
const access = require('dotenv').parse(fs.readFileSync(path.resolve(__dirname, '../../.env.staging-access')));
const dist = path.resolve('dist');
const output = path.resolve(__dirname, '../../outputs/navigation-recovery-20261125');

(async () => {
  const response = await fetch(stage + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: access.STAGING_LEARNER_USERNAME, password: access.STAGING_PASSWORD }) });
  assert(response.ok, 'Staging login');
  const session = await response.json();
  const { chromium } = require(process.env.MAZA_PLAYWRIGHT_PATH || 'playwright');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const server = http.createServer((req, res) => {
    const file = path.resolve(dist, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(dist + path.sep)) { res.writeHead(400).end(); return; }
    const target = fs.existsSync(file) && fs.statSync(file).isFile() ? file : path.join(dist, 'index.html');
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf' };
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    fs.createReadStream(target).pipe(res);
  });
  server.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  fs.mkdirSync(output, { recursive: true });
  let checked = 0;
  const prepareContext = async (viewport, seen = true) => {
      const context = await browser.newContext({ viewport });
        await context.addInitScript(({ token, user, seen }) => {
          localStorage.setItem('maza_token', token);
          localStorage.setItem('maza_user', JSON.stringify(user));
          if (seen) localStorage.setItem(`maza_how_it_works_seen:${user.id}`, 'true');
        }, { ...session, seen });
        await context.route('**/*', async route => {
          const request = route.request();
          const url = new URL(request.url());
          if (url.pathname.startsWith('/api/')) {
            const result = await fetch(stage + url.pathname + url.search, { method: request.method(), headers: { 'Content-Type': 'application/json', ...(request.headers().authorization ? { Authorization: request.headers().authorization } : {}) }, body: ['GET', 'HEAD'].includes(request.method()) ? undefined : request.postData() });
            await route.fulfill({ status: result.status, contentType: result.headers.get('content-type') || 'application/json', body: Buffer.from(await result.arrayBuffer()) });
          } else if (url.origin === origin) await route.continue();
          else await route.abort();
        });
      return context;
  };
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const context = await prepareContext(viewport);
      try {
        const routes = ['/certificados', '/notificacoes', '/preferencias/notificacoes', '/definicoes', '/perfil/editar', '/perfil/mudar-senha', '/resultados-profissionais', '/curso/missing-course', '/oportunidades/missing-job'];
        for (const route of routes) {
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          try {
            await page.goto(origin + route);
            const menu = page.getByTestId('web-app-navigation');
            await menu.waitFor();
            await page.reload();
            await menu.waitFor();
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            if (route === '/certificados' || route === '/definicoes') await page.screenshot({ path: path.join(output, `${route.slice(1)}-${viewport.width}.png`), fullPage: true });
            if (route === '/certificados') {
              await page.getByRole('button', { name: 'Voltar', exact: true }).click();
              await page.getByText('O que quer aprender hoje?', { exact: true }).waitFor();
            } else {
              await menu.getByRole('button', { name: 'Ir para Cursos', exact: true }).click();
              await page.waitForURL(origin + '/Cursos');
            }
            await menu.waitFor({ state: 'hidden' });
            assert.deepEqual(errors, [], route);
            checked++;
          } finally { await page.close(); }
        }
        const page = await context.newPage();
        try {
          await page.goto(origin + '/Conquistas');
          await page.getByText('As Suas Conquistas e Jornadas', { exact: true }).waitFor();
          await page.reload();
          await page.getByText('As Suas Conquistas e Jornadas', { exact: true }).waitFor();
          assert.equal(await page.getByTestId('web-app-navigation').count(), 0);
          await page.goto(origin + '/Perfil');
          await page.getByText('Certificados', { exact: true }).click();
          await page.getByTestId('web-app-navigation').waitFor();
          await page.getByRole('button', { name: 'Voltar', exact: true }).click();
          await page.waitForURL(origin + '/Perfil');
          await page.getByText('Certificados', { exact: true }).click();
          await page.goBack();
          await page.waitForURL(origin + '/Perfil');
          await page.goForward();
          await page.getByTestId('web-app-navigation').waitFor();
          checked += 3;
        } finally { await page.close(); }
      } finally { await context.close(); }
      const fresh = await prepareContext(viewport, false);
      try {
        const page = await fresh.newPage();
        await page.goto(origin + '/certificados');
        await page.getByRole('button', { name: 'Voltar', exact: true }).waitFor();
        await page.reload();
        await page.getByRole('button', { name: 'Voltar', exact: true }).waitFor();
        assert.equal(new URL(page.url()).pathname, '/certificados');
        assert.equal(await page.evaluate(id => localStorage.getItem(`maza_how_it_works_seen:${id}`), session.user.id), null, 'Background Home must not open or mark the welcome story');
        checked++;
      } finally { await fresh.close(); }
    }
    console.log(`PASS: ${checked} mobile/desktop checks: cold deep links, refresh, back, global destinations, tab reload and browser back/forward; staging API only.`);
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
