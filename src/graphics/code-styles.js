// Izgledi koda i terminala na slajdovima (kartica Elementi).
import { ensure } from '../lib/color.js';
import { highlight } from './highlight.js';

// kod (S.opts.codeStyle): boje teme ili šeme boja poznatih editora (tamni = VS Code, svetli = GitHub), otvorene licence
// base osnovni tekst, kw ključne reči, str tekst u navodnicima, fn imena funkcija, com komentari
export const CODE_STYLES = {
  tamni: { bg: '#1E1E1E', base: '#D4D4D4', kw: '#569CD6', str: '#CE9178', fn: '#DCDCAA', com: '#6A9955' },
  svetli: { bg: '#F6F8FA', base: '#1F2328', kw: '#CF222E', str: '#0A3069', fn: '#8250DF', com: '#59636E' },
  onedark: { bg: '#282C34', base: '#ABB2BF', kw: '#C678DD', str: '#98C379', fn: '#61AFEF', com: '#5C6370' },
  dracula: { bg: '#282A36', base: '#F8F8F2', kw: '#FF79C6', str: '#F1FA8C', fn: '#50FA7B', com: '#6272A4' },
  monokai: { bg: '#272822', base: '#F8F8F2', kw: '#F92672', str: '#E6DB74', fn: '#A6E22E', com: '#75715E' },
  nord: { bg: '#2E3440', base: '#D8DEE9', kw: '#81A1C1', str: '#A3BE8C', fn: '#88C0D0', com: '#616E88' },
  tokyo: { bg: '#1A1B26', base: '#A9B1D6', kw: '#BB9AF7', str: '#9ECE6A', fn: '#7AA2F7', com: '#565F89' },
  catppuccin: { bg: '#1E1E2E', base: '#CDD6F4', kw: '#CBA6F7', str: '#A6E3A1', fn: '#89B4FA', com: '#6C7086' },
  gruvbox: { bg: '#282828', base: '#EBDBB2', kw: '#FB4934', str: '#B8BB26', fn: '#FABD2F', com: '#928374' },
  solarized: { bg: '#002B36', base: '#93A1A1', kw: '#859900', str: '#2AA198', fn: '#268BD2', com: '#586E75' },
};
export const CODE_IDS = ['tema', ...Object.keys(CODE_STYLES)];
// boje koda za slajd: zvanične boje šeme, pojačane do kontrasta 4,5:1 gde su slabije (npr. komentari)
export function codePalette(id) {
  const c = CODE_STYLES[id];
  if (!c) return null;
  const e = x => ensure(x, c.bg, 4.5);
  return { bg: c.bg, base: e(c.base), kw: e(c.kw), str: e(c.str), fn: e(c.fn), com: e(c.com) };
}

// terminal (S.opts.termStyle): šeme boja poznatih terminala, otvorene licence (MIT)
// bg podloga, fg ispis programa, cmd tekst komande, prompt odziv „$“, fn ime programa, str tekst u navodnicima,
// kw ključne reči, com komentari
export const TERM_STYLES = {
  tamni: { bg: '#0C0C0C', fg: '#CCCCCC', cmd: '#FFFFFF', prompt: '#16C60C', fn: '#FFFFFF', str: '#FFFFFF', kw: '#FFFFFF', com: '#8A8A8A' },
  plavi: { bg: '#012456', fg: '#EEEDF0', cmd: '#FFFFFF', prompt: '#F9F1A5', fn: '#FFFFFF', str: '#FFFFFF', kw: '#FFFFFF', com: '#9FB8D6' },
  dracula: { bg: '#282A36', fg: '#F8F8F2', cmd: '#F8F8F2', prompt: '#50FA7B', fn: '#8BE9FD', str: '#F1FA8C', kw: '#FF79C6', com: '#6272A4' },
  onedark: { bg: '#282C34', fg: '#ABB2BF', cmd: '#DCDFE4', prompt: '#98C379', fn: '#61AFEF', str: '#E5C07B', kw: '#C678DD', com: '#5C6370' },
  nord: { bg: '#2E3440', fg: '#D8DEE9', cmd: '#ECEFF4', prompt: '#A3BE8C', fn: '#88C0D0', str: '#EBCB8B', kw: '#81A1C1', com: '#616E88' },
  tokyo: { bg: '#1A1B26', fg: '#A9B1D6', cmd: '#C0CAF5', prompt: '#9ECE6A', fn: '#7AA2F7', str: '#E0AF68', kw: '#BB9AF7', com: '#565F89' },
  catppuccin: { bg: '#1E1E2E', fg: '#BAC2DE', cmd: '#CDD6F4', prompt: '#A6E3A1', fn: '#89B4FA', str: '#F9E2AF', kw: '#CBA6F7', com: '#6C7086' },
  gruvbox: { bg: '#282828', fg: '#EBDBB2', cmd: '#FBF1C7', prompt: '#B8BB26', fn: '#8EC07C', str: '#FABD2F', kw: '#FE8019', com: '#928374' },
  solarized: { bg: '#002B36', fg: '#839496', cmd: '#93A1A1', prompt: '#859900', fn: '#268BD2', str: '#B58900', kw: '#D33682', com: '#586E75' },
  svetli: { bg: '#F6F8FA', fg: '#1F2328', cmd: '#1F2328', prompt: '#1A7F37', fn: '#0969DA', str: '#0A3069', kw: '#CF222E', com: '#59636E' },
};
export const TERM_IDS = ['kod', ...Object.keys(TERM_STYLES)];

// boje terminala za slajd: zvanične boje šeme, pojačane do kontrasta 4,5:1 gde su slabije (npr. komentari),
// jer se terminal gleda na projektoru
export function termPalette(id) {
  const t = TERM_STYLES[id];
  if (!t) return null;
  const e = c => ensure(c, t.bg, 4.5);
  return { bg: t.bg, syn: { base: e(t.cmd), kw: e(t.kw), str: e(t.str), fn: e(t.fn), com: e(t.com), prompt: e(t.prompt), out: e(t.fg) } };
}

// oblik terminala (S.opts.termShape): sadržaj se piše sa „$ “, a pri crtanju odziv dobija izgled pravog terminala.
// običan: „$ “; vscode: panel sa karticom TERMINAL i Linux odzivom; moderan: folder i grana iznad komande i odziv ›
// (kao Starship); windows: kartica sa imenom ljuske i PowerShell odziv. Ostali redovi (ispis, >>>, baza=#) ostaju isti.
export const TERM_SHAPES = ['obican', 'vscode', 'moderan', 'windows'];
export function terminalParas(lines, syn, shape, dir) {
  const out = [], c = (t, color) => ({ t, color });
  let first = true;
  for (const line of lines.length ? lines : [' ']) {
    const m = line.match(/^\s*\$ (.*)$/);
    if (!m || !['vscode', 'moderan', 'windows'].includes(shape)) { out.push(highlight(line, syn, 'terminal')[0]); continue; }
    const cmd = highlight('$ ' + m[1], syn, 'terminal')[0].runs.slice(1);
    if (shape === 'vscode') out.push({ runs: [c('student@fakultet', syn.prompt || syn.fn), c(':', syn.out || syn.base), c('~/' + dir, syn.fn), c('$ ', syn.out || syn.base), ...cmd] });
    else if (shape === 'windows') out.push({ runs: [c('PS C:\\Users\\student\\' + dir + '> ', syn.out || syn.base), ...cmd] });
    else {
      if (!first) out.push({ runs: [{ t: ' ' }] });
      out.push({ runs: [c('~/' + dir, syn.fn), c(' on ', syn.com), c('main', syn.kw)] }, { runs: [c('› ', syn.prompt || syn.fn), ...cmd] });
    }
    first = false;
  }
  return out;
}

// ime fajla na kartici editora: naslov bloka (```python ocene.py), komentar sa imenom fajla u prvom redu
// (taj red se ne ponavlja ispod kartice) ili uobičajeno ime za jezik; u kursu o tehnologiji fajlovi su iz serije „ocene“
const FILE = /^(?:[\w-]*\.[A-Za-z][\w]{0,11}|[\w-]+\.[\w.-]*[A-Za-z][\w]*|Dockerfile|Containerfile|Makefile|Jenkinsfile|Procfile|Gemfile)$/;
const EXT = {
  python: 'py', py: 'py', rust: 'rs', rs: 'rs', javascript: 'js', js: 'js', node: 'js', mjs: 'mjs', typescript: 'ts', ts: 'ts',
  sql: 'sql', psql: 'sql', postgresql: 'sql', mysql: 'sql', sqlite: 'sql', yaml: 'yml', yml: 'yml', bash: 'sh', sh: 'sh', shell: 'sh', zsh: 'sh',
  go: 'go', c: 'c', cpp: 'cpp', 'c++': 'cpp', java: 'java', kotlin: 'kt', kt: 'kt', csharp: 'cs', cs: 'cs', 'c#': 'cs', php: 'php', ruby: 'rb', rb: 'rb',
  html: 'html', css: 'css', json: 'json', toml: 'toml', r: 'R', lua: 'lua', haskell: 'hs', hs: 'hs', swift: 'swift', scala: 'scala', dart: 'dart',
  cypher: 'cypher', markdown: 'md', md: 'md', xml: 'xml',
};
const BASE = { js: 'index', mjs: 'index', ts: 'index', html: 'index', css: 'stil', java: 'Main', kt: 'Main', cs: 'Program', hs: 'Main', sql: 'upiti', json: 'podaci', yml: 'config', toml: 'config', md: 'README', xml: 'config' };
const NAMED = { dockerfile: 'Dockerfile', docker: 'Dockerfile', makefile: 'Makefile', make: 'Makefile', gitignore: '.gitignore', dockerignore: '.dockerignore', compose: 'compose.yaml' };
export function codeFile(lang, lines, title = '', project = '') {
  // putanja (src/ocene.py) daje samo ime fajla, kao na kartici u editoru
  const file = x => { const f = /^[\w./-]+$/.test(x) ? x.split('/').pop() : ''; return FILE.test(f) ? f : ''; };
  const id = String(lang || '').toLowerCase(), t = file(String(title || '').trim());
  if (t) return { name: t, lines };
  const m = (lines[0] || '').match(/^\s*(?:\/\/|#|--|;)\s*(\S+)\s*$/), named = m && file(m[1]);
  if (named && lines.length > 1) {
    const rest = lines.slice(1);
    while (rest.length > 1 && !rest[0].trim()) rest.shift();
    return { name: named, lines: rest };
  }
  if (NAMED[id]) return { name: NAMED[id], lines };
  const ext = EXT[id];
  if (!ext) return { name: id || 'kod', lines };
  if (ext === 'yml' && lines.some(l => /^services:/.test(l))) return { name: 'compose.yaml', lines };
  return { name: (project && ['py', 'js', 'mjs', 'ts'].includes(ext) ? project : BASE[ext] || 'main') + '.' + ext, lines };
}
