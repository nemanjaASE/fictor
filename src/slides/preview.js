// HTML pregled slajdova iz istog opisa koji pravi .pptx.
import { fcss } from '../core/fonts.js';
import { S } from '../core/state.js';
import { drawChart } from '../graphics/charts.js';
import { cellCss, listLook, tableGrid } from '../graphics/data-styles.js';
import { el } from '../lib/dom.js';
import { DPI, G, P } from './layout.js';

/* ---------- pregled slajdova ---------- */
export const pxpt = v => (v * DPI / 72) + 'px';
export const normP = p => (typeof p === 'string' ? { runs: [{ t: p }] } : p.runs ? p : { ...p, runs: [{ t: p.t || '' }] });
export function place(d, o) { d.style.left = o.x * DPI + 'px'; d.style.top = o.y * DPI + 'px'; d.style.width = o.w * DPI + 'px'; d.style.height = (o.h || 0) * DPI + 'px'; }
export function textEl(o) {
  const s = o.st, d = el('div', 'o tx'); place(d, o);
  d.style.justifyContent = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[s.valign || 'top'];
  d.style.fontFamily = fcss(s.font); d.style.fontSize = pxpt(s.size); d.style.color = s.color;
  d.style.fontWeight = s.bold ? 700 : 400; d.style.lineHeight = 1.2 * (s.spacing || 1); d.style.textAlign = s.align || 'left';
  if (s.cs) d.style.letterSpacing = pxpt(s.cs);
  let n = 0, bu = null;
  for (const raw of o.paras) {
    const p = normP(raw), pe = el('div', 'pp');
    if (p.size) pe.style.fontSize = pxpt(p.size);
    if (p.after) pe.style.marginBottom = pxpt(p.after);
    if (p.bullet) {
      pe.style.paddingLeft = pxpt(p.bullet === 'num' ? 24 : 20);
      bu = bu || listLook(S.opts.listStyle, P());
      const b = el('span', 'bu'); b.textContent = p.bullet === 'num' ? (++n) + '.' : bu.char;
      if (p.bullet === 'num') b.style.fontFamily = fcss(S.fonts.heading); else if (bu.code !== '2022') b.style.fontFamily = 'Arial, sans-serif';
      if (bu.color) b.style.color = bu.color;
      pe.append(b);
    }
    for (const r of p.runs) {
      const sp = el('span'); sp.textContent = r.t;
      if (r.color) sp.style.color = r.color;
      if (r.bold != null) sp.style.fontWeight = r.bold ? 700 : 400;
      if (r.italic) sp.style.fontStyle = 'italic';
      if (r.font) sp.style.fontFamily = fcss(r.font);
      pe.append(sp);
    }
    d.append(pe);
  }
  return d;
}
export function tableEl(o) {
  const wrap = el('div', 'o'); place(wrap, o); wrap.style.height = 'auto';
  const t = el('table', 'stbl'); t.style.fontFamily = fcss(o.font); t.style.fontSize = pxpt(o.size); t.style.fontVariantNumeric = 'tabular-nums';
  const cg = el('colgroup'); o.colW.forEach(w => { const c = el('col'); c.style.width = w * DPI + 'px'; cg.append(c); }); t.append(cg);
  tableGrid(o).forEach((row, r) => {
    const tr = el('tr');
    for (const { t: txt, i, x, code } of row) {
      const c = el(r ? 'td' : 'th'); c.textContent = txt;
      c.style.cssText = `color:${x.fg};font-weight:${x.bold ? 700 : 400};text-align:${(o.align && o.align[i]) || (i ? 'right' : 'left')};height:${o.rowH * DPI}px;padding:${0.05 * DPI}px ${0.1 * DPI}px;vertical-align:middle;${cellCss(x, DPI / 72)}`;
      if (code) c.style.fontFamily = fcss(o.mono);
      if (x.small) { c.style.fontSize = pxpt(o.size * 0.75); c.style.letterSpacing = '0.06em'; }
      tr.append(c);
    }
    t.append(tr);
  });
  wrap.append(t);
  return wrap;
}
export function objEl(o) {
  if (o.k === 'text') return textEl(o);
  if (o.k === 'table') return tableEl(o);
  if (o.k === 'chart') { const d = el('img', 'o'); place(d, o); d.src = drawChart(o); d.alt = o.alt || ''; return d; }
  const d = el(o.k === 'image' ? 'img' : 'div', 'o'); place(d, o);
  if (o.k === 'rect') { d.style.background = o.fill; if (o.r) d.style.borderRadius = o.r * DPI + 'px'; }
  else if (o.k === 'ellipse') { d.style.background = o.fill; d.style.borderRadius = '50%'; }
  else if (o.k === 'line') { const t = Math.max(1, o.width * DPI / 72); d.style.height = t + 'px'; d.style.top = (o.y * DPI - t / 2) + 'px'; d.style.background = o.color; }
  else if (o.k === 'image') { d.src = o.data; d.alt = o.alt || ''; }
  return d;
}
export function slideEl(L, s, n) {
  const { W, H } = G(), root = el('div', 'sl');
  root.style.width = W * DPI + 'px'; root.style.height = H * DPI + 'px'; root.style.background = L.bg;
  L.objects.forEach(o => root.append(objEl(o)));
  L.ph.forEach(p => { const c = s.fill[p.name]; if (c && p.type !== 'pic') root.append(textEl({ ...p, paras: c })); });
  s.extras.forEach(o => root.append(objEl(o)));
  if (L.num && S.opts.numbers) root.append(textEl({ ...L.num, paras: [String(n)] }));
  return root;
}
