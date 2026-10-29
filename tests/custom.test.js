import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseMd } from '../src/content/markdown.js';
import { CUSTOM, activeTech, isMarkPath, slugOf } from '../src/content/tech.js';
import { S, defaults, sanitize } from '../src/core/state.js';
import { STYLES } from '../src/core/themes.js';
import { fetchMark } from '../src/graphics/marks.js';
import { layouts } from '../src/slides/layout.js';

const PATH = 'M0 0h24v24H0V0zm12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z';

describe('drugi jezik: naziv i znak', () => {
  it('naziv se pretvara u ime znaka kao u Simple Icons', () => {
    expect(slugOf('Kotlin')).toBe('kotlin');
    expect(slugOf('C#')).toBe('csharp');
    expect(slugOf('C++')).toBe('cplusplus');
    expect(slugOf('Node.js')).toBe('nodedotjs');
    expect(slugOf(' Go ')).toBe('go');
  });

  it('putanja znaka sme da sadrži samo komande i brojeve', () => {
    expect(isMarkPath(PATH)).toBe(true);
    expect(isMarkPath('M0 0"/><script>alert(1)</script>')).toBe(false);
    expect(isMarkPath('')).toBe(false);
    expect(isMarkPath(42)).toBe(false);
  });

  it('sačuvano stanje zadržava ispravan jezik, a odbacuje neispravan znak', () => {
    const ok = sanitize({ deck: 'predavanje', tech: CUSTOM, custom: { name: 'Kotlin', mark: PATH, cmd: 'kotlinc ocene.kt' } }, defaults());
    expect(ok.tech).toBe(CUSTOM);
    expect(ok.custom).toEqual({ name: 'Kotlin', mark: PATH, cmd: 'kotlinc ocene.kt' });
    const bad = sanitize({ deck: 'predavanje', tech: CUSTOM, techLook: true, custom: { name: 'x'.repeat(99), mark: '<svg onload=alert(1)>' } }, defaults());
    expect(bad.custom.mark).toBe('');
    expect(bad.custom.name).toHaveLength(40);
    expect(bad.techLook).toBe(false);
  });
});

describe('drugi jezik: preuzimanje znaka', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('iz SVG-a uzima samo proverenu putanju', async () => {
    const fetch = vi.fn(async () => ({ ok: true, text: async () => `<svg viewBox="0 0 24 24"><title>Kotlin</title><path d="${PATH}"/></svg>` }));
    vi.stubGlobal('fetch', fetch);
    expect(await fetchMark('Kotlin')).toBe(PATH);
    expect(fetch.mock.calls[0][0]).toMatch(/simple-icons@[\d.]+\/icons\/kotlin\.svg$/);
  });

  it('za Javu traži znak OpenJDK-a, a za nepostojeći znak vraća prazno', async () => {
    const fetch = vi.fn(async url => ({ ok: url.endsWith('/openjdk.svg'), text: async () => `<path d="${PATH}"/>` }));
    vi.stubGlobal('fetch', fetch);
    expect(await fetchMark('Java')).toBe(PATH);
    expect(await fetchMark('Zmajski jezik')).toBe('');
  });

  it('odbacuje putanju sa nedozvoljenim znakovima i grešku mreže', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => '<path d="M0 0&quot;/&gt;"/>' })));
    expect(await fetchMark('Kotlin')).toBe('');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('nema mreže'); }));
    expect(await fetchMark('Kotlin')).toBe('');
  });
});

describe.each(['Kotlin', 'C#', 'Programski jezik sa veoma dugim imenom'])('obrazac kursa: %s', name => {
  const tc = activeTech({ tech: CUSTOM, custom: { name, cmd: 'pokreni ocene' } }), blocks = parseMd(tc.md);
  const titles = blocks.filter(b => b.k === 'h' && b.level === 2).map(b => b.text);

  it('ima isti redosled kao gotovi kursevi', () => {
    expect(titles[0]).toMatch(/^Ciljevi/);
    expect(titles.at(-1)).toMatch(/^Rezime/);
    for (const t of ['Pitanje za vas', 'Podsetnik', 'Zadatak', 'Šta dalje']) expect(titles.some(x => x.startsWith(t)), t).toBe(true);
    expect(blocks.filter(b => b.k === 'h' && b.level === 1)).toHaveLength(3);
    expect(tc.meta.title).toBe(name + ': ubrzani kurs');
  });

  it('naslovi i kod staju na slajd', () => {
    for (const t of titles) expect(t.length, t).toBeLessThanOrEqual(72);
    for (const b of blocks.filter(x => x.k === 'code')) {
      expect(b.lines.length).toBeLessThanOrEqual(20);
      for (const l of b.lines) expect(l.length, l).toBeLessThanOrEqual(80);
    }
  });
});

describe('drugi jezik na slajdovima', () => {
  const run = (custom, fn) => {
    const before = { tech: S.tech, custom: S.custom, style: S.style };
    try { Object.assign(S, { tech: CUSTOM, custom }); for (const [style] of STYLES) { S.style = style; fn(layouts(), style); } }
    finally { Object.assign(S, before); }
  };
  const svg = objs => objs.filter(o => o.k === 'image' && o.data.startsWith('data:image/svg'));
  const komanda = L => L.NASLOVNI.ph.some(x => x.name === 'komanda');

  it('znak i komanda idu na naslovni slajd i u podnožje', () => run({ name: 'Kotlin', mark: PATH, cmd: 'kotlinc ocene.kt' }, (L, style) => {
    expect(svg(L.NASLOVNI.objects), style).toHaveLength(1);
    expect(svg(L.SADRZAJ.objects), style).toHaveLength(1);
    expect(komanda(L), style).toBe(true);
  }));

  it('bez znaka nema slike, a bez komande nema reda sa komandom', () => run({ name: 'Zmajski', mark: '', cmd: '' }, (L, style) => {
    expect(svg(L.NASLOVNI.objects), style).toHaveLength(0);
    expect(komanda(L), style).toBe(false);
  }));
});
