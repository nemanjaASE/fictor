import { describe, expect, it } from 'vitest';
import { buildCtx } from '../src/content/citations.js';
import { parseMd } from '../src/content/markdown.js';
import { TECH } from '../src/content/tech.js';
import { FONTS, MONO } from '../src/core/fonts.js';
import { S, defaults, sanitize } from '../src/core/state.js';
import { STYLES } from '../src/core/themes.js';
import { CODE_STYLES, TERM_IDS } from '../src/graphics/code-styles.js';
import { hasMark } from '../src/graphics/marks.js';
import { contrast } from '../src/lib/color.js';
import { slides } from '../src/slides/deck.js';
import { layouts } from '../src/slides/layout.js';

describe.each(Object.entries(TECH))('predavanje: %s', (id, tc) => {
  const blocks = parseMd(tc.md);

  it('ima ciljeve, delove, kod, zadatak i rezime', () => {
    const titles = blocks.filter(b => b.k === 'h' && b.level === 2).map(b => b.text);
    expect(titles[0]).toMatch(/^Ciljevi/);
    expect(titles.some(x => /^Zadatak/.test(x))).toBe(true);
    expect(titles.at(-1)).toMatch(/^Rezime/);
    expect(blocks.filter(b => b.k === 'h' && b.level === 1).length).toBeGreaterThanOrEqual(2);
    expect(blocks.filter(b => b.k === 'code').length).toBeGreaterThanOrEqual(3);
  });

  it('ima strukturu ubrzanog kursa: tri celine, pitanje, podsetnik, zadatak i šta dalje', () => {
    const titles = blocks.filter(b => b.k === 'h' && b.level === 2).map(b => b.text);
    expect(blocks.filter(b => b.k === 'h' && b.level === 1).map(b => b.text)).toHaveLength(3);
    for (const t of ['Pitanje za vas', 'Podsetnik', 'Zadatak', 'Šta dalje']) expect(titles.some(x => x.startsWith(t)), t).toBe(true);
    expect(blocks.some(b => b.k === 'table' && titles.some(x => x.startsWith('Podsetnik')))).toBe(true);
    expect(tc.meta.title).toBe(tc.name + ': ubrzani kurs');
  });

  it('naslovi slajdova staju u dva reda', () => {
    for (const b of blocks.filter(x => x.k === 'h' && x.level === 2)) expect(b.text.length, b.text).toBeLessThanOrEqual(72);
  });

  it('kod staje na slajd', () => {
    for (const b of blocks.filter(x => x.k === 'code')) {
      expect(b.lines.length, b.lang).toBeLessThanOrEqual(20);
      for (const l of b.lines) expect(l.length, l).toBeLessThanOrEqual(80);
    }
  });

  it('ima znak za dugme i slajdove', () => {
    // zvanični znak (Simple Icons) ili Lucide ikonica za tehnologiju bez znaka
    expect(hasMark(id)).toBe(true);
  });

  it('znak je na naslovnom slajdu i u podnožju, u svakom stilu', () => {
    const before = { tech: S.tech, style: S.style }, svg = objs => objs.filter(o => o.k === 'image' && o.data.startsWith('data:image/svg'));
    try {
      S.tech = id;
      for (const [style] of STYLES) {
        S.style = style;
        const L = layouts();
        expect(svg(L.NASLOVNI.objects), style).toHaveLength(1);
        expect(svg(L.SADRZAJ.objects), style).toHaveLength(1);
        expect(svg(L.KRAJ.objects), style).toHaveLength(0);
      }
    } finally { Object.assign(S, before); }
  });

  it('naslovni slajd ima komandu tik iznad naslova, u svakom stilu', () => {
    const before = { tech: S.tech, style: S.style, title: S.meta.title, samples: S.opts.samples, content: S.content.slides };
    expect(tc.cmd).toMatch(/^[ -~]{3,40}$/);
    try {
      S.tech = id; S.meta.title = tc.meta.title; S.opts.samples = true; S.content.slides = '';
      buildCtx();
      for (const [style] of STYLES) {
        S.style = style;
        const Ls = layouts(), ph = n => Ls.NASLOVNI.ph.find(x => x.name === n), k = ph('komanda'), t = ph('title'), o = ph('oznaka');
        // ispod komande staje bar jedan red naslova, a komanda ne ulazi u oznaku predmeta
        expect(k.y + k.h + t.st.size * 1.2 * 0.95 / 72, style).toBeLessThanOrEqual(t.y + t.h);
        expect(k.y, style).toBeGreaterThanOrEqual(o.y + o.h);
        expect(Ls.KRAJ.ph.some(x => x.name === 'komanda'), style).toBe(false);
        expect(slides(Ls)[0].fill.komanda[0].runs.map(r => r.t).join(''), style).toBe('$ ' + tc.cmd);
      }
    } finally { Object.assign(S, { tech: before.tech, style: before.style }); S.meta.title = before.title; S.opts.samples = before.samples; S.content.slides = before.content; }
  });

  it('izgled koristi postojeće fontove i čitljive boje', () => {
    const { colors: c, fonts: f, style } = tc.look;
    expect(FONTS[f.heading] && FONTS[f.body] && MONO[f.mono]).toBeTruthy();
    // kod mora biti u fontu koji je na svakom Windows računaru, inače PowerPoint kvari poravnanje
    expect(MONO[f.mono].src).toBe('w');
    expect(STYLES.some(([k]) => k === style)).toBe(true);
    expect(contrast(c.text, c.bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(c.muted, c.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.text, c.surface)).toBeGreaterThanOrEqual(4.5);
    if (tc.look.code) expect(tc.look.code in CODE_STYLES).toBe(true);
    if (tc.look.term) expect(TERM_IDS).toContain(tc.look.term);
  });

  it('kod u tabelama ostaje kakav je i piše se fontom za kod', () => {
    const before = { tech: S.tech, samples: S.opts.samples, content: S.content.slides };
    Object.assign(S, { tech: id }); S.opts.samples = true; S.content.slides = '';
    try {
      buildCtx();
      const tables = slides(layouts()).flatMap(s => s.extras).filter(o => o.k === 'table');
      for (const tb of tables) {
        expect(tb.mono).toBe(S.fonts.mono);
        tb.rows.forEach((r, i) => r.forEach((v, j) => { if (tb.code[i][j]) expect(v, v).not.toMatch(/[„“”‘’]/); }));
      }
    } finally { Object.assign(S, { tech: before.tech }); S.opts.samples = before.samples; S.content.slides = before.content; }
  });

  it('pravi slajdove: naslovni, sadržaj iz primera i završni, bez tuđe literature', () => {
    const before = { tech: S.tech, samples: S.opts.samples, content: S.content.slides };
    Object.assign(S, { tech: id }); S.opts.samples = true; S.content.slides = '';
    try {
      buildCtx();
      const list = slides(layouts());
      expect(list.some(s => s.fill.title && s.fill.title[0] === 'Literatura')).toBe(false);
      expect(list[0].layout).toBe('NASLOVNI');
      expect(list.at(-1).layout).toBe('KRAJ');
      expect(list.length).toBeGreaterThanOrEqual(12);
      expect(list.filter(s => s.layout === 'SEKCIJA').length).toBeGreaterThanOrEqual(2);
    } finally { Object.assign(S, { tech: before.tech }); S.opts.samples = before.samples; S.content.slides = before.content; }
  });
});

describe('bez tehnologije', () => {
  it('slajdovi nemaju znak ni komandu', () => {
    const before = S.tech;
    try {
      S.tech = '';
      const L = layouts();
      for (const id of Object.keys(L)) expect(L[id].objects.some(o => o.k === 'image' && o.data.startsWith('data:image/svg')), id).toBe(false);
      expect(L.NASLOVNI.ph.some(x => x.name === 'komanda')).toBe(false);
    } finally { S.tech = before; }
  });
});

describe('vrsta prezentacije', () => {
  const people = () => {
    buildCtx();
    const f = slides(layouts())[0].fill;
    return [f.autor, f.detalji].flat().filter(Boolean).map(p => (typeof p === 'string' ? p : p.runs.map(r => r.t).join(''))).join(' | ');
  };

  it('predavanje ima predavača bez mentora, izlaganje ima mentora', () => {
    const before = { deck: S.deck, tech: S.tech, samples: S.opts.samples, content: S.content.slides };
    try {
      // bez primera slajdova (opšti primeri crtaju dijagram, a u testu nema canvas-a); naslovni slajd je uvek tu
      S.tech = ''; S.opts.samples = false; S.content.slides = '';
      S.deck = 'predavanje';
      expect(people()).not.toMatch(/Mentor/);
      expect(layouts().NASLOVNI.ph.find(x => x.name === 'autor').prompt).toBe('Predavač');
      S.deck = 'izlaganje';
      expect(people()).toMatch(/Mentor: /);
      expect(layouts().NASLOVNI.ph.find(x => x.name === 'autor').prompt).toBe('Autor');
    } finally { Object.assign(S, { deck: before.deck, tech: before.tech }); S.opts.samples = before.samples; S.content.slides = before.content; }
  });

  it('tehnologija postoji samo uz predavanje', () => {
    expect(sanitize({ deck: 'izlaganje', tech: 'python', techLook: true }, defaults())).toMatchObject({ tech: '', techLook: false });
    expect(sanitize({ deck: 'predavanje', tech: 'python', techLook: true }, defaults())).toMatchObject({ tech: 'python', techLook: true });
  });
});
