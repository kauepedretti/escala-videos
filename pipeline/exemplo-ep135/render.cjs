const { chromium } = require('playwright');
(async()=>{
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const root = process.cwd();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); }).listen((+process.env.RPORT||8927));
const mode = process.argv[2];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', m => console.log('page:', m.text())); page.on('pageerror', e => console.log('ERR', e.message));
await page.goto('http://localhost:'+(+process.env.RPORT||8927)+'/index.html'); await page.evaluate(() => window.prepare());
if (mode === 'stills') {
  fs.mkdirSync('stills', { recursive: true });
  for (const t of process.argv.slice(3).map(Number)) { const d = await page.evaluate(t => renderAt(t), t);
    fs.writeFileSync(`stills/t${t.toFixed(2)}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
} else {
  const [a, b, name] = [Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30', name + '.tmp.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = Math.round(a * 30); f < Math.round(b * 30); f++) { const d = await page.evaluate(t => renderAt(t), f / 30);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  ff.stdin.end(); await new Promise(r => ff.on('close', c => { if (c === 0) fs.renameSync(name + '.tmp.mp4', name + '.mp4'); console.log('ffmpeg', c); r(); }));
}
await browser.close(); srv.close();
})();
