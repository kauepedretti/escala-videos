// ---------- 2D ----------
const out = document.getElementById('out'), ctx = out.getContext('2d');
const small = document.createElement('canvas'); small.width = 270; small.height = 480; const sctx = small.getContext('2d');
const blur = document.createElement('canvas'); blur.width = 270; blur.height = 480; const bctx = blur.getContext('2d');
const vig = document.createElement('canvas'); vig.width = W; vig.height = H;
{ const v = vig.getContext('2d'); const g = v.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.7)'); v.fillStyle = g; v.fillRect(0, 0, W, H); }
function proj(v) { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, ok: p.z < 1 && p.z > -1 }; }
function txt(s, x, y, { size = 40, font = 'SG', weight = 700, color = '#fff', align = 'center', alpha = 1, ls = 0, shadow = true } = {}) {
  if (alpha <= 0) return; ctx.save(); ctx.globalAlpha = alpha; ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (ls) ctx.letterSpacing = ls + 'px'; if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 22; }
  if (arguments[3] && arguments[3].stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(10,6,4,0.7)'; ctx.strokeText(s, x, y); ctx.shadowBlur = 0; }
  ctx.fillText(s, x, y); ctx.restore();
}
function ring(x, y, r, alpha, color = '#fff', lw = 3) { if (alpha <= 0) return; ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * PI); ctx.stroke(); ctx.restore(); }
function line(pts, alpha, color = '#fff', lw = 3, dash = null) {
  if (alpha <= 0 || pts.length < 2) return; ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.restore();
}
const capCache = {};
function layout(i) {
  if (capCache[i]) return capCache[i];
  const [s, e, text, hl] = P[i]; ctx.font = '700 62px SG';
  const words = text.split(' '); const lines = [[]]; let w = 0; const space = ctx.measureText(' ').width;
  for (const wd of words) { const ww = ctx.measureText(wd).width; if (w + ww > 820 && lines[lines.length - 1].length) { lines.push([]); w = 0; } lines[lines.length - 1].push({ wd, ww }); w += ww + space; }
  const total = text.replace(/ /g, '').length; let acc = 0; const items = [];
  lines.forEach((ln, li) => { const lw = ln.reduce((a, b) => a + b.ww, 0) + space * (ln.length - 1); let x = W / 2 - lw / 2;
    for (const it of ln) { const t0 = s + (e - s) * (acc / total) * 0.92; acc += it.wd.length; items.push({ ...it, x, li, t0, hl: hl.includes(it.wd.toLowerCase()) }); x += it.ww + space; } });
  return capCache[i] = { items, n: lines.length };
}
function captions(t) {
  for (let i = 0; i < P.length; i++) {
    const [s, e, text, , kind] = P[i]; const next = P[i + 1] ? P[i + 1][0] : DURATION;
    const end = Math.min(e + 0.35, next - 0.02); if (t < s - 0.05 || t > end || kind === 'hidden') continue;
    const fade = 1 - ss(end - 0.15, end, t);
    if (kind === 'mid') { const k = eo(clamp((t - s) / 0.5)); txt(text, W / 2, H * 0.47 + (1 - k) * 30, { size: 78, weight: 500, alpha: k * fade }); continue; }
    const L = layout(i); const y0 = 1235 - (L.n - 1) * 38;
    for (const it of L.items) { const k = eo(clamp((t - it.t0) / 0.16)); if (k <= 0) continue;
      txt(it.wd, it.x, y0 + it.li * 76 + (1 - k) * 16, { size: 62, align: 'left', alpha: k * fade, color: it.hl ? ACCENT : '#fff', stroke: true }); }
  }
}
const fmt = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
function hud(label, value, alpha, color = '#fff', size = 132) {
  if (alpha <= 0) return;
  if (label) txt(label, W / 2, 300, { size: 28, font: 'JB', weight: 500, color: 'rgba(255,255,255,0.75)', alpha, ls: 4 });
  txt(value, W / 2, 400, { size, alpha, color });
}
let PARTS = null;
function initParts() {
  const c = document.createElement('canvas'); c.width = W; c.height = 600; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '700 120px SG'; x.fillText('ESCALA DO', W / 2, 200); x.font = '700 170px SG'; x.fillText('ABSURDO', W / 2, 360);
  const d = x.getImageData(0, 0, W, 600).data; PARTS = []; let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let yy = 0; yy < 600; yy += 5) for (let xx = 0; xx < W; xx += 5) if (d[(yy * W + xx) * 4 + 3] > 128) {
    const a = rnd() * 2 * PI, r = 300 + rnd() * 900; PARTS.push({ tx: xx, ty: yy + 660, sx: W / 2 + Math.cos(a) * r, sy: 760 + Math.sin(a) * r, dl: rnd() * 0.5, o: rnd() < 0.18 }); }
}
