// Citiranje u stilovima IEEE, APA 7, Harvard i Chicago (autor–datum).
import { parseBib } from './bibtex.js';
import { activeTech } from './tech.js';
import { userMd } from './markdown.js';
import { S } from '../core/state.js';

/* ---------- citiranje: četiri stila (IEEE, APA 7, Harvard, Chicago autor–datum) ---------- */
export const CITE_STYLES = { ieee: 'IEEE', apa: 'APA 7', harvard: 'Harvard', chicago: 'Chicago' };
export const SAMPLE_SOURCES = [
  { key: 's1', type: 'article', authors: [{ last: 'Autor', first: 'Ana' }, { last: 'Saradnik', first: 'Bojan' }], year: '2024', title: 'Naslov rada o optimizaciji upita', journal: 'Naziv časopisa', volume: '12', issue: '3', pages: '45–67', doi: '10.xxxx/xxxxx' },
  { key: 's2', type: 'book', authors: [{ last: 'Pisac', first: 'Petar' }], year: '2022', title: 'Naslov knjige', edition: '2', city: 'Beograd', publisher: 'Izdavač' },
  { key: 's3', type: 'conf', authors: [{ last: 'Istraživač', first: 'Ivana' }, { last: 'Kolega', first: 'Dragan' }, { last: 'Pisac', first: 'Petar' }], year: '2023', title: 'Naslov rada sa konferencije', booktitle: 'Zbornik radova konferencije', pages: '101–110' },
];
// kontekst citiranja: koji izvori postoje, kojim redom su citirani i šta ide u spisak
export let CTX = { map: new Map(SAMPLE_SOURCES.map(s => [s.key, s])), listed: SAMPLE_SOURCES.map(s => s.key), unknown: [], user: false, count: SAMPLE_SOURCES.length };
export function buildCtx() {
  const bib = (S.bib || '').trim() ? parseBib(S.bib) : [];
  // predavanje o tehnologiji citira samo ono što piše u njegovom tekstu (podrazumevano ništa)
  const at = activeTech(S), tech = S.doc === 'slides' && S.opts.samples && at ? at.md : '';
  const sources = bib.length ? bib : SAMPLE_SOURCES, map = new Map(sources.map(s => [s.key, s])), text = userMd(S.doc) || tech;
  let order = [];
  if (text) { for (const m of text.matchAll(/\[(@[^\]]+)\]/g)) for (const k of m[1].split(/[;,]/).map(x => x.trim().replace(/^@/, '')).filter(Boolean)) if (!order.includes(k)) order.push(k); }
  else order = sources.map(s => s.key);
  CTX = { map, listed: order.filter(k => map.has(k)), unknown: order.filter(k => !map.has(k)), user: !!bib.length, count: sources.length, sources };
}
export const ini = f => String(f || '').split(/[\s-]+/).filter(Boolean).map(x => x[0] + '.').join(' ');
export const joinI = arr => (arr.length <= 1 ? arr[0] || '' : arr.slice(0, -1).join(', ') + ' i ' + arr[arr.length - 1]);
export const ed = e => (/^\d+$/.test(e) ? `${e}. izd.` : `${e} izd.`);
// jedan izvor u izabranom stilu, kao niz delova: { t, i: kurziv, raw: bez transliteracije (linkovi) }
export function refRuns(s, style) {
  const A = s.authors || [], R = [], t = (x, o = {}) => { if (x) R.push({ t: x, ...o }); }, yr = s.year || 'b. d.';
  const url = s.doi ? `https://doi.org/${s.doi}` : s.url;
  if (style === 'ieee') {
    if (A.length) t(joinI(A.map(a => (a.org ? a.last : `${ini(a.first)} ${a.last}`.trim()))) + ', ');
    if (s.type === 'book') { t(s.title, { i: true }); t(`${s.edition ? ', ' + ed(s.edition) : ''}${s.city ? (s.edition ? ' ' : ', ') + s.city + ':' : ''}${s.publisher ? ' ' + s.publisher : ''}, ${yr}.`); }
    else if (s.type === 'web') { t(`„${s.title}“`); if (s.site) { t(', '); t(s.site, { i: true }); } t('. [Na mreži]. Dostupno: '); t(s.url, { raw: true }); if (s.urldate) t(` (pristupljeno: ${s.urldate})`); t('.'); }
    else if (s.type === 'thesis') t(`„${s.title}“, ${s.thesis}${s.school ? ', ' + s.school : ''}${s.city ? ', ' + s.city : ''}, ${yr}.`);
    else {
      t(`„${s.title}“, `);
      if (s.type === 'conf') { t('u '); t(s.booktitle, { i: true }); t(`, ${yr}${s.pages ? ', str. ' + s.pages : ''}.`); }
      else if (s.journal) { t(s.journal, { i: true }); t(`${s.volume ? ', tom ' + s.volume : ''}${s.issue ? ', br. ' + s.issue : ''}${s.pages ? ', str. ' + s.pages : ''}, ${yr}.`); }
      else t(`${s.publisher || s.site || ''}${s.publisher || s.site ? ', ' : ''}${yr}.`);
      if (s.doi) { t(' doi: '); t(s.doi, { raw: true }); t('.'); }
    }
  } else if (style === 'apa') {
    const nm = A.map(a => (a.org ? a.last : `${a.last}, ${ini(a.first)}`.replace(/, $/, '')));
    if (nm.length) t(`${nm.length === 1 ? nm[0] : nm.slice(0, -1).join(', ') + ', & ' + nm[nm.length - 1]} (${yr}). `);
    else { t(s.title, { i: true }); t(`. (${yr}). `); }
    if (s.type === 'article') { if (A.length) t(`${s.title}. `); t(s.journal, { i: true }); if (s.volume) { t(', '); t(s.volume, { i: true }); } t(`${s.issue ? '(' + s.issue + ')' : ''}${s.pages ? ', ' + s.pages : ''}. `); if (url) t(url, { raw: true }); }
    else if (s.type === 'book') { if (A.length) t(s.title, { i: true }); t(`${s.edition ? ' (' + ed(s.edition) + ')' : ''}. ${s.publisher ? s.publisher + '.' : ''}`); }
    else if (s.type === 'conf') { if (A.length) t(`${s.title}. U `); t(s.booktitle, { i: true }); t(`${s.pages ? ' (str. ' + s.pages + ')' : ''}.${s.publisher ? ' ' + s.publisher + '.' : ''}`); if (url) { t(' '); t(url, { raw: true }); } }
    else if (s.type === 'thesis') { if (A.length) t(s.title, { i: true }); t(` [${s.thesis[0].toUpperCase() + s.thesis.slice(1)}${s.school ? ', ' + s.school : ''}].`); }
    else { if (A.length) t(s.title, { i: true }); t('. '); if (s.site || s.publisher) t(`${s.site || s.publisher}. `); if (url) t(url, { raw: true }); }
  } else if (style === 'harvard') {
    if (A.length) t(`${joinI(A.map(a => (a.org ? a.last : `${a.last}, ${ini(a.first)}`)))} (${yr}) `); else { t(s.title, { i: true }); t(` (${yr}) `); }
    if (s.type === 'article') { t(`„${s.title}“, `); t(s.journal, { i: true }); t(`${s.volume ? ', ' + s.volume : ''}${s.issue ? '(' + s.issue + ')' : ''}${s.pages ? ', str. ' + s.pages : ''}.`); if (s.doi) { t(' Dostupno na: '); t(url, { raw: true }); t('.'); } }
    else if (s.type === 'book') { if (A.length) t(s.title, { i: true }); t(`.${s.edition ? ' ' + ed(s.edition) : ''}${s.city ? ' ' + s.city + ':' : ''}${s.publisher ? ' ' + s.publisher : ''}.`); }
    else if (s.type === 'conf') { t(`„${s.title}“, u `); t(s.booktitle, { i: true }); t(`${s.pages ? ', str. ' + s.pages : ''}.`); }
    else if (s.type === 'thesis') { if (A.length) t(s.title, { i: true }); t(`. ${s.thesis[0].toUpperCase() + s.thesis.slice(1)}${s.school ? '. ' + s.school : ''}.`); }
    else { if (A.length) t(s.title, { i: true }); t('.'); if (url) { t(' Dostupno na: '); t(url, { raw: true }); } if (s.urldate) t(` (Pristupljeno: ${s.urldate})`); t('.'); }
  } else {
    const nm = A.map((a, i) => (a.org ? a.last : i ? `${a.first} ${a.last}`.trim() : `${a.last}, ${a.first}`.replace(/, $/, '')));
    if (nm.length) t(`${nm.length === 1 ? nm[0] : nm.slice(0, -1).join(', ') + ', i ' + nm[nm.length - 1]}. ${yr}. `); else { t(s.title, { i: true }); t(`. ${yr}. `); }
    if (s.type === 'article') { t(`„${s.title}.“ `); t(s.journal, { i: true }); t(`${s.volume ? ' ' + s.volume : ''}${s.issue ? ' (' + s.issue + ')' : ''}${s.pages ? ': ' + s.pages : ''}.`); if (url) { t(' '); t(url, { raw: true }); t('.'); } }
    else if (s.type === 'book') { if (A.length) t(s.title, { i: true }); t(`.${s.edition ? ' ' + ed(s.edition) + '.' : ''}${s.city ? ' ' + s.city + ':' : ''}${s.publisher ? ' ' + s.publisher + '.' : ''}`); }
    else if (s.type === 'conf') { t(`„${s.title}.“ U `); t(s.booktitle, { i: true }); t(`${s.pages ? ', ' + s.pages : ''}.`); }
    else if (s.type === 'thesis') t(`„${s.title}.“ ${s.thesis[0].toUpperCase() + s.thesis.slice(1)}${s.school ? ', ' + s.school : ''}.`);
    else { if (A.length) t(`„${s.title}.“`); if (s.site) { t(' '); t(s.site); t('.'); } if (url) { t(' '); t(url, { raw: true }); t('.'); } }
  }
  return R;
}
// spisak literature: IEEE po redosledu citiranja sa brojevima, ostali abecedno po prezimenu
export function refList() {
  const style = S.opts.cite || 'ieee', srcs = CTX.listed.map(k => CTX.map.get(k));
  if (style === 'ieee') return srcs.map((s, i) => ({ label: `[${i + 1}]`, runs: refRuns(s, style) }));
  const first = s => ((s.authors[0] && s.authors[0].last) || s.title || '');
  return [...srcs].sort((a, b) => first(a).localeCompare(first(b), 'sr') || String(a.year).localeCompare(String(b.year))).map(s => ({ label: '', runs: refRuns(s, style) }));
}
export function cite(keys) {
  const style = S.opts.cite || 'ieee';
  if (style === 'ieee') return keys.map(k => { const i = CTX.listed.indexOf(k); return i < 0 ? `[?${k}]` : `[${i + 1}]`; }).join(', ');
  return '(' + keys.map(k => {
    const s = CTX.map.get(k); if (!s) return '?' + k;
    const A = s.authors.map(a => a.last), yr = s.year || 'b. d.';
    // APA 7: „i dr.“ od tri autora; Harvard i Chicago navode do tri autora
    const who = !A.length ? `„${s.title}“` : A.length === 1 ? A[0] : A.length === 2 ? A[0] + (style === 'apa' ? ' & ' : ' i ') + A[1] : (style === 'apa' || A.length > 3) ? A[0] + ' i dr.' : joinI(A);
    return style === 'chicago' ? `${who} ${yr}` : `${who}, ${yr}`;
  }).join('; ') + ')';
}
// {c:1,2} u tekstu primera postaje citat u izabranom stilu (redni brojevi izvora)
export const withCites = str => String(str).replace(/\{c:([\d,]+)\}/g, (_, l) => cite(l.split(',').map(n => (CTX.sources || SAMPLE_SOURCES)[+n - 1]).filter(Boolean).map(s => s.key)));
export const refGuide = () => `Navedite tri do pet ključnih izvora u stilu ${CITE_STYLES[S.opts.cite || 'ieee']}. ` + (S.opts.cite === 'ieee' || !S.opts.cite
  ? 'U tekstu ih označite brojem u uglastim zagradama, redom kojim se prvi put pojavljuju, npr. [1].'
  : `U tekstu navedite prezime autora i godinu, npr. ${cite([CTX.listed[0] || 's1'])}, a spisak poređajte abecedno po prezimenu.`);
