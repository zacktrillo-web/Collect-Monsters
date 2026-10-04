// Renders a concept sheet + hero image for each monster.
// Usage: node tools/render.mjs [monster-id ...]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'output');
fs.mkdirSync(path.join(out, 'sheets'), { recursive: true });
fs.mkdirSync(path.join(out, 'heroes'), { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()));
page.on('pageerror', (e) => console.error('[page]', e.message));
await page.goto(`${base}/tools/sheet.html`);
await page.waitForFunction(() => window.sheetReady);

const ids = process.argv.slice(2).length ? process.argv.slice(2) : await page.evaluate(() => window.monsterIds);
for (const id of ids) {
  const started = Date.now();
  const hero = await page.evaluate((id) => window.renderSheet(id), id);
  fs.writeFileSync(path.join(out, 'heroes', `${id}.png`), Buffer.from(hero.split(',')[1], 'base64'));
  await page.locator('#sheet').screenshot({ path: path.join(out, 'sheets', `${id}.png`) });
  console.log(`${id}  ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

await browser.close();
server.close();
