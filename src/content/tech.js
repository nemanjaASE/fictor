// Ubrzani kursevi o tehnologijama: primer sadržaja (Markdown u tech/*.md), podaci za naslovni slajd i izgled.
// Svaki kurs ide istim redom: šta je tehnologija, pet osnova, mali program iz serije „ocene“, podsetnik, zadatak.
// Nova tehnologija: dodaj .md fajl, unos ovde i znak u graphics/marks.js. Boje su inspirisane tehnologijom.
// Znak tehnologije je na dugmetu u aplikaciji, na naslovnom slajdu i u podnožju slajdova.
// cmd: komanda iz predavanja, na naslovnom slajdu iznad naslova (kao u terminalu).
// look.code, look.term i look.shape: izgled koda, boje i oblik terminala uz boje tehnologije; look.accentRule: crtica u boji akcenta
// na naslovnom slajdu (za akcenat koji je preslab za tekst, kao Python žuta).
// Kod je uvek u fontu Consolas (ima ga svaki Windows i Office za Mac): kada font za kod nedostaje, PowerPoint
// ga menja proporcionalnim fontom i uvlačenje se raspada. Naslovi i tekst su u Windows fontovima ili u fontovima
// koje Microsoft 365 sam preuzima (Fira Sans, Roboto, IBM Plex Sans).
import docker from './tech/docker.md?raw';
import git from './tech/git.md?raw';
import javascript from './tech/javascript.md?raw';
import python from './tech/python.md?raw';
import rust from './tech/rust.md?raw';
import sql from './tech/sql.md?raw';
import { courseTemplate, customMeta } from './template.js';

export const TECH = {
  python: {
    name: 'Python', md: python, cmd: 'python3 ocene.py',
    meta: { title: 'Python: ubrzani kurs', subtitle: 'Od prvog programa do funkcija, listi i testova', course: 'Programiranje u Pythonu' },
    next: 'Sledeći korak: klase, moduli i rad sa fajlovima',
    look: { colors: { primary: '#306998', accent: '#FFD43B', text: '#0B1220', muted: '#5B6474', bg: '#FFFFFF', surface: '#F5F7FA' }, fonts: { heading: 'Segoe UI', body: 'Segoe UI', mono: 'Consolas' }, style: 'minimalni', corners: 'round',
      code: 'tamni', term: 'onedark', shape: 'moderan', accentRule: true },
  },
  rust: {
    name: 'Rust', md: rust, cmd: 'cargo run',
    meta: { title: 'Rust: ubrzani kurs', subtitle: 'Od prvog programa do vlasništva, grešaka i testova', course: 'Sistemsko programiranje' },
    next: 'Sledeći korak: strukture, enum i trait',
    look: { colors: { primary: '#2C2724', accent: '#B7410E', text: '#1E1A17', muted: '#655B53', bg: '#FBF8F3', surface: '#F1EBE2' }, fonts: { heading: 'Fira Sans', body: 'Fira Sans', mono: 'Consolas' }, style: 'minimalni', corners: 'sharp' },
  },
  docker: {
    name: 'Docker', md: docker, cmd: 'docker compose up',
    meta: { title: 'Docker: ubrzani kurs', subtitle: 'Od prvog kontejnera do slike i Docker Compose-a', course: 'Razvoj i isporuka softvera' },
    next: 'Sledeći korak: CI/CD i automatska izrada slika',
    look: { colors: { primary: '#0C3B85', accent: '#2496ED', text: '#16202E', muted: '#566375', bg: '#FFFFFF', surface: '#EEF3FA' }, fonts: { heading: 'Roboto', body: 'Roboto', mono: 'Consolas' }, style: 'korporativni', corners: 'round' },
  },
  git: {
    name: 'Git', md: git, cmd: 'git switch -c prazna-lista',
    meta: { title: 'Git: ubrzani kurs', subtitle: 'Od prvog commit-a do grana i pull request-a', course: 'Softversko inženjerstvo' },
    next: 'Sledeći korak: GitHub Actions i automatski testovi',
    look: { colors: { primary: '#24292F', accent: '#E8553D', text: '#1F2328', muted: '#59636E', bg: '#FFFFFF', surface: '#F6F8FA' }, fonts: { heading: 'IBM Plex Sans', body: 'IBM Plex Sans', mono: 'Consolas' }, style: 'minimalni', corners: 'sharp' },
  },
  javascript: {
    name: 'JavaScript', md: javascript, cmd: 'node ocene.js',
    meta: { title: 'JavaScript: ubrzani kurs', subtitle: 'Od prvog programa do modula, await i testova', course: 'Veb programiranje' },
    next: 'Sledeći korak: DOM, fetch i rad sa JSON-om',
    look: { colors: { primary: '#F0DB4F', accent: '#6CB4EE', text: '#E7E5DF', muted: '#A3A19B', bg: '#1B1B1D', surface: '#26262A' }, fonts: { heading: 'Segoe UI', body: 'Segoe UI', mono: 'Consolas' }, style: 'minimalni', corners: 'round' },
  },
  sql: {
    name: 'SQL', md: sql, cmd: 'psql -d fakultet',
    meta: { title: 'SQL: ubrzani kurs', subtitle: 'Od prve tabele do spojeva, grupisanja i indeksa', course: 'Baze podataka' },
    next: 'Sledeći korak: transakcije i nivoi izolacije',
    look: { colors: { primary: '#25577F', accent: '#C47A2C', text: '#1C2126', muted: '#5A636D', bg: '#FFFFFF', surface: '#F2F4F6' }, fonts: { heading: 'Georgia', body: 'Segoe UI', mono: 'Consolas' }, style: 'akademski', corners: 'sharp' },
  },
};
export const TECH_IDS = Object.keys(TECH);

/* ---------- jezik koji korisnik unese sam ---------- */
// naziv, znak iz Simple Icons i komanda; sadržaj je obrazac ubrzanog kursa
export const CUSTOM = 'custom';
// ime znaka kao u Simple Icons: „C#“ → csharp, „C++“ → cplusplus, „Node.js“ → nodedotjs
const SLUG = { '+': 'plus', '.': 'dot', '&': 'and', '#': 'sharp', 'đ': 'd', 'ß': 'ss', 'ł': 'l', 'ħ': 'h', 'ı': 'i' };
export const slugOf = name => String(name || '').toLowerCase().replace(/[+.&#đßłħı]/g, ch => SLUG[ch])
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
// putanja znaka se upisuje u SVG, pa sme da sadrži samo komande i brojeve putanje
export const isMarkPath = d => typeof d === 'string' && d.length <= 30000 && /^[Mm][MmLlHhVvCcSsQqTtAaZz0-9.,\s-]*$/.test(d);
// izabrana tehnologija: gotov kurs ili jezik koji je korisnik uneo
export function activeTech(s) {
  if (s.tech !== CUSTOM) return TECH[s.tech] || null;
  const c = s.custom || {}, name = String(c.name || '').trim() || 'Jezik';
  return { name, md: courseTemplate(name, slugOf(name) || 'kod', c.cmd), cmd: c.cmd || '', meta: customMeta(name), next: 'Sledeći korak: teme iz zvanične dokumentacije', custom: true };
}
