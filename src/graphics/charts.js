// Grafikoni: čitanje podataka, palete i crtanje (pregled i Word).
import { parseTable } from '../content/markdown.js';
import { fcss } from '../core/fonts.js';
import { S } from '../core/state.js';
import { T } from '../core/text.js';
import { ensure, mix, onColor, spin } from '../lib/color.js';
import { chartLook } from './data-styles.js';
import { P } from '../slides/layout.js';

/* ---------- grafikoni ---------- */
export function parseNum(v) {
  let s = String(v).replace(/[\s%]/g, '').replace(/−/g, '-');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s); return isNaN(n) ? 0 : n;
}
export const fmtNum = v => { const neg = v < 0, r = Math.round(Math.abs(v) * 100) / 100, [a, d] = String(r).split('.'); return (neg ? '−' : '') + a.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : ''); };
export function parseChart(lines) {
  const spec = { type: 'stubici', title: '', y: '', source: '', highlight: '', cats: [], series: [] }, tbl = [];
  for (const l of lines) {
    if (/^\s*\|/.test(l)) { tbl.push(l); continue; }
    const m = l.match(/^\s*([^:]{1,20}?)\s*:\s*(.*)$/); if (!m) continue;
    const k = m[1].toLowerCase().trim(), v = m[2].trim();
    if (/^(tip|vrsta|type)$/.test(k)) spec.type = /linij|line/i.test(v) ? 'linije' : /vodorav|horiz|traka|bar$/i.test(v) ? 'vodoravni' : 'stubici';
    else if (/^(naslov|title)$/.test(k)) spec.title = v;
    else if (/^(y|osa|osa y|jedinica)$/.test(k)) spec.y = v;
    else if (/^(izvor|source)$/.test(k)) spec.source = v;
    else if (/^(istakni|highlight)$/.test(k)) spec.highlight = v;
  }
  const t = parseTable(tbl);
  if (t.head.length > 1) { spec.cats = t.rows.map(r => r[0]); spec.series = t.head.slice(1).map((name, j) => ({ name, values: t.rows.map(r => parseNum(r[j + 1])) })); }
  return spec;
}
export const OKABE = ['#0072B2', '#E69F00', '#009E73', '#D55E00', '#56B4E9', '#CC79A7', '#F0E442', '#000000'];
export function chartPalette(n, p = P()) {
  const mode = S.opts.chartPal || 'tema';
  const base = mode === 'okabe' ? OKABE
    : mode === 'nijanse' ? Array.from({ length: Math.max(n, 1) }, (_, i) => mix(p.primary, p.bg, (i / Math.max(n, 2)) * 0.7))
    : [p.primary, p.accent, spin(p.primary, 40), mix(p.muted, p.primary, 0.3), spin(p.accent, -35), mix(p.primary, p.accent, 0.5)];
  return Array.from({ length: Math.max(n, 1) }, (_, i) => base[i % base.length]);
}
export const sameCat = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
// jedna serija: istaknuta kategorija u primarnoj boji, ostale u boji rest (siva ili svetla nijansa); više serija: paleta
// (fix: popravka boja palete za podlogu)
export function chartColorsFor(spec, p, fix = c => c, rest = mix(p.muted, p.bg, 0.45)) {
  const pal = n => chartPalette(n, p).map(fix);
  if (spec.series.length === 1 && spec.type !== 'linije') {
    if (spec.highlight) { const hi = pal(1)[0]; return spec.cats.map(c => (sameCat(c, spec.highlight) ? hi : rest)); }
    return pal(1);
  }
  return pal(spec.series.length);
}
// grafikon u izabranom izgledu (opis izgleda je u data-styles.js)
// tekst grafikona (kategorije, serije, osa, izvor) ide kroz T: tipografija i ćirilica kao ostatak dokumenta
const chartText = sp => ({ ...sp, cats: sp.cats.map(c => T(c)), series: sp.series.map(s => ({ ...s, name: T(s.name) })), y: T(sp.y || ''), source: T(sp.source || ''), highlight: T(sp.highlight || '') });
// opis grafikona za čitače ekrana: vrsta, naslov ili osa, pa sve vrednosti (i istaknuta kategorija)
export function chartAlt(sp) {
  const kind = sp.type === 'linije' ? 'Linijski grafikon' : sp.type === 'vodoravni' ? 'Vodoravni stubičasti grafikon' : 'Stubičasti grafikon';
  const name = sp.title || sp.y, vals = s => sp.cats.map((c, i) => `${c}: ${fmtNum(s.values[i])}`).join('; ');
  const data = sp.series.length === 1 ? vals(sp.series[0]) : sp.series.map(s => `${s.name} (${vals(s)})`).join('. ');
  const hi = sp.highlight && sp.cats.some(c => sameCat(c, sp.highlight)) ? ` ${T('Istaknuto')}: ${sp.highlight}.` : '';
  return `${T(kind)}${name ? ': ' + name : ''}. ${data}.${hi}`;
}
export const chartObj = (spec0, x, y, w, h, p, font, size, look = S.opts.chartStyle) => {
  const spec = chartText(spec0), L = chartLook(look, p), q = L.p, colors = chartColorsFor(spec, q, L.min ? c => ensure(c, q.bg, L.min) : undefined, L.rest);
  return {
    k: 'chart', x, y, w, h, spec, look, colors, font, size, alt: chartAlt(spec), card: L.card, shapes: L.shapes, axis: L.axis, values: L.values, bold: L.bold, gap: L.gap,
    c: { muted: q.muted, text: q.text, hair: q.hair, bg: q.bg, grid: L.grid, gridW: L.gridW, dash: L.dash, cat: L.cat, base: L.base, track: L.track, hi: ensure(q.primary, q.bg, 4.5) },
  };
};
// grafikon na slajdu ili posteru: zaobljeni i trake postaju oblici; tamni dobija podlogu, a grafikon se uvlači u nju
export function chartShapes(o, r = 0, pad = 0.16) {
  // oblici grafikona: prvi pravougaonik nosi opis celog grafikona za čitače ekrana
  const sp = o.spec, empty = !sp.series.length || !sp.cats.length;
  const part = list => { const first = list.findIndex(x => x.k === 'rect'); return list.map((x, i) => ({ ...x, part: 'chart', ...(i === first ? { alt: o.alt } : {}) })); };
  if (o.shapes && !empty && sp.type !== 'linije') return part(chartPrims(o, r));
  // linijski grafikon u izgledu sa oblicima ostaje pravi grafikon, na podlozi tog izgleda
  const n = { ...o, shapes: null };
  if (!o.card) return [n];
  return part([{ k: 'rect', x: o.x, y: o.y, w: o.w, h: o.h, fill: o.card, r }, { ...n, x: o.x + pad, y: o.y + pad, w: o.w - 2 * pad, h: o.h - 2 * pad }]);
}
// zaobljeni stubići i trake kao pravougaonici i tekst (u inčima, mere u odnosu na veličinu slova, da isto izgleda i na posteru)
const textW = (t, size) => String(t).length * size * 0.56 / 72;
export function chartPrims(o, r = 0) {
  const sp = o.spec, c = o.c, out = [], S_ = sp.series, nS = S_.length, cats = sp.cats, nC = cats.length, em = o.size / 72;
  const hiIdx = nS === 1 && sp.highlight ? cats.findIndex(x => sameCat(x, sp.highlight)) : -1;
  const colorOf = (ci, si) => (nS === 1 ? o.colors[ci % o.colors.length] : o.colors[si]);
  const rect = (x, y, w, h, fill, rad = 0) => out.push({ k: 'rect', x, y, w, h, fill, r: Math.max(0, Math.min(rad, w / 2, h / 2)) });
  const text = (x, y, w, h, t, color, more = {}) => out.push({ k: 'text', x, y, w, h, paras: [t], st: { font: o.font, size: o.size, color, valign: 'middle', ...more } });
  let { x, y, w, h } = o;
  if (o.card) { rect(x, y, w, h, o.card, r); x += 1.4 * em; y += 1.1 * em; w -= 2.8 * em; h -= 2.2 * em; }
  if (nS > 1) {
    // legenda: kvadratić u boji serije i naziv
    let lx = x;
    S_.forEach((s, si) => { rect(lx, y + 0.45 * em, 0.9 * em, 0.9 * em, o.colors[si], 0.2 * em); text(lx + 1.3 * em, y, textW(s.name, o.size) + em, 1.8 * em, s.name, c.text); lx += 1.3 * em + textW(s.name, o.size) + 2.2 * em; });
    y += 2.6 * em; h -= 2.6 * em;
  }
  const max = Math.max(...S_.flatMap(s => s.values.map(Math.abs)), 1e-9), vs = o.size + 1;
  if (o.shapes === 'trake' || sp.type === 'vodoravni') {
    // trake: naziv iznad, vrednost desno, traka na svetloj podlozi
    const valW = nS > 1 ? Math.max(...S_.flatMap(s => s.values.map(v => textW(fmtNum(v), vs)))) + em : 0, tw = w - valW;
    // red: naziv, pa trake; redovi nisu viši nego što treba, a cela grupa stoji na sredini polja
    const lineH = 1.9 * em, rowH = Math.min(h / nC, lineH + nS * 1.95 * em + 2.4 * em), bh = Math.max(0.6 * em, Math.min(1.6 * em, (rowH - lineH - 0.9 * em) / nS - 0.35 * em));
    y += (h - rowH * nC) / 2;
    cats.forEach((cat, ci) => {
      const hi = ci === hiIdx, ry = y + rowH * ci + (rowH - lineH - nS * (bh + 0.35 * em)) / 2;
      text(x, ry, w * 0.68, lineH, cat, hi ? c.hi : c.text, { bold: hi });
      if (nS === 1) text(x + w * 0.5, ry, w * 0.5, lineH, fmtNum(S_[0].values[ci]), hi ? c.hi : c.text, { bold: true, align: 'right', size: vs });
      S_.forEach((s, si) => {
        const by = ry + lineH + 0.15 * em + si * (bh + 0.35 * em), v = s.values[ci];
        rect(x, by, tw, bh, c.track, bh / 2);
        rect(x, by, Math.max(bh, Math.abs(v) / max * tw), bh, colorOf(ci, si), bh / 2);
        if (nS > 1) text(x + tw, by - 0.4 * em, valW, bh + 0.8 * em, fmtNum(v), c.text, { bold: true, align: 'right' });
      });
    });
    return out;
  }
  // zaobljeni stubići: vrednost iznad (istaknuta u „pilulici“), kategorija ispod
  const labH = 2.2 * em, valH = 3.0 * em, bot = y + h - labH, ph = bot - y - valH, band = w / nC, sg = 0.4 * em;
  const gw = band * o.gap, bw = (gw - (nS - 1) * sg) / nS;
  cats.forEach((cat, ci) => {
    const gx = x + band * ci + (band - gw) / 2, hi = ci === hiIdx;
    S_.forEach((s, si) => {
      const v = s.values[ci], bh = Math.max(0.15 * em, Math.abs(v) / max * ph), bx = gx + si * (bw + sg), by = bot - bh, col = colorOf(ci, si), rad = Math.min(bw * 0.2, 1.6 * em, bh / 2);
      rect(bx, by, bw, bh, col, rad);
      // donji uglovi ostaju oštri: stubić „stoji“ na osi
      if (rad > 0) rect(bx, by + bh - Math.min(rad, bh / 2), bw, Math.min(rad, bh / 2), col);
      const t = fmtNum(v);
      if (hi) {
        const pw = textW(t, vs) + 1.4 * em, pht = 1.9 * em, py = by - pht - 0.5 * em;
        rect(bx + bw / 2 - pw / 2, py, pw, pht, col, pht / 2);
        text(bx + bw / 2 - pw / 2, py, pw, pht, t, onColor(col), { bold: true, align: 'center', size: vs });
      } else text(bx - em, by - 2.3 * em, bw + 2 * em, 1.9 * em, t, c.text, { bold: true, align: 'center', size: vs });
    });
    text(x + band * ci, bot + 0.3 * em, band, labH - 0.3 * em, cat, hi ? c.hi : c.cat, { bold: hi, align: 'center' });
  });
  return out;
}
export function niceScale(min, max, n = 5) {
  const range = (max - min) || 1, raw = range / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  return { lo: Math.floor(min / step) * step, hi: Math.ceil(max / step) * step, step };
}
export const chartCache = new Map();
// crta grafikon u PNG: pregled slajda i slika u Word-u (labels: naslov ose i izvor u samoj slici;
// frame: kartica sa zaobljenim uglovima u samoj slici, za Word gde nema zasebne podloge)
export function drawChart(o, opt = {}) {
  const sp = o.spec, c = o.c, font = fcss(o.font), key = JSON.stringify([sp, o.w, o.h, o.colors, c, o.look, o.shapes, o.axis, o.values, o.bold, o.gap, o.card, o.font, o.size, opt]);
  if (chartCache.has(key)) return chartCache.get(key);
  const CW = Math.round(Math.min(2800, Math.max(1200, o.w * 220))), CH = Math.round(CW * o.h / o.w), k = CW / (o.w * 72);
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
  const g = cv.getContext('2d'), F = pt => Math.round(pt * k), fs = F(o.size);
  const pad = opt.frame && o.card ? F(12) : 0, cw = CW - 2 * pad, ch = CH - 2 * pad;
  g.fillStyle = c.bg;
  if (pad) { g.beginPath(); g.roundRect(0, 0, CW, CH, S.corners === 'round' ? F(8) : 0); g.fill(); g.translate(pad, pad); } else g.fillRect(0, 0, CW, CH);
  g.textBaseline = 'middle';
  const font_ = (w, s) => `${w} ${s}px ${font}`;
  let top = F(6), bottom = ch - F(4);
  if (opt.labels && sp.y) { g.font = font_(400, fs); g.fillStyle = c.muted; g.textAlign = 'left'; g.fillText(sp.y, 0, top + fs * 0.6); top += fs * 1.8; }
  if (opt.labels && sp.source) { g.font = font_(400, Math.round(fs * 0.85)); g.fillStyle = c.muted; g.textAlign = 'left'; g.fillText(T('Izvor: ') + sp.source, 0, bottom - fs * 0.5); bottom -= fs * 1.6; }
  const S_ = sp.series, nS = S_.length, cats = sp.cats, nC = cats.length;
  if (!nS || !nC) { g.font = font_(400, fs); g.fillStyle = c.muted; g.textAlign = 'center'; g.fillText(T('Dodaj podatke u tabelu grafikona'), cw / 2, ch / 2); const u0 = cv.toDataURL('image/png'); chartCache.set(key, u0); return u0; }
  const done = () => { const u = cv.toDataURL('image/png'); chartCache.set(key, u); if (chartCache.size > 40) chartCache.delete(chartCache.keys().next().value); return u; };
  if (o.shapes && sp.type !== 'linije') {
    // isti oblici kao na slajdu, u prostoru između naslova ose i izvora
    const I = v => v * 72 * k, prims = chartPrims({ ...o, x: 0, y: top / (72 * k), w: cw / (72 * k), h: (bottom - top) / (72 * k), card: null });
    for (const q of prims) {
      if (q.k === 'rect') { g.fillStyle = q.fill; g.beginPath(); g.roundRect(I(q.x), I(q.y), I(q.w), I(q.h), I(q.r || 0)); g.fill(); continue; }
      const s = q.st, ax = s.align === 'center' ? q.x + q.w / 2 : s.align === 'right' ? q.x + q.w : q.x;
      g.font = font_(s.bold ? 700 : 400, F(s.size)); g.fillStyle = s.color; g.textAlign = s.align || 'left'; g.fillText(q.paras[0], I(ax), I(q.y + q.h / 2));
    }
    return done();
  }
  // linija preko cele širine, puna ili isprekidana
  const hline = (x0, x1, y, color, w, dash) => {
    g.fillStyle = color; const t = Math.max(1, F(w)), yy = Math.round(y);
    if (!dash) { g.fillRect(x0, yy, x1 - x0, t); return; }
    for (let x = x0; x < x1; x += F(6)) g.fillRect(x, yy, Math.min(F(3), x1 - x), t);
  };
  const vfs = F(o.size + (o.bold ? 2 : 0)), vfont = font_(o.bold ? 700 : 400, vfs);
  if (nS > 1 && sp.type !== 'linije') {
    g.font = font_(400, fs); let lx = 0; const ly = top + fs * 0.6;
    S_.forEach((s, i) => { g.fillStyle = o.colors[i]; g.fillRect(lx, ly - fs * 0.35, fs * 0.7, fs * 0.7); lx += fs; g.fillStyle = c.text; g.textAlign = 'left'; g.fillText(s.name, lx, ly); lx += g.measureText(s.name).width + fs * 1.4; });
    top += fs * 1.9;
  }
  const all = S_.flatMap(s => s.values), sc = niceScale(Math.min(0, ...all), Math.max(0, ...all));
  g.font = font_(400, fs);
  if (sp.type === 'vodoravni') {
    const labW = Math.min(cw * 0.35, Math.max(...cats.map(t => g.measureText(t).width)) + fs), x0 = labW, x1 = cw - fs * 4;
    const band = (bottom - top) / nC, bw = band * (o.gap || 0.62) / nS, X = v => x0 + (v - sc.lo) / (sc.hi - sc.lo) * (x1 - x0);
    cats.forEach((cat, ci) => {
      const yc = top + band * ci + band / 2;
      g.font = font_(400, fs); g.fillStyle = c.cat || c.text; g.textAlign = 'right'; g.fillText(cat, x0 - fs * 0.6, yc);
      S_.forEach((s, si) => {
        const v = s.values[ci], y = yc - (bw * nS) / 2 + si * bw, col = nS === 1 ? o.colors[ci % o.colors.length] : o.colors[si];
        g.fillStyle = col; g.fillRect(Math.min(X(0), X(v)), y, Math.abs(X(v) - X(0)), bw * 0.92);
        g.font = vfont; g.fillStyle = c.text; g.textAlign = 'left'; g.fillText(fmtNum(v), X(v) + fs * 0.4, y + bw * 0.46);
      });
    });
    g.fillStyle = c.base || c.text; g.fillRect(X(0) - 1, top, Math.max(1, F(0.75)), bottom - top);
  } else {
    const ticks = []; for (let v = sc.lo; v <= sc.hi + sc.step / 2; v += sc.step) ticks.push(v);
    const axis = o.axis !== false, labW = axis ? Math.max(...ticks.map(v => g.measureText(fmtNum(v)).width)) + fs * 0.8 : fs * 0.5;
    const x0 = labW, x1 = cw - (sp.type === 'linije' ? Math.min(cw * 0.22, Math.max(...S_.map(s => g.measureText(s.name).width)) + fs * 1.2) : fs * 0.5);
    const yB = bottom - fs * 1.8, Y = v => yB - (v - sc.lo) / (sc.hi - sc.lo) * (yB - top - fs);
    ticks.forEach(v => {
      if (c.grid !== null && v !== 0) hline(x0, x1, Y(v), c.grid || c.hair, c.gridW || 0.6, c.dash);
      if (axis) { g.fillStyle = c.muted; g.textAlign = 'right'; g.fillText(fmtNum(v), x0 - fs * 0.5, Y(v)); }
    });
    const band = (x1 - x0) / nC;
    if (sp.type === 'linije') {
      const px = ci => x0 + band * ci + band / 2;
      S_.forEach((s, si) => {
        g.strokeStyle = o.colors[si]; g.lineWidth = F(o.bold ? 3 : 2); g.lineJoin = 'round'; g.beginPath();
        s.values.forEach((v, ci) => (ci ? g.lineTo(px(ci), Y(v)) : g.moveTo(px(ci), Y(v)))); g.stroke();
        g.fillStyle = o.colors[si]; s.values.forEach((v, ci) => { g.beginPath(); g.arc(px(ci), Y(v), F(o.bold ? 4 : 3.2), 0, Math.PI * 2); g.fill(); });
        if (o.values) { g.font = vfont; g.fillStyle = c.text; g.textAlign = 'center'; s.values.forEach((v, ci) => g.fillText(fmtNum(v), px(ci), Y(v) - fs * 1.0)); g.font = font_(400, fs); }
        if (nS > 1) { g.textAlign = 'left'; g.font = font_(600, fs); g.fillText(s.name, px(nC - 1) + fs * 0.7, Y(s.values[nC - 1])); g.font = font_(400, fs); }
      });
    } else {
      const bw = band * (o.gap || 0.62) / nS;
      g.font = vfont;
      cats.forEach((cat, ci) => S_.forEach((s, si) => {
        const v = s.values[ci], x = x0 + band * ci + (band - bw * nS) / 2 + si * bw, col = nS === 1 ? o.colors[ci % o.colors.length] : o.colors[si];
        g.fillStyle = col; g.fillRect(x + bw * 0.04, Math.min(Y(0), Y(v)), bw * 0.92, Math.abs(Y(v) - Y(0)));
        g.fillStyle = c.text; g.textAlign = 'center'; g.fillText(fmtNum(v), x + bw / 2, (v >= 0 ? Y(v) - vfs * 0.75 : Y(v) + vfs * 0.75));
      }));
      g.font = font_(400, fs);
    }
    hline(x0, x1, Y(0), c.base || c.text, o.bold ? 0.75 : 0.9, false);
    g.fillStyle = c.cat || c.text; g.textAlign = 'center';
    cats.forEach((cat, ci) => g.fillText(cat, x0 + band * ci + band / 2, yB + fs * 1.0));
  }
  return done();
}
// zamena za sliku iz Markdown-a: polje sa opisom, koje se u PowerPoint-u/Word-u menja pravom slikom
export function placeholderPNG(wIn, hIn, label, p) {
  const cw = 1200, ch = Math.round(cw * hIn / wIn), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  const g = cv.getContext('2d'); g.fillStyle = p.surface; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = p.hair; g.lineWidth = 4; g.setLineDash([18, 12]); g.strokeRect(14, 14, cw - 28, ch - 28);
  g.fillStyle = p.muted; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 ${Math.round(ch * 0.07)}px ${fcss(S.fonts.body)}`; g.fillText(T('Ovde ide slika'), cw / 2, ch / 2 - ch * 0.05);
  g.font = `400 ${Math.round(ch * 0.05)}px ${fcss(S.fonts.body)}`; g.fillText(T(label).slice(0, 60), cw / 2, ch / 2 + ch * 0.06);
  return cv.toDataURL('image/png');
}
