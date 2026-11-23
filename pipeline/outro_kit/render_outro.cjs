const { chromium } = require('playwright');
(async () => {
  const http = require('http'), fs = require('fs'), path = require('path'); const root = __dirname;
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
  const srv = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); }).listen(Number(process.env.OPORT || 8940));
  const [tag, dir] = [process.argv[2], process.argv[3]]; const Lp = Number(process.argv[4] || 0), lines = process.argv[5] ? process.argv[5].split('|') : []; fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } }); page.on('pageerror', e => console.log('ERR', e.message));
  await page.goto('http://localhost:' + (process.env.OPORT || 8940) + '/index.html'); await page.evaluate(() => window.prepare()); await page.evaluate(([t, l, L]) => { window.TAG = t; window.LINES = l; window.LP = L; }, [tag, lines, Lp]);
  const NF = Math.round((Lp + 4.6) * 30); for (let f = 0; f < NF; f++) { const d = await page.evaluate(v => renderAt(v), f / 30 - Lp); fs.writeFileSync(path.join(dir, String(f).padStart(3, '0') + '.png'), Buffer.from(d.split(',')[1], 'base64')); }
  await browser.close(); srv.close();
})();
