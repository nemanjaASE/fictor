// Izvoz u Word (.docx): stilovi, naslovna strana, sadržaj, tabele, literatura.
import * as D from 'docx';
import { buildCtx, refList } from '../content/citations.js';
import { resolveRuns } from '../content/markdown.js';
import { S } from '../core/state.js';
import { T, slug, up } from '../core/text.js';
import { DOC_NAMES, FIG_IN, K, docBlocks, docChart, docPal, docTable, docType, mentorLbl } from '../docs/blocks.js';
import { drawChart, placeholderPNG } from '../graphics/charts.js';
import { diagram } from '../graphics/diagram.js';
import { listLook, tableGrid } from '../graphics/data-styles.js';
import { hx } from '../lib/color.js';
import { isNum } from '../slides/deck.js';

export function b64bytes(dataUrl) { const s = atob(dataUrl.split(',')[1]); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
export async function buildDocx() {
  buildCtx();
  const k = K(), m = S.meta, hf = k.head, bf = k.body, mf = S.fonts.mono, TW = 9070;
  // znak liste: tačka ostaje u sporednoj boji, ostali izgledi u svojoj boji i fontom Arial
  const bu = listLook(S.opts.listStyle, { pText: k.primary, muted: k.muted, aText: k.accentText });
  const X = hx, Rn = (t, o = {}) => new D.TextRun({ text: t, ...o });
  const runsDocx = (runs, base = {}) => resolveRuns(runs).map(r => Rn(r.code ? r.t : T(r.t), { ...base, ...(r.b ? { bold: true } : {}), ...(r.i ? { italics: true } : {}), ...(r.code ? { font: S.fonts.mono } : {}) }));
  const NB = { style: D.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const tblNone = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
  const hairB = { style: D.BorderStyle.SINGLE, size: 4, color: X(k.hair) };
  const spacer = tw => new D.Paragraph({ spacing: { before: tw, after: 0 }, children: [] });
  const boxTable = (children, pad) => new D.Table({
    width: { size: TW, type: D.WidthType.DXA }, columnWidths: [TW], borders: tblNone,
    rows: [new D.TableRow({ children: [new D.TableCell({ width: { size: TW, type: D.WidthType.DXA }, shading: { type: D.ShadingType.CLEAR, color: 'auto', fill: X(k.primary) }, borders: { top: NB, bottom: NB, left: NB, right: NB }, margins: { top: pad, bottom: pad, left: pad + 60, right: pad + 60 }, children })] })],
  });

  /* naslovna strana */
  const cover = [], centered = S.style === 'akademski', al = centered ? { alignment: D.AlignmentType.CENTER } : {};
  if (S.logo) {
    let w = 180, h = 180 / S.logo.ar; if (h > 70) { h = 70; w = 70 * S.logo.ar; }
    cover.push(new D.Paragraph({ ...al, spacing: { after: 480 }, children: [new D.ImageRun({ type: 'png', data: b64bytes(S.logo.data), transformation: { width: Math.round(w), height: Math.round(h) }, altText: { name: 'Logotip', title: T('Logotip'), description: T('Logotip' + (m.institution ? ': ' + m.institution : '')) } })] }));
  }
  if (m.institution) cover.push(new D.Paragraph({ ...al, spacing: { after: 40 }, children: [Rn(up(T(m.institution)), { size: 18, bold: true, color: X(k.muted), characterSpacing: 40 })] }));
  if (m.course) cover.push(new D.Paragraph({ ...al, spacing: { after: 0 }, children: [Rn(T(m.course), { size: 20, color: X(k.muted) })] }));
  const typeP = color => new D.Paragraph({ ...al, spacing: { after: 160 }, children: [Rn(up(T(docType())), { size: 18, bold: true, color: X(color), characterSpacing: 50 })] });
  const titleP = color => new D.Paragraph({ ...al, heading: D.HeadingLevel.TITLE, children: [Rn(T(m.title), color ? { color: X(color) } : {})] });
  const subP = color => new D.Paragraph({ ...al, style: 'Podnaslov', children: [Rn(T(m.subtitle), color ? { color: X(color) } : {})] });
  const metaTable = () => {
    const rows = [['Student', m.author], ['Broj indeksa', m.index], ['Predmet', m.course], [mentorLbl(), m.mentor], ['Datum', m.date]].filter(r => r[1]);
    if (!rows.length) return null;
    const lw = 2400;
    const mcell = (runs, w) => new D.TableCell({ width: { size: w, type: D.WidthType.DXA }, borders: { top: NB, left: NB, right: NB, bottom: hairB }, margins: { top: 110, bottom: 110, left: 0, right: 120 }, verticalAlign: D.VerticalAlign.CENTER, children: [new D.Paragraph({ spacing: { after: 0 }, children: runs })] });
    return new D.Table({
      width: { size: TW, type: D.WidthType.DXA }, columnWidths: [lw, TW - lw], borders: tblNone,
      rows: rows.map(([l, v]) => new D.TableRow({ children: [mcell([Rn(up(T(l)), { size: 16, bold: true, color: X(k.muted), characterSpacing: 30 })], lw), mcell([Rn(T(v), { size: 22 })], TW - lw)] })),
    });
  };
  if (S.style === 'akademski') {
    // tradicionalna naslovna strana: sve centrirano, mentor levo i student desno pri dnu
    cover.push(spacer(S.logo ? 2250 : 2850), typeP(k.muted), titleP());
    if (m.subtitle) cover.push(subP());
    cover.push(spacer(2550));
    const half = Math.round(TW / 2);
    const sc = (lines, align, w) => new D.TableCell({
      width: { size: w, type: D.WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: lines.map((l, i) => new D.Paragraph({ alignment: align, spacing: { after: 40 }, children: [Rn(l, i === 0 ? { size: 18, color: X(k.muted) } : { size: 22 })] })),
    });
    const left = [T(mentorLbl() + ':')].concat(m.mentor ? [T(m.mentor)] : []);
    const right = [T('Student:')].concat([m.author, m.index].filter(Boolean).map(T));
    cover.push(new D.Table({ width: { size: TW, type: D.WidthType.DXA }, columnWidths: [half, TW - half], borders: tblNone, rows: [new D.TableRow({ children: [sc(left, D.AlignmentType.LEFT, half), sc(right, D.AlignmentType.RIGHT, TW - half)] })] }));
    cover.push(spacer(900));
    if (m.date) cover.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [Rn(T(m.date), { size: 20, color: X(k.muted) })] }));
  } else if (S.style === 'korporativni') {
    cover.push(spacer(S.logo ? 1650 : 2400));
    const ch = [typeP(k.soft), titleP(k.onP)]; if (m.subtitle) ch.push(subP(k.soft));
    cover.push(boxTable(ch, 480), spacer(1950));
    const mt = metaTable(); if (mt) cover.push(mt);
  } else {
    cover.push(spacer(S.logo ? 1800 : 2600), typeP(k.primary), titleP());
    if (m.subtitle) cover.push(subP());
    cover.push(new D.Paragraph({ spacing: { before: 240, after: 1800 }, border: { bottom: { style: D.BorderStyle.SINGLE, size: 4, color: X(k.hair), space: 1 } }, children: [] }));
    const mt = metaTable(); if (mt) cover.push(mt);
  }

  /* sadržaj */
  const prav = S.opts.pravilnik, lang = S.opts.script === 'cyr' ? 'sr-Cyrl-RS' : 'sr-Latn-RS';
  const sz = prav ? { body: 24, h1: 28, h2: 24, title: 40, line: 360 } : { body: 22, h1: 30, h2: 24, title: 56, line: 288 };
  const just = prav ? { alignment: D.AlignmentType.JUSTIFIED } : {};
  const body = []; let breakNext = false, hasToc = false;
  const brk = () => { const o = breakNext ? { pageBreakBefore: true } : {}; breakNext = false; return o; };
  for (const b of docBlocks()) {
    if (b.k === 'pagebreak') { breakNext = true; continue; }
    if (b.k === 'h1') body.push(new D.Paragraph({ ...brk(), heading: D.HeadingLevel.HEADING_1, numbering: { reference: 'poglavlja', level: 0 }, children: [Rn(T(b.t))] }));
    else if (b.k === 'h2') body.push(new D.Paragraph({ ...brk(), heading: D.HeadingLevel.HEADING_2, numbering: { reference: 'poglavlja', level: 1 }, children: [Rn(T(b.t))] }));
    else if (b.k === 'h1u') body.push(new D.Paragraph({ ...brk(), heading: D.HeadingLevel.HEADING_1, children: [Rn(T(b.t))] }));
    else if (b.k === 'unh') body.push(new D.Paragraph({ ...brk(), style: 'NaslovBezBroja', ...(b.gap ? { spacing: { before: 480, after: 160 } } : {}), children: [Rn(T(b.t))] }));
    else if (b.k === 'kw') body.push(new D.Paragraph({ ...brk(), ...just, children: [Rn(T('Ključne reči: '), { bold: true }), Rn(T(b.t))] }));
    else if (b.k === 'toc') { hasToc = true; body.push(new D.TableOfContents(T('Sadržaj'), { hyperlink: true, headingStyleRange: '1-2' })); }
    else if (b.k === 'guide') body.push(new D.Paragraph({ ...brk(), style: 'Uputstvo', children: [Rn(T(b.t))] }));
    else if (b.k === 'p') body.push(new D.Paragraph({ ...brk(), ...just, children: runsDocx(b.runs) }));
    else if (b.k === 'h3') body.push(new D.Paragraph({ ...brk(), keepNext: true, spacing: { before: 200, after: 80 }, children: runsDocx(b.runs, { bold: true }) }));
    else if (b.k === 'note') body.push(new D.Paragraph({ style: 'Napomena', border: { left: { style: D.BorderStyle.SINGLE, size: 12, color: X(k.primary), space: 10 } }, shading: { type: D.ShadingType.CLEAR, color: 'auto', fill: X(k.surface) }, children: b.label ? [Rn(T(b.label) + ': ', { bold: true }), Rn(T(b.t))] : runsDocx(b.runs) }));
    else if (b.k === 'bullets' || b.k === 'numbered') {
      const inst = body.length; // svaka numerisana lista kreće od 1
      b.items.forEach((t, i) => body.push(new D.Paragraph({ numbering: { reference: b.k === 'bullets' ? 'tacke' : 'struktura', level: 0, instance: inst }, spacing: { after: i === b.items.length - 1 ? 160 : 60 }, children: typeof t === 'string' ? [Rn(T(t))] : runsDocx(t) })));
    }
    else if (b.k === 'rq') b.items.forEach(([tag, t]) => body.push(new D.Paragraph({ indent: { left: 794, hanging: 794 }, spacing: { after: 100 }, children: [Rn(T(tag), { bold: true, color: X(k.primary) }), new D.TextRun({ children: [new D.Tab(), T(t)] })] })));
    else if (b.k === 'figure') {
      // slika i opis ispod nje, centrirano
      const [wi, hi] = FIG_IN;
      body.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 0 }, children: [new D.ImageRun({ type: 'png', data: b64bytes(b.placeholder ? placeholderPNG(wi, hi, b.placeholder, docPal(k)) : diagram(wi, hi, docPal(k))), transformation: { width: Math.round(wi * 96), height: Math.round(hi * 96) }, altText: { name: 'Slika', title: T(b.caption), description: T(b.placeholder || b.caption) } })] }));
      body.push(new D.Paragraph({ style: 'OpisSlike', alignment: D.AlignmentType.CENTER, children: [Rn(T(b.caption))] }));
    } else if (b.k === 'chart') {
      const co = docChart(b.spec, k);
      body.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 0 }, children: [new D.ImageRun({ type: 'png', data: b64bytes(drawChart(co, { labels: true, frame: true })), transformation: { width: Math.round(co.w * 96), height: Math.round(co.h * 96) }, altText: { name: 'Grafikon', title: T(b.caption), description: co.alt } })] }));
      body.push(new D.Paragraph({ style: 'OpisSlike', alignment: D.AlignmentType.CENTER, children: [Rn(T(b.caption))] }));
    } else if (b.k === 'code') {
      body.push(new D.Paragraph({ style: 'OpisTabele', children: [Rn(T(b.caption))] }));
      b.lines.forEach((l, i) => body.push(new D.Paragraph({ style: 'Kod', keepNext: i < b.lines.length - 1, shading: { type: D.ShadingType.CLEAR, color: 'auto', fill: X(k.surface) }, indent: { left: 200 }, spacing: { after: i === b.lines.length - 1 ? 240 : 0 }, children: [Rn(l || ' ')] })));
    } else if (b.k === 'table') {
      // naslov tabele iznad; ćelije u izabranom izgledu (kartica: svaka ćelija u boji kartice)
      body.push(new D.Paragraph({ style: 'OpisTabele', children: [Rn(T(b.caption))] }));
      const cols = b.widths.map(w => Math.round(w * TW));
      const right = b.head.map((_, i) => i && b.rows.every(r => isNum(r[i])));
      const edge = e => (e ? { style: D.BorderStyle.SINGLE, size: Math.round(e.w * 8), color: X(e.c) } : NB);
      const cell = ({ t, i, x }) => new D.TableCell({
        width: { size: cols[i], type: D.WidthType.DXA }, borders: { top: edge(x.top), right: edge(x.right), bottom: edge(x.bottom), left: edge(x.left) },
        ...(x.fill ? { shading: { type: D.ShadingType.CLEAR, color: 'auto', fill: X(x.fill) } } : {}),
        margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: D.VerticalAlign.CENTER,
        children: [new D.Paragraph({ alignment: right[i] ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT, spacing: { after: 0, line: 260 }, children: [Rn(T(t), { size: x.small ? 16 : 20, bold: x.bold, color: X(x.fg), ...(x.small ? { characterSpacing: 10 } : {}) })] })],
      });
      body.push(new D.Table({
        width: { size: TW, type: D.WidthType.DXA }, columnWidths: cols, borders: tblNone,
        rows: tableGrid(docTable(b, k), true).map((row, r) => new D.TableRow(r ? { cantSplit: true, children: row.map(cell) } : { tableHeader: true, children: row.map(cell) })),
      }));
      body.push(new D.Paragraph({ spacing: { before: 0, after: 120 }, children: [] }));
    } else if (b.k === 'refs') refList().forEach(r => body.push(new D.Paragraph({ style: 'Literatura', children: [...(r.label ? [Rn(r.label), new D.TextRun({ children: [new D.Tab()] })] : []), ...r.runs.map(x => Rn(x.raw ? x.t : T(x.t), x.i ? { italics: true } : {}))] })));
  }

  const header = new D.Header({ children: [new D.Paragraph({
    tabStops: [{ type: D.TabStopType.RIGHT, position: TW }], border: { bottom: { style: D.BorderStyle.SINGLE, size: 4, color: X(k.hair), space: 6 } },
    children: [Rn(T(m.title).length > 70 ? T(m.title).slice(0, 68) + '…' : T(m.title), { size: 16, color: X(k.muted) }), new D.TextRun({ children: [new D.Tab(), T(docType())], size: 16, color: X(k.muted) })],
  })] });
  const footer = new D.Footer({ children: [new D.Paragraph({ alignment: D.AlignmentType.RIGHT, children: [new D.TextRun({ children: [T('Strana '), D.PageNumber.CURRENT, T(' od '), D.PageNumber.TOTAL_PAGES_IN_SECTION], size: 16, color: X(k.muted) })] })] });
  const page = { size: { width: 11906, height: 16838 }, margin: { top: 1418, bottom: 1418, left: 1418, right: 1418, header: 709, footer: 709 } };

  const doc = new D.Document({
    creator: m.author || 'Fictor', title: m.title || '', description: docType(),
    ...(hasToc ? { features: { updateFields: true } } : {}),
    styles: {
      default: {
        document: { run: { font: bf, size: sz.body, color: X(k.text), language: { value: lang } }, paragraph: { spacing: { line: sz.line, after: 120 } } },
        title: { run: { font: hf, size: sz.title, bold: true, color: X(k.text) }, paragraph: { spacing: { before: 0, after: 160, line: 264 } } },
        heading1: { run: { font: hf, size: sz.h1, bold: true, color: X(k.primary) }, paragraph: { spacing: { before: 360, after: 120 }, keepNext: true, keepLines: true } },
        heading2: { run: { font: hf, size: sz.h2, bold: true, color: X(k.text) }, paragraph: { spacing: { before: 260, after: 80 }, keepNext: true } },
      },
      paragraphStyles: [
        { id: 'Podnaslov', name: 'Podnaslov', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, color: X(k.muted) }, paragraph: { spacing: { after: 120 } } },
        { id: 'NaslovBezBroja', name: 'Naslov bez broja', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: hf, size: sz.h1, bold: true, color: X(k.primary) }, paragraph: { spacing: { before: 0, after: 160 }, keepNext: true } },
        { id: 'Uputstvo', name: 'Uputstvo', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 20, italics: true, color: X(k.muted) }, paragraph: { keepNext: true } },
        { id: 'Napomena', name: 'Napomena', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 21 }, paragraph: { indent: { left: 284 }, spacing: { before: 120, after: 220, line: 288 } } },
        { id: 'Kod', name: 'Kod', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: mf, size: 18 }, paragraph: { spacing: { after: 0, line: 252 } } },
        { id: 'OpisTabele', name: 'Naslov tabele', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 18 }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true } },
        { id: 'OpisSlike', name: 'Opis slike', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 18, italics: true, color: X(k.muted) }, paragraph: { spacing: { before: 80, after: 240 } } },
        { id: 'Literatura', name: 'Literatura', basedOn: 'Normal', next: 'Literatura', quickFormat: true, run: { size: 20 }, paragraph: { indent: { left: 567, hanging: 567 }, spacing: { after: 100 } } },
      ],
    },
    numbering: { config: [
      { reference: 'poglavlja', levels: [
        { level: 0, format: D.LevelFormat.DECIMAL, text: '%1.', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 567 } }, run: { color: X(k.primary) } } },
        { level: 1, format: D.LevelFormat.DECIMAL, text: '%1.%2.', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 680, hanging: 680 } }, run: { color: X(k.text) } } },
      ] },
      { reference: 'tacke', levels: [{ level: 0, format: D.LevelFormat.BULLET, text: bu.char, alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 283 } }, run: { color: X(bu.color || k.muted), ...(bu.code !== '2022' ? { font: 'Arial' } : {}) } } }] },
      { reference: 'struktura', levels: [{ level: 0, format: D.LevelFormat.DECIMAL, text: '%1.', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } }, ...(bu.color ? { run: { color: X(bu.color) } } : {}) } }] },
    ] },
    sections: [
      { properties: { page }, children: cover },
      { properties: { page: { ...page, pageNumbers: { start: 1 } } }, headers: { default: header }, footers: { default: footer }, children: body },
    ],
  });
  return { blob: await D.Packer.toBlob(doc), name: slug(m.title || DOC_NAMES[S.doc]) + '-' + S.doc + '.docx' };
}
