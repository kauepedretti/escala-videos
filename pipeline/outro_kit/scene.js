// Escala do Absurdo — Ep. 02 — Quantas Terras cabem no Sol?
const W = 1080, H = 1920, PI = Math.PI;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, s) => a + (b - a) * s;
const ss = (a, b, x) => { const s = clamp((x - a) / (b - a)); return s * s * (3 - 2 * s); };
const eio = s => s < .5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
const eo = s => 1 - Math.pow(1 - s, 3);
const win = (t, a, b, f = 0.25) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
const ORANGE = '#3CFF7A', BLUE = '#9cc8ff', RED = '#ff5a3c';

const P=[]; const DURATION=4.6;
// base 3D compartilhada (renderizador, shaders, estrelas, galáxia, Sol, Terra)
const glc = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0, 1);
const camera = new THREE.PerspectiveCamera(50, W / H, 0.001, 1e8);
let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const gauss = () => { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * PI * rnd()); };
const n3 = (x, y, z) => V3(x, y, z).normalize();
const UPY = V3(0, 1, 0);
const NOISE = `
float hash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}`;
const VERT = `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vObjN; varying vec3 vN; varying vec3 vW;
void main(){
 #ifdef USE_INSTANCING
  mat4 im = instanceMatrix;
 #else
  mat4 im = mat4(1.0);
 #endif
 vObjN=normal; vN=normalize(mat3(modelMatrix*im)*normal);
 vec4 w=modelMatrix*im*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w;
 #include <logdepthbuf_vertex>
}`;
const FHEAD = `
#include <common>
#include <logdepthbuf_pars_fragment>
varying vec3 vObjN; varying vec3 vN; varying vec3 vW;` + NOISE;

function radialTex(stops, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const mkSprite = (tex, op = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op })); s.renderOrder = 20; return s; };
const GLOW_TEX = radialTex([[0, 'rgba(255,200,120,1)'], [0.2, 'rgba(255,140,40,0.55)'], [0.5, 'rgba(255,90,10,0.14)'], [1, 'rgba(255,60,0,0)']]);
const BLUE_TEX = radialTex([[0, 'rgba(160,210,255,1)'], [0.25, 'rgba(90,150,255,0.35)'], [1, 'rgba(60,120,255,0)']]);
const WHITE_TEX = radialTex([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,250,235,0.6)'], [0.5, 'rgba(255,240,210,0.12)'], [1, 'rgba(255,240,210,0)']]);

function starPoints(n, R, size = 2.2, seedv = 7) {
  let s = seedv; const r2 = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3), c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = r2() * 2 - 1, a = r2() * 2 * PI, r = Math.sqrt(1 - u * u); p.set([R * r * Math.cos(a), R * u, R * r * Math.sin(a)], i * 3);
    const b = 0.4 + 0.6 * Math.pow(r2(), 2.5), w = r2(); c.set([b * (0.8 + 0.2 * w), b * 0.88, b * (1.1 - 0.2 * w)], i * 3); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const o = new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, depthWrite: false, transparent: true, fog: false })); o.renderOrder = -1; return o;
}
function starMat(c1, c2, c3, freq, seedv) {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, op: { value: 1 }, c1: { value: new THREE.Color(...c1) }, c2: { value: new THREE.Color(...c2) }, c3: { value: new THREE.Color(...c3) }, freq: { value: freq }, seed: { value: seedv } },
    vertexShader: VERT, transparent: true,
    fragmentShader: FHEAD + `uniform float time,op,freq,seed; uniform vec3 c1,c2,c3;
void main(){
 #include <logdepthbuf_fragment>
 vec3 n=normalize(vObjN); vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW);
 float f=fbm(n*freq+vec3(seed,time*0.12,time*0.08)); float g=fbm(n*freq*3.4+f*2.5+vec3(time*0.25));
 float mu=abs(dot(N,V)); vec3 col=mix(c1,c2,smoothstep(0.3,0.75,f)); col=mix(col,c3,pow(g,2.5)*1.3);
 col*=(0.45+0.65*pow(mu,0.45))*1.05; gl_FragColor=vec4(col,op);
}` });
}
const SUN_COLS = [[1.0, 0.30, 0.02], [1.0, 0.72, 0.22], [1.0, 0.95, 0.78]];
function earthMat(sunDirUniform) {
  return new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, sunPos: { value: V3(-1e6, 2e5, 3e5) } }, vertexShader: VERT,
    fragmentShader: FHEAD + `uniform float time; uniform vec3 sunPos;
void main(){
 #include <logdepthbuf_fragment>
 vec3 n=normalize(vObjN); vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW);
 float c=fbm(n*2.1+vec3(3.1,1.7,0.4)); float land=smoothstep(0.50,0.53,c);
 vec3 ocean=mix(vec3(0.02,0.12,0.36),vec3(0.06,0.34,0.72),fbm(n*7.));
 vec3 lc=mix(vec3(0.14,0.36,0.13),vec3(0.55,0.47,0.28),smoothstep(0.4,0.65,fbm(n*5.+7.)));
 vec3 col=mix(ocean,lc,land); col=mix(col,vec3(0.95),smoothstep(0.82,0.9,abs(n.y)));
 col=mix(col,vec3(1.),smoothstep(0.52,0.72,fbm(n*4.5+vec3(time*0.03,0.,9.)))*0.85);
 vec3 Ld=normalize(sunPos-vW); float diff=smoothstep(-0.1,0.35,dot(N,Ld));
 vec3 lit=col*(0.05+diff*1.05); lit+=pow(1.-max(dot(N,V),0.),3.)*vec3(0.3,0.55,1.)*(0.25+diff)*0.9;
 gl_FragColor=vec4(lit,1.);
}` });
}
function makeGalaxy(GR, NG = 150000, sd = 5) {
  let s = sd; const r2 = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ga = () => { let u = 0; while (u === 0) u = r2(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * PI * r2()); };
  const g = new THREE.BufferGeometry(); const p = new Float32Array(NG * 3), c = new Float32Array(NG * 3);
  for (let i = 0; i < NG; i++) { let x, y, z, col;
    if (i < NG * 0.16) { const r = Math.abs(ga()) * GR * 0.11; const a = r2() * 2 * PI; x = Math.cos(a) * r * 1.4; z = Math.sin(a) * r; y = ga() * GR * 0.03; col = [1, 0.82, 0.55]; }
    else { const arm = i % 4; let r = GR * (0.12 + Math.pow(r2(), 0.8) * 0.9); const th = arm * PI / 2 + Math.log(r / (GR * 0.12)) / Math.tan(13 * PI / 180) + ga() * 0.22;
      const sp = GR * 0.035 * (1 + r / GR); x = Math.cos(th) * r + ga() * sp; z = Math.sin(th) * r + ga() * sp; y = ga() * GR * 0.012; const h = r2(); col = h < 0.25 ? [0.65, 0.78, 1] : h < 0.3 ? [1, 0.6, 0.75] : [0.95, 0.92, 0.88]; }
    const b = 0.35 + 0.65 * Math.pow(r2(), 2); p.set([x, y, z], i * 3); c.set(col.map(v => v * b), i * 3); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const grp = new THREE.Group();
  grp.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 2.0, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  const core = mkSprite(radialTex([[0, 'rgba(255,220,160,0.9)'], [0.3, 'rgba(255,170,90,0.25)'], [1, 'rgba(255,140,60,0)']])); core.scale.setScalar(GR * 0.9); grp.add(core);
  return grp;
}
// composição padrão: 3D + brilho + vinheta
function composite(alphaBloom = 0.55) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.drawImage(glc, 0, 0);
  sctx.drawImage(glc, 0, 0, 270, 480); bctx.clearRect(0, 0, 270, 480); bctx.filter = 'blur(5px)'; bctx.drawImage(small, 0, 0); bctx.filter = 'none';
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alphaBloom; ctx.drawImage(blur, 0, 0, W, H);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(vig, 0, 0);
}
function marker(p, label, alpha, color = ORANGE, side = 1, len = 80) {
  if (alpha <= 0) return; ring(p.x, p.y, 14, alpha, color, 3);
  line([[p.x + 10 * side, p.y - 10], [p.x + (len * 0.75) * side, p.y - len]], alpha, color, 3);
  txt(label, p.x + (len * 0.75 + 6) * side, p.y - len - 20, { size: 36, font: 'JB', weight: 500, color, align: side > 0 ? 'left' : 'right', alpha, stroke: true });
}
function ruler(a, b, label, alpha, prog = 1, off = 0, color = ORANGE) {
  if (alpha <= 0) return; const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const A = [a.x + nx * off, a.y + ny * off], B = [a.x + nx * off + dx * prog, a.y + ny * off + dy * prog];
  line([A, B], alpha, color, 3); line([[A[0] - nx * 14, A[1] - ny * 14], [A[0] + nx * 14, A[1] + ny * 14]], alpha, color, 3);
  if (prog > 0.98) line([[B[0] - nx * 14, B[1] - ny * 14], [B[0] + nx * 14, B[1] + ny * 14]], alpha, color, 3);
  const sg = off < 0 ? -1 : 1; txt(label, (A[0] + a.x + nx * off + dx) / 2 + nx * 46 * sg, (A[1] + a.y + ny * off + dy) / 2 + ny * 46 * sg, { size: 46, font: 'JB', weight: 500, color, alpha: alpha * ss(0.6, 1, prog), stroke: true });
}
function ending(t, T0, T1, T2, epTag) { // T0 = "O universo", T1 = "É absurdo", T2 = "Segue"
  const mid = win(t, T0 - 0.15, T1 - 0.1, 0.3); if (mid > 0) { ctx.fillStyle = `rgba(0,0,0,${0.5 * mid})`; ctx.fillRect(0, 0, W, H); }
  const sl = win(t, T1, T1 + 1.1, 0.06);
  if (sl > 0) { ctx.fillStyle = `rgba(0,0,0,${0.5 * sl})`; ctx.fillRect(0, 0, W, H); const k = eo(clamp((t - T1) / 0.14)); ctx.save(); ctx.translate(Math.sin(t * 91) * 8 * (1 - k), 0); txt('É ABSURDO.', W / 2, H * 0.47, { size: 168 * (1.5 - 0.5 * k), color: ORANGE, alpha: sl }); ctx.restore(); }
  const lg = clamp((t - T2 - 0.15) / 1.6);
  if (lg > 0) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,' + (0.65 * ss(T2 - 0.05, T2 + 0.5, t)) + ')'; ctx.fillRect(0, 0, W, H);
    for (const p of PARTS) { const k = eio(clamp((lg - p.dl * 0.5) / 0.6)); ctx.globalAlpha = 0.25 + 0.75 * k; ctx.fillStyle = p.o ? ORANGE : '#fff'; ctx.fillRect(lerp(p.sx, p.tx, k) - 2, lerp(p.sy, p.ty, k) - 2, 4, 4); }
    ctx.restore(); txt(epTag, W / 2, 1200, { size: 28, font: 'JB', weight: 500, color: 'rgba(255,255,255,0.7)', alpha: ss(T2 + 1.4, T2 + 1.9, t), ls: 3 }); }
  const fin = ss(0, 0.35, t); if (fin < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fin})`; ctx.fillRect(0, 0, W, H); }
  txt('ESCALA DO ABSURDO', 72, 200, { size: 24, font: 'JB', weight: 500, color: 'rgba(255,255,255,0.5)', align: 'left', ls: 3, alpha: 1 - ss(T2 - 0.1, T2 + 0.3, t) });
}
window.prepare = async () => {
  await Promise.all([document.fonts.load('700 60px SG'), document.fonts.load('500 60px SG'), document.fonts.load('500 40px JB')]);
  initParts(); return true;
};
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
      txt(it.wd, it.x, y0 + it.li * 76 + (1 - k) * 16, { size: 62, align: 'left', alpha: k * fade, color: it.hl ? ORANGE : '#fff', stroke: true }); }
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
// Vinheta padrão do fim (igual em todos os vídeos). Tx = início da frase final do tema; Tv = início da vinheta.
const OUTRO_LEN = 4.6; var OUTRO_OVERLAY = false;
function phraseX(t, Tx, Tv, lines) {
  const k = eo(clamp((t - Tx) / 0.5)); const a = win(t, Tx - 0.05, Tv + 0.05, 0.2) * k; if (a <= 0) return;
  ctx.fillStyle = `rgba(0,0,0,${0.82 * a})`; ctx.fillRect(0, 0, W, H);
  const y0 = H * 0.47 - (lines.length - 1) * 46; lines.forEach((l, i) => txt(l, W / 2, y0 + i * 92 + (1 - k) * 30, { size: 74, weight: 500, alpha: a }));
}
function outro(t, Tv, epTag) {
  const v = t - Tv;
  if (!OUTRO_OVERLAY) txt('ESCALA DO ABSURDO', 72, 200, { size: 24, font: 'JB', weight: 500, color: 'rgba(255,255,255,0.5)', align: 'left', ls: 3, alpha: 1 - ss(-0.2, 0.2, v) });
  if (v < -0.05) { const fin = ss(0, 0.35, t); if (fin < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - fin})`; ctx.fillRect(0, 0, W, H); } return; }
  // fundo: escurece até preto
  ctx.fillStyle = `rgba(0,0,0,${0.6 + 0.4 * ss(1.0, 1.5, v)})`; ctx.fillRect(0, 0, W, H);
  // 1) "É ABSURDO." (batida)
  const sl = win(v, 0.03, 1.35, 0.06);
  if (sl > 0) { const k = eo(clamp((v - 0.03) / 0.14)); ctx.save(); ctx.translate(Math.sin(t * 91) * 8 * (1 - k), 0); txt('É ABSURDO.', W / 2, H * 0.47, { size: 168 * (1.5 - 0.5 * k), color: ORANGE, alpha: sl }); ctx.restore(); }
  // 2) logo em partículas
  const lg = clamp((v - 1.3) / 1.3);
  if (lg > 0) { ctx.save(); for (const p of PARTS) { const k = eio(clamp((lg - p.dl * 0.5) / 0.6)); ctx.globalAlpha = 0.25 + 0.75 * k; ctx.fillStyle = p.o ? ORANGE : '#fff'; ctx.fillRect(lerp(p.sx, p.tx, k) - 2, lerp(p.sy, p.ty, k) - 2, 4, 4); } ctx.restore(); }
  // 3) régua de escala (marca da casa)
  const rk = eo(clamp((v - 2.0) / 0.7)); if (rk > 0) { const y = 1110, half = 380 * rk; ctx.save(); ctx.strokeStyle = ORANGE; ctx.lineWidth = 3; ctx.globalAlpha = 0.95; ctx.beginPath(); ctx.moveTo(W / 2 - half, y); ctx.lineTo(W / 2 + half, y); ctx.stroke();
    for (let i = -8; i <= 8; i++) { const x = W / 2 + i * 47.5; if (Math.abs(i * 47.5) > half) continue; const h = i % 4 === 0 ? 22 : 11; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke(); } ctx.restore(); }
  txt(epTag, W / 2, 1165, { size: 26, font: 'JB', weight: 500, color: 'rgba(255,255,255,0.65)', alpha: ss(2.4, 2.8, v), ls: 3 });
  // 4) chamada pra seguir
  const pk = eo(clamp((v - 2.5) / 0.35)); if (pk > 0) { const w = 560 * (0.85 + 0.15 * pk), h = 92, x = W / 2 - w / 2, y = 1260; ctx.save(); ctx.globalAlpha = pk; ctx.fillStyle = ORANGE; ctx.beginPath(); ctx.roundRect(x, y, w, h, 46); ctx.fill(); ctx.restore();
    txt('SIGA  @escaladoabsurdo', W / 2, y + h / 2 + 2, { size: 38, font: 'SG', weight: 700, color: '#111', alpha: pk, shadow: false }); }
  txt('próxima escala  →', W / 2, 1440, { size: 34, font: 'JB', weight: 500, color: 'rgba(255,255,255,0.85)', alpha: ss(2.9, 3.3, v) * (1 - ss(4.2, 4.6, v) * 0.0) });
}
OUTRO_OVERLAY = true;
window.renderAt = function (v) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); if (v < 0) phraseX(v, -(window.LP || 0), 0, window.LINES || []); else outro(v, 0, window.TAG || ''); return out.toDataURL('image/png'); };
