const G = '#3CFF7A', BG = '#0b1418', INK = '#eef3f0';
const EXPR = ['espanto', 'pensando', 'rindo', 'medo'];
const CHARS = ['Planetinha', 'Telescópio', 'Reguinha'];
// ---------- rosto (compartilhado) ----------
function face(c, ex, cx, cy, s, opt = {}) { // s = escala; opt.oneEye
  c.save(); c.translate(cx, cy); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  const dark = opt.dark || '#121212', ex1 = opt.oneEye ? [0] : [-34, 34];
  const eye = (x, y, r, pr, px = 0, py = 0) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.lineWidth = 4; c.strokeStyle = dark; c.stroke(); c.fillStyle = dark; c.beginPath(); c.arc(x + px, y + py, pr, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + px + pr * 0.35, y + py - pr * 0.35, pr * 0.3, 0, 7); c.fill(); };
  const R = opt.oneEye ? 34 : 20;
  if (ex === 'espanto') { ex1.forEach(x => eye(x, -8, R * 1.15, R * 0.35)); c.fillStyle = dark; c.beginPath(); c.ellipse(0, 40, 13, 17, 0, 0, 7); c.fill();
    c.fillStyle = G; c.font = '800 44px SG'; c.textAlign = 'center'; c.fillText('!', opt.oneEye ? 70 : 78, -40); }
  if (ex === 'pensando') { ex1.forEach(x => eye(x, -6, R, R * 0.5, R * 0.35, -R * 0.4)); c.strokeStyle = dark; c.lineWidth = 6; c.beginPath(); c.moveTo(-14, 38); c.lineTo(18, 32); c.stroke();
    c.fillStyle = G; [0, 1, 2].forEach(i => { c.beginPath(); c.arc((opt.oneEye ? 58 : 66) + i * 16, -52 - i * 4, 5, 0, 7); c.fill(); }); }
  if (ex === 'rindo') { c.strokeStyle = dark; c.lineWidth = 7; ex1.forEach(x => { c.beginPath(); c.arc(x, -2, opt.oneEye ? 22 : 14, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); });
    c.fillStyle = dark; c.beginPath(); c.moveTo(-26, 24); c.quadraticCurveTo(0, 26, 26, 24); c.quadraticCurveTo(22, 58, 0, 58); c.quadraticCurveTo(-22, 58, -26, 24); c.fill(); c.fillStyle = '#ff7f9a'; c.beginPath(); c.ellipse(0, 50, 11, 6, 0, 0, 7); c.fill(); }
  if (ex === 'medo') { ex1.forEach(x => eye(x, -6, R * 1.1, R * 0.28, 0, 2)); c.strokeStyle = dark; c.lineWidth = 5; c.beginPath(); for (let i = 0; i <= 6; i++) c.lineTo(-24 + i * 8, 40 + (i % 2 ? -5 : 5)); c.stroke();
    c.fillStyle = '#7fd3ff'; c.beginPath(); c.moveTo(opt.oneEye ? 56 : 62, -44); c.quadraticCurveTo(opt.oneEye ? 70 : 76, -20, opt.oneEye ? 56 : 62, -16); c.quadraticCurveTo(opt.oneEye ? 42 : 48, -20, opt.oneEye ? 56 : 62, -44); c.fill(); }

  const EX = opt.oneEye ? 66 : 74; // x dos símbolos
  if (ex === 'feliz') { ex1.forEach(x => eye(x, -6, R, R * 0.5, 0, 2)); c.strokeStyle = dark; c.lineWidth = 6; c.beginPath(); c.arc(0, 26, 20, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
  if (ex === 'ideia') { ex1.forEach(x => eye(x, -8, R * 1.05, R * 0.45, 0, -R * 0.3)); c.fillStyle = dark; c.beginPath(); c.arc(0, 32, 16, 0, Math.PI); c.fill();
    c.fillStyle = '#ffe27a'; c.shadowColor = '#ffe27a'; c.shadowBlur = 20; c.beginPath(); c.arc(EX, -62, 16, 0, 7); c.fill(); c.shadowBlur = 0; c.fillStyle = '#9aa3ad'; c.fillRect(EX - 7, -48, 14, 9); }
  if (ex === 'confuso') { eye(ex1[0], -6, R, R * 0.45, R * 0.3, 0); if (ex1[1] !== undefined) eye(ex1[1], -10, R * 0.75, R * 0.35, -R * 0.2, 0); c.strokeStyle = dark; c.lineWidth = 5; c.beginPath(); c.moveTo(-18, 38); c.quadraticCurveTo(-4, 30, 6, 40); c.quadraticCurveTo(14, 46, 22, 36); c.stroke();
    c.fillStyle = G; c.font = '800 46px SG'; c.textAlign = 'center'; c.fillText('?', EX + 4, -40); }
  if (ex === 'apaixonado') { const heart = (x, y, s2, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s2 * 0.35); c.bezierCurveTo(x - s2, y - s2 * 0.4, x - s2 * 0.4, y - s2, x, y - s2 * 0.4); c.bezierCurveTo(x + s2 * 0.4, y - s2, x + s2, y - s2 * 0.4, x, y + s2 * 0.35); c.fill(); };
    ex1.forEach(x => heart(x, -4, opt.oneEye ? 34 : 24, '#ff5a7e')); c.strokeStyle = dark; c.lineWidth = 6; c.beginPath(); c.arc(0, 28, 16, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); heart(EX, -56, 16, '#ff5a7e'); heart(EX + 22, -80, 10, '#ff8aa5'); }
  if (ex === 'explodiu') { c.strokeStyle = dark; c.lineWidth = 4; ex1.forEach(x => { c.beginPath(); for (let a = 0; a < 14; a += 0.3) c.lineTo(x + Math.cos(a) * a * (opt.oneEye ? 2.2 : 1.4), -6 + Math.sin(a) * a * (opt.oneEye ? 2.2 : 1.4)); c.stroke(); });
    c.fillStyle = dark; c.beginPath(); c.ellipse(0, 42, 18, 12, 0, 0, 7); c.fill(); c.fillStyle = G; [[-50, -70], [0, -88], [50, -70]].forEach(([x, y]) => { c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 6 : 15, a = k * Math.PI / 5; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill(); }); }
  if (ex === 'triste') { ex1.forEach(x => eye(x, -2, R * 0.95, R * 0.45, 0, R * 0.3)); c.strokeStyle = dark; c.lineWidth = 6; c.beginPath(); c.arc(0, 50, 18, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke();
    c.fillStyle = '#7fd3ff'; const tx = ex1[0] - (opt.oneEye ? 10 : 6); c.beginPath(); c.moveTo(tx, 14); c.quadraticCurveTo(tx + 10, 34, tx, 40); c.quadraticCurveTo(tx - 10, 34, tx, 14); c.fill(); }
  if (ex === 'orgulhoso') { c.strokeStyle = dark; c.lineWidth = 6; ex1.forEach(x => { c.beginPath(); c.arc(x, -10, opt.oneEye ? 20 : 13, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke(); }); c.beginPath(); c.arc(4, 26, 18, 0.1 * Math.PI, 0.8 * Math.PI); c.stroke();
    c.fillStyle = '#ffe27a'; c.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 6 : 16, a = k * Math.PI / 4; c.lineTo(EX + Math.cos(a) * r, -54 + Math.sin(a) * r); } c.fill(); }
  if (ex === 'sono') { c.strokeStyle = dark; c.lineWidth = 6; ex1.forEach(x => { c.beginPath(); c.moveTo(x - (opt.oneEye ? 22 : 14), -4); c.lineTo(x + (opt.oneEye ? 22 : 14), -4); c.stroke(); }); c.beginPath(); c.ellipse(0, 36, 8, 10, 0, 0, 7); c.stroke();
    c.fillStyle = G; c.font = '800 30px SG'; c.textAlign = 'center'; c.fillText('z', EX - 6, -36); c.font = '800 40px SG'; c.fillText('Z', EX + 18, -66); }
  c.restore(); }
// ---------- estilo DRAW (2D, traço de mão) ----------
function wob(c, pts, close = true) { c.beginPath(); pts.forEach(([x, y], i) => { const j = Math.sin(i * 7.3 + x) * 1.6; i ? c.lineTo(x + j, y - j) : c.moveTo(x, y); }); if (close) c.closePath(); }
function circ(cx, cy, r, n = 40) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
function drawChar(c, who, ex, cx, cy) {
  c.save(); c.lineWidth = 6; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round';
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(cx, cy + 150, 110, 16, 0, 0, 7); c.fill();
  if (who === 0) { // planetinha
    c.strokeStyle = INK; [[-40, 110], [40, 110]].forEach(([dx]) => { c.beginPath(); c.moveTo(cx + dx, cy + 90); c.lineTo(cx + dx * 1.1, cy + 145); c.lineTo(cx + dx * 1.1 + (dx > 0 ? 18 : -18), cy + 145); c.stroke(); });
    c.beginPath(); c.moveTo(cx - 95, cy + 10); c.lineTo(cx - 140, ex === 'medo' ? cy - 40 : cy + 40); c.stroke(); c.beginPath(); c.moveTo(cx + 95, cy + 10); c.lineTo(cx + 140, ex === 'pensando' ? cy - 20 : ex === 'espanto' ? cy - 50 : cy + 40); c.stroke();
    c.fillStyle = '#7b6cf0'; wob(c, circ(cx, cy, 100)); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(cx - 30, cy - 50, 34, 18, -0.5, 0, 7); c.fill();
    c.strokeStyle = G; c.lineWidth = 9; c.beginPath(); c.ellipse(cx, cy + 62, 150, 30, -0.12, 0.15, Math.PI - 0.15); c.stroke();
    face(c, ex, cx, cy - 5, 1.05);
  } else if (who === 1) { // telescópio
    c.beginPath(); c.moveTo(cx, cy + 40); c.lineTo(cx - 70, cy + 145); c.moveTo(cx, cy + 40); c.lineTo(cx + 70, cy + 145); c.moveTo(cx, cy + 40); c.lineTo(cx, cy + 145); c.stroke();
    c.save(); c.translate(cx, cy - 10); c.rotate(ex === 'pensando' ? -0.45 : ex === 'medo' ? 0.1 : -0.25);
    c.fillStyle = '#e9edf2'; wob(c, [[-140, -55], [80, -70], [80, 70], [-140, 55]]); c.fill(); c.stroke();
    c.fillStyle = G; wob(c, [[-30, -60], [0, -62], [0, 62], [-30, 60]]); c.fill(); c.stroke();
    c.fillStyle = '#3a4250'; wob(c, [[80, -82], [130, -86], [130, 86], [80, 82]]); c.fill(); c.stroke();
    c.restore(); face(c, ex, cx + 110, cy - 30, 0.95, { oneEye: true, dark: '#121212' });
  } else { // reguinha
    c.beginPath(); c.moveTo(cx - 60, cy + 70); c.lineTo(cx - 70, cy + 145); c.lineTo(cx - 52, cy + 145); c.moveTo(cx + 60, cy + 70); c.lineTo(cx + 70, cy + 145); c.lineTo(cx + 88, cy + 145); c.stroke();
    c.beginPath(); c.moveTo(cx - 150, cy); c.lineTo(cx - 190, ex === 'espanto' ? cy - 60 : cy + 30); c.moveTo(cx + 150, cy); c.lineTo(cx + 190, ex === 'pensando' ? cy - 40 : cy + 30); c.stroke();
    c.save(); c.translate(cx, cy); c.rotate(ex === 'medo' ? 0.08 : -0.04); c.fillStyle = '#f2c94c'; wob(c, [[-150, -75], [150, -75], [150, 75], [-150, 75]]); c.fill(); c.stroke();
    c.lineWidth = 4; for (let i = 0; i <= 20; i++) { const x = -135 + i * 13.5; c.beginPath(); c.moveTo(x, -75); c.lineTo(x, -75 + (i % 5 ? 14 : 28)); c.stroke(); }
    c.fillStyle = G; c.fillRect(-150, 58, 300, 17); c.restore(); face(c, ex, cx, cy + 12, 1.0);
  }
  c.restore(); }
// ---------- estilo 3D (three.js) ----------
const gl = document.getElementById('gl'); const R3 = new THREE.WebGLRenderer({ canvas: gl, antialias: true, alpha: true }); R3.setSize(420, 420, false); R3.setClearColor(0x000000, 0);
const sc = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100); cam.position.set(0, 0.4, 9); cam.lookAt(0, 0, 0);
sc.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.9)); const dl = new THREE.DirectionalLight(0xffffff, 1.1); dl.position.set(3, 4, 5); sc.add(dl); const rim = new THREE.DirectionalLight(0x3cff7a, 0.8); rim.position.set(-4, 2, -3); sc.add(rim);
const fc = document.createElement('canvas'); fc.width = fc.height = 256; const ftex = new THREE.CanvasTexture(fc);
function setFace(ex, opt) { const c = fc.getContext('2d'); c.clearRect(0, 0, 256, 256); face(c, ex, 128, 128, 1.25, opt); ftex.needsUpdate = true; }
const M = (col, r = 0.45, m = 0) => new THREE.MeshStandardMaterial({ color: col, roughness: r, metalness: m });
function limb(a, b, mat) { const v = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, v.length(), 12), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize()); return m; }
function facePlane(x, y, z, s, ry = 0) { const p = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: ftex, transparent: true })); p.position.set(x, y, z); p.rotation.y = ry; return p; }
function build(who, ex) { const g = new THREE.Group(); const dark = M(0x1c2230);
  if (who === 0) { g.add(new THREE.Mesh(new THREE.SphereGeometry(1.35, 48, 32), M(0x7b6cf0, 0.5)));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.09, 16, 80), M(0x3cff7a, 0.3, 0.1)); ring.rotation.x = Math.PI / 2.6; ring.rotation.z = 0.18; ring.position.y = -0.95; ring.scale.set(0.9,0.9,0.9); g.add(ring);
    setFace(ex); g.add(facePlane(0, 0.25, 1.4, 2.0));
    [-0.55, 0.55].forEach(x => g.add(limb(new THREE.Vector3(x, -1.1, 0), new THREE.Vector3(x * 1.15, -2.0, 0.2), dark)));
    g.add(limb(new THREE.Vector3(-1.3, 0, 0), new THREE.Vector3(-1.9, ['medo','explodiu','feliz'].includes(ex) ? 0.8 : -0.5, 0.3), dark)); g.add(limb(new THREE.Vector3(1.3, 0, 0), new THREE.Vector3(1.9, ['espanto','ideia','explodiu','feliz','orgulhoso'].includes(ex) ? 0.9 : ['pensando','confuso'].includes(ex) ? 0.4 : -0.5, 0.3), dark));
  } else if (who === 1) { const tube = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 3.0, 40), M(0xe9edf2, 0.35)); b.rotation.z = Math.PI / 2; tube.add(b);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.35, 40), M(0x3cff7a, 0.35)); band.rotation.z = Math.PI / 2; tube.add(band);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.45, 40), M(0x3a4250, 0.4, 0.3)); lens.rotation.z = Math.PI / 2; lens.position.x = 1.7; tube.add(lens);
    tube.rotation.z = ['pensando','ideia','orgulhoso'].includes(ex) ? 0.4 : ['medo','triste','sono'].includes(ex) ? -0.12 : 0.22; tube.rotation.y = -1.05; tube.position.y = 0.5; g.add(tube);
    setFace(ex, { oneEye: true }); const fp = facePlane(0, 0, 0, 1.9); fp.position.set(1.95, 0, 0); fp.rotation.y = Math.PI / 2; tube.add(fp);
    [[-0.9, 0.6], [0.9, 0.6], [0, -0.9]].forEach(([x, z]) => g.add(limb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, -2.1, z), dark)));
  } else { const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 0.35), M(0xf2c94c, 0.5)); g.add(body);
    for (let i = 0; i <= 20; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.03, i % 5 ? 0.18 : 0.34, 0.02), dark); tk.position.set(-1.45 + i * 0.145, 0.8 - (i % 5 ? 0.09 : 0.17), 0.18); g.add(tk); }
    const st = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 0.37), M(0x3cff7a, 0.35)); st.position.y = -0.71; g.add(st);
    setFace(ex); g.add(facePlane(0, -0.05, 0.19, 2.1));
    [-0.6, 0.6].forEach(x => g.add(limb(new THREE.Vector3(x, -0.8, 0), new THREE.Vector3(x * 1.1, -2.0, 0.2), dark)));
    g.add(limb(new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(-2.2, ex === 'espanto' ? 0.8 : -0.4, 0.2), dark)); g.add(limb(new THREE.Vector3(1.6, 0, 0), new THREE.Vector3(2.2, ex === 'pensando' ? 0.6 : -0.4, 0.2), dark));
    g.rotation.z = ex === 'medo' ? 0.08 : -0.04; }
  g.rotation.y = who === 1 ? 0 : -0.25; g.rotation.x = 0.08; return g; }
// ---------- folha ----------
function sheet(mode) { const out = document.getElementById('out'), c = out.getContext('2d'); c.fillStyle = BG; c.fillRect(0, 0, 1920, 1560);
  c.strokeStyle = 'rgba(140,200,210,0.06)'; c.lineWidth = 1; for (let x = 0; x < 1920; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1560); c.stroke(); } for (let y = 0; y < 1560; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(1920, y); c.stroke(); }
  c.fillStyle = '#fff'; c.font = '700 64px SG'; c.textAlign = 'left'; c.fillText('Mascote · estilo ' + (mode === '3d' ? '3D' : 'DRAW'), 70, 110);
  c.fillStyle = G; c.font = '500 26px JB'; c.fillText('ESCALA DO ABSURDO · candidatos', 72, 158);
  EXPR.forEach((e, j) => { c.fillStyle = 'rgba(255,255,255,0.6)'; c.font = '500 26px JB'; c.textAlign = 'center'; c.fillText(e.toUpperCase(), 520 + j * 370, 230); });
  CHARS.forEach((n, i) => { const y = 400 + i * 420; c.fillStyle = G; c.font = '700 40px SG'; c.textAlign = 'left'; c.fillText((i + 1) + '. ' + n, 60, y + 10);
    EXPR.forEach((e, j) => { const x = 520 + j * 370;
      if (mode === 'draw') { c.save(); c.translate(x, y); c.scale(0.95, 0.95); drawChar(c, i, e, 0, -10); c.restore(); }
      else { while (sc.children.length > 3) sc.remove(sc.children[3]); sc.add(build(i, e)); R3.render(sc, cam); c.drawImage(gl, x - 200, y - 210, 400, 400); } }); });
  return out.toDataURL('image/png'); }
window.prepare = async () => { await document.fonts.load('700 60px SG'); await document.fonts.load('500 26px JB'); return true; };

const ALL = ['feliz', 'rindo', 'espanto', 'explodiu', 'pensando', 'ideia', 'confuso', 'medo', 'triste', 'apaixonado', 'orgulhoso', 'sono'];
function charSheet(i) { const out = document.getElementById('out'), c = out.getContext('2d'); c.fillStyle = BG; c.fillRect(0, 0, 1920, 1560);
  c.strokeStyle = 'rgba(140,200,210,0.06)'; for (let x = 0; x < 1920; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1560); c.stroke(); } for (let y = 0; y < 1560; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(1920, y); c.stroke(); }
  c.fillStyle = '#fff'; c.font = '700 64px SG'; c.textAlign = 'left'; c.fillText(CHARS[i] + ' · reações', 70, 110); c.fillStyle = G; c.font = '500 26px JB'; c.fillText('ESCALA DO ABSURDO · mascote 3D', 72, 158);
  ALL.forEach((e, k) => { const x = 280 + (k % 4) * 455, y = 420 + Math.floor(k / 4) * 400; while (sc.children.length > 3) sc.remove(sc.children[3]); sc.add(build(i, e)); R3.render(sc, cam); c.drawImage(gl, x - 190, y - 200, 380, 380);
    c.fillStyle = 'rgba(255,255,255,0.75)'; c.font = '500 26px JB'; c.textAlign = 'center'; c.fillText(e.toUpperCase(), x, y + 200); });
  return out.toDataURL('image/png'); }
function single(i, e) { while (sc.children.length > 3) sc.remove(sc.children[3]); sc.add(build(i, e)); R3.render(sc, cam); return gl.toDataURL('image/png'); }
window.renderAt = mode => mode === 'p' ? charSheet(0) : mode === 't' ? charSheet(1) : sheet(mode);
window.single = single; window.ALL = ALL;
