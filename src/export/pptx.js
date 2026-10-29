// Izvoz u PowerPoint (.pptx): matrica slajdova, tema, grafikoni, srpski jezik teksta.
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import { buildCtx } from '../content/citations.js';
import { S } from '../core/state.js';
import { T, slug } from '../core/text.js';
import { chartPalette } from '../graphics/charts.js';
import { bulletXml, listLook, tableGrid } from '../graphics/data-styles.js';
import { ALT, altName, altReset, altXml } from './alt.js';
import { ensure, hx, lum, mix } from '../lib/color.js';
import { esc } from '../lib/dom.js';
import { poster } from '../poster/poster.js';
import { slides } from '../slides/deck.js';
import { G, ORDER, P, layouts } from '../slides/layout.js';
import { normP } from '../slides/preview.js';
import { themeLabel } from '../ui/controls.js';

/* ---------- pravljenje fajlova ---------- */
export function pBox(s) {
  const o = { fontFace: s.font, fontSize: s.size, color: hx(s.color), bold: !!s.bold, align: s.align || 'left', valign: s.valign || 'top', margin: 0 };
  if (s.spacing) o.lineSpacingMultiple = s.spacing;
  if (s.cs) o.charSpacing = s.cs;
  return o;
}
export function pRuns(paras, s) {
  const ps = paras.map(normP), out = [];
  ps.forEach((p, i) => {
    p.runs.forEach((r, j) => {
      const o = { fontFace: r.font || p.font || s.font, fontSize: p.size || s.size, color: hx(r.color || p.color || s.color), bold: r.bold ?? p.bold ?? !!s.bold, italic: !!r.italic, align: p.align || s.align || 'left' };
      if (s.spacing) o.lineSpacingMultiple = s.spacing;
      if (s.cs) o.charSpacing = s.cs;
      if (p.after) o.paraSpaceAfter = p.after;
      if (p.bullet === 'dot') o.bullet = { code: listLook(S.opts.listStyle, {}).code, indent: 20 };
      else if (p.bullet === 'num') o.bullet = { type: 'number', indent: 24 };
      else o.bullet = false; // inače pasus nasleđuje tačku iz rasporeda
      if (j === p.runs.length - 1 && i < ps.length - 1) o.breakLine = true;
      out.push({ text: r.t, options: o });
    });
  });
  return out;
}
export function clrScheme() {
  const c = S.colors, dark = lum(c.bg) < 0.3, x = v => `<a:srgbClr val="${hx(v)}"/>`;
  const dk1 = dark ? c.bg : c.text, lt1 = dark ? c.text : c.bg;
  const dk2 = dark ? c.surface : mix(c.primary, '#000000', 0.45), lt2 = dark ? mix(c.text, c.bg, 0.15) : c.surface;
  const acc = chartPalette(6, P());
  const name = esc('Fictor · ' + themeLabel());
  return `<a:clrScheme name="${name}"><a:dk1>${x(dk1)}</a:dk1><a:lt1>${x(lt1)}</a:lt1><a:dk2>${x(dk2)}</a:dk2><a:lt2>${x(lt2)}</a:lt2>` +
    acc.map((v, i) => `<a:accent${i + 1}>${x(v)}</a:accent${i + 1}>`).join('') +
    `<a:hlink>${x(ensure(c.primary, c.bg, 4.5))}</a:hlink><a:folHlink>${x(c.muted)}</a:folHlink></a:clrScheme>`;
}
// SVG ostaje pun data: URL: PptxGenJS iz njega crta PNG zamenu za PowerPoint bez podrške za SVG
const imgData = d => (d.startsWith('data:image/svg') ? d : d.replace(/^data:/, ''));
export function addExtra(pptx, slide, o) {
  const S_ = pptx.ShapeType, named = (name, alt) => (alt ? { objectName: altName(name, alt) } : {});
  if (o.k === 'rect') slide.addShape(o.r ? S_.roundRect : S_.rect, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: hx(o.fill) }, ...(o.r ? { rectRadius: o.r } : {}), ...named(T('Grafikon'), o.alt) });
  else if (o.k === 'ellipse') slide.addShape(S_.ellipse, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: hx(o.fill) } });
  else if (o.k === 'line') slide.addShape(S_.line, { x: o.x, y: o.y, w: o.w, h: 0, line: { color: hx(o.color), width: o.width } });
  else if (o.k === 'text') slide.addText(pRuns(o.paras, o.st), { x: o.x, y: o.y, w: o.w, h: o.h, ...pBox(o.st) });
  else if (o.k === 'image') slide.addImage({ data: imgData(o.data), x: o.x, y: o.y, w: o.w, h: o.h, altText: o.alt || '' });
  else if (o.k === 'chart') {
    // pravi PowerPoint grafikon: menja se desnim klikom → Uredi podatke
    const sp = o.spec, line = sp.type === 'linije', horiz = sp.type === 'vodoravni', vals = sp.series.flatMap(x => x.values);
    if (!sp.series.length || !sp.cats.length) return;
    slide.addChart(line ? pptx.ChartType.line : pptx.ChartType.bar, sp.series.map(x => ({ name: x.name, labels: sp.cats, values: x.values })), {
      // razmak između grupa stubića: isti deo širine kategorije pod stubićima kao u pregledu (o.gap)
      x: o.x, y: o.y, w: o.w, h: o.h, altText: o.alt || '', barDir: horiz ? 'bar' : 'col', barGapWidthPct: Math.min(500, Math.round(sp.series.length * (1 - (o.gap || 0.62)) / (o.gap || 0.62) * 100)), chartColors: o.colors.map(hx),
      chartArea: { fill: { color: hx(o.c.bg) } }, plotArea: { fill: { color: hx(o.c.bg) } },
      catAxisLabelColor: hx(o.c.cat || o.c.text), valAxisLabelColor: hx(o.c.muted), catAxisLabelFontFace: o.font, valAxisLabelFontFace: o.font, catAxisLabelFontSize: o.size, valAxisLabelFontSize: o.size,
      catAxisLineColor: hx(o.c.base || o.c.text), catAxisLineSize: 0.75, catAxisMajorTickMark: 'none',
      // izgled: mreža (ili bez nje), brojevi na osi, vrednosti i na tačkama linije
      valGridLine: horiz || o.c.grid === null ? { style: 'none' } : { color: hx(o.c.grid || o.c.hair), size: o.c.gridW || 0.75, style: o.c.dash ? 'dash' : 'solid' }, catGridLine: { style: 'none' }, valAxisLineShow: false, valAxisHidden: horiz || o.axis === false,
      catAxisOrientation: horiz ? 'maxMin' : 'minMax', ...(Math.min(...vals) >= 0 ? { valAxisMinVal: 0 } : {}),
      showLegend: sp.series.length > 1, legendPos: 't', legendFontFace: o.font, legendFontSize: o.size, legendColor: hx(o.c.text),
      showValue: !line || !!o.values, dataLabelColor: hx(o.c.text), dataLabelFontFace: o.font, dataLabelFontSize: o.size + (o.bold ? 2 : 0), dataLabelFontBold: !!o.bold, dataLabelPosition: line ? 't' : 'outEnd',
      lineSize: o.bold ? 3 : 2, lineDataSymbol: 'circle', lineDataSymbolSize: o.bold ? 8 : 7,
    });
  }
  else if (o.k === 'table') {
    // izgled ćelija iz izabranog izgleda tabele (ivice redom: gore, desno, dole, levo)
    const b = e => (e ? { type: 'solid', pt: e.w, color: hx(e.c) } : { type: 'none' });
    const rows = tableGrid(o).map(row => row.map(({ t, i, x, code }) => ({ text: t, options: {
      bold: x.bold, color: hx(x.fg), align: (o.align && o.align[i]) || (i ? 'right' : 'left'), border: [b(x.top), b(x.right), b(x.bottom), b(x.left)],
      ...(x.fill ? { fill: { color: hx(x.fill) } } : {}), ...(code ? { fontFace: o.mono } : {}), ...(x.small ? { fontSize: Math.round(o.size * 0.75) } : {}) } })));
    slide.addTable(rows, { x: o.x, y: o.y, w: o.w, colW: o.colW, rowH: o.rowH, fontFace: o.font, fontSize: o.size, valign: 'middle', ...named(T('Tabela'), o.alt) });
  }
}
export async function finishPptx(pptx) {
  const zip = await JSZip.loadAsync(await pptx.write({ outputType: 'arraybuffer' }));
  // tema: tvoja paleta u Dizajn → Varijante → Boje
  const tf = 'ppt/theme/theme1.xml';
  zip.file(tf, (await zip.file(tf).async('string')).replace(/<a:clrScheme[\s\S]*?<\/a:clrScheme>/, clrScheme()));
  // matrica: bez podrazumevanog razmaka iznad pasusa; tamna tema menja mapiranje boja
  const mf = 'ppt/slideMasters/slideMaster1.xml';
  let mx = (await zip.file(mf).async('string')).replace(/<a:spcBef><a:spcPct val="20000"\/><\/a:spcBef>/g, '<a:spcBef><a:spcPts val="0"/></a:spcBef>').replace('<a:lvl1pPr algn="ctr"', '<a:lvl1pPr algn="l"');
  if (lum(S.colors.bg) < 0.3) mx = mx.replace('bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2"', 'bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2"');
  zip.file(mf, mx);
  // PptxGenJS dodaje prazan raspored „DEFAULT“; daj mu ime na našem jeziku
  for (const lf of zip.file(/^ppt\/slideLayouts\/slideLayout\d+\.xml$/)) {
    const x = await lf.async('string');
    if (x.includes('<p:cSld name="DEFAULT">')) zip.file(lf.name, x.replace('<p:cSld name="DEFAULT">', `<p:cSld name="${esc(T('Prazan'))}">`));
  }
  // jezik teksta: srpski, da PowerPoint proverava srpski pravopis; znak liste u boji izgleda liste
  const lang = S.opts.script === 'cyr' ? 'sr-Cyrl-RS' : 'sr-Latn-RS', bu = listLook(S.opts.listStyle, P());
  for (const xf of zip.file(/^ppt\/(presentation\.xml|(slides|slideLayouts|slideMasters|notesSlides|notesMasters)\/[^/]+\.xml)$/)) {
    const x = await xf.async('string'), y = altXml(bulletXml(x.replace(/lang="en-US"/g, `lang="${lang}"`), bu), ALT);
    if (y !== x) zip.file(xf.name, y);
  }
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', compression: 'DEFLATE' });
  return blob;
}
export async function buildPoster() {
  buildCtx(); altReset();
  const pptx = new PptxGenJS(), Pst = poster(), m = S.meta;
  pptx.defineLayout({ name: 'POSTER', width: Pst.W, height: Pst.H }); pptx.layout = 'POSTER';
  pptx.author = m.author || ''; pptx.company = m.institution || ''; pptx.title = m.title || ''; pptx.subject = m.course || '';
  pptx.theme = { headFontFace: S.fonts.heading, bodyFontFace: S.fonts.body };
  const slide = pptx.addSlide(); slide.background = { color: hx(Pst.bg) };
  for (const o of Pst.objects) addExtra(pptx, slide, o);
  slide.addNotes(T('Štampa: Datoteka → Izvezi → PDF, pa PDF pošalji u štampariju. Veličina slajda je ' + S.poster.size + '.'));
  return { blob: await finishPptx(pptx), name: slug(m.title || 'poster') + '-poster-' + S.poster.size + '.pptx' };
}
export async function buildPptx() {
  buildCtx(); altReset();
  const pptx = new PptxGenJS(), { W, H } = G(), m = S.meta;
  pptx.defineLayout({ name: 'FICTOR', width: W, height: H }); pptx.layout = 'FICTOR';
  pptx.author = m.author || ''; pptx.company = m.institution || ''; pptx.title = m.title || ''; pptx.subject = m.course || '';
  pptx.theme = { headFontFace: S.fonts.heading, bodyFontFace: S.fonts.body };
  const Ls = layouts(), S_ = pptx.ShapeType;
  for (const id of ORDER) {
    const L = Ls[id], objects = [];
    for (const o of L.objects) {
      // zaobljen pravougaonik u matrici ide kao oblik sa praznim tekstom (PptxGenJS ovde nema zaobljenje za rect)
      if (o.k === 'rect' && o.r) objects.push({ text: { text: '', options: { shape: S_.roundRect, rectRadius: o.r, x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: hx(o.fill) } } } });
      else if (o.k === 'rect') objects.push({ rect: { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: hx(o.fill) } } });
      else if (o.k === 'ellipse') objects.push({ text: { text: '', options: { shape: S_.ellipse, x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: hx(o.fill) } } } });
      else if (o.k === 'line') objects.push({ line: { x: o.x, y: o.y, w: o.w, h: 0, line: { color: hx(o.color), width: o.width } } });
      // tekst u matrici mora biti običan string (niz delova PptxGenJS ovde ne podržava)
      else if (o.k === 'text') objects.push({ text: { text: o.paras.map(p => normP(p).runs.map(r => r.t).join('')).join('\n'), options: { x: o.x, y: o.y, w: o.w, h: o.h, ...pBox(o.st) } } });
      else if (o.k === 'image') objects.push({ image: { x: o.x, y: o.y, w: o.w, h: o.h, data: imgData(o.data), altText: o.alt || '' } });
    }
    for (const p of L.ph) {
      const opts = { name: p.name, type: p.type, x: p.x, y: p.y, w: p.w, h: p.h, ...pBox(p.st) };
      if (p.type !== 'pic') opts.fit = 'shrink';
      opts.bullet = p.st.list ? { code: listLook(S.opts.listStyle, {}).code, indent: 20 } : false;
      objects.push({ placeholder: { options: opts, text: T(p.prompt) } });
    }
    const def = { title: T(L.name), background: { color: hx(L.bg) }, objects };
    if (L.num && S.opts.numbers) { const n = L.num; def.slideNumber = { x: n.x, y: n.y, w: n.w, h: n.h, fontFace: n.st.font, fontSize: n.st.size, color: hx(n.st.color), align: n.st.align, valign: n.st.valign, bold: true, margin: 0 }; }
    pptx.defineSlideMaster(def);
  }
  for (const s of slides(Ls)) {
    const L = Ls[s.layout], slide = pptx.addSlide({ masterName: T(L.name) });
    for (const p of L.ph) {
      const c = s.fill[p.name];
      if (c && p.type !== 'pic') slide.addText(pRuns(c, p.st), { placeholder: p.name, ...pBox(p.st) });
    }
    for (const o of s.extras) addExtra(pptx, slide, o);
    if (s.notes) slide.addNotes(T(s.notes));
  }
  const blob = await finishPptx(pptx);
  return { blob, name: slug(m.title || 'prezentacija') + '.pptx' };
}
