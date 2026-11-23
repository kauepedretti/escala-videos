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
