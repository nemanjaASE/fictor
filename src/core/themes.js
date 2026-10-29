// Gotove teme, polja za boje i stilovi rasporeda.

/* ---------- teme ---------- */
// Jedna glavna boja i neutralni tonovi; akcenat je prigušen i koristi se za jedan detalj.
// Fontovi su samo oni koje PowerPoint i Word prikazuju bez instalacije (Windows, Office ili Office ih sam preuzima):
// font koji nedostaje Office menja drugim, pa se tekst ponavlja na prelomu reda, a kod gubi poravnanje.
export const PRESETS = {
  akademski: { name: 'Univerzitet', note: 'univerzitetska klasika, serifni naslovi', colors: { primary: '#1B365D', accent: '#9E2A2B', text: '#1A1A1A', muted: '#5E5E5E', bg: '#FFFFFF', surface: '#F2F3F4' }, fonts: { heading: 'Source Serif Pro', body: 'Source Sans Pro', mono: 'Source Code Pro' }, style: 'akademski', corners: 'sharp', set: 'moderan' },
  skriljac: { name: 'Škriljac', note: 'naučne konferencije, mirna tamnozelena', colors: { primary: '#23373B', accent: '#C9741F', text: '#23373B', muted: '#65767A', bg: '#FAFAFA', surface: '#EDF0F0' }, fonts: { heading: 'Fira Sans', body: 'Fira Sans', mono: 'Fira Code' }, style: 'akademski', corners: 'sharp', set: 'moderan' },
  konsalting: { name: 'Konsalting', note: 'poslovni izveštaji i odbrane projekata', colors: { primary: '#0B2545', accent: '#3E7CB1', text: '#1C1C1C', muted: '#666B73', bg: '#FFFFFF', surface: '#F2F4F7' }, fonts: { heading: 'IBM Plex Sans', body: 'IBM Plex Sans', mono: 'IBM Plex Mono' }, style: 'korporativni', corners: 'sharp', set: 'moderan' },
  casopis: { name: 'Časopis', note: 'uređivački izgled, mnogo belog prostora', colors: { primary: '#5E1F2C', accent: '#7A6A58', text: '#1E1C1A', muted: '#6B6560', bg: '#FFFFFF', surface: '#F3F2F0' }, fonts: { heading: 'Source Serif Pro', body: 'Source Sans Pro', mono: 'Source Code Pro' }, style: 'minimalni', corners: 'sharp', set: 'moderan' },
  noc: { name: 'Noć', note: 'tamna tema za tehnička predavanja', colors: { primary: '#9DB8D9', accent: '#C8A97E', text: '#E6E4E0', muted: '#A09D98', bg: '#141619', surface: '#1E2125' }, fonts: { heading: 'IBM Plex Sans', body: 'IBM Plex Sans', mono: 'IBM Plex Mono' }, style: 'minimalni', corners: 'sharp', set: 'tamni' },
  inzenjerstvo: { name: 'Inženjerstvo', note: 'tehnika, elektrotehnika, mašinstvo i građevina', colors: { primary: '#0F4C8A', accent: '#2BA6DE', text: '#121A23', muted: '#526273', bg: '#FFFFFF', surface: '#EEF3F8' }, fonts: { heading: 'Roboto', body: 'Roboto', mono: 'Consolas' }, style: 'korporativni', corners: 'sharp', set: 'moderan' },
  medicina: { name: 'Medicina', note: 'medicina, biologija i farmacija', colors: { primary: '#0E5A66', accent: '#B5533C', text: '#16242A', muted: '#526870', bg: '#FFFFFF', surface: '#EDF4F5' }, fonts: { heading: 'Noto Sans', body: 'Noto Sans', mono: 'Source Code Pro' }, style: 'korporativni', corners: 'round', set: 'meki' },
  pravo: { name: 'Pravo', note: 'pravo, istorija i filozofija', colors: { primary: '#1F3A2E', accent: '#8C6D24', text: '#1B1E1C', muted: '#585F5A', bg: '#FCFBF7', surface: '#F0EEE6' }, fonts: { heading: 'PT Serif', body: 'Source Sans Pro', mono: 'Source Code Pro' }, style: 'akademski', corners: 'sharp', set: 'akademski' },
  ekonomija: { name: 'Ekonomija', note: 'ekonomija, finansije i menadžment', colors: { primary: '#123A57', accent: '#2C7A55', text: '#191F25', muted: '#56606B', bg: '#FFFFFF', surface: '#EFF3F6' }, fonts: { heading: 'Aptos', body: 'Aptos', mono: 'Consolas' }, style: 'korporativni', corners: 'sharp', set: 'moderan' },
  projektor: { name: 'Projektor', note: 'jak kontrast za slabe projektore i velike sale', colors: { primary: '#0A3A8C', accent: '#B8860B', text: '#000000', muted: '#3A3A3A', bg: '#FFFFFF', surface: '#ECECEC' }, fonts: { heading: 'Segoe UI', body: 'Segoe UI', mono: 'Consolas' }, style: 'minimalni', corners: 'sharp', set: 'moderan' },
  univerzalni: { name: 'Univerzalni', note: 'radi na svakom Windows računaru bez instalacije', colors: { primary: '#1F3B5C', accent: '#5B7FA6', text: '#1F1F1F', muted: '#606366', bg: '#FFFFFF', surface: '#F2F3F5' }, fonts: { heading: 'Segoe UI', body: 'Segoe UI', mono: 'Consolas' }, style: 'korporativni', corners: 'sharp', set: 'moderan' },
};
// sekcije u kartici Izgled: opšte teme, teme za oblast studija i teme za posebne uslove prikazivanja
export const GROUPS = [
  ['opste', ['akademski', 'casopis', 'skriljac', 'konsalting']],
  ['oblast', ['inzenjerstvo', 'medicina', 'pravo', 'ekonomija']],
  ['uslovi', ['noc', 'projektor', 'univerzalni']],
];
export const COLOR_FIELDS = [
  ['primary', 'Primarna', 'naslovi, trake, istaknute vrednosti'],
  ['accent', 'Akcenat', 'retko: jedna linija ili detalj'],
  ['text', 'Tekst', 'osnovni tekst'],
  ['muted', 'Sporedni tekst', 'podnaslovi, opisi, podnožje'],
  ['bg', 'Pozadina', 'pozadina slajda'],
  ['surface', 'Površina', 'kod, okviri, napomene'],
];
// stil rasporeda; id „akademski“ je zadržan zbog sačuvanih tema, a u aplikaciji se zove „Traka“ (naslov u traci u boji)
export const STYLES = [['minimalni', 'Minimalni'], ['akademski', 'Traka'], ['korporativni', 'Korporativni']];
