// Naučni poster po pristupu „Better Poster“ i QR kod ka radu.
import qrcode from 'qrcode-generator';
import { refList } from '../content/citations.js';
import { parseMd, plainRuns, userMd } from '../content/markdown.js';
import { fcss } from '../core/fonts.js';
import { S } from '../core/state.js';
import { T, up } from '../core/text.js';
import { chartObj, chartShapes } from '../graphics/charts.js';
import { diagram } from '../graphics/diagram.js';
import { tableColors, tableShapes } from '../graphics/data-styles.js';
import { ensure, mix, toHsl } from '../lib/color.js';
import { fitSize, isNum } from '../slides/deck.js';
import { Img, Ln, P, R, Tx, fitBox, st } from '../slides/layout.js';

/* ---------- poster: „Better Poster“ (Mike Morrison) ----------
   glavni nalaz krupno u sredini, detalji sa strane, QR kod ka celom radu */
export const POSTER_MM = { A0: [1189, 841], A1: [841, 594] };
export function posterGeo() {
  const [a, b] = POSTER_MM[S.poster.size], land = S.poster.orient === 'land';
  return { W: (land ? a : b) / 25.4, H: (land ? b : a) / 25.4, f: S.poster.size === 'A1' ? Math.SQRT1_2 : 1, land, mm: land ? [a, b] : [b, a] };
}
// *reč* u glavnom nalazu postaje istaknuta
export const emphRuns = (text, emph) => String(text || '').split(/\*([^*]+)\*/).map((t, i) => ({ t: T(t), ...(i % 2 ? { bold: true, color: emph } : {}) })).filter(r => r.t);
export const qrCache = new Map();
export function qrPNG(text) {
  const key = text || '';
  if (qrCache.has(key)) return qrCache.get(key);
  const cv = document.createElement('canvas'), g = cv.getContext('2d');
  if (text) {
    if (qrcode.stringToBytesFuncs) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
    const n = qr.getModuleCount(), q = 4, px = Math.max(8, Math.floor(1200 / (n + 2 * q)));
    cv.width = cv.height = (n + 2 * q) * px;
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#111318';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) g.fillRect((c + q) * px, (r + q) * px, px, px);
  } else {
    // bez linka: prazno polje sa uputstvom
    cv.width = cv.height = 600;
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 600, 600);
    g.strokeStyle = '#9AA0A8'; g.lineWidth = 6; g.setLineDash([24, 16]); g.strokeRect(30, 30, 540, 540);
    g.fillStyle = '#6B7079'; g.font = `600 64px ${fcss(S.fonts.body)}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('QR', 300, 270);
    g.font = `400 34px ${fcss(S.fonts.body)}`; g.fillText(T('dodaj link do rada'), 300, 350);
  }
  const url = cv.toDataURL('image/png'); qrCache.set(key, url); return url;
}
export function poster() {
  const { W, H, f, land } = posterGeo(), p = P(), m = S.meta, hf = S.fonts.heading, bf = S.fonts.body;
  const u = v => v * f, pt = v => Math.round(v * f);
  const rr = S.corners === 'round' ? u(0.2) : 0, qrAlt = T('QR kod sa linkom do rada') + (m.link ? ': ' + m.link : '');
  const filled = S.style !== 'minimalni';
  const cBg = filled ? p.primary : p.surface, cText = filled ? p.onP : p.text, cSoft = filled ? p.soft : p.muted;
  // istaknute reči: akcenat samo ako je blizak primarnoj boji, inače svetlija nijansa primarne
  const near = (a, b) => { const d = Math.abs(toHsl(a)[0] - toHsl(b)[0]) % 360; return Math.min(d, 360 - d) < 60; };
  const cEmph = filled ? ensure(near(p.accent, p.primary) ? mix(p.accent, p.onP, 0.3) : mix(p.primary, '#FFFFFF', 0.6), cBg, 4.5) : p.pText;
  const lineCount = (text, wIn, size) => {
    const cpl = Math.max(4, Math.floor(wIn * 72 / (size * 0.58))); let lines = 1, cur = 0;
    for (const w of String(text).split(/\s+/).filter(Boolean)) { const add = w.length + (cur ? 1 : 0); if (cur && cur + add > cpl) { lines++; cur = w.length; } else cur += add; }
    return lines;
  };
  const O = [];
  const eyebrow = (x, y, w, txt, color) => O.push(Tx(x, y, w, u(0.6), [up(T(txt))], st(bf, pt(20), color, { bold: true, cs: pt(2) })));
  const logo = (box, align) => { if (S.logo) { const r = fitBox(box, S.logo.ar, align); O.push(Img(r.x, r.y, r.w, r.h, S.logo.data, T('Logotip' + (m.institution ? ': ' + m.institution : '')))); } };
  // naslov zauzima onoliko visine koliko mu treba, pa autori idu odmah ispod
  const title = (x, y, w, h, size) => {
    const t = T(m.title), sz = fitSize(t, w, h, pt(size), 1.0, pt(32)), th = Math.min(h, lineCount(t, w, sz) * sz * 1.2 / 72 + u(0.2));
    O.push(Tx(x, y, w, th, [t], st(hf, sz, p.text, { bold: true, spacing: 1.0 })));
    return th;
  };
  const authors = (x, y, w, h) => {
    const ps = [m.author && { runs: [{ t: T(m.author), bold: true }], size: pt(28), after: pt(4) }, m.institution && { runs: [{ t: T(m.institution), color: p.muted }] }, m.mentor && { runs: [{ t: T('Mentor: ' + m.mentor), color: p.muted }] }].filter(Boolean);
    if (ps.length) O.push(Tx(x, y, w, h, ps, st(bf, pt(24), p.text, { spacing: 1.15 })));
  };
  const finding = (x, y, w, h) => {
    const plain = T(String(m.finding || '').replace(/\*/g, ''));
    O.push(Tx(x, y, w, h, [{ runs: emphRuns(m.finding || T('Ovde napiši glavni nalaz u jednoj rečenici'), cEmph) }], st(hf, fitSize(plain, w, h, pt(110), 1.05, pt(48)), cText, { spacing: 1.05, valign: 'middle' })));
  };
  const MDP = userMd('poster') ? posterMd(userMd('poster')) : null;
  const SECTIONS = MDP && MDP.sections.length ? MDP.sections : [
    ['Problem', 'Optimizatori biraju plan izvršavanja pre pokretanja upita. Kada procena veličine međurezultata pogreši, plan ostaje loš do kraja.'],
    ['Metod', 'Plan se preispituje tokom izvršavanja, na osnovu stvarnih veličina međurezultata, a preostali spojevi se preuređuju po potrebi.'],
    ['Rezultati', 'Na 120 upita iz skupa LDBC SNB adaptivni izbor je u medijani 3,4 puta brži i troši 41% manje memorije.'],
    ['Zaključak', 'Adaptivni izbor plana može se dodati postojećim grafovskim bazama i ne menja rezultate upita.'],
  ];
  const sections = (x, y, w, h) => {
    const each = h / SECTIONS.length;
    SECTIONS.forEach(([lab, txt], i) => {
      const yy = y + i * each;
      eyebrow(x, yy, w, lab, p.pText);
      O.push(Tx(x, yy + u(0.75), w, each - u(1.0), [T(txt)], st(bf, pt(28), p.text, { spacing: 1.15 })));
    });
  };
  const figure = (x, y, w, h) => {
    if (MDP && MDP.chart) { O.push(...chartShapes(chartObj(MDP.chart, x, y, w, h, p, bf, pt(18)), rr, u(0.3))); const cap = MDP.chart.title || MDP.chart.y; if (cap) O.push(Tx(x, y + h + u(0.2), w, u(0.6), [T('Slika 1. ' + cap)], st(bf, pt(20), p.muted))); return; }
    O.push(Img(x, y, w, h, diagram(w, h), T('Slika 1. Tok obrade upita')));
    O.push(Tx(x, y + h + u(0.2), w, u(0.6), [T('Slika 1. Tok obrade upita')], st(bf, pt(20), p.muted)));
  };
  const rowH = u(0.75);
  const table = (x, y, w) => {
    const own = MDP && MDP.table, head = own ? own.head : ['Sistem', 'Vreme (ms)', 'Memorija (MB)'];
    const rows = own ? own.rows : [['Referentni sistem A', '412', '980'], ['Referentni sistem B', '356', '1.120'], ['Predloženi pristup', '121', '578']], n = head.length;
    O.push(Tx(x, y, w, u(0.6), [T('Tabela 1. ' + (own ? own.caption || '' : 'Prosečne vrednosti na 120 upita'))], st(bf, pt(20), p.text)));
    const tb = { k: 'table', x, y: y + u(0.7), w, colW: (n > 2 ? [0.5, ...Array(n - 1).fill(0.5 / (n - 1))] : Array(n).fill(1 / n)).map(c => c * w), rowH, font: bf, size: pt(22),
      head: head.map(T), rows: rows.map(r => r.map(v => (isNum(v) ? v : T(v)))), align: head.map((_, i) => (i && rows.every(r => isNum(r[i])) ? 'right' : 'left')), hi: own ? (own.hi >= 0 ? own.hi : -1) : 2, look: S.opts.tableStyle, c: tableColors(p) };
    O.push(...tableShapes(tb, rr, u(1)));
    return u(0.7) + (rows.length + 1) * rowH;
  };
  const refs = (x, y, w, h) => {
    eyebrow(x, y, w, 'Literatura', p.pText);
    O.push(Tx(x, y + u(0.75), w, h - u(0.75), refList().map(r => ({ runs: [...(r.label ? [{ t: r.label + ' ' }] : []), ...r.runs.map(x => ({ t: x.raw ? x.t : T(x.t), italic: !!x.i }))], after: pt(6) })), st(bf, pt(17), p.text, { spacing: 1.1 })));
  };
  const contact = (x, y, w) => {
    eyebrow(x, y, w, 'Kontakt', p.pText);
    const ps = [m.author && { runs: [{ t: T(m.author), bold: true }] }, m.email].filter(Boolean);
    if (ps.length) O.push(Tx(x, y + u(0.75), w, u(1.4), ps, st(bf, pt(24), p.text, { spacing: 1.15 })));
  };

  if (land) {
    // tri kolone: levo naslov i priča, u sredini glavni nalaz, desno dokazi
    const M = u(1.3), cx = W * 0.30, cw = W * 0.40, g = u(1.2), lw = cx - M - g, rx = cx + cw + g, rw = W - M - rx, pad = u(1.6);
    O.push(R(cx, 0, cw, H, cBg));
    if (m.course) eyebrow(M, u(1.5), lw, m.course, p.muted);
    const ay = u(2.2) + title(M, u(2.2), lw, u(4.6), 56) + u(0.6);
    authors(M, ay, lw, u(2.2));
    const ly = ay + u(2.5);
    O.push(Ln(M, ly, lw, p.hair, pt(1.5)));
    sections(M, ly + u(0.8), lw, H - M - ly - u(0.8));
    eyebrow(cx + pad, u(2.0), cw - 2 * pad, 'Glavni nalaz', cSoft);
    finding(cx + pad, u(3.2), cw - 2 * pad, u(17.5));
    O.push(Ln(cx + pad, u(22.2), cw - 2 * pad, mix(cText, cBg, 0.6), pt(1.5)));
    const qs = u(6.4), tx = cx + pad + qs + u(0.8), tw = cw - 2 * pad - qs - u(0.8);
    O.push(Img(cx + pad, u(23.4), qs, qs, qrPNG(m.link), qrAlt));
    O.push(Tx(tx, u(23.6), tw, u(1.2), [T('Skeniraj za ceo rad')], st(hf, pt(34), cText, { bold: true })));
    O.push(Tx(tx, u(25.0), tw, u(2.4), [m.link || T('Dodaj link do rada u podešavanjima')], st(bf, pt(22), cSoft, { spacing: 1.1 })));
    logo({ x: rx, y: u(1.3), w: rw, h: u(2.2) }, 'right');
    const fh = rw / 1.3;
    figure(rx, u(4.2), rw, fh);
    let y = u(4.2) + fh + u(1.3);
    y += table(rx, y, rw) + u(1.2);
    refs(rx, y, rw, u(4.6));
    contact(rx, H - M - u(2.2), rw);
  } else {
    // uspravno: naslov gore, traka sa glavnim nalazom, ispod dve kolone
    const M = u(1.3), bandH = u(15.2), pad = u(1.4);
    if (m.course) eyebrow(M, u(1.4), W * 0.7, m.course, p.muted);
    const ay = u(2.1) + title(M, u(2.1), W * 0.72, u(4.2), 60) + u(0.5);
    authors(M, ay, W * 0.72, u(2.2));
    const bandY = ay + u(2.8);
    logo({ x: W - M - u(6), y: u(1.4), w: u(6), h: u(3) }, 'right');
    O.push(R(0, bandY, W, bandH, cBg));
    const qs = u(6.6), qx = W - M - qs;
    eyebrow(M, bandY + pad, W * 0.5, 'Glavni nalaz', cSoft);
    finding(M, bandY + pad + u(1.0), qx - u(1.4) - M, bandH - 2 * pad - u(1.0));
    O.push(Img(qx, bandY + u(2.0), qs, qs, qrPNG(m.link), qrAlt));
    O.push(Tx(qx - u(1), bandY + u(2.0) + qs + u(0.4), qs + u(2), u(1.0), [T('Skeniraj za ceo rad')], st(hf, pt(26), cText, { bold: true, align: 'center' })));
    O.push(Tx(qx - u(1), bandY + u(2.0) + qs + u(1.5), qs + u(2), u(1.4), [m.link || T('Dodaj link do rada')], st(bf, pt(18), cSoft, { align: 'center', spacing: 1.1 })));
    const top = bandY + bandH + u(1.4), cw = (W - 2 * M - u(1.4)) / 2, rx = M + cw + u(1.4);
    sections(M, top, cw, H - M - top);
    const fh = cw / 2.0;
    figure(rx, top, cw, fh);
    let y = top + fh + u(1.1);
    y += table(rx, y, cw) + u(0.9);
    refs(rx, y, cw, u(3.6));
    contact(rx, Math.max(y + u(4.0), H - M - u(2.2)), cw);
  }
  return { W, H, bg: p.bg, objects: O };
}


/* ---------- poster iz sopstvenog sadržaja: ## odeljci levo, prva tabela i prvi grafikon desno ---------- */
export function posterMd(src) {
  const out = { sections: [], table: null, chart: null }; let cur = null;
  for (const x of parseMd(src)) {
    if (x.k === 'h' && x.level <= 2) { cur = [x.text, '']; out.sections.push(cur); continue; }
    if (x.k === 'table' && !out.table) { out.table = x; continue; }
    if (x.k === 'chart' && !out.chart) { out.chart = x.spec; continue; }
    const text = x.k === 'p' || x.k === 'quote' ? plainRuns(x.runs) : x.k === 'ul' || x.k === 'ol' ? x.items.map(plainRuns).join('; ') : '';
    if (!text) continue;
    if (!cur) { cur = ['', '']; out.sections.push(cur); }
    cur[1] = (cur[1] ? cur[1] + ' ' : '') + text;
  }
  out.sections = out.sections.slice(0, 5);
  return out;
}
