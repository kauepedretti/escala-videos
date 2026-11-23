// Escala do Absurdo — Ep. 02 — Quantas Terras cabem no Sol?
const W = 1080, H = 1920, PI = Math.PI;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, s) => a + (b - a) * s;
const ss = (a, b, x) => { const s = clamp((x - a) / (b - a)); return s * s * (3 - 2 * s); };
const eio = s => s < .5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
const eo = s => 1 - Math.pow(1 - s, 3);
const win = (t, a, b, f = 0.25) => ss(a, a + f, t) * (1 - ss(b - f, b, t));
const ORANGE = '#FFB23E', BLUE = '#9cc8ff', RED = '#ff5a3c', ACCENT = '#3CFF7A';

