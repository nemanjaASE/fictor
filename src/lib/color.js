// Boje: mešanje, kontrast (WCAG) i HSL.

/* ---------- boje ---------- */
export const hx = h => String(h || '').replace('#', '').toUpperCase();
export const isHex = s => /^#?[0-9a-f]{6}$/i.test(String(s).trim());
export const normHex = s => '#' + hx(String(s).trim());
export function rgb(h) { const n = parseInt(hx(h), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
export function toHex(c) { return '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase(); }
export function mix(a, b, t) { const A = rgb(a), B = rgb(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); }
export function lum(h) { const c = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
export function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export function onColor(h) { return contrast(h, '#FFFFFF') >= contrast(h, '#111318') ? '#FFFFFF' : '#111318'; }
// pomera boju ka crnoj/beloj dok ne dostigne traženi kontrast
export function ensure(fg, bg, ratio) { let c = fg; const to = lum(bg) > 0.4 ? '#000000' : '#FFFFFF'; for (let i = 0; i < 24 && contrast(c, bg) < ratio; i++) c = mix(c, to, 0.1); return c; }
export function toHsl(h) {
  const [r, g, b] = rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let hh = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; }
  return [hh, s, l];
}
export function fromHsl(h, s, l) {
  h = ((h % 360) + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
}
export const spin = (h, d) => { const [a, s, l] = toHsl(h); return fromHsl(a + d, s, l); };
// najizraženija boja na slici (npr. logotipu fakulteta), iz niza RGBA piksela: preskače providne, skoro bele,
// skoro crne i sive piksele, grupiše slične nijanse i bira grupu sa najviše piksela, uz prednost zasićenijim bojama
export function dominantColor(px) {
  const bins = new Map();
  for (let i = 0; i + 3 < px.length; i += 4) {
    if (px[i + 3] < 128) continue;
    const r = px[i], g = px[i + 1], b = px[i + 2], max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 510, s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
    if (s < 0.25 || l > 0.92 || l < 0.08) continue;
    const key = (r >> 4) << 8 | (g >> 4) << 4 | (b >> 4), e = bins.get(key) || { n: 0, w: 0, r: 0, g: 0, b: 0 };
    e.n++; e.w += s; e.r += r; e.g += g; e.b += b; bins.set(key, e);
  }
  let best = null;
  for (const e of bins.values()) if (!best || e.w > best.w) best = e;
  return best ? toHex([best.r / best.n, best.g / best.n, best.b / best.n]) : null;
}
