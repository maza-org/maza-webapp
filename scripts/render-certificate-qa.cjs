const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const { chromium } = require(process.env.MAZA_PLAYWRIGHT_PATH || 'playwright');
  const output = path.resolve(__dirname, '../.codex-tmp/certificate-verification-20261125');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 1 });
    await page.goto(require('node:url').pathToFileURL(path.join(output, 'native-certificate.html')).href);
    await page.locator('.verification svg').waitFor();
    const bounds = await page.locator('.verification').boundingBox();
    assert(bounds.x > 0 && bounds.y > 500 && bounds.y + bounds.height < 770);
    assert.equal(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
    await page.screenshot({ path: path.join(output, 'native-certificate.png'), fullPage: true });
    await page.pdf({ path: path.join(output, 'native-certificate.pdf'), printBackground: true, preferCSSPageSize: true });
    console.log('PASS: native HTML QR positioned below content, all logos loaded, PDF rendered.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
