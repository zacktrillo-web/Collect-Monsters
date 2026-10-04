// Renders each blockout next to its Roblox-part rebuild: output/roblox-check/<id>.png
// Usage: node tools/check-roblox.mjs [monster-id ...]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { monsters } from '../src/monsters/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'output', 'roblox-check');
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': file.endsWith('.html') ? 'text/html' : 'text/javascript' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[page]', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/tools/roblox-check.html`);
await page.waitForFunction(() => window.ready);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : monsters.map((m) => m.id);
for (const id of ids) {
  const [a, b] = await page.evaluate((id) => window.compare(id), id);
  await page.setContent(`<body style="margin:0;display:flex;background:#000"><img src="${a}"><img src="${b}"></body>`);
  await page.setViewportSize({ width: 1400, height: 650 });
  await page.screenshot({ path: path.join(out, `${id}.png`) });
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/roblox-check.html`);
  await page.waitForFunction(() => window.ready);
  console.log(id);
}
await browser.close();
server.close();
