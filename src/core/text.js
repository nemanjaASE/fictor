// Ćirilica i srpska tipografija; T() prolazi kroz sav tekst koji ide u fajlove.
import { S } from './state.js';

/* ---------- ćirilica ---------- */
export const CYR = { A: 'А', B: 'Б', V: 'В', G: 'Г', D: 'Д', Đ: 'Ђ', E: 'Е', Ž: 'Ж', Z: 'З', I: 'И', J: 'Ј', K: 'К', L: 'Л', M: 'М', N: 'Н', O: 'О', P: 'П', R: 'Р', S: 'С', T: 'Т', Ć: 'Ћ', U: 'У', F: 'Ф', H: 'Х', C: 'Ц', Č: 'Ч', Š: 'Ш' };
export const DIG = { 'Dž': 'Џ', 'DŽ': 'Џ', 'dž': 'џ', 'Lj': 'Љ', 'LJ': 'Љ', 'lj': 'љ', 'Nj': 'Њ', 'NJ': 'Њ', 'nj': 'њ' };
export function toCyr(s) {
  return s.replace(/D[žŽ]|L[jJ]|N[jJ]|dž|lj|nj|[A-Za-zĐđŽžĆćČčŠš]/g, m => {
    if (DIG[m]) return DIG[m];
    const up = m.toUpperCase(), c = CYR[up];
    if (!c) return m;
    return m === up ? c : c.toLowerCase();
  });
}
// srpska tipografija: navodnici „ “, crta u rasponima i između reči, tri tačke, tvrdi razmak pre jedinica
export const UNITS = '%|‰|°C|GB|MB|KB|TB|GHz|MHz|ms|ns|min|km|kg|mm|cm|m|g|s|h';
export const UNIT_RE = new RegExp(`(\\d) (${UNITS})(?![\\p{L}\\d])`, 'gu');
export function typo(s) {
  return s
    .replace(/"([^"\n]*)"/g, '„$1“')
    .replace(/(^|[^\d.\-/])(\d{1,4}) ?- ?(\d{1,4})(?![\d\-/]|[.,]\d)/g, '$1$2–$3')
    .replace(/ - /g, ' – ')
    .replace(/\.\.\./g, '…')
    .replace(UNIT_RE, '$1 $2');
}
export const T = s => { let r = String(s ?? ''); if (S.opts.typo) r = typo(r); return S.opts.script === 'cyr' ? toCyr(r) : r; };
export const up = s => s.toLocaleUpperCase('sr');
// ime fajla: bez dijakritika i razmaka, mala slova (ćirilica ostaje); deli ga izvoz sa ostatkom aplikacije
export const slug = s => (T(s) || 'sablon').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'dj').replace(/[^\wЀ-ӿ]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 60) || 'sablon';
