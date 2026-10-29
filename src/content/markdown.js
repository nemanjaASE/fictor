// Markdown: blokovi i formatiranje u redu teksta.
import { cite } from './citations.js';
import { S } from '../core/state.js';
import { parseChart } from '../graphics/charts.js';

/* ---------- sopstveni sadržaj: Markdown ----------
   # Celina   ## Slajd ili odeljak   ### Podnaslov   - stavka   1. stavka   > izjava ili napomena
   **podebljano**  *kurziv*  `kod`  [@kljuc] citat   | tabela |   ```python kod```   ```grafikon ...```   ```brojevi ...```
   # Naslov {-} bez broja */
export const userMd = doc => ((S.content && S.content[doc]) || '').trim();
export function inline(s) {
  const out = [], re = /(\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|`([^`]+)`|\[(@[^\]]+)\])/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index) });
    if (m[2]) out.push({ t: m[2], b: true });
    else if (m[3]) out.push({ t: m[3], i: true });
    else if (m[4]) out.push({ t: m[4], code: true });
    else out.push({ cite: m[5].split(/[;,]/).map(x => x.trim().replace(/^@/, '')).filter(Boolean) });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ t: s.slice(last) });
  return out;
}
export const resolveRuns = runs => runs.map(r => (r.cite ? { t: cite(r.cite) } : r));
export const plainRuns = runs => resolveRuns(runs).map(r => r.t).join('');
export const stripMd = s => plainRuns(inline(String(s)));
export function parseTable(rows) {
  const isSep = l => !l.replace(/[|:\-\s]/g, '').length;
  const raw = l => { let s = l.trim(); if (s.startsWith('|')) s = s.slice(1); if (s.endsWith('|')) s = s.slice(0, -1); return s.split('|').map(c => c.trim()); };
  const src = rows.filter(l => !isSep(l)).map(raw), data = src.map(r => r.map(stripMd));
  const n = Math.max(0, ...data.map(r => r.length));
  data.forEach(r => { while (r.length < n) r.push(''); });
  // code[i][j]: ćelija je cela u `navodnicima` (kod), pa je ne treba menjati tipografijom ni pismom
  const code = src.slice(1).map(r => Array.from({ length: n }, (_, j) => /^`[^`]+`$/.test(r[j] || '')));
  return { head: data[0] || [], rows: data.slice(1), code, hi: -1 };
}
// red tabele koji „istakni:“ imenuje: po prvoj ćeliji (bez obzira na velika slova) ili po rednom broju reda
export function tableHi(t, want) {
  const w = String(want).trim();
  if (/^\d+$/.test(w)) return +w >= 1 && +w <= t.rows.length ? +w - 1 : -1;
  return t.rows.findIndex(r => String(r[0] || '').trim().toLowerCase() === w.toLowerCase());
}
// ključni brojevi: „3,4× | brže izvršavanje | medijana na 120 upita | Brzina“ po redu (oznaka iznad broja nije obavezna), i „izvor: …“
export function parseStats(lines) {
  const items = [], src = { source: '' };
  for (const l of lines) {
    const m = l.match(/^\s*(izvor|source)\s*:\s*(.*)$/i);
    if (m) { src.source = stripMd(m[2]); continue; }
    const parts = l.split('|').map(x => stripMd(x.trim()));
    if (parts[0]) items.push([parts[0], parts[1] || '', parts[2] || '', parts[3] || '']);
  }
  return { k: 'stats', items, source: src.source };
}
export function parseMd(src) {
  const L = String(src || '').replace(/\r\n?/g, '\n').split('\n'), out = [];
  const isTable = l => /^\s*\|.*\|\s*$/.test(l), capRe = /^\s*(tabela|table)\s*:\s*/i;
  const startsBlock = l => /^(#{1,4}\s|```|\s*>|\s*[-*+]\s+|\s*\d+[.)]\s+|\s*\||!\[)/.test(l) || capRe.test(l);
  let i = 0, pendingCap = '';
  while (i < L.length) {
    const l = L[i]; let m;
    if (!l.trim()) { i++; continue; }
    if ((m = l.match(/^```\s*([\w+#-]*)\s*(.*)$/))) {
      const lang = m[1].toLowerCase(), title = m[2].trim(), body = []; i++;
      while (i < L.length && !/^```\s*$/.test(L[i])) body.push(L[i++]);
      i++;
      if (/^(grafikon|chart)$/.test(lang)) out.push({ k: 'chart', spec: parseChart(body) });
      else if (/^(brojevi|stats)$/.test(lang)) out.push(parseStats(body));
      else out.push({ k: 'code', lang, title, lines: body });
      continue;
    }
    if ((m = l.match(/^(#{1,4})\s+(.*?)\s*(\{-\}|\{\.unnumbered\})?\s*$/))) { out.push({ k: 'h', level: m[1].length, text: stripMd(m[2]), runs: inline(m[2]), unnumbered: !!m[3] }); i++; continue; }
    if (capRe.test(l) && L.slice(i + 1).find(x => x.trim()) && isTable(L.slice(i + 1).find(x => x.trim()))) { pendingCap = l.replace(capRe, ''); i++; continue; }
    if (isTable(l)) {
      const rows = []; while (i < L.length && isTable(L[i])) rows.push(L[i++]);
      const t = parseTable(rows), hiRe = /^\s*(istakni|highlight)\s*:\s*/i;
      // posle tabele, bilo kojim redom: „Tabela: opis“ (naslov) i „istakni: red“ (istaknut red)
      for (let n = 0; n < 2; n++) {
        let j = i; while (j < L.length && !L[j].trim()) j++;
        if (j >= L.length) break;
        if (capRe.test(L[j]) && t.caption == null) { t.caption = L[j].replace(capRe, ''); i = j + 1; }
        else if (hiRe.test(L[j]) && t.hi < 0) { t.hi = tableHi(t, stripMd(L[j].replace(hiRe, ''))); i = j + 1; }
        else break;
      }
      if (t.caption == null && pendingCap) t.caption = pendingCap;
      pendingCap = '';
      out.push({ k: 'table', ...t });
      continue;
    }
    if ((m = l.match(/^!\[([^\]]*)\]\(([^)]*)\)/))) { out.push({ k: 'img', alt: m[1] || 'Slika', src: m[2] }); i++; continue; }
    if (/^\s*>/.test(l)) { const buf = []; while (i < L.length && /^\s*>/.test(L[i])) buf.push(L[i++].replace(/^\s*>\s?/, '')); out.push({ k: 'quote', runs: inline(buf.join(' ').trim()) }); continue; }
    const listOf = (re, k) => {
      const items = [];
      while (i < L.length && re.test(L[i])) {
        let t = L[i++].replace(re, '');
        while (i < L.length && L[i].trim() && /^\s{2,}\S/.test(L[i]) && !re.test(L[i])) t += ' ' + L[i++].trim();
        items.push(inline(t.trim()));
      }
      out.push({ k, items });
    };
    if (/^\s*[-*+]\s+/.test(l)) { listOf(/^\s*[-*+]\s+/, 'ul'); continue; }
    if (/^\s*\d+[.)]\s+/.test(l)) { listOf(/^\s*\d+[.)]\s+/, 'ol'); continue; }
    if (/^\s*(---+|\*\*\*+)\s*$/.test(l)) { out.push({ k: 'hr' }); i++; continue; }
    const buf = [l.trim()]; i++;
    while (i < L.length && L[i].trim() && !startsBlock(L[i])) buf.push(L[i++].trim());
    out.push({ k: 'p', runs: inline(buf.join(' ')) });
  }
  return out;
}
export const estLines = (text, wIn, size) => {
  const cpl = Math.max(4, Math.floor(wIn * 72 / (size * 0.56))); let lines = 1, cur = 0;
  for (const w of String(text).split(/\s+/).filter(Boolean)) { const add = w.length + (cur ? 1 : 0); if (cur && cur + add > cpl) { lines++; cur = w.length; } else cur += add; }
  return lines;
};
