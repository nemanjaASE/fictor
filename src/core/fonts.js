// Fontovi koje generator nudi i odakle dolaze.

/* ---------- fontovi ---------- */
// svi fontovi imaju i ćirilicu. src: w = ugrađen u Windows, o = dolazi uz Office,
// c = Google font iz Office-ovog kataloga: Microsoft 365 ga sam preuzme čim ga dokument traži,
// g = Google font koji treba instalirati na računar na kom se prikazuje.
// Ime mora tačno da odgovara katalogu: Office zna „Source Sans Pro“, a noviji naziv „Source Sans 3“ ne zna.
export const FONTS = {
  // pregled koristi Source Serif 4 i Source Sans 3 sa Google Fonts: isti dizajn pod novim imenom
  'Source Serif Pro': { css: "'Source Serif Pro', 'Source Serif 4', Georgia, serif", src: 'c' },
  'Source Sans Pro': { css: "'Source Sans Pro', 'Source Sans 3', 'Segoe UI', sans-serif", src: 'c' },
  'IBM Plex Sans': { css: "'IBM Plex Sans', 'Segoe UI', sans-serif", src: 'c' },
  'IBM Plex Serif': { css: "'IBM Plex Serif', Georgia, serif", src: 'c' },
  'Fira Sans': { css: "'Fira Sans', 'Segoe UI', sans-serif", src: 'c' },
  'PT Serif': { css: "'PT Serif', Georgia, serif", src: 'c' },
  'Noto Sans': { css: "'Noto Sans', 'Segoe UI', sans-serif", src: 'c' },
  'Lora': { css: "'Lora', Georgia, serif", src: 'c' },
  'Roboto': { css: "'Roboto', 'Segoe UI', sans-serif", src: 'c' },
  'Source Serif 4': { css: "'Source Serif 4', Georgia, serif", src: 'g' },
  'Source Sans 3': { css: "'Source Sans 3', 'Segoe UI', sans-serif", src: 'g' },
  'Literata': { css: "'Literata', Georgia, serif", src: 'g' },
  'Inter': { css: "'Inter', system-ui, sans-serif", src: 'g' },
  'Segoe UI': { css: "'Segoe UI', system-ui, sans-serif", src: 'w' },
  'Aptos': { css: "Aptos, 'Segoe UI', system-ui, sans-serif", src: 'o' },
  'Calibri': { css: "Calibri, Carlito, 'Segoe UI', sans-serif", src: 'o' },
  'Cambria': { css: "Cambria, Caladea, Georgia, serif", src: 'o' },
  'Georgia': { css: "Georgia, 'Times New Roman', serif", src: 'w' },
  'Times New Roman': { css: "'Times New Roman', Times, serif", src: 'w' },
};
export const MONO = {
  'Source Code Pro': { css: "'Source Code Pro', Consolas, monospace", src: 'c' },
  'IBM Plex Mono': { css: "'IBM Plex Mono', Consolas, monospace", src: 'c' },
  'Fira Code': { css: "'Fira Code', Consolas, monospace", src: 'c' },
  'JetBrains Mono': { css: "'JetBrains Mono', Consolas, monospace", src: 'g' },
  'Consolas': { css: "Consolas, 'Cascadia Mono', monospace", src: 'w' },
  'Cascadia Code': { css: "'Cascadia Code', Consolas, monospace", src: 'w' },
};
export const SRC = { c: 'Office (Microsoft 365) ga preuzima sam', g: 'Google Fonts · instaliraj pre prikazivanja', w: 'Ugrađen u Windows', o: 'Dolazi uz Microsoft Office' };
export const fcss = name => (FONTS[name] || MONO[name] || { css: `'${name}', sans-serif` }).css;
