// Stanje aplikacije: podrazumevane vrednosti, provera učitanih podataka i čuvanje u pregledaču.
import { FONTS, MONO } from './fonts.js';
import { PRESETS, STYLES } from './themes.js';
import { CUSTOM, TECH_IDS, isMarkPath } from '../content/tech.js';
import { CODE_IDS, TERM_IDS, TERM_SHAPES } from '../graphics/code-styles.js';
import { CHART_STYLES, LIST_STYLES, OLD_CHART, OLD_QUOTE, OLD_STAT, OLD_TABLE, QUOTE_STYLES, STAT_STYLES, TABLE_STYLES } from '../graphics/data-styles.js';
import { isHex, normHex } from '../lib/color.js';

/* ---------- stanje ---------- */
export const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
export const today = () => { const d = new Date(); return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`; };
export function defaults() {
  const p = PRESETS.akademski;
  return {
    doc: 'slides', deck: 'izlaganje', tech: '', techLook: false, custom: { name: '', mark: '', cmd: '' }, poster: { size: 'A0', orient: 'land' },
    content: { slides: '', poster: '', koncept: '', seminarski: '', izvestaj: '' }, bib: '', editing: false, editTab: 'md', preset: 'akademski', density: 'grid', faculty: '#0E4C92', fromFaculty: false,
    colors: { ...p.colors }, fonts: { ...p.fonts }, style: p.style, corners: p.corners, ratio: '16:9',
    meta: {
      title: 'Optimizacija upita u grafovskim bazama podataka', subtitle: 'Adaptivni izbor plana izvršavanja',
      docTypes: { koncept: 'Koncept seminarskog rada', seminarski: 'Seminarski rad', izvestaj: 'Izveštaj sa laboratorijske vežbe' }, author: 'Ime Prezime', index: 'IN 12/2023',
      institution: 'Naziv fakulteta, Univerzitet', course: 'Napredne baze podataka',
      mentor: 'prof. dr Ime Prezime', date: today(), email: 'ime.prezime@fakultet.rs', footer: '',
      // odbrana rada: vrsta rada na naslovnom slajdu, članovi komisije (jedan u redu) i vreme za izlaganje u minutima
      workType: 'Master rad', committee: 'prof. dr Ime Prezime\ndoc. dr Ime Prezime', minutes: '15',
      finding: 'Adaptivni izbor plana čini upite nad grafovima *3,4 puta bržim*, bez gubitka tačnosti.', link: 'https://example.org/moj-rad',
    },
    logo: null,
    opts: { script: 'lat', samples: true, numbers: true, guides: true, pravilnik: false, typo: true, cite: 'ieee', chartPal: 'tema', codeStyle: 'tema', termStyle: 'kod', termShape: 'obican', accentRule: false, tableStyle: 'moderna', chartStyle: 'moderan', listStyle: 'kvadratici', quoteStyle: 'centrirano', statStyle: 'krupni' },
  };
}
// OLD_KEY: isti format, sačuvan dok se aplikacija zvala Šablonar
export const KEY = 'fictor:v1', OLD_KEY = 'sablonar:v2';
export const CITE_IDS = ['ieee', 'apa', 'harvard', 'chicago'];
export const STYLE_ALIAS = { linija: 'minimalni', panel: 'akademski', blok: 'korporativni' };
export function sanitize(src, base) {
  const s = base;
  if (!src || typeof src !== 'object') return s;
  if (['slides', 'poster', 'koncept', 'seminarski', 'izvestaj'].includes(src.doc)) s.doc = src.doc;
  if (src.content && typeof src.content === 'object') for (const k of Object.keys(s.content)) if (typeof src.content[k] === 'string') s.content[k] = src.content[k].slice(0, 200000);
  if (typeof src.bib === 'string') s.bib = src.bib.slice(0, 200000);
  if (typeof src.editing === 'boolean') s.editing = src.editing;
  if (['md', 'bib'].includes(src.editTab)) s.editTab = src.editTab;
  if (src.poster && typeof src.poster === 'object') {
    if (['A0', 'A1'].includes(src.poster.size)) s.poster.size = src.poster.size;
    if (['land', 'port'].includes(src.poster.orient)) s.poster.orient = src.poster.orient;
  }
  if (['izlaganje', 'predavanje', 'odbrana'].includes(src.deck)) s.deck = src.deck;
  if (src.tech === '' || src.tech === CUSTOM || TECH_IDS.includes(src.tech)) s.tech = src.tech;
  if (typeof src.techLook === 'boolean') s.techLook = src.techLook && TECH_IDS.includes(s.tech);
  if (src.custom && typeof src.custom === 'object') {
    if (typeof src.custom.name === 'string') s.custom.name = src.custom.name.slice(0, 40);
    if (typeof src.custom.cmd === 'string') s.custom.cmd = src.custom.cmd.slice(0, 80);
    if (isMarkPath(src.custom.mark)) s.custom.mark = src.custom.mark;
  }
  // tehnologija je primer predavanja i ne postoji uz izlaganje ili odbranu
  if (s.deck !== 'predavanje') { s.tech = ''; s.techLook = false; }
  if (isHex(src.faculty)) s.faculty = normHex(src.faculty);
  if (typeof src.fromFaculty === 'boolean') s.fromFaculty = src.fromFaculty;
  if (['grid', 'big'].includes(src.density)) s.density = src.density;
  if (src.preset in PRESETS) s.preset = src.preset; else if (src.preset === null || src.colors) s.preset = null;
  if (src.colors) for (const k of Object.keys(s.colors)) if (isHex(src.colors[k])) s.colors[k] = normHex(src.colors[k]);
  if (src.fonts) {
    if (FONTS[src.fonts.heading]) s.fonts.heading = src.fonts.heading;
    if (FONTS[src.fonts.body]) s.fonts.body = src.fonts.body;
    if (MONO[src.fonts.mono]) s.fonts.mono = src.fonts.mono;
  }
  // gotova tema uvek ima svoje trenutne fontove; sačuvano stanje može imati one koje je tema ranije koristila
  if (s.preset) s.fonts = { ...PRESETS[s.preset].fonts };
  const sty = STYLE_ALIAS[src.style] || src.style;
  if (STYLES.some(([k]) => k === sty)) s.style = sty;
  if (['sharp', 'round'].includes(src.corners)) s.corners = src.corners;
  if (['16:9', '4:3'].includes(src.ratio)) s.ratio = src.ratio;
  if (src.meta) {
    for (const k of Object.keys(s.meta)) if (typeof src.meta[k] === 'string') s.meta[k] = src.meta[k].slice(0, 300);
    const dt = src.meta.docTypes;
    if (dt && typeof dt === 'object') for (const k of Object.keys(s.meta.docTypes)) if (typeof dt[k] === 'string') s.meta.docTypes[k] = dt[k].slice(0, 200);
    if (typeof src.meta.docType === 'string') s.meta.docTypes.koncept = src.meta.docType.slice(0, 200);
  }
  if (src.logo && typeof src.logo.data === 'string' && src.logo.data.startsWith('data:image/png') && src.logo.ar > 0) s.logo = { data: src.logo.data, ar: +src.logo.ar };
  if (src.opts) {
    if (['lat', 'cyr'].includes(src.opts.script)) s.opts.script = src.opts.script;
    if (CITE_IDS.includes(src.opts.cite)) s.opts.cite = src.opts.cite;
    if (['tema', 'okabe', 'nijanse'].includes(src.opts.chartPal)) s.opts.chartPal = src.opts.chartPal;
    if (CODE_IDS.includes(src.opts.codeStyle)) s.opts.codeStyle = src.opts.codeStyle;
    if (TERM_IDS.includes(src.opts.termStyle)) s.opts.termStyle = src.opts.termStyle;
    // ranija „traka prozora“ (tri tačke) postaje panel kao u VS Code-u
    if (TERM_SHAPES.includes(src.opts.termShape)) s.opts.termShape = src.opts.termShape; else if (src.opts.termBar === true) s.opts.termShape = 'vscode';
    const ts = OLD_TABLE[src.opts.tableStyle] || src.opts.tableStyle;
    if (TABLE_STYLES.includes(ts)) s.opts.tableStyle = ts;
    const cs = OLD_CHART[src.opts.chartStyle] || src.opts.chartStyle;
    if (CHART_STYLES.includes(cs)) s.opts.chartStyle = cs;
    if (LIST_STYLES.includes(src.opts.listStyle)) s.opts.listStyle = src.opts.listStyle;
    const qs = OLD_QUOTE[src.opts.quoteStyle] || src.opts.quoteStyle;
    if (QUOTE_STYLES.includes(qs)) s.opts.quoteStyle = qs;
    const ss = OLD_STAT[src.opts.statStyle] || src.opts.statStyle;
    if (STAT_STYLES.includes(ss)) s.opts.statStyle = ss;
    for (const k of ['samples', 'numbers', 'guides', 'pravilnik', 'typo', 'accentRule']) if (typeof src.opts[k] === 'boolean') s.opts[k] = src.opts[k];
  }
  return s;
}
export let S = defaults();
// zamena celog stanja (npr. posle učitavanja teme); uvoznici vide novu vrednost
export function setState(next) { S = next; }
try {
  const raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY);
  if (raw) S = sanitize(JSON.parse(raw), defaults());
} catch (e) { /* bez lokalnog skladišta */ }
export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { try { localStorage.setItem(KEY, JSON.stringify({ ...S, logo: null })); } catch (e2) { /* ignoriši */ } }
}
