const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
(async () => { const srv = http.createServer((q, r) => { const p = path.join(process.cwd(), decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200); r.end(d); }); }).listen(8761);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1560 } });
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('http://localhost:8761/index.html'); await p.evaluate(() => window.prepare());
  for (const m of ['p', 't']) { const d = await p.evaluate(m => renderAt(m), m); fs.writeFileSync('reacoes_' + (m === 'p' ? 'planetinha' : 'telescopio') + '.png', Buffer.from(d.split(',')[1], 'base64')); }
  fs.mkdirSync('png', { recursive: true }); const all = await p.evaluate(() => window.ALL);
  for (const [i, n] of [[0, 'planetinha'], [1, 'telescopio']]) for (const e of all) { const d = await p.evaluate(([i, e]) => single(i, e), [i, e]); fs.writeFileSync(`png/${n}-${e}.png`, Buffer.from(d.split(',')[1], 'base64')); }
  await b.close(); srv.close(); })();
