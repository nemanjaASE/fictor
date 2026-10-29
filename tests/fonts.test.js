import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FONTS, MONO } from '../src/core/fonts.js';
import { defaults, sanitize } from '../src/core/state.js';
import { GROUPS, PRESETS } from '../src/core/themes.js';
import { contrast, onColor } from '../src/lib/color.js';
import { D as DICT } from '../src/ui/i18n.js';

const ALL = { ...FONTS, ...MONO };
const families = css => css.split(',').map(f => f.trim().replace(/^'|'$/g, ''));

describe('fontovi', () => {
  it('svaki font ima poznato poreklo', () => {
    for (const [name, f] of Object.entries(ALL)) expect(['w', 'o', 'c', 'g'], name).toContain(f.src);
  });

  it('pregled učitava sa Google Fonts svaki font koji nije u Windows-u ili Office-u', () => {
    // „Source Sans Pro“ nema na Google Fonts, pa pregled koristi „Source Sans 3“ (isti dizajn)
    const link = readFileSync(new URL('../index.html', import.meta.url), 'utf8').match(/fonts\.googleapis\.com\/css2\?[^"]+/)[0];
    const loaded = [...link.matchAll(/family=([^:&]+)/g)].map(m => m[1].replace(/\+/g, ' '));
    for (const [name, f] of Object.entries(ALL)) {
      if (f.src === 'c' || f.src === 'g') expect(families(f.css).some(x => loaded.includes(x)), name).toBe(true);
    }
  });
});

describe.each(Object.entries(PRESETS))('tema: %s', (id, pr) => {
  it('koristi fontove koje PowerPoint i Word prikazuju bez instalacije', () => {
    // font koji nedostaje Office menja drugim: tekst se ponavlja na prelomu reda, a kod gubi poravnanje
    const { heading, body, mono } = pr.fonts;
    expect(FONTS[heading]?.src, heading).not.toBe('g');
    expect(FONTS[body]?.src, body).not.toBe('g');
    expect(MONO[mono]?.src, mono).not.toBe('g');
    expect(FONTS[heading] && FONTS[body] && MONO[mono]).toBeTruthy();
  });

  it('ima čitljive boje i postoji naziv na oba jezika', () => {
    const c = pr.colors;
    expect(contrast(c.text, c.bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(c.muted, c.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(onColor(c.primary), c.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.text, c.surface)).toBeGreaterThanOrEqual(4.5);
    for (const lang of ['sr', 'en']) expect(DICT[lang]['preset.' + id], lang).toHaveLength(2);
  });
});

describe('sekcije u kartici Izgled', () => {
  it('svaka tema je u tačno jednoj sekciji, a sekcije i opisi postoje na oba jezika', () => {
    const ids = GROUPS.flatMap(([, list]) => list);
    expect([...ids].sort()).toEqual(Object.keys(PRESETS).sort());
    for (const lang of ['sr', 'en']) {
      for (const [g] of GROUPS) expect(DICT[lang]['look.g.' + g], g).toBeTruthy();
      for (const id of ids) expect(DICT[lang]['use.' + id], id).toBeTruthy();
    }
  });
});

describe('sačuvano stanje', () => {
  it('gotova tema dobija svoje trenutne fontove', () => {
    const s = sanitize({ preset: 'akademski', fonts: { heading: 'Source Serif 4', body: 'Source Sans 3', mono: 'Source Code Pro' } }, defaults());
    expect(s.fonts).toEqual(PRESETS.akademski.fonts);
  });

  it('prilagođena tema zadržava izabrane fontove', () => {
    const s = sanitize({ preset: null, colors: { ...PRESETS.casopis.colors }, fonts: { heading: 'Literata', body: 'Source Sans 3', mono: 'JetBrains Mono' } }, defaults());
    expect(s.fonts).toEqual({ heading: 'Literata', body: 'Source Sans 3', mono: 'JetBrains Mono' });
  });
});
