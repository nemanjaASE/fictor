import { describe, expect, it } from 'vitest';
import { buildCtx } from '../src/content/citations.js';
import { S, defaults, sanitize } from '../src/core/state.js';
import { CODE_IDS, CODE_STYLES, TERM_IDS, TERM_SHAPES, TERM_STYLES, codeFile, codePalette, terminalParas, termPalette } from '../src/graphics/code-styles.js';
import { highlight } from '../src/graphics/highlight.js';
import { contrast } from '../src/lib/color.js';
import { codeBlock, slides } from '../src/slides/deck.js';
import { P, layouts } from '../src/slides/layout.js';

const withOpts = (opts, fn) => {
  const before = { ...S.opts };
  try { Object.assign(S.opts, opts); return fn(); } finally { S.opts = before; }
};
// predavanje o Pythonu sa primerima: ima i blokove koda i blokove terminala
const pythonSlides = () => {
  const before = { tech: S.tech, content: S.content.slides };
  try { Object.assign(S, { tech: 'python' }); S.content.slides = ''; buildCtx(); return slides(layouts()); }
  finally { Object.assign(S, { tech: before.tech }); S.content.slides = before.content; }
};

describe('izgled koda i terminala', () => {
  it('sve boje teksta su čitljive na svojoj podlozi', () => {
    const terms = Object.keys(TERM_STYLES).map(id => [id + ' (terminal)', { bg: termPalette(id).bg, ...termPalette(id).syn }]);
    const codes = Object.keys(CODE_STYLES).map(id => [id + ' (kod)', codePalette(id)]);
    for (const [id, s] of [...codes, ...terms]) {
      for (const k of ['base', 'kw', 'str', 'fn', 'com', 'prompt', 'out']) if (s[k]) expect(contrast(s[k], s.bg), `${id}.${k}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('šeme terminala zadržavaju svoje boje gde su dovoljno jake, a slabe pojačavaju', () => {
    expect(termPalette('dracula').syn.prompt).toBe('#50FA7B');
    expect(termPalette('dracula').syn.com).not.toBe('#6272A4');
    expect(termPalette('nepostojeca')).toBe(null);
  });

  it('šeme editora zadržavaju svoje boje gde su dovoljno jake, a slabe pojačavaju', () => {
    expect(codePalette('dracula').fn).toBe('#50FA7B');
    expect(codePalette('onedark').com).not.toBe('#5C6370');
    expect(codePalette('tema')).toBe(null);
    for (const id of CODE_IDS) expect(sanitize({ opts: { codeStyle: id } }, defaults()).opts.codeStyle).toBe(id);
    expect(sanitize({ opts: { codeStyle: 'neon' } }, defaults()).opts.codeStyle).toBe('tema');
  });

  it('podrazumevano su kod i terminal u bojama teme', () => withOpts({ codeStyle: 'tema', termStyle: 'kod' }, () => {
    const p = P();
    expect(p.code).toBe(S.colors.surface);
    expect(p.term.bg).toBe(p.code);
  }));

  it('izabrani izgled menja podlogu i boje sintakse', () => withOpts({ codeStyle: 'tamni', termStyle: 'plavi' }, () => {
    const p = P();
    expect(p.code).toBe('#1E1E1E');
    expect(p.syn.kw).toBe('#569CD6');
    expect(p.term.bg).toBe('#012456');
  }));

  it('terminal boji odziv i ispis programa svojim bojama', () => {
    const [cmd, out] = highlight('$ cargo run\nStudenata: 6', termPalette('tamni').syn, 'terminal');
    expect(cmd.runs[0]).toMatchObject({ t: '$ ', color: '#16C60C' });
    expect(out.runs[0]).toMatchObject({ t: 'Studenata: 6', color: '#CCCCCC' });
  });

  it('sačuvano stanje prihvata svaku šemu i oblik terminala, a nepoznate odbacuje', () => {
    for (const id of TERM_IDS) expect(sanitize({ opts: { termStyle: id } }, defaults()).opts.termStyle).toBe(id);
    for (const shape of TERM_SHAPES) expect(sanitize({ opts: { termShape: shape } }, defaults()).opts.termShape).toBe(shape);
    expect(sanitize({ opts: { termStyle: 'matrix', termShape: 'mac' } }, defaults()).opts).toMatchObject({ termStyle: 'kod', termShape: 'obican' });
    // ranija traka prozora sa tri tačke postaje panel kao u VS Code-u
    expect(sanitize({ opts: { termBar: true } }, defaults()).opts.termShape).toBe('vscode');
  });

  it('oblik terminala menja samo redove sa „$ “', () => {
    const syn = termPalette('onedark').syn, lines = ['$ python3 ocene.py', 'Studenata: 6', '>>> 2 + 3', '$ pytest -q'];
    const text = shape => terminalParas(lines, syn, shape, 'ocene').map(q => q.runs.map(r => r.t).join(''));
    expect(text('obican')).toEqual(lines);
    expect(text('vscode')).toEqual(['student@fakultet:~/ocene$ python3 ocene.py', 'Studenata: 6', '>>> 2 + 3', 'student@fakultet:~/ocene$ pytest -q']);
    expect(text('windows')[0]).toBe('PS C:\\Users\\student\\ocene> python3 ocene.py');
    expect(text('moderan')).toEqual(['~/ocene on main', '› python3 ocene.py', 'Studenata: 6', '>>> 2 + 3', ' ', '~/ocene on main', '› pytest -q']);
  });

  it('na slajdovima kod i terminal dobijaju svoje podloge', () => withOpts({ codeStyle: 'svetli', termStyle: 'tamni', samples: true }, () => {
    const fills = pythonSlides().flatMap(s => s.extras).filter(o => o.k === 'rect').map(o => o.fill);
    expect(fills).toContain('#F6F8FA');
    expect(fills).toContain('#0C0C0C');
  }));

  it('panel kao u VS Code-u ima karticu TERMINAL samo na terminalu, i nigde tri tačke', () => withOpts({ termStyle: 'onedark', termShape: 'vscode', samples: true }, () => {
    const list = pythonSlides(), tab = s => s.extras.some(o => o.k === 'text' && o.paras[0] === 'TERMINAL');
    const term = list.filter(s => s.extras.some(o => o.k === 'rect' && o.fill === '#282C34')), code = list.filter(s => s.extras.some(o => o.k === 'rect' && o.fill === P().code));
    expect(term.length).toBeGreaterThan(0);
    for (const s of term) expect(tab(s)).toBe(true);
    for (const s of code) expect(tab(s)).toBe(false);
    expect(list.some(s => s.extras.some(o => o.k === 'ellipse'))).toBe(false);
  }));
});

describe('kod kao u editoru', () => {
  const name = (...a) => codeFile(...a).name;
  it('ime fajla dolazi iz naslova bloka, iz komentara u prvom redu ili iz jezika', () => {
    expect(name('python', ['x = 1'], 'ocene.py')).toBe('ocene.py');
    expect(name('python', ['x = 1'], 'src/alati/ocene.py')).toBe('ocene.py');
    // naslov koji nije ime fajla (npr. opis listinga u radu) ne ide na karticu
    expect(name('python', ['x = 1'], 'Prosek ocena')).toBe('main.py');
    expect(name('python', ['x = 1'], '', 'ocene')).toBe('ocene.py');
    expect(name('rust', ['fn main() {}'], '', 'ocene')).toBe('main.rs');
    expect(name('javascript', ['let x;'])).toBe('index.js');
    expect(name('sql', ['SELECT 1;'])).toBe('upiti.sql');
    expect(name('dockerfile', ['FROM python:3.12'])).toBe('Dockerfile');
    expect(name('yaml', ['services:', '  api:'])).toBe('compose.yaml');
    expect(name('yaml', ['ime: ocene'])).toBe('config.yml');
    expect(name('cobol', ['x'])).toBe('cobol');
    expect(name('', ['x'])).toBe('kod');
  });

  it('komentar sa imenom fajla prelazi na karticu, a običan komentar ostaje u kodu', () => {
    expect(codeFile('javascript', ['// izvestaj.js', 'export function f() {}'])).toEqual({ name: 'izvestaj.js', lines: ['export function f() {}'] });
    expect(codeFile('gitignore', ['# .gitignore', '__pycache__/'])).toEqual({ name: '.gitignore', lines: ['__pycache__/'] });
    expect(codeFile('yaml', ['# .github/workflows/ci.yml', 'on: push']).name).toBe('ci.yml');
    expect(codeFile('python', ['# srednja ocena', 'x = 1']).lines).toEqual(['# srednja ocena', 'x = 1']);
    expect(codeFile('python', ['# verzija 1.2', 'x = 1']).lines).toHaveLength(2);
  });

  it('na slajdu blok koda ima karticu fajla i brojeve redova poravnate sa kodom', () => withOpts({ codeStyle: 'tamni', samples: true }, () => {
    const code = pythonSlides().filter(s => s.extras.some(o => o.part === 'code'));
    expect(code.length).toBeGreaterThan(0);
    const tabs = code.map(s => s.extras.find(o => o.k === 'text' && o.part === 'code' && o.st.bold).paras[0]);
    expect(tabs).toContain('ocene.py');
    expect(tabs).toContain('test_ocene.py');
    for (const s of code) {
      const [nums, text] = s.extras.filter(o => o.k === 'text' && o.part === 'code' && o.st.font === S.fonts.mono);
      expect(nums.paras.map(q => q.runs[0].t)).toEqual(text.paras.map((_, i) => String(i + 1)));
      expect(nums).toMatchObject({ y: text.y, h: text.h, st: { size: text.st.size, spacing: text.st.spacing, align: 'right' } });
      expect(nums.x + nums.w).toBeLessThan(text.x);
      // red sa imenom fajla je na kartici, ne ponavlja se u kodu
      expect(text.paras.some(q => q.runs.map(r => r.t).join('') === '# test_ocene.py')).toBe(false);
    }
  }));

  it('naslov bloka ide na karticu, a oznaka jezika gore desno ostaje samo običnom terminalu', () => withOpts({ termShape: 'obican' }, () => {
    const H = { p: P(), bf: S.fonts.body, mf: S.fonts.mono, rr: 0 }, box = { x: 1, y: 1, w: 10, h: 4 };
    const texts = x => codeBlock(x, box, H).filter(o => o.k === 'text').map(o => o.paras[0]);
    expect(texts({ lang: 'python', title: 'planer.py', lines: ['x = 1'] })).toEqual(['planer.py', { runs: [{ t: '1' }] }, expect.anything()]);
    expect(texts({ lang: 'terminal', title: '', lines: ['$ ls'] })[0]).toBe('terminal');
  }));
});

describe('skok pregleda na kod i terminal', () => {
  it('slajd zna da ima kod, odnosno terminal', async () => {
    const { slideKinds } = await import('../src/slides/deck.js');
    const kinds = pythonSlides().map(slideKinds);
    expect(kinds.some(k => k.includes('code'))).toBe(true);
    expect(kinds.some(k => k.includes('terminal'))).toBe(true);
    // slajd sa terminalom nije označen kao slajd sa kodom
    expect(kinds.some(k => k.includes('code') && k.includes('terminal'))).toBe(false);
  });
});
