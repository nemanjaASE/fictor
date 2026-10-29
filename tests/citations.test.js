import { describe, it, expect, beforeEach } from 'vitest';
import { S } from '../src/core/state.js';
import { parseBib, deLatex } from '../src/content/bibtex.js';
import { BIB_EXAMPLE } from '../src/content/examples.js';
import { buildCtx, cite, refList, CTX } from '../src/content/citations.js';

const text = list => list.map(r => (r.label ? r.label + ' ' : '') + r.runs.map(x => x.t).join(''));

describe('BibTeX', () => {
  it('čita unose, srpska slova i autore-organizacije', () => {
    const bib = parseBib(BIB_EXAMPLE);
    expect(bib.map(x => [x.key, x.type])).toEqual([['autor2024', 'article'], ['pisac2022', 'book'], ['istrazivac2023', 'conf'], ['sajt2025', 'web']]);
    expect(bib[1].publisher).toBe('Izdavač');
    expect(bib[2].authors[0]).toEqual({ last: 'Istraživač', first: 'Ivana' });
    expect(bib[3].authors[0]).toMatchObject({ last: 'Naziv organizacije', org: true });
    expect(bib[0].pages).toBe('45–67');
  });
  it('prevodi LaTeX zapise slova', () => {
    expect(deLatex('{\\v{Z}}ivkovi{\\\'c} {\\dj}ur{\\dj}a')).toBe('Živković đurđa');
  });
});

describe('citiranje', () => {
  beforeEach(() => {
    S.doc = 'seminarski'; S.bib = BIB_EXAMPLE;
    S.content.seminarski = 'Prvo [@pisac2022], pa [@autor2024; @istrazivac2023] i [@nepostoji].';
    buildCtx();
  });
  it('IEEE numeriše redom prvog citiranja i navodi samo citirane izvore', () => {
    S.opts.cite = 'ieee';
    expect(cite(['pisac2022'])).toBe('[1]');
    expect(cite(['autor2024', 'istrazivac2023'])).toBe('[2], [3]');
    expect(text(refList())[0]).toBe('[1] P. Pisac, Naslov knjige, 2. izd. Beograd: Izdavač, 2022.');
    expect(refList()).toHaveLength(3);
  });
  it('APA 7: „&“ za dva autora, „i dr.“ od tri, spisak abecedno', () => {
    S.opts.cite = 'apa';
    expect(cite(['autor2024'])).toBe('(Autor & Saradnik, 2024)');
    expect(cite(['istrazivac2023'])).toBe('(Istraživač i dr., 2023)');
    expect(text(refList()).map(t => t.split(',')[0])).toEqual(['Autor', 'Istraživač', 'Pisac']);
    expect(text(refList())[0]).toContain('https://doi.org/10.xxxx/xxxxx');
  });
  it('Harvard i Chicago navode do tri autora', () => {
    S.opts.cite = 'harvard';
    expect(cite(['istrazivac2023'])).toBe('(Istraživač, Kolega i Pisac, 2023)');
    S.opts.cite = 'chicago';
    expect(cite(['autor2024'])).toBe('(Autor i Saradnik 2024)');
  });
  it('prijavljuje nepoznate ključeve', () => {
    S.opts.cite = 'ieee';
    expect(CTX.unknown).toEqual(['nepostoji']);
    expect(cite(['nepostoji'])).toBe('[?nepostoji]');
  });
});
