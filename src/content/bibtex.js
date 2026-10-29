// BibTeX: čitanje unosa iz Google Scholar-a, Zotero-a i Mendeley-a.

/* ---------- literatura: BibTeX ---------- */
export const ACC = { v: { c: 'č', C: 'Č', s: 'š', S: 'Š', z: 'ž', Z: 'Ž', r: 'ř', e: 'ě' }, "'": { c: 'ć', C: 'Ć', e: 'é', a: 'á', o: 'ó', i: 'í', u: 'ú', n: 'ń', s: 'ś', z: 'ź', E: 'É' }, '"': { o: 'ö', u: 'ü', a: 'ä', O: 'Ö', U: 'Ü', A: 'Ä' }, '`': { e: 'è', a: 'à' }, '^': { e: 'ê', o: 'ô' }, '~': { n: 'ñ' }, c: { c: 'ç' } };
export function deLatex(s) {
  return String(s)
    .replace(/\{?\\([v'"`^~c])\s*\{?\s*([A-Za-z])\s*\}?\}?/g, (m, a, ch) => (ACC[a] && ACC[a][ch]) || ch)
    .replace(/\{?\\dj\}?/g, 'đ').replace(/\{?\\DJ\}?/g, 'Đ').replace(/\\([&%_$#])/g, '$1')
    .replace(/\\[a-zA-Z]+\s*/g, '').replace(/---/g, '—').replace(/--/g, '–').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}
export function splitAuthors(raw) {
  const parts = []; let depth = 0, cur = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '{') depth++; else if (ch === '}') depth--;
    if (depth === 0 && /^\s+and\s+/i.test(raw.slice(i)) && /\s/.test(ch)) { parts.push(cur); cur = ''; i += raw.slice(i).match(/^\s+and\s+/i)[0].length - 1; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map(a => {
    a = a.trim();
    if (/^\{.*\}$/.test(a)) return { last: deLatex(a), first: '', org: true };
    const d = deLatex(a);
    if (d.includes(',')) { const [l, f] = d.split(','); return { last: l.trim(), first: (f || '').trim() }; }
    const w = d.split(' '); return { last: w.pop(), first: w.join(' ') };
  });
}
export function parseBib(src) {
  const out = [], s = String(src || ''), re = /@(\w+)\s*\{\s*([^,\s]*)\s*,/g; let m;
  while ((m = re.exec(s))) {
    const type = m[1].toLowerCase(); if (['comment', 'preamble', 'string'].includes(type)) continue;
    const f = {}; let i = re.lastIndex;
    while (i < s.length) {
      while (i < s.length && /[\s,]/.test(s[i])) i++;
      if (s[i] === '}' || i >= s.length) { i++; break; }
      const nm = s.slice(i).match(/^([\w-]+)\s*=\s*/); if (!nm) { i++; continue; }
      i += nm[0].length; let val;
      if (s[i] === '{') { let d = 0; const st = i; for (; i < s.length; i++) { if (s[i] === '{') d++; else if (s[i] === '}') { d--; if (!d) { i++; break; } } } val = s.slice(st + 1, i - 1); }
      else if (s[i] === '"') { const st = ++i; let d = 0; for (; i < s.length; i++) { if (s[i] === '{') d++; else if (s[i] === '}') d--; else if (s[i] === '"' && !d) break; } val = s.slice(st, i); i++; }
      else { const v = s.slice(i).match(/^[^,}\s]+/); val = v ? v[0] : ''; i += val.length; }
      f[nm[1].toLowerCase()] = val;
    }
    re.lastIndex = i;
    const g = k => (f[k] ? deLatex(f[k]) : '');
    const kind = /^(article)$/.test(type) ? 'article' : /^(book|inbook|incollection)$/.test(type) ? 'book' : /^(inproceedings|conference|proceedings)$/.test(type) ? 'conf'
      : /thesis/.test(type) ? 'thesis' : (/^(online|electronic|www|webpage)$/.test(type) || f.url) && !/^(techreport|report)$/.test(type) ? 'web' : 'other';
    out.push({
      key: m[2], type: kind, authors: f.author ? splitAuthors(f.author) : f.editor ? splitAuthors(f.editor) : [],
      year: (g('year') || g('date')).slice(0, 4), title: g('title'), journal: g('journal') || g('journaltitle'), booktitle: g('booktitle'),
      volume: g('volume'), issue: g('number') || g('issue'), pages: g('pages'), doi: g('doi').replace(/^https?:\/\/doi\.org\//, ''), url: f.url ? f.url.trim() : '',
      urldate: g('urldate'), publisher: g('publisher') || g('organization') || g('institution'), city: g('address') || g('location'), edition: g('edition'),
      school: g('school') || g('institution'), site: g('howpublished') || g('organization'), thesis: type === 'phdthesis' ? 'doktorska disertacija' : type === 'mastersthesis' ? 'master rad' : g('type') || 'rad',
    });
  }
  return out;
}
