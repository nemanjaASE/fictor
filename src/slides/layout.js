// Geometrija i paleta slajdova; rasporedi (slide master) za tri stila.
import { estLines } from '../content/markdown.js';
import { activeTech } from '../content/tech.js';
import { fcss } from '../core/fonts.js';
import { S } from '../core/state.js';
import { T } from '../core/text.js';
import { codePalette, termPalette } from '../graphics/code-styles.js';
import { hasMark, markImage } from '../graphics/marks.js';
import { contrast, ensure, lum, mix, onColor } from '../lib/color.js';

/* ---------- geometrija i paleta slajdova ---------- */
export const DPI = 96;
export const G = () => (S.ratio === '4:3' ? { W: 10, H: 7.5, M: 0.6 } : { W: 13.333, H: 7.5, M: 0.75 });
export function P() {
  const c = S.colors, dark = lum(c.bg) < 0.3, onP = onColor(c.primary), cs = codePalette(S.opts.codeStyle);
  // kod na mirnoj površini, prigušene boje sintakse (ili paleta izabranog editora)
  const code = cs ? cs.bg : c.surface;
  const syn = cs ? { base: cs.base, kw: cs.kw, str: cs.str, fn: cs.fn, com: cs.com } : {
    base: c.text,
    kw: ensure(dark ? mix(c.primary, '#FFFFFF', 0.15) : c.primary, code, 4.5),
    str: ensure(mix(c.accent, c.text, 0.3), code, 4.5),
    fn: ensure(mix(c.primary, c.text, 0.45), code, 4.5),
    com: ensure(c.muted, code, 3.5),
  };
  // terminal: izabrana šema ili isti izgled kao kod
  const term = termPalette(S.opts.termStyle) || { bg: code, syn };
  return {
    ...c, dark, code, syn, term, onP,
    soft: mix(onP, c.primary, 0.3),
    hair: mix(c.text, c.bg, 0.82),
    pText: ensure(c.primary, c.bg, 4.5),
    aText: ensure(c.accent, c.bg, 3),
  };
}
export const LN = { NASLOVNI: 'Naslovni slajd', SEKCIJA: 'Sekcija', SADRZAJ: 'Naslov i sadržaj', KOLONE: 'Dve kolone', SLIKA: 'Slika i tekst', NASLOV: 'Samo naslov', IZJAVA: 'Izjava', KRAJ: 'Završni slajd' };
export const ORDER = ['NASLOVNI', 'SEKCIJA', 'SADRZAJ', 'KOLONE', 'SLIKA', 'NASLOV', 'IZJAVA', 'KRAJ'];

export const st = (font, size, color, more = {}) => ({ font, size, color, ...more });
export const R = (x, y, w, h, fill, r = 0) => ({ k: 'rect', x, y, w, h, fill, r });
export const Ln = (x, y, w, color, width = 0.75) => ({ k: 'line', x, y, w, h: 0, color, width });
export const Tx = (x, y, w, h, paras, s) => ({ k: 'text', x, y, w, h, paras, st: s });
export const Img = (x, y, w, h, data, alt = '') => ({ k: 'image', x, y, w, h, data, alt });
export const ph = (name, type, x, y, w, h, s, prompt) => ({ name, type, x, y, w, h, st: s, prompt });
// broj redova teksta u polju širine wIn: u pregledaču merenjem pravog fonta, inače (testovi) procenom po broju slova
let measure;
export function textLines(text, font, size, bold, wIn) {
  if (typeof document === 'undefined') return estLines(text, wIn * 0.95, size);
  measure = measure || document.createElement('canvas').getContext('2d');
  measure.font = `${bold ? 700 : 400} ${size}px ${fcss(font)}`;
  // malo uže od polja: reč koja jedva staje u pregledu u PowerPoint-u može da pređe u novi red
  const max = wIn * 72 * 0.985; let lines = 1, cur = '';
  for (const w of String(text).split(/\s+/).filter(Boolean)) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && measure.measureText(next).width > max) { lines++; cur = w; } else cur = next;
  }
  return lines;
}
export function fitBox(box, ar, align) {
  let w = box.w, h = box.w / ar;
  if (h > box.h) { h = box.h; w = h * ar; }
  const x = align === 'right' ? box.x + box.w - w : align === 'center' ? box.x + (box.w - w) / 2 : box.x;
  return { x, y: box.y + (box.h - h) / 2, w, h };
}

/* Rasporedi (slide master): isti opis crta pregled i pravi .pptx.
   minimalni    – bez traka i ukrasa, tanke linije, mnogo belog prostora
   akademski    – (u aplikaciji „Traka“) traka sa naslovom, linija napretka na sekcijama
   korporativni – oznaka celine iznad naslova-rečenice, naslovna u boji */
export function layouts() {
  const { W, H, M } = G(), p = P(), hf = S.fonts.heading, bf = S.fonts.body, mf = S.fonts.mono, sty = S.style;
  const foot = T(S.meta.footer || [S.meta.institution, S.meta.course].filter(Boolean).join('  ·  '));
  const bodySt = st(bf, 20, p.text, { spacing: 1.1, list: true });
  const eyebrow = color => st(bf, 11, color, { bold: true, cs: 1.5 });
  // opis za čitače ekrana: logotip ustanove i znak tehnologije
  const logoAlt = T('Logotip' + (S.meta.institution ? ': ' + S.meta.institution : ''));
  const logo = (o, box, align) => { if (S.logo) { const f = fitBox(box, S.logo.ar, align); o.push(Img(f.x, f.y, f.w, f.h, S.logo.data, logoAlt)); } };
  const numSlot = color => ({ x: W - M - 0.8, y: H - 0.5, w: 0.8, h: 0.3, st: st(bf, 10, color, { align: 'right', valign: 'middle' }) });
  // predavanje o tehnologiji: znak tehnologije u podnožju i na naslovnom slajdu, komanda iznad naslova
  const at = activeTech(S), tech = at && hasMark(S.tech) ? S.tech : null, command = at && at.cmd;
  // podnožje od x0 (na slajdu „Izjava“ sa obojenom levom trećinom počinje desno od nje)
  const footer = (o, color, line, x0 = M) => {
    if (line) o.push(Ln(x0, H - 0.62, W - M - x0, p.hair, 0.5));
    const mk = tech ? 0.17 : 0;
    if (tech) o.push(Img(x0, H - 0.35 - mk / 2, mk, mk, markImage(tech, color), at.name));
    if (foot) o.push(Tx(x0 + (mk && mk + 0.1), H - 0.5, Math.min(W * 0.6, W - M - x0 - 1), 0.3, [foot], st(bf, 9, color, { valign: 'middle' })));
  };
  const lw = S.logo ? 1.9 : 0, L = {};

  const head = () => {
    const o = [], extra = []; let title, top;
    if (sty === 'akademski') {
      o.push(R(0, 0, W, 1.0, p.primary));
      title = ph('title', 'title', M, 0.08, W - 2 * M, 0.84, st(hf, 24, p.onP, { valign: 'middle' }), 'Naslov slajda');
      top = 1.45;
      footer(o, p.muted, false);
      logo(o, { x: W - M - 2.5, y: H - 0.62, w: 1.5, h: 0.45 }, 'right');
    } else if (sty === 'korporativni') {
      extra.push(ph('oznaka', 'body', M, 0.4, W - 2 * M - lw, 0.3, eyebrow(p.muted), 'CELINA'));
      title = ph('title', 'title', M, 0.7, W - 2 * M - lw, 0.95, st(hf, 24, p.pText, { bold: true, valign: 'top', spacing: 0.95 }), 'Naslov kao rečenica sa zaključkom');
      o.push(Ln(M, 1.74, W - 2 * M, p.hair, 0.75));
      top = 1.98;
      footer(o, p.muted, true);
      logo(o, { x: W - M - 1.6, y: 0.4, w: 1.6, h: 0.6 }, 'right');
    } else {
      title = ph('title', 'title', M, 0.55, W - 2 * M - lw, 1.0, st(hf, 28, p.text, { bold: true, valign: 'top', spacing: 0.95 }), 'Naslov slajda');
      top = 1.85;
      footer(o, p.muted, true);
      logo(o, { x: W - M - 1.6, y: 0.55, w: 1.6, h: 0.6 }, 'right');
    }
    return { o, title, top, extra };
  };
  const content = (id, phs) => {
    const h = head(), box = { x: M, y: h.top, w: W - 2 * M, h: H - 0.85 - h.top };
    return { id, bg: p.bg, objects: h.o, ph: [h.title, ...h.extra, ...phs(box, h.o)], num: numSlot(p.muted), box };
  };
  L.SADRZAJ = content('SADRZAJ', b => [ph('telo', 'body', b.x, b.y, b.w, b.h, bodySt, 'Tekst slajda')]);
  L.KOLONE = content('KOLONE', (b, o) => {
    const g = 0.6, w = (b.w - g) / 2, x2 = b.x + w + g, hs = st(hf, 18, p.pText, { bold: true, valign: 'top' });
    o.push(Ln(b.x, b.y + 0.5, w, p.hair, 0.75), Ln(x2, b.y + 0.5, w, p.hair, 0.75));
    return [ph('levo-naslov', 'body', b.x, b.y, w, 0.42, hs, 'Naslov kolone'), ph('levo', 'body', b.x, b.y + 0.7, w, b.h - 0.7, bodySt, 'Leva kolona'),
      ph('desno-naslov', 'body', x2, b.y, w, 0.42, hs, 'Naslov kolone'), ph('desno', 'body', x2, b.y + 0.7, w, b.h - 0.7, bodySt, 'Desna kolona')];
  });
  L.SLIKA = content('SLIKA', b => { const g = 0.55, w = b.w * 0.56; return [ph('slika', 'pic', b.x, b.y, w, b.h, st(bf, 14, p.muted), 'Slika'), ph('opis', 'body', b.x + w + g, b.y, b.w - w - g, b.h, st(bf, 18, p.text, { spacing: 1.1 }), 'Opis slike')]; });
  L.NASLOV = content('NASLOV', () => []);

  // naslovni i završni slajd
  const hero = (id, closing) => {
    const o = [], phs = []; let bg = p.bg;
    const tTitle = closing ? 'Hvala na pažnji' : 'Naslov prezentacije', tw = W - 2 * M;
    const lect = S.deck === 'predavanje', def = S.deck === 'odbrana';
    // odbrana: kandidat; mentor, komisija i datum (tri reda, pa je polje više)
    const who = lect ? 'Predavač' : def ? 'Kandidat' : 'Autor', more = lect ? 'Datum' : def ? 'Mentor, komisija, datum' : 'Mentor, datum', dh = def ? 0.3 : 0;
    // znak tehnologije u gornjem desnom uglu, u visini oznake predmeta ili logotipa
    const ms = 0.6, mark = (x, y, color) => { if (tech && !closing) o.push(Img(x, y, ms, ms, markImage(tech, color), at.name)); };
    // znak „$“ u boji akcenta, osim kad je akcenat preslab za tekst (npr. žuta na beloj): tada u glavnoj boji
    const pc = contrast(p.accent, p.bg) >= 3 ? p.aText : p.pText;
    // komanda kao u terminalu, tik iznad prvog reda naslova; naslov je poravnat uz donju ivicu polja,
    // pa se mesto računa iz broja redova naslova
    const cmd = (bottom, w, size, bold, color, pc, minY) => {
      if (!command || closing) return;
      const n = Math.min(3, textLines(T(S.meta.title || tTitle), hf, size, bold, w));
      const y = Math.max(minY, bottom - n * size * 1.2 * 0.95 / 72 - 0.1 - 0.4);
      phs.push(ph('komanda', 'body', M, y, w, 0.4, st(mf, 16, color, { valign: 'bottom', pc }), '$ komanda'));
    };
    if (sty === 'korporativni') {
      const BH = H * 0.64, cw = W * 0.78, y2 = BH + 0.45;
      o.push(R(0, 0, W, BH, p.primary));
      if (!closing) phs.push(ph('oznaka', 'body', M, 0.8, cw, 0.35, eyebrow(p.soft), 'PREDMET'));
      phs.push(ph('title', 'title', M, 1.25, cw, BH - 2.45, st(hf, 40, p.onP, { bold: true, valign: 'bottom', spacing: 0.95 }), tTitle));
      cmd(BH - 1.2, cw, 40, true, p.soft, p.onP, 1.25);
      phs.push(ph('podnaslov', 'body', M, BH - 1.0, cw, 0.55, st(bf, 18, p.soft), 'Podnaslov'));
      if (!closing) {
        phs.push(ph('autor', 'body', M, y2, W * 0.5, 0.75, st(bf, 13, p.text, { spacing: 1.15 }), who));
        phs.push(ph('detalji', 'body', M, y2 + 0.8, W * 0.5, 0.6 + dh, st(bf, 11, p.muted, { spacing: 1.15 }), more));
      } else phs.push(ph('kontakt', 'body', M, y2, W * 0.55, 1.3, st(bf, 13, p.text, { spacing: 1.2 }), 'Kontakt'));
      logo(o, { x: W - M - 1.8, y: y2, w: 1.8, h: 0.9 }, 'right');
      mark(W - M - ms, 0.8 + (0.35 - ms) / 2, p.onP);
    } else if (sty === 'akademski') {
      logo(o, { x: M, y: 0.6, w: 1.8, h: 0.75 }, 'left');
      mark(W - M - ms, 0.6 + (0.75 - ms) / 2, p.pText);
      if (!closing) phs.push(ph('oznaka', 'body', M, 1.75, tw, 0.35, eyebrow(p.muted), 'PREDMET'));
      phs.push(ph('title', 'title', M, 2.1, tw - 0.8, 1.75, st(hf, 36, p.pText, { valign: 'bottom', spacing: 0.95 }), tTitle));
      cmd(3.85, tw - 0.8, 36, false, p.muted, pc, 2.1);
      phs.push(ph('podnaslov', 'body', M, 4.02, tw, 0.5, st(bf, 18, p.muted), 'Podnaslov'));
      o.push(Ln(M, 4.75, tw, p.accent, 1));
      if (!closing) {
        phs.push(ph('autor', 'body', M, 4.95, tw * 0.6, 0.75, st(bf, 14, p.text, { spacing: 1.15 }), who));
        phs.push(ph('detalji', 'body', M, 5.75, tw * 0.6, 0.6 + dh, st(bf, 12, p.muted, { spacing: 1.15 }), more));
      } else phs.push(ph('kontakt', 'body', M, 4.95, tw * 0.6, 1.2, st(bf, 14, p.text, { spacing: 1.2 }), 'Kontakt'));
    } else {
      if (!closing) phs.push(ph('oznaka', 'body', M, 0.7, W * 0.6, 0.35, eyebrow(p.muted), 'PREDMET'));
      const lb = { x: W - M - 1.8, y: 0.55, w: 1.8, h: 0.7 };
      logo(o, lb, 'right');
      mark((S.logo ? fitBox(lb, S.logo.ar, 'right').x - 0.3 : W - M) - ms, lb.y + (lb.h - ms) / 2, p.pText);
      phs.push(ph('title', 'title', M, 2.05, W * 0.8, 2.48, st(hf, 42, p.text, { bold: true, valign: 'bottom', spacing: 0.95 }), tTitle));
      cmd(4.53, W * 0.8, 42, true, p.muted, pc, 1.15);
      phs.push(ph('podnaslov', 'body', M, 4.75, W * 0.7, 0.55, st(bf, 18, p.muted), 'Podnaslov'));
      o.push(Ln(M, 5.7, tw, p.hair, 0.75));
      // crtica u boji akcenta preko linije, kada je izgled traži (Python)
      if (S.opts.accentRule && !closing) o.push(Ln(M, 5.7, 0.9, p.accent, 3));
      const cw = (tw - 0.4) / 2;
      if (!closing) {
        phs.push(ph('autor', 'body', M, 5.9, cw, 0.9, st(bf, 12, p.text, { spacing: 1.15 }), who));
        phs.push(ph('detalji', 'body', M + cw + 0.4, 5.9, cw, 0.9 + dh * 0.5, st(bf, 12, p.muted, { spacing: 1.15 }), more));
      } else phs.push(ph('kontakt', 'body', M, 5.9, tw, 0.9, st(bf, 12, p.text, { spacing: 1.15 }), 'Kontakt'));
    }
    return { id, bg, objects: o, ph: phs };
  };
  L.NASLOVNI = hero('NASLOVNI', false);
  L.KRAJ = hero('KRAJ', true);

  // sekcija: mala oznaka („DEO 1“) i naslov celine, bez ukrasnih brojeva
  L.SEKCIJA = (() => {
    const o = [], phs = []; let bg = p.bg, nc = p.muted, prog = null;
    const tw = W * 0.75;
    if (sty === 'korporativni') {
      bg = p.primary; nc = p.soft;
      phs.push(ph('oznaka', 'body', M, 2.75, tw, 0.35, eyebrow(p.soft), 'DEO 1'));
      phs.push(ph('title', 'title', M, 3.15, tw, 1.3, st(hf, 36, p.onP, { bold: true, valign: 'top', spacing: 0.95 }), 'Naziv celine'));
      phs.push(ph('opis', 'body', M, 4.55, W * 0.6, 0.9, st(bf, 16, p.soft), 'Kratak opis'));
    } else if (sty === 'akademski') {
      phs.push(ph('oznaka', 'body', M, 2.5, tw, 0.35, eyebrow(p.muted), 'DEO 1'));
      phs.push(ph('title', 'title', M, 2.85, W - 2 * M, 1.1, st(hf, 32, p.pText, { valign: 'bottom', spacing: 0.95 }), 'Naziv celine'));
      o.push(Ln(M, 4.12, W - 2 * M, p.hair, 1));
      prog = { x: M, y: 4.12, w: W - 2 * M };
      phs.push(ph('opis', 'body', M, 4.35, W * 0.6, 0.9, st(bf, 16, p.muted), 'Kratak opis'));
    } else {
      phs.push(ph('oznaka', 'body', M, 2.75, tw, 0.35, eyebrow(p.muted), 'DEO 1'));
      phs.push(ph('title', 'title', M, 3.15, tw, 1.3, st(hf, 36, p.text, { bold: true, valign: 'top', spacing: 0.95 }), 'Naziv celine'));
      phs.push(ph('opis', 'body', M, 4.55, W * 0.6, 0.9, st(bf, 16, p.muted), 'Kratak opis'));
    }
    return { id: 'SEKCIJA', bg, objects: o, ph: phs, slots: { prog }, num: numSlot(nc) };
  })();
  // izjava: jedna rečenica, pitanje ili citat; izgled iz kartice Elementi (S.opts.quoteStyle, opis u data-styles.js)
  L.IZJAVA = (() => {
    const q = S.opts.quoteStyle, o = [], phs = [], acc = ensure(p.accent, p.bg, 3), tw = W - 2 * M, round = S.corners === 'round';
    const prompt = 'Jedna rečenica koju publika treba da zapamti', bold = sty !== 'akademski';
    // ukrasni navodnik uvek u fontu Georgia (Windows, macOS i Office ga imaju): neki fontovi naslova ga crtaju kao dve kose crte
    const mark = (x, y, w, h, size, color, align = 'left') => o.push(Tx(x, y, w, h, ['“'], st('Georgia', size, color, { bold: true, align })));
    let bg = p.bg;
    if (q === 'centrirano') {
      // navodnik, oznaka, tekst (do tri reda) i opis na sredini; kratka crtica pre opisa
      footer(o, p.muted, sty !== 'akademski');
      mark(W / 2 - 1, 1.0, 2, 1.6, 96, acc, 'center');
      o.push(R(W / 2 - 0.25, 4.85, 0.5, 0.06, acc, round ? 0.03 : 0));
      phs.push(ph('oznaka', 'body', M, 2.4, tw, 0.35, { ...eyebrow(p.muted), align: 'center' }, 'PITANJE ZA VAS'));
      phs.push(ph('title', 'title', W * 0.12, 2.85, W * 0.76, 1.8, st(hf, 34, sty === 'minimalni' ? p.text : p.pText, { bold, valign: 'top', spacing: 1.0, align: 'center' }), prompt));
      phs.push(ph('opis', 'body', W * 0.15, 5.05, W * 0.7, 0.7, st(bf, 16, p.muted, { spacing: 1.1, align: 'center' }), 'Objašnjenje ili izvor'));
    } else if (q === 'podeljeno') {
      // leva trećina u glavnoj boji sa krupnim navodnikom, tekst desno
      const pw = W * 0.34, x = pw + 0.6;
      o.push(R(0, 0, pw, H, p.primary));
      mark(0, H / 2 - 1.3, pw, 2.2, 160, mix(p.onP, p.primary, 0.45), 'center');
      footer(o, p.muted, false, x);
      phs.push(ph('oznaka', 'body', x, 2.0, W - x - M, 0.35, eyebrow(p.muted), 'PITANJE ZA VAS'));
      phs.push(ph('title', 'title', x, 2.45, W - x - M, 2.9, st(hf, 32, p.text, { bold, valign: 'top', spacing: 1.0 }), prompt));
      phs.push(ph('opis', 'body', x, 5.45, W - x - M, 0.7, st(bf, 16, p.muted, { spacing: 1.1 }), 'Objašnjenje ili izvor'));
    } else if (q === 'kartica') {
      // izjava u mekoj zaobljenoj kartici, mali navodnik u boji akcenta
      const card = mix(p.text, p.bg, 0.955), x = M + 0.55, cw = tw - 1.1, sub = ensure(p.muted, card, 4.5);
      footer(o, p.muted, false);
      o.push(R(M, 1.5, tw, 4.3, card, round ? 0.25 : 0));
      mark(x - 0.04, 1.65, 1, 1.0, 72, ensure(p.accent, card, 3));
      phs.push(ph('oznaka', 'body', x, 2.55, cw, 0.35, eyebrow(sub), 'PITANJE ZA VAS'));
      phs.push(ph('title', 'title', x, 2.95, cw * 0.9, 1.75, st(hf, 32, ensure(sty === 'minimalni' ? p.text : p.pText, card, 4.5), { bold, valign: 'top', spacing: 1.0 }), prompt));
      phs.push(ph('opis', 'body', x, 4.85, cw, 0.6, st(bf, 16, sub, { spacing: 1.1 }), 'Objašnjenje ili izvor'));
    } else if (q === 'krupno') {
      // vrlo krupan tekst preko celog slajda, oznaka u boji akcenta
      footer(o, p.muted, sty !== 'akademski');
      phs.push(ph('oznaka', 'body', M, 1.35, tw, 0.35, eyebrow(ensure(p.accent, p.bg, 4.5)), 'PITANJE ZA VAS'));
      phs.push(ph('title', 'title', M, 1.8, tw, 3.6, st(hf, 48, p.text, { bold: true, valign: 'top', spacing: 0.95 }), prompt));
      phs.push(ph('opis', 'body', M, 5.6, W * 0.7, 0.7, st(bf, 16, p.muted, { spacing: 1.1 }), 'Objašnjenje ili izvor'));
    } else {
      // obična: oznaka, tekst u glavnoj boji i opis, levo
      bg = sty === 'korporativni' ? p.surface : p.bg;
      footer(o, p.muted, sty !== 'akademski');
      phs.push(ph('oznaka', 'body', M, 2.0, W * 0.7, 0.35, eyebrow(p.muted), 'PITANJE ZA VAS'));
      phs.push(ph('title', 'title', M, 2.45, W * 0.8, 2.9, st(hf, 34, sty === 'minimalni' ? p.text : p.pText, { bold, valign: 'top', spacing: 1.0 }), prompt));
      phs.push(ph('opis', 'body', M, 5.45, W * 0.65, 0.7, st(bf, 16, p.muted, { spacing: 1.1 }), 'Objašnjenje ili izvor'));
    }
    return { id: 'IZJAVA', bg, objects: o, ph: phs, num: numSlot(p.muted) };
  })();
  for (const id of ORDER) L[id].name = LN[id];
  return L;
}
