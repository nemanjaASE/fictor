// Izgledi tabela, grafikona, listi, izjave i ključnih brojeva (kartica Elementi): isti opis za pregled, PowerPoint i Word.
import { ensure, hx, lum, mix, toHsl } from '../lib/color.js';

// moderna: sitno zaglavlje, tanke linije između redova, istaknut red na nijansi glavne boje; istaknut: bez linija, tvoj
// rezultat u zaobljenoj traci u glavnoj boji; redovi: svaki red je zaobljena meka kartica; tamna: tabela na tamnoj kartici;
// akademska: tri linije (radovi i časopisi); mreza: tanke linije oko svake ćelije
export const TABLE_STYLES = ['moderna', 'istaknut', 'redovi', 'tamna', 'akademska', 'mreza'];
export const OLD_TABLE = { zebra: 'moderna', zaglavlje: 'moderna', kartica: 'redovi' };
const MODERN = ['moderna', 'istaknut', 'redovi', 'tamna'];

// boje tabele iz palete slajda ili strane (p: text, bg, primary, accent, onP, pText, muted, hair)
export function tableColors(p) {
  const soft = mix(p.text, p.bg, 0.955), tint = mix(p.primary, p.bg, 0.88);
  const dbg = lum(p.bg) < 0.3 ? mix(p.bg, '#FFFFFF', 0.05) : '#111827', dfg = '#E5E7EB';
  const [vivid] = toHsl(p.accent)[1] >= toHsl(p.primary)[1] ? [p.accent] : [p.primary];
  return {
    bg: p.bg, fg: p.text, fill: p.primary, onFill: p.onP, hi: p.pText, hair: p.hair,
    shade: mix(p.text, p.bg, 0.93), grid: mix(p.text, p.bg, 0.72),
    head: ensure(p.muted, p.bg, 4.5), sep: mix(p.text, p.bg, 0.9), rule: mix(p.text, p.bg, 0.8),
    soft, softHead: ensure(p.muted, soft, 4.5), tint, tintFg: ensure(p.pText, tint, 4.5),
    dark: { bg: dbg, fg: dfg, head: ensure('#9CA3AF', dbg, 4.5), rule: mix(dfg, dbg, 0.8), sep: mix(dfg, dbg, 0.88), hi: ensure(vivid, dbg, 4.5) },
  };
}

// ćelija u redu r (0 = zaglavlje, 1…n redovi): podloga, boja i debljina teksta, ivice { w (pt), c } ili null;
// small/upper: sitno zaglavlje velikim slovima; under: boja oblika iza ćelije na slajdu (traka, kartica reda, tamna kartica).
// flat: bez oblika iza tabele (Word), pa ćelije same dobijaju tu boju
export function tableCell(look, c, r, n, hi, flat = false) {
  const L = (w, color) => ({ w, c: color }), head = r === 0, last = r === n;
  const x = { fill: null, under: null, fg: hi && !head ? c.hi : c.fg, bold: head || hi, small: false, upper: false, top: null, right: null, bottom: null, left: null };
  if (MODERN.includes(look) && head) Object.assign(x, { small: true, upper: true, fg: c.head });
  if (look === 'moderna') {
    x.bottom = head ? L(0.75, c.rule) : last ? null : L(0.5, c.sep);
    if (hi && !head) Object.assign(x, { fill: c.tint, fg: c.tintFg });
  } else if (look === 'istaknut') {
    if (head) x.bottom = L(0.75, c.rule);
    else if (hi) Object.assign(x, { under: c.fill, fg: c.onFill });
  } else if (look === 'redovi') {
    if (!head) Object.assign(x, hi ? { under: c.tint, fg: c.tintFg } : { under: c.soft });
    // u Word-u razmak između kartica: debela ivica u boji strane
    if (flat && !head) x.bottom = last ? null : L(3, c.bg);
  } else if (look === 'tamna') {
    const d = c.dark;
    Object.assign(x, { under: d.bg, fg: head ? d.head : hi ? d.hi : d.fg, bottom: head ? L(0.75, d.rule) : last ? null : L(0.5, d.sep) });
  } else if (look === 'mreza') {
    x.top = x.right = x.bottom = x.left = L(0.75, c.grid);
    if (head) x.fill = c.shade;
  } else {
    // akademska: linija iznad i ispod zaglavlja i na dnu, bez senčenja
    if (head) { x.top = L(1.5, c.fg); x.bottom = L(0.75, c.fg); } else if (last) x.bottom = L(1.5, c.fg);
  }
  if (flat && x.under) { x.fill = x.under; x.under = null; }
  if (x.fill && hi && !head && look === 'mreza') x.fg = ensure(c.hi, x.fill, 4.5);
  return x;
}

// sve ćelije (zaglavlje, pa redovi) sa izgledom; code: ćelija sa kodom (mono font)
export const tableGrid = (o, flat = false) => [o.head, ...o.rows].map((row, r) => row.map((t, i) => {
  const x = tableCell(o.look, o.c, r, o.rows.length, r > 0 && r - 1 === o.hi, flat);
  return { t: x.upper ? String(t).toLocaleUpperCase('sr') : t, i, x, code: !!(r && o.code && o.code[r - 1] && o.code[r - 1][i]) };
}));
// podloga i ivice ćelije za HTML pregled (k: piksela po tački)
export const cellCss = (x, k) => (x.fill ? `background:${x.fill};` : '') +
  ['top', 'right', 'bottom', 'left'].map(s => (x[s] ? `border-${s}:${Math.max(1, Math.round(x[s].w * k))}px solid ${x[s].c};` : '')).join('');

// tabela na slajdu ili posteru: oblici iza tabele (tamna kartica, traka istaknutog reda, kartice redova); u = jedinica
// zaobljenja i razmaka (1 na slajdu, veća na posteru); r = 0 (izbor „Oštri“) daje oštre uglove
export function tableShapes(tb, r = 0, u = 1) {
  const rows = tb.rows.length, out = [], rad = r ? 0.12 * u : 0;
  if (tb.look === 'tamna') {
    const pad = 0.14 * u, h = (rows + 1) * tb.rowH, w = tb.w - 2 * pad;
    return [{ k: 'rect', x: tb.x, y: tb.y - pad / 2, w: tb.w, h: h + pad, fill: tb.c.dark.bg, r: Math.max(r, rad) },
      { ...tb, x: tb.x + pad, w, colW: tb.colW.map(cw => cw * w / tb.w) }];
  }
  if (tb.look === 'istaknut' && tb.hi >= 0) out.push({ k: 'rect', x: tb.x, y: tb.y + (tb.hi + 1) * tb.rowH + 0.02 * u, w: tb.w, h: tb.rowH - 0.04 * u, fill: tb.c.fill, r: rad });
  if (tb.look === 'redovi') {
    for (let i = 0; i < rows; i++) out.push({ k: 'rect', x: tb.x, y: tb.y + (i + 1) * tb.rowH + 0.03 * u, w: tb.w, h: tb.rowH - 0.06 * u, fill: i === tb.hi ? tb.c.tint : tb.c.soft, r: rad });
  }
  return [...out, tb];
}

// izgled grafikona (S.opts.chartStyle). Moderan, tamni i klasičan su pravi PowerPoint grafikoni; zaobljeni i trake se crtaju
// oblicima (zaobljeni vrhovi i trake ne postoje u PowerPoint grafikonima), pa se njihovi podaci menjaju u aplikaciji.
// p: boje za crtanje, card: podloga kartice, grid/dash/gridW: mreža (null = bez nje), axis: brojevi na osi, values: brojevi
// i na linijama, bold: krupni podebljani brojevi, gap: deo širine kategorije pod stubićima, cat: boja kategorija,
// base: linija ose, rest: boja ostalih stubića kad je jedan istaknut, track: podloga trake, min: najmanji kontrast boja palete
export const CHART_STYLES = ['moderan', 'zaobljeni', 'trake', 'tamni', 'klasican'];
export function chartLook(id, p) {
  const base = { p, card: null, grid: null, gridW: 0.75, dash: false, axis: false, values: true, bold: true, gap: 0.66, cat: p.muted, base: p.hair, rest: mix(p.primary, p.bg, 0.78), track: null, min: 0, shapes: null };
  if (id === 'tamni') {
    // istaknuto u življoj od dve boje teme (akcenat ili glavna), posvetljenoj za tamnu podlogu; ostali stubići tamnosivi;
    // diskretna isprekidana mreža
    const bg = lum(p.bg) < 0.3 ? mix(p.bg, '#FFFFFF', 0.05) : '#111827', text = '#E5E7EB', muted = ensure('#9CA3AF', bg, 4.5);
    const [hi, lo] = toHsl(p.accent)[1] >= toHsl(p.primary)[1] ? [p.accent, p.primary] : [p.primary, p.accent];
    const q = { ...p, bg, text, muted, primary: ensure(hi, bg, 4.5), accent: ensure(lo, bg, 3), hair: mix(text, bg, 0.8) };
    return { ...base, p: q, card: bg, grid: mix(text, bg, 0.88), dash: true, cat: muted, base: mix(text, bg, 0.7), rest: mix(text, bg, 0.78), min: 3 };
  }
  if (id === 'zaobljeni') {
    const bg = mix(p.text, p.bg, 0.955), q = { ...p, bg, muted: ensure(p.muted, bg, 4.5) };
    return { ...base, p: q, card: bg, gap: 0.56, cat: q.muted, rest: mix(p.primary, bg, 0.74), shapes: 'zaobljeni' };
  }
  if (id === 'trake') return { ...base, rest: mix(p.primary, p.bg, 0.72), track: mix(p.text, p.bg, 0.93), shapes: 'trake' };
  if (id === 'klasican') return { ...base, grid: p.hair, axis: true, values: false, bold: false, gap: 0.62, cat: p.text, base: p.text, rest: mix(p.muted, p.bg, 0.45) };
  return base;
}
// ranije sačuvani izgledi grafikona
export const OLD_CHART = { minimalan: 'moderan', kartica: 'zaobljeni' };

// liste (S.opts.listStyle): znak (Unicode kod za PowerPoint) i njegova boja; brojevi numerisanih listi su u istoj boji
// (color null = boja teksta). Znak se u PowerPoint-u crta fontom Arial, koji ima sva četiri znaka.
export const LIST_STYLES = ['tacke', 'kvadratici', 'crtice', 'strelice'];
export function listLook(id, p) {
  if (id === 'kvadratici') return { code: '25AA', char: '▪', color: p.pText };
  if (id === 'crtice') return { code: '2013', char: '–', color: p.muted };
  if (id === 'strelice') return { code: '203A', char: '›', color: p.aText };
  return { code: '2022', char: '•', color: null };
}

// PptxGenJS ne zadaje boju ni font znaka liste: dodaje ih ovde (redosled u a:pPr: buClr, buSzPct, buFont, buChar)
export function bulletXml(x, bu) {
  const clr = bu.color ? `<a:buClr><a:srgbClr val="${hx(bu.color)}"/></a:buClr>` : '', ch = `<a:buChar char="&#x${bu.code};"/>`;
  if (bu.code !== '2022') x = x.split(`<a:buSzPct val="100000"/>${ch}`).join(`${clr}<a:buSzPct val="100000"/><a:buFont typeface="Arial"/>${ch}`);
  else if (clr) x = x.split(`<a:buSzPct val="100000"/>${ch}`).join(`${clr}<a:buSzPct val="100000"/>${ch}`);
  return clr ? x.split('<a:buSzPct val="100000"/><a:buFont typeface="+mj-lt"/><a:buAutoNum').join(`${clr}<a:buSzPct val="100000"/><a:buFont typeface="+mj-lt"/><a:buAutoNum`) : x;
}

// izjava i citat (S.opts.quoteStyle): centrirano (navodnik, tekst i opis na sredini), podeljeno (leva trećina u glavnoj boji
// sa krupnim navodnikom), kartica (izjava u mekoj zaobljenoj kartici), krupno (vrlo krupan tekst), obična (kao ranije)
export const QUOTE_STYLES = ['centrirano', 'podeljeno', 'kartica', 'krupno', 'obicna'];
export const OLD_QUOTE = { navodnici: 'centrirano', linija: 'krupno', boja: 'podeljeno' };

// ključni brojevi (S.opts.statStyle): krupni brojevi bez ukrasa, zaobljene meke kartice, prvi broj istaknut u kartici
// u glavnoj boji, kratka crtica u boji akcenta iznad broja, ili klasična tanka linija iznad broja.
// Za i-ti broj: card podloga kartice (null = bez nje), value broj, label opis, desc sitan tekst, eyebrow oznaka iznad,
// bar crtica iznad broja, size veličina broja u odnosu na uobičajenu
export const STAT_STYLES = ['krupni', 'kartice', 'istaknut', 'crtica', 'linija'];
export const OLD_STAT = { kolone: 'krupni', boja: 'istaknut' };
export function statLook(id, p, i = 0) {
  const soft = mix(p.text, p.bg, 0.955), main = id === 'istaknut' && i === 0;
  const card = main ? p.primary : id === 'kartice' || id === 'istaknut' ? soft : null, on = card || p.bg;
  return {
    card, value: main ? p.onP : ensure(p.pText, on, 4.5), label: main ? p.onP : p.text,
    desc: ensure(main ? p.soft : p.muted, on, 4.5), eyebrow: ensure(main ? p.soft : p.muted, on, 4.5),
    bar: id === 'crtica' ? ensure(p.accent, p.bg, 3) : null, size: id === 'krupni' ? 1.3 : card ? 0.95 : 1,
  };
}

// kompleti: usklađeni izgledi svih elemenata jednim klikom (posle se svaki menja pojedinačno);
// meki komplet traži i obline, jer su mu kartice i stubići zaobljeni
export const LOOK_SETS = {
  akademski: { tableStyle: 'akademska', chartStyle: 'klasican', statStyle: 'linija', quoteStyle: 'obicna', listStyle: 'crtice' },
  moderan: { tableStyle: 'moderna', chartStyle: 'moderan', statStyle: 'krupni', quoteStyle: 'centrirano', listStyle: 'kvadratici' },
  meki: { tableStyle: 'redovi', chartStyle: 'zaobljeni', statStyle: 'kartice', quoteStyle: 'kartica', listStyle: 'kvadratici', corners: 'round' },
  tamni: { tableStyle: 'tamna', chartStyle: 'tamni', statStyle: 'istaknut', quoteStyle: 'podeljeno', listStyle: 'strelice' },
};
// primeni komplet na stanje; activeSet: komplet koji tačno odgovara trenutnim izgledima (ili null)
export function applySet(S, id) {
  const { corners, ...opts } = LOOK_SETS[id];
  Object.assign(S.opts, opts);
  if (corners) S.corners = corners;
}
export const activeSet = S => Object.keys(LOOK_SETS).find(id => Object.entries(LOOK_SETS[id]).every(([k, v]) => (k === 'corners' ? S.corners : S.opts[k]) === v)) || null;
// tema predlaže svoj komplet: primenjuje se samo dok izgledi odgovaraju nekom kompletu, a ne kad su menjani pojedinačno.
// was: komplet pre promene teme (tema menja i uglove, pa se provera radi pre toga)
export function themeSet(S, id, was = activeSet(S)) {
  if (!LOOK_SETS[id] || !was) return false;
  applySet(S, id);
  return true;
}
