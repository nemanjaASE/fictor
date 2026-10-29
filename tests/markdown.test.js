import { describe, it, expect } from 'vitest';
import { parseMd, inline } from '../src/content/markdown.js';
import { MD_EXAMPLES } from '../src/content/examples.js';

describe('Markdown', () => {
  it('prepoznaje naslove, naslove bez broja i liste', () => {
    const b = parseMd('# Rezime {-}\nTekst.\n\n## Odeljak\n- jedan\n- dva\n\n1. prvi\n2. drugi');
    expect(b.map(x => x.k)).toEqual(['h', 'p', 'h', 'ul', 'ol']);
    expect(b[0]).toMatchObject({ level: 1, text: 'Rezime', unnumbered: true });
    expect(b[3].items).toHaveLength(2);
  });
  it('razlaže formatiranje i citate u redu teksta', () => {
    expect(inline('**jako** i *kurziv* sa `kod` [@a; @b]')).toEqual([
      { t: 'jako', b: true }, { t: ' i ' }, { t: 'kurziv', i: true }, { t: ' sa ' }, { t: 'kod', code: true }, { t: ' ' }, { cite: ['a', 'b'] },
    ]);
  });
  it('čita tabelu sa naslovom ispod', () => {
    const [t] = parseMd('| A | B |\n|---|---|\n| x | 1 |\nTabela: Opis tabele');
    expect(t).toMatchObject({ k: 'table', head: ['A', 'B'], rows: [['x', '1']], caption: 'Opis tabele' });
  });
  it('čita kod sa jezikom i naslovom', () => {
    const [c] = parseMd('```python Merenje\nprint(1)\n```');
    expect(c).toMatchObject({ k: 'code', lang: 'python', title: 'Merenje', lines: ['print(1)'] });
  });
  it('čita grafikon sa podacima u srpskom formatu brojeva', () => {
    const [g] = parseMd('```grafikon\ntip: vodoravni\nistakni: B\n| X | Vrednost |\n|---|---|\n| A | 1.120 |\n| B | 3,4 |\n```');
    expect(g.k).toBe('chart');
    expect(g.spec).toMatchObject({ type: 'vodoravni', highlight: 'B', cats: ['A', 'B'] });
    expect(g.spec.series[0].values).toEqual([1120, 3.4]);
  });
  it('primeri iz uređivača se čitaju bez grešaka', () => {
    for (const md of Object.values(MD_EXAMPLES)) expect(parseMd(md).length).toBeGreaterThan(3);
  });
  it('tabela pamti ćelije koje su cele kod', () => {
    const [t] = parseMd(['| Komanda | Opis |', '|---|---|', '| `git status` | stanje |'].join('\n'));
    expect(t.rows[0]).toEqual(['git status', 'stanje']);
    expect(t.code[0]).toEqual([true, false]);
  });
});
