import { describe, expect, it } from 'vitest';
import { buildCtx } from '../src/content/citations.js';
import { TECH } from '../src/content/tech.js';
import { S, defaults, sanitize } from '../src/core/state.js';
import { PRESETS } from '../src/core/themes.js';
import { K, docBlocks, docTable } from '../src/docs/blocks.js';
import { chartObj, chartShapes } from '../src/graphics/charts.js';
import { SAMPLE_CHART, slideKinds, slides, statsObjs } from '../src/slides/deck.js';
import {
  CHART_STYLES, LIST_STYLES, LOOK_SETS, QUOTE_STYLES, STAT_STYLES, TABLE_STYLES, activeSet, applySet, bulletXml, listLook, statLook, tableCell, tableColors, tableGrid, tableShapes, themeSet,
} from '../src/graphics/data-styles.js';
import { altXml } from '../src/export/alt.js';
import { contrast, ensure, mix, onColor } from '../src/lib/color.js';
import { G, layouts } from '../src/slides/layout.js';
import { parseMd } from '../src/content/markdown.js';

// paleta slajda iz boja teme (kao P() u layout.js)
const pal = c => ({ ...c, onP: onColor(c.primary), pText: ensure(c.primary, c.bg, 4.5), aText: ensure(c.accent, c.bg, 3), soft: mix(onColor(c.primary), c.primary, 0.3), hair: mix(c.text, c.bg, 0.82) });
const looks = [...Object.entries(PRESETS).map(([k, v]) => [k, v.colors]), ...Object.entries(TECH).map(([k, v]) => [k + ' (tehnologija)', v.look.colors])];
// slajdovi iz Markdown-a sa jednom tabelom i jednim grafikonom
const MD = ['## Rezultati', '| Sistem | Vreme (ms) |', '|---|---|', '| A | 412 |', '| Predloženi | 121 |', '',
  '## Grafikon', '```grafikon', 'istakni: Predloženi', '| Sistem | Vreme (ms) |', '|---|---|', '| A | 412 |', '| Predloženi | 121 |', '```', '',
  '## Ključna poruka', '> Plan izvršavanja treba preispitati dok upit traje, a ne samo jednom pre početka izvršavanja.', '', 'Sve ostalo je posledica.', '',
  '## Brojevi', '```brojevi', '3,4× | brže izvršavanje | medijana na 120 upita | Brzina', '−41% | manje memorije', '100% | ista tačnost', 'izvor: sopstvena merenja', '```'].join('\n');
const withS = (opts, fn, colors) => {
  const before = { opts: { ...S.opts }, tech: S.tech, md: S.content.slides, colors: S.colors };
  try { S.tech = ''; Object.assign(S.opts, opts); if (colors) S.colors = colors; S.content.slides = MD; buildCtx(); return fn(); }
  finally { Object.assign(S, { opts: before.opts, tech: before.tech, colors: before.colors }); S.content.slides = before.md; }
};
const mdSlides = () => slides(layouts()).flatMap(s => s.extras);

describe('izgledi tabela', () => {
  it('tekst u svakoj ćeliji je čitljiv na svojoj podlozi, u svakoj temi i svakom izgledu', () => {
    for (const [name, c] of looks) {
      const p = pal(c), tc = tableColors(p);
      for (const look of TABLE_STYLES) for (const flat of [false, true]) for (let r = 0; r <= 3; r++) for (const hi of [false, true]) {
        const x = tableCell(look, tc, r, 3, hi, flat), bg = x.fill || x.under || c.bg;
        expect(contrast(x.fg, bg), `${name} ${look} red ${r}${hi ? ' istaknut' : ''}${flat ? ' (Word)' : ''}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('akademska tabela ostaje sa tri linije i bez senčenja', () => {
    const tc = tableColors(pal(PRESETS.akademski.colors)), cells = [0, 1, 2, 3].map(r => tableCell('akademska', tc, r, 3, false));
    expect(cells.every(x => !x.fill && !x.left && !x.right)).toBe(true);
    expect([cells[0].top.w, cells[0].bottom.w, cells[3].bottom.w]).toEqual([1.5, 0.75, 1.5]);
    expect(cells[1].bottom).toBe(null);
    expect(cells[2].bottom).toBe(null);
  });

  it('svaki izgled je drugačiji', () => {
    const tc = tableColors(pal(PRESETS.akademski.colors));
    const sig = look => JSON.stringify([0, 1, 2, 3].map(r => [tableCell(look, tc, r, 3, r === 3), tableCell(look, tc, r, 3, r === 3, true)]));
    expect(new Set(TABLE_STYLES.map(sig)).size).toBe(TABLE_STYLES.length);
  });

  it('moderni izgledi imaju sitno zaglavlje velikim slovima', () => {
    const tc = tableColors(pal(PRESETS.akademski.colors));
    const o = { look: 'moderna', c: tc, head: ['Sistem', 'Vreme'], rows: [['A', '1'], ['Predloženi', '2']], hi: 1 };
    const grid = tableGrid(o);
    expect(grid[0].map(x => x.t)).toEqual(['SISTEM', 'VREME']);
    expect(grid[0][0].x).toMatchObject({ small: true, upper: true });
    expect(grid[2][0].x.fill).toBe(tc.tint);
    expect(tableGrid({ ...o, look: 'akademska' })[0][0].t).toBe('Sistem');
  });

  const tb = look => ({ k: 'table', look, x: 1, y: 1, w: 6, colW: [3, 3], rowH: 0.5, head: ['a', 'b'], rows: [['1', '2'], ['3', '4'], ['5', '6']], hi: 2, c: tableColors(pal(PRESETS.akademski.colors)) });
  it('istaknut red ima zaobljenu traku iza sebe na slajdu, a u Word-u obojene ćelije', () => {
    const t = tb('istaknut'), [band, table] = tableShapes(t, 0.1);
    expect(band).toMatchObject({ k: 'rect', fill: t.c.fill });
    expect(band.y).toBeCloseTo(1 + 3 * 0.5 + 0.02, 6);
    expect(band.r).toBeGreaterThan(0);
    expect(table.k).toBe('table');
    expect(tableGrid(t)[3][0].x).toMatchObject({ fill: null, under: t.c.fill, fg: t.c.onFill });
    expect(tableGrid(t, true)[3][0].x).toMatchObject({ fill: t.c.fill, under: null });
  });

  it('redovi kao kartice: zaobljena kartica iza svakog reda, istaknut na nijansi glavne boje', () => {
    const t = tb('redovi'), out = tableShapes(t), rects = out.filter(o => o.k === 'rect');
    expect(rects.map(o => o.fill)).toEqual([t.c.soft, t.c.soft, t.c.tint]);
    // u Word-u razmak između kartica je debela ivica u boji strane
    expect(tableGrid(t, true)[1][0].x.bottom).toEqual({ w: 3, c: t.c.bg });
  });

  it('tamna tabela je na tamnoj kartici, a u Word-u svaka ćelija je tamna', () => {
    const t = tb('tamna'), [card, inner] = tableShapes(t);
    expect(card).toMatchObject({ k: 'rect', fill: t.c.dark.bg });
    expect(inner.x).toBeGreaterThan(card.x);
    expect(inner.colW.reduce((a, b) => a + b)).toBeCloseTo(inner.w, 6);
    expect(tableGrid(t, true).flat().every(cell => cell.x.fill === t.c.dark.bg)).toBe(true);
  });

  it('akademska, mreža i moderna nemaju oblike iza tabele', () => {
    for (const look of ['akademska', 'mreza', 'moderna']) expect(tableShapes(tb(look)), look).toHaveLength(1);
  });

  it('tabela na slajdu je u izabranom izgledu, a u Word-u takođe', () => withS({ tableStyle: 'redovi' }, () => {
    const ex = mdSlides(), i = ex.findIndex(o => o.k === 'table');
    expect(ex[i].look).toBe('redovi');
    expect(ex.slice(0, i).filter(o => o.k === 'rect' && o.fill === ex[i].c.soft).length).toBeGreaterThan(0);
    const o = docTable({ head: ['Upit', 'Vreme'], rows: [['Q1', '212'], ['Q2', '98']] }, K());
    expect(o.look).toBe('redovi');
  }));
});

describe('izgledi grafikona', () => {
  it('natpisi su čitljivi, a istaknuti stubac se vidi na podlozi grafikona', () => {
    for (const [name, c] of looks) for (const look of CHART_STYLES) {
      const o = chartObj(SAMPLE_CHART, 0, 0, 6, 3, pal(c), 'Calibri', 12, look);
      expect(contrast(o.c.text, o.c.bg), `${name} ${look} tekst`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(o.c.muted, o.c.bg), `${name} ${look} ose`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(o.colors[2], o.c.bg), `${name} ${look} istaknut`).toBeGreaterThanOrEqual(3);
    }
  });

  it('izgled određuje mrežu, brojeve na osi, podlogu i boju ostalih stubića', () => {
    const p = pal(PRESETS.akademski.colors), o = look => chartObj(SAMPLE_CHART, 0, 0, 6, 3, p, 'Calibri', 12, look);
    expect(o('klasican')).toMatchObject({ axis: true, bold: false, card: null, shapes: null, c: { grid: p.hair } });
    expect(o('moderan')).toMatchObject({ axis: false, bold: true, values: true, card: null, shapes: null, c: { grid: null } });
    // moderan: ostali stubići u svetloj nijansi glavne boje, ne sivi
    expect(o('moderan').colors[0]).toBe(mix(p.primary, p.bg, 0.78));
    expect(o('moderan').colors[2]).toBe(p.primary);
    expect(o('tamni')).toMatchObject({ axis: false, shapes: null, c: { dash: true } });
    expect(contrast(o('tamni').card, '#FFFFFF')).toBeGreaterThan(10);
    expect(o('zaobljeni')).toMatchObject({ shapes: 'zaobljeni' });
    expect(o('trake')).toMatchObject({ shapes: 'trake', card: null });
  });

  it('pravi grafikoni ostaju grafikoni, a tamni dobija podlogu', () => {
    const p = pal(PRESETS.akademski.colors), sh = look => chartShapes(chartObj(SAMPLE_CHART, 1, 1, 8, 4, p, 'Calibri', 12, look), 0.1);
    for (const look of ['moderan', 'klasican']) expect(sh(look).map(o => o.k)).toEqual(['chart']);
    expect(sh('tamni').map(o => o.k)).toEqual(['rect', 'chart']);
    expect(sh('tamni')[1]).toMatchObject({ x: 1.16, w: 8 - 0.32 });
  });

  it('zaobljeni stubići su oblici u kartici, istaknuta vrednost u pilulici', () => {
    const p = pal(PRESETS.akademski.colors), o = chartObj(SAMPLE_CHART, 1, 1, 8, 4, p, 'Calibri', 12, 'zaobljeni'), out = chartShapes(o, 0.1);
    expect(out.some(x => x.k === 'chart')).toBe(false);
    const [card, ...rest] = out;
    expect(card).toMatchObject({ k: 'rect', x: 1, y: 1, w: 8, h: 4, fill: o.card });
    for (const x of rest) {
      expect(x.x).toBeGreaterThanOrEqual(1); expect(x.y).toBeGreaterThanOrEqual(1);
      expect(x.x + x.w).toBeLessThanOrEqual(9 + 1e-9); expect(x.y + x.h).toBeLessThanOrEqual(5 + 1e-9);
    }
    const pill = rest.find(x => x.k === 'rect' && x.fill === o.colors[2] && x.r === x.h / 2);
    const label = rest.find(x => x.k === 'text' && x.paras[0] === '121');
    expect(label).toMatchObject({ x: pill.x, y: pill.y, w: pill.w, st: { bold: true } });
    // viši broj, viši stubić
    const bars = rest.filter(x => x.k === 'rect' && x.r > 0 && x.r < x.h / 2);
    expect(bars[0].h).toBeGreaterThan(bars[2].h);
  });

  it('trake: podloga pune širine i traka srazmerna vrednosti', () => {
    const p = pal(PRESETS.akademski.colors), o = chartObj(SAMPLE_CHART, 1, 1, 8, 4, p, 'Calibri', 12, 'trake'), out = chartShapes(o);
    const tracks = out.filter(x => x.k === 'rect' && x.fill === o.c.track), bars = out.filter(x => x.k === 'rect' && x.fill !== o.c.track);
    expect(tracks).toHaveLength(3);
    expect(bars).toHaveLength(3);
    expect(bars[0].w).toBeCloseTo(tracks[0].w, 6);
    expect(bars[2].w / bars[0].w).toBeCloseTo(121 / 412, 2);
    expect(out.filter(x => x.k === 'text').map(x => x.paras[0])).toEqual(['Sistem A', '412', 'Sistem B', '356', 'Predloženi', '121']);
  });

  it('linijski grafikon u izgledu sa oblicima ostaje pravi grafikon', () => {
    const p = pal(PRESETS.akademski.colors), spec = { ...SAMPLE_CHART, type: 'linije', highlight: '' };
    expect(chartShapes(chartObj(spec, 1, 1, 8, 4, p, 'Calibri', 12, 'zaobljeni'), 0.1).map(o => o.k)).toEqual(['rect', 'chart']);
    expect(chartShapes(chartObj(spec, 1, 1, 8, 4, p, 'Calibri', 12, 'trake')).map(o => o.k)).toEqual(['chart']);
  });

  it('na posteru su oblici srazmerni većim slovima', () => {
    const p = pal(PRESETS.akademski.colors), lab = size => chartShapes(chartObj(SAMPLE_CHART, 0, 0, 16, 8, p, 'Calibri', size, 'zaobljeni')).find(x => x.k === 'text' && x.paras[0] === 'Sistem A');
    expect(lab(24).h / lab(12).h).toBeCloseTo(2, 6);
  });

  it('grafikon na slajdu je u izabranom izgledu', () => {
    withS({ chartStyle: 'moderan' }, () => {
      const charts = mdSlides().filter(o => o.k === 'chart');
      expect(charts.length).toBeGreaterThan(0);
      for (const ch of charts) expect(ch).toMatchObject({ look: 'moderan', axis: false, bold: true });
    });
    withS({ chartStyle: 'trake' }, () => {
      const ex = mdSlides();
      expect(ex.some(o => o.k === 'chart')).toBe(false);
      expect(ex.some(o => o.k === 'text' && o.paras[0] === 'Predloženi')).toBe(true);
    });
  });
});

describe('sačuvano stanje', () => {
  it('prihvata svaki izgled tabele i grafikona, a nepoznate odbacuje', () => {
    for (const id of TABLE_STYLES) expect(sanitize({ opts: { tableStyle: id } }, defaults()).opts.tableStyle).toBe(id);
    for (const id of CHART_STYLES) expect(sanitize({ opts: { chartStyle: id } }, defaults()).opts.chartStyle).toBe(id);
    expect(sanitize({ opts: { tableStyle: 'neon', chartStyle: '3d' } }, defaults()).opts).toMatchObject({ tableStyle: 'moderna', chartStyle: 'moderan' });
    // raniji izgledi grafikona prelaze u najbliže nove
    expect(sanitize({ opts: { chartStyle: 'minimalan' } }, defaults()).opts.chartStyle).toBe('moderan');
    expect(sanitize({ opts: { chartStyle: 'kartica' } }, defaults()).opts.chartStyle).toBe('zaobljeni');
    expect(sanitize({ opts: { statStyle: 'boja' } }, defaults()).opts.statStyle).toBe('istaknut');
    expect(sanitize({ opts: { statStyle: 'kolone' } }, defaults()).opts.statStyle).toBe('krupni');
    expect(sanitize({ opts: { tableStyle: 'zebra', quoteStyle: 'boja' } }, defaults()).opts).toMatchObject({ tableStyle: 'moderna', quoteStyle: 'podeljeno' });
    expect(sanitize({ opts: { tableStyle: 'kartica', quoteStyle: 'navodnici' } }, defaults()).opts).toMatchObject({ tableStyle: 'redovi', quoteStyle: 'centrirano' });
    for (const [key, ids] of [['listStyle', LIST_STYLES], ['quoteStyle', QUOTE_STYLES], ['statStyle', STAT_STYLES]]) {
      for (const id of ids) expect(sanitize({ opts: { [key]: id } }, defaults()).opts[key]).toBe(id);
      expect(sanitize({ opts: { [key]: 'nepoznat' } }, defaults()).opts[key]).toBe(defaults().opts[key]);
    }
  });
});

describe('izgledi listi', () => {
  it('svaki izgled ima svoj znak, a znak u boji se vidi na podlozi', () => {
    expect(new Set(LIST_STYLES.map(id => listLook(id, {}).char)).size).toBe(LIST_STYLES.length);
    for (const [name, c] of looks) for (const id of LIST_STYLES) {
      const bu = listLook(id, pal(c));
      if (bu.color) expect(contrast(bu.color, c.bg), `${name} ${id}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('PowerPoint dobija boju i font znaka, i boju brojeva', () => {
    const xml = '<a:buSzPct val="100000"/><a:buChar char="&#x25AA;"/> <a:buSzPct val="100000"/><a:buFont typeface="+mj-lt"/><a:buAutoNum type="arabicPeriod" startAt="1"/>';
    const out = bulletXml(xml, { code: '25AA', color: '#1B365D' });
    expect(out).toContain('<a:buClr><a:srgbClr val="1B365D"/></a:buClr><a:buSzPct val="100000"/><a:buFont typeface="Arial"/><a:buChar char="&#x25AA;"/>');
    expect(out).toContain('<a:buClr><a:srgbClr val="1B365D"/></a:buClr><a:buSzPct val="100000"/><a:buFont typeface="+mj-lt"/><a:buAutoNum');
    // tačke ostaju kao do sada
    const dots = '<a:buSzPct val="100000"/><a:buChar char="&#x2022;"/>';
    expect(bulletXml(dots, listLook('tacke', {}))).toBe(dots);
  });
});

describe('izgledi izjave', () => {
  // podloga iza teksta: kartica ako je ima, inače pozadina rasporeda
  const textBg = L => (L.objects.find(o => o.k === 'rect' && o.h > 1 && o.x > 0) || { fill: L.bg }).fill;
  it('tekst izjave je čitljiv u svakoj temi i svakom izgledu', () => {
    for (const [name, c] of looks) for (const q of QUOTE_STYLES) withS({ quoteStyle: q }, () => {
      const L = layouts().IZJAVA;
      for (const ph of L.ph) expect(contrast(ph.st.color, textBg(L)), `${name} ${q} ${ph.name}`).toBeGreaterThanOrEqual(4.5);
    }, c);
  });

  it('svaki izgled ima svoj raspored', () => {
    const L = q => withS({ quoteStyle: q }, () => layouts().IZJAVA), title = q => L(q).ph.find(x => x.name === 'title'), { W } = G();
    const mark = q => L(q).objects.some(o => o.k === 'text' && o.paras[0] === '“');
    expect(title('centrirano').st.align).toBe('center');
    expect(mark('centrirano')).toBe(true);
    expect(L('podeljeno').objects.find(o => o.k === 'rect' && o.x === 0).fill).toBe(S.colors.primary);
    expect(title('podeljeno').x).toBeGreaterThan(W * 0.34);
    const card = L('kartica').objects.find(o => o.k === 'rect' && o.h > 1);
    expect(title('kartica').x).toBeGreaterThan(card.x);
    expect(title('kartica').y + title('kartica').h).toBeLessThan(card.y + card.h);
    expect(title('krupno').st.size).toBeGreaterThan(title('obicna').st.size);
    expect(mark('obicna') || mark('krupno')).toBe(false);
  });
});

describe('ključni brojevi', () => {
  it('blok ```brojevi daje brojeve, opise i izvor', () => {
    const st = parseMd(MD).find(x => x.k === 'stats');
    expect(st.items).toEqual([['3,4×', 'brže izvršavanje', 'medijana na 120 upita', 'Brzina'], ['−41%', 'manje memorije', '', ''], ['100%', 'ista tačnost', '', '']]);
    expect(st.source).toBe('sopstvena merenja');
  });

  it('brojevi su čitljivi na svojoj podlozi u svakoj temi', () => {
    for (const [name, c] of looks) for (const id of STAT_STYLES) for (const i of [0, 1]) {
      const x = statLook(id, pal(c), i), bg = x.card || c.bg;
      for (const k of ['value', 'label', 'desc', 'eyebrow']) expect(contrast(x[k], bg), `${name} ${id} ${i} ${k}`).toBeGreaterThanOrEqual(4.5);
      if (x.bar) expect(contrast(x.bar, c.bg), `${name} ${id} crtica`).toBeGreaterThanOrEqual(3);
    }
  });

  it('svaki izgled crta svoje oblike', () => {
    const p = pal(PRESETS.akademski.colors), a = { x: 1, y: 2, w: 11, h: 4.5 }, data = [['1', 'a', '', 'Prvi'], ['2', 'b', ''], ['3', 'c', '']];
    const objs = look => withS({ statStyle: look }, () => statsObjs(data, 'izvor', a, { p, W: 13.333, hf: 'Georgia', bf: 'Calibri', rr: 0.1 }));
    const rects = look => objs(look).filter(o => o.k === 'rect'), size = look => objs(look).find(o => o.k === 'text' && o.paras[0] === '1').st.size;
    expect(objs('linija').filter(o => o.k === 'line')).toHaveLength(3);
    expect(rects('krupni')).toHaveLength(0);
    expect(size('krupni')).toBeGreaterThan(size('linija'));
    expect(rects('kartice').map(o => o.r)).toEqual([0.16, 0.16, 0.16]);
    // istaknut prvi: samo prva kartica u glavnoj boji
    expect(rects('istaknut').map(o => o.fill === p.primary)).toEqual([true, false, false]);
    expect(rects('crtica')).toHaveLength(3);
    // oznaka iznad broja (velikim slovima) samo kad je zadata
    expect(objs('krupni').some(o => o.k === 'text' && o.paras[0] === 'PRVI')).toBe(true);
  });

  it('slajd iz Markdown-a ima ključne brojeve, a Word listu sa podebljanim brojem', () => withS({ statStyle: 'kartice' }, () => {
    const s = slides(layouts()).find(x => x.extras.some(o => o.k === 'text' && o.paras[0] === '3,4×'));
    expect(s.extras.filter(o => o.k === 'rect')).toHaveLength(3);
    const before = { doc: S.doc, md: S.content.seminarski };
    try {
      S.doc = 'seminarski'; S.content.seminarski = '# Rezultati\n' + MD.slice(MD.indexOf('```brojevi'));
      const list = docBlocks().find(b => b.k === 'bullets');
      expect(list.items[0][0]).toEqual({ t: '3,4×', b: true });
    } finally { S.doc = before.doc; S.content.seminarski = before.md; }
  }));
});

describe('uglovi za sve elemente', () => {
  const p = pal(PRESETS.akademski.colors);
  it('„Oštri“ daje oštre kartice brojeva, tabela i izjave, a „Obli“ zaobljene', () => {
    const data = [['1', 'a', ''], ['2', 'b', '']], a = { x: 1, y: 2, w: 11, h: 4.5 };
    for (const [rr, round] of [[0, false], [0.1, true]]) {
      const cards = withS({ statStyle: 'kartice' }, () => statsObjs(data, '', a, { p, W: 13.333, hf: 'Georgia', bf: 'Calibri', rr })).filter(o => o.k === 'rect');
      expect(cards.every(o => (o.r > 0) === round), `brojevi ${rr}`).toBe(true);
      const t = { k: 'table', look: 'redovi', x: 1, y: 1, w: 6, colW: [3, 3], rowH: 0.5, head: ['a', 'b'], rows: [['1', '2']], hi: -1, c: tableColors(p) };
      expect(tableShapes(t, rr).filter(o => o.k === 'rect').every(o => (o.r > 0) === round), `tabela ${rr}`).toBe(true);
      const before = S.corners;
      try {
        S.corners = round ? 'round' : 'sharp';
        const card = withS({ quoteStyle: 'kartica' }, () => layouts().IZJAVA.objects.find(o => o.k === 'rect' && o.h > 1));
        expect(card.r > 0, `izjava ${rr}`).toBe(round);
      } finally { S.corners = before; }
    }
  });

  it('zaobljeni stubići ostaju zaobljeni i uz „Oštri“: to im je suština', () => {
    const bars = chartShapes(chartObj(SAMPLE_CHART, 1, 1, 8, 4, p, 'Calibri', 12, 'zaobljeni'), 0).filter(o => o.k === 'rect' && o.fill !== chartObj(SAMPLE_CHART, 1, 1, 8, 4, p, 'Calibri', 12, 'zaobljeni').card);
    expect(bars.some(o => o.r > 0)).toBe(true);
  });
});

describe('kompleti izgleda', () => {
  it('svaki komplet koristi postojeće izglede', () => {
    const ids = { tableStyle: TABLE_STYLES, chartStyle: CHART_STYLES, statStyle: STAT_STYLES, quoteStyle: QUOTE_STYLES, listStyle: LIST_STYLES };
    for (const [name, set] of Object.entries(LOOK_SETS)) for (const [k, v] of Object.entries(set)) {
      if (k === 'corners') expect(['round', 'sharp']).toContain(v);
      else expect(ids[k], `${name}.${k}`).toContain(v);
    }
  });

  it('komplet menja sve izglede odjednom i prepoznaje se dok ga ne promeniš', () => {
    const before = { opts: { ...S.opts }, corners: S.corners };
    try {
      applySet(S, 'tamni');
      expect(S.opts).toMatchObject({ tableStyle: 'tamna', chartStyle: 'tamni', quoteStyle: 'podeljeno' });
      expect(activeSet(S)).toBe('tamni');
      S.opts.listStyle = 'tacke';
      expect(activeSet(S)).toBe(null);
      S.corners = 'sharp'; applySet(S, 'meki');
      expect(S.corners).toBe('round');
      expect(activeSet(S)).toBe('meki');
    } finally { S.opts = before.opts; S.corners = before.corners; }
  });
});

describe('skok pregleda', () => {
  it('svaki slajd zna koje elemente ima', () => withS({ chartStyle: 'trake' }, () => {
    const kinds = slides(layouts()).map(slideKinds);
    for (const k of ['table', 'chart', 'stats', 'quote']) expect(kinds.some(x => x.includes(k)), k).toBe(true);
    // grafikon od oblika se i dalje prepoznaje kao grafikon
    expect(kinds.filter(x => x.includes('chart'))).toHaveLength(1);
  }));
});

describe('provera 4:3, ćirilice i primera', () => {
  it('na ćirilici su i nazivi u grafikonu ćirilicom, u svakom izgledu', () => {
    const before = S.opts.script;
    try {
      S.opts.script = 'cyr';
      for (const look of CHART_STYLES) {
        const o = chartObj(SAMPLE_CHART, 1, 1, 8, 4, pal(PRESETS.akademski.colors), 'Calibri', 12, look);
        expect(o.spec.cats, look).toEqual(['Систем А', 'Систем Б', 'Предложени']);
        // istaknuta kategorija se i dalje prepoznaje
        expect(o.colors[2]).not.toBe(o.colors[0]);
        const texts = chartShapes(o).filter(x => x.k === 'text').map(x => x.paras[0]);
        if (texts.length) expect(texts).toContain('Предложени');
      }
    } finally { S.opts.script = before; }
  });

  it('ukrasni navodnik je u fontu Georgia u svakoj temi', () => {
    for (const q of ['centrirano', 'podeljeno', 'kartica']) withS({ quoteStyle: q }, () => {
      const m = layouts().IZJAVA.objects.find(o => o.k === 'text' && o.paras[0] === '“');
      expect(m.st.font, q).toBe('Georgia');
    }, PRESETS.projektor.colors);
  });

  it('u 4:3 svaki izgled izjave staje u slajd', () => {
    const before = S.ratio;
    try {
      S.ratio = '4:3';
      for (const q of QUOTE_STYLES) withS({ quoteStyle: q }, () => {
        const L = layouts().IZJAVA, { W, H } = G();
        for (const ph of L.ph) { expect(ph.x + ph.w, `${q} ${ph.name}`).toBeLessThanOrEqual(W + 1e-9); expect(ph.y + ph.h).toBeLessThanOrEqual(H); }
      });
    } finally { S.ratio = before; }
  });
});

describe('istaknut red u sopstvenim tabelama', () => {
  const md = rest => ['| Sistem | Vreme |', '|---|---|', '| A | 412 |', '| Predloženi | 121 |', ...rest].join('\n');
  it('red „istakni:“ posle tabele bira red po prvoj ćeliji ili rednom broju, uz naslov bilo kojim redom', () => {
    expect(parseMd(md(['istakni: predloženi'])).find(x => x.k === 'table').hi).toBe(1);
    expect(parseMd(md(['', 'Tabela: Vreme', 'istakni: 1'])).find(x => x.k === 'table')).toMatchObject({ hi: 0, caption: 'Vreme' });
    expect(parseMd(md(['istakni: Predloženi', 'Tabela: Vreme'])).find(x => x.k === 'table')).toMatchObject({ hi: 1, caption: 'Vreme' });
    expect(parseMd(md(['istakni: nepostojeći'])).find(x => x.k === 'table').hi).toBe(-1);
    expect(parseMd(md([])).find(x => x.k === 'table').hi).toBe(-1);
    // „istakni:“ koji nije odmah posle tabele ostaje običan tekst
    expect(parseMd(md(['', 'Neki tekst.', 'istakni: A'])).filter(x => x.k === 'p')).toHaveLength(1);
  });

  it('istaknut red stiže na slajd i u Word', () => withS({ tableStyle: 'istaknut' }, () => {
    const before = S.content.slides;
    S.content.slides = '## Rezultati\n' + md(['istakni: Predloženi']);
    const tb = slides(layouts()).flatMap(s => s.extras).find(o => o.k === 'table');
    S.content.slides = before;
    expect(tb.hi).toBe(1);
    expect(tableShapes(tb, 0.1).some(o => o.k === 'rect' && o.fill === tb.c.fill)).toBe(true);
    const b0 = { doc: S.doc, md: S.content.seminarski };
    try {
      S.doc = 'seminarski'; S.content.seminarski = '# Rezultati\n' + md(['istakni: Predloženi']);
      const b = docBlocks().find(x => x.k === 'table');
      expect(docTable(b, K()).hi).toBe(1);
    } finally { S.doc = b0.doc; S.content.seminarski = b0.md; }
  }));
});

describe('opisi za čitače ekrana', () => {
  it('grafikon dobija opis sa vrstom, naslovom i svim vrednostima', () => {
    const o = chartObj(SAMPLE_CHART, 0, 0, 6, 3, pal(PRESETS.akademski.colors), 'Calibri', 12, 'moderan');
    expect(o.alt).toBe('Stubičasti grafikon: Vreme odgovora po sistemu. Sistem A: 412; Sistem B: 356; Predloženi: 121. Istaknuto: Predloženi.');
    // grafikon od oblika: opis je na prvom obliku
    const prims = chartShapes(chartObj(SAMPLE_CHART, 0, 0, 6, 3, pal(PRESETS.akademski.colors), 'Calibri', 12, 'trake'));
    const first = prims.findIndex(x => x.k === 'rect');
    expect(prims[first].alt).toBe(o.alt);
    expect(prims.filter(x => x.alt)).toHaveLength(1);
  });

  it('opis i zaglavlje tabele se upisuju u XML prezentacije', () => {
    const xml = '<p:cNvPr id="4" name="FictorAlt0"/><a:tbl><a:tblPr/><p:cNvPr id="5" name="FictorAlt1">';
    const out = altXml(xml, [{ name: 'Tabela', descr: 'Vreme "upita" & memorija' }, { name: 'Grafikon', descr: 'Stubičasti' }]);
    expect(out).toContain('name="Tabela" descr="Vreme &quot;upita&quot; &amp; memorija"');
    expect(out).toContain('name="Grafikon" descr="Stubičasti"');
    expect(out).toContain('<a:tblPr firstRow="1"/>');
  });

  it('slike na slajdu imaju opis: znak tehnologije, logotip i slika iz sadržaja', () => {
    const before = { tech: S.tech, logo: S.logo, md: S.content.slides };
    try {
      Object.assign(S, { tech: 'python', logo: { data: 'data:image/png;base64,AAAA', ar: 2 } });
      const L = layouts();
      const imgs = [...L.NASLOVNI.objects, ...L.NASLOV.objects].filter(o => o.k === 'image');
      expect(imgs.some(o => o.alt === 'Python')).toBe(true);
      expect(imgs.some(o => o.alt.startsWith('Logotip'))).toBe(true);
    } finally { Object.assign(S, { tech: before.tech, logo: before.logo }); S.content.slides = before.md; }
  });
});

describe('komplet uz temu', () => {
  it('svaka tema predlaže postojeći komplet, a podrazumevani izgledi su komplet podrazumevane teme', () => {
    for (const [k, pr] of Object.entries(PRESETS)) expect(Object.keys(LOOK_SETS), k).toContain(pr.set);
    const d = defaults();
    expect(activeSet(d)).toBe(PRESETS.akademski.set);
  });

  it('tema menja komplet samo dok izgledi nisu menjani pojedinačno', () => {
    const before = { opts: { ...S.opts }, corners: S.corners };
    try {
      applySet(S, 'moderan');
      expect(themeSet(S, 'tamni')).toBe(true);
      expect(S.opts.tableStyle).toBe('tamna');
      // tema menja uglove (Meki traži obline): važi komplet od pre promene teme
      applySet(S, 'meki'); const was = activeSet(S); S.corners = 'sharp';
      expect(themeSet(S, 'moderan', was)).toBe(true);
      expect(S.opts.tableStyle).toBe('moderna');
      S.opts.tableStyle = 'mreza';
      expect(themeSet(S, 'moderan')).toBe(false);
      expect(S.opts.tableStyle).toBe('mreza');
    } finally { S.opts = before.opts; S.corners = before.corners; }
  });
});
