// Bojenje sintakse koda za slajdove: pravila po jeziku, red po red (višeredni komentari se ne prate).

/* ---------- primer Python koda za ugrađene primere ---------- */
export const CODE = `from dataclasses import dataclass

@dataclass
class Plan:
    redosled: list[str]
    cena: float

def izaberi_plan(upit, statistike) -> Plan:
    # proceni cenu svakog kandidata i vrati najjeftiniji
    kandidati = generisi_planove(upit, max_dubina=4)
    return min(kandidati, key=lambda p: proceni(p, statistike))`;

// opšti skup reči za jezike bez sopstvenih pravila
export const KW = 'def|class|return|from|import|for|in|if|else|elif|lambda|while|with|as|None|True|False|and|or|not|fn|let|mut|pub|struct|impl|use|match|enum|trait|const|static|void|int|float|double|char|bool|boolean|public|private|protected|new|var|function|async|await|try|catch|finally|throw|throws|interface|extends|implements|package|namespace|using|include|null|true|false|this|self|super|break|continue|switch|case|default|do|typedef|unsigned|long|auto|loop|where|type|mod|crate|SELECT|FROM|WHERE|JOIN|ON|GROUP|BY|ORDER|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|AND|OR|NOT|NULL|AS|MATCH|RETURN';

const JS_KW = 'async await break case catch class const continue default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield';
const str = q => `${q}(?:[^${q}\\\\]|\\\\.)*${q}`;
const LANGS = {
  python: {
    kw: 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case self',
    com: '#.*$', str: [str('"'), str("'")], deco: '@[\\w.]+',
  },
  rust: {
    kw: 'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while Some None Ok Err',
    com: '\\/\\/.*$', str: [str('"')], deco: '#!?\\[[^\\]]*\\]', macro: '\\b[a-z_]\\w*!',
  },
  javascript: { kw: JS_KW, com: '\\/\\/.*$', str: [str('"'), str("'"), str('`')] },
  typescript: { kw: JS_KW + ' interface type enum implements private public protected readonly as number string boolean', com: '\\/\\/.*$', str: [str('"'), str("'"), str('`')] },
  sql: {
    kw: 'SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER FULL CROSS ON USING GROUP BY ORDER HAVING LIMIT OFFSET INSERT INTO VALUES UPDATE SET DELETE CREATE ALTER DROP TABLE INDEX VIEW PRIMARY KEY FOREIGN REFERENCES CHECK NOT NULL UNIQUE DEFAULT AND OR IN IS LIKE BETWEEN EXISTS AS DISTINCT COUNT SUM AVG MIN MAX BEGIN COMMIT ROLLBACK EXPLAIN ANALYZE WITH UNION ALL CASE WHEN THEN ELSE END ASC DESC INTEGER INT BIGINT TEXT VARCHAR CHAR DATE TIMESTAMP NUMERIC DECIMAL SERIAL BOOLEAN TRUE FALSE',
    com: '--.*$', str: [str("'")], ci: true,
  },
  dockerfile: {
    kw: 'FROM AS RUN CMD LABEL EXPOSE ENV ADD COPY ENTRYPOINT VOLUME USER WORKDIR ARG ONBUILD STOPSIGNAL HEALTHCHECK SHELL',
    com: '#.*$', str: [str('"')], vars: '\\$\\{?\\w+\\}?',
  },
  yaml: { com: '#.*$', str: [str('"'), str("'")], key: '^\\s*(?:-\\s+)?[\\w.-]+(?=\\s*:)', kw: 'true false null yes no' },
  bash: {
    kw: 'if then else elif fi for in do done while until case esac function return export local readonly source sudo echo cd',
    com: '(?:^|\\s)#.*$', str: [str('"'), str("'")], vars: '\\$\\{?[\\w@#?]+\\}?',
  },
};
const ALIAS = { py: 'python', rs: 'rust', js: 'javascript', mjs: 'javascript', node: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', zsh: 'bash', docker: 'dockerfile', yml: 'yaml', compose: 'yaml', psql: 'sql', postgresql: 'sql', mysql: 'sql', sqlite: 'sql' };
// terminal: red sa odzivom („$ “, „# “, „> “ ili „baza=# “) je komanda, ostalo je ispis programa
const TERMINAL = /^(terminal|console|konzola|shell-session)$/;
export const isTerminal = lang => TERMINAL.test(String(lang || '').toLowerCase());

const cache = new Map();
function compile(lang) {
  if (cache.has(lang)) return cache.get(lang);
  const L = LANGS[lang];
  let parts, kinds;
  if (!L) {
    // nepoznat jezik: opšta pravila (komentar po uobičajenom znaku za taj jezik)
    const com = /^(sql|lua|haskell|hs|ada|cypher)$/.test(lang) ? '--.*$' : /^(r|rb|ruby|toml|perl|gitignore|dockerignore|)$/.test(lang) ? '#.*$' : '\\/\\/.*$';
    parts = [com, `${str('"')}|${str("'")}`, '@\\w+', `\\b(?:${KW})\\b`, '\\b\\d+(?:\\.\\d+)?\\b', '\\b[A-Za-z_]\\w*(?=\\()', '\\b[A-Z]\\w*\\b'];
    kinds = ['com', 'str', 'kw', 'kw', 'kw', 'fn', 'fn'];
  } else {
    parts = []; kinds = [];
    const push = (re, kind) => { if (re) { parts.push(re); kinds.push(kind); } };
    push(L.com, 'com');
    push(L.str.join('|'), 'str');
    push(L.key, 'kw');
    push(L.deco, 'kw');
    push(L.macro, 'fn');
    push(L.vars, 'fn');
    if (L.kw) push(`\\b(?:${L.kw.split(' ').join('|')})\\b`, 'kw');
    push('\\b\\d+(?:\\.\\d+)?\\b', 'kw');
    push('\\b[A-Za-z_]\\w*(?=\\()', 'fn');
    if (!L.ci) push('\\b[A-Z][a-z]\\w*\\b', 'fn');
  }
  const re = new RegExp(parts.map(x => `(${x})`).join('|'), L && L.ci ? 'gim' : 'gm');
  const out = { re, kinds };
  cache.set(lang, out);
  return out;
}
function tokens(line, syn, lang) {
  const { re, kinds } = compile(lang), runs = [];
  let last = 0, m;
  re.lastIndex = 0;
  while ((m = re.exec(line))) {
    if (!m[0]) { re.lastIndex++; continue; }
    if (m.index > last) runs.push({ t: line.slice(last, m.index) });
    const kind = kinds[m.slice(1).findIndex(g => g !== undefined)];
    runs.push({ t: m[0], color: syn[kind], italic: kind === 'com' });
    last = m.index + m[0].length;
  }
  if (last < line.length) runs.push({ t: line.slice(last) });
  return runs;
}
export function highlight(code, syn, lang = 'python') {
  const id = String(lang || '').toLowerCase(), name = ALIAS[id] || id;
  return code.split('\n').map(line => {
    let runs;
    if (TERMINAL.test(name)) {
      const pm = line.match(/^(\s*(?:[$#>]|[\w-]+=[#>]) )(.*)$/);
      // izgled terminala može imati posebnu boju odziva (prompt) i ispisa (out)
      if (!pm) runs = line ? [{ t: line, color: syn.out || syn.com }] : [];
      else if (/=/.test(pm[1])) runs = [{ t: pm[1], color: syn.prompt || syn.com }, ...tokens(pm[2], syn, 'sql')];
      else {
        // ime programa (git, docker, cargo…) kao funkcija, ostatak kao bash
        const cm = pm[2].match(/^(\S+)(.*)$/);
        runs = [{ t: pm[1], color: syn.prompt || syn.com }, ...(cm ? [{ t: cm[1], color: syn.fn }, ...tokens(cm[2], syn, 'bash')] : [])];
      }
    } else runs = tokens(line, syn, name);
    if (!runs.length) runs.push({ t: ' ' });
    return { runs };
  });
}
