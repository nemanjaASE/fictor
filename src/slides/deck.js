// Sadržaj prezentacije: primeri (izlaganje, predavanje, odbrana) i slajdovi iz Markdown-a.
import { CTX, refList } from '../content/citations.js';
import { activeTech } from '../content/tech.js';
import { estLines, parseMd, plainRuns, resolveRuns, userMd } from '../content/markdown.js';
import { S } from '../core/state.js';
import { T, up } from '../core/text.js';
import { chartObj, chartShapes, placeholderPNG } from '../graphics/charts.js';
import { codeFile, terminalParas } from '../graphics/code-styles.js';
import { diagram } from '../graphics/diagram.js';
import { statLook, tableColors, tableShapes } from '../graphics/data-styles.js';
import { CODE, highlight, isTerminal } from '../graphics/highlight.js';
import { lum, mix } from '../lib/color.js';
import { G, Img, Ln, P, R, Tx, st } from './layout.js';

/* ---------- sadržaj slajdova ---------- */
// procena prelamanja: smanjuje font naslova dok tekst ne stane u svoje polje
export function fitSize(text, wIn, hIn, size, spacing = 1, min = 18) {
  const words = String(text).split(/\s+/).filter(Boolean);
  for (let s = size; s > min; s -= 2) {
    const cpl = Math.max(4, Math.floor(wIn * 72 / (s * 0.58)));
    let lines = 1, cur = 0;
    for (const w of words) { const add = w.length + (cur ? 1 : 0); if (cur && cur + add > cpl) { lines++; cur = w.length; } else cur += add; }
    if (lines * s * 1.2 * spacing <= hIn * 72 + 2) return s;
  }
  return min;
}
export const bl = items => items.map(it => (typeof it === 'string' ? { runs: [{ t: T(it) }], bullet: 'dot', after: 10 } : { runs: it.runs.map(r => ({ ...r, t: T(r.t) })), bullet: 'dot', after: 10 }));
export const nl = items => items.map(t => ({ runs: [{ t: T(t) }], bullet: 'num', after: 10 }));
export const SAMPLE_CHART = { type: 'stubici', title: 'Vreme odgovora po sistemu', y: 'Vreme odgovora (ms)', source: 'sopstvena merenja, prosek od 5 ponavljanja', highlight: 'Predloženi', cats: ['Sistem A', 'Sistem B', 'Predloženi'], series: [{ name: 'Vreme (ms)', values: [412, 356, 121] }] };
export const isNum = v => /^[\d.,%\s−–×+-]+$/.test(String(v));
// Primeri koriste „akcione naslove“: naslov je rečenica sa zaključkom slajda.
// Tri vrste prezentacije: izlaganje (seminarski), predavanje (sa ciljevima i rezimeom), odbrana (sa rezervnim slajdovima).
export function slides(Ls) {
  const m = S.meta, p = P(), { W } = G(), hf = S.fonts.heading, bf = S.fonts.body, mf = S.fonts.mono;
  const rr = S.corners === 'round' ? 0.1 : 0, out = [], b = Ls.NASLOV.box;
  const add = (layout, fill, extras = [], notes = '') => {
    const tp = Ls[layout].ph.find(x => x.name === 'title');
    if (tp && fill.title && typeof fill.title[0] === 'string') {
      const size = fitSize(fill.title[0], tp.w, tp.h, tp.st.size, tp.st.spacing || 1);
      if (size < tp.st.size) fill.title = [{ runs: [{ t: fill.title[0] }], size }];
    }
    out.push({ layout, fill, extras, notes });
  };
  const one = s => (s ? [s] : null);
  const tag = s => [up(T(s))];

  const titleSlide = () => {
    const autor = [m.author && { runs: [{ t: T(m.author), bold: true }] }, m.institution && T(m.institution)].filter(Boolean);
    // predavanje drži predavač: bez mentora na naslovnom slajdu; odbrana: mentor i članovi komisije
    const komisija = S.deck === 'odbrana' ? committee() : [];
    const detalji = [S.deck !== 'predavanje' && m.mentor && T('Mentor: ' + m.mentor), komisija.length && T('Komisija: ' + komisija.join(', ')), m.date && T(m.date)].filter(Boolean);
    // predavanje o tehnologiji: komanda iz predavanja, znak „$“ u posebnoj boji (komanda se ne preslovljava)
    const kp = Ls.NASLOVNI.ph.find(x => x.name === 'komanda'), at = activeTech(S), komanda = kp && at && at.cmd ? [{ runs: [{ t: '$ ', color: kp.st.pc }, { t: at.cmd }] }] : null;
    // odbrana: iznad naslova vrsta rada (npr. MASTER RAD) umesto predmeta
    const oznaka = S.deck === 'odbrana' && m.workType ? up(T(m.workType)) : m.course && up(T(m.course));
    add('NASLOVNI', { oznaka: one(oznaka), komanda, title: one(T(m.title)), podnaslov: one(m.subtitle && T(m.subtitle)), autor: autor.length ? autor : null, detalji: detalji.length ? detalji : null }, [],
      'Naslovni slajd. Sve rasporede menjaš na jednom mestu: Prikaz → Matrica slajdova.');
  };
  const agenda = items => {
    const rowH = Math.min(1.0, b.h / items.length), ag = [];
    items.forEach(([t, d], i) => {
      const y = b.y + i * rowH;
      ag.push(Tx(b.x, y + 0.02, 0.6, 0.42, [String(i + 1)], st(hf, 18, p.pText, { bold: true })));
      ag.push(Tx(b.x + 0.7, y, b.w - 0.7, 0.42, [T(t)], st(hf, 20, p.text, { bold: true })));
      ag.push(Tx(b.x + 0.7, y + 0.43, b.w - 0.7, 0.32, [T(d)], st(bf, 13, p.muted)));
      if (i < items.length - 1) ag.push(Ln(b.x, y + rowH - 0.12, b.w, p.hair, 0.5));
    });
    add('NASLOV', { oznaka: tag('Pregled'), title: [T('Sadržaj')] }, ag, 'Raspored „Samo naslov“: prazna površina za sopstvene elemente, ovde sadržaj izlaganja.');
  };
  const section = (lab, ttl, desc) => add('SEKCIJA', { oznaka: tag(lab), title: [T(ttl)], opis: one(desc && T(desc)) }, [], 'Raspored „Sekcija“: razdvaja celine izlaganja.');
  const list = (tg, ttl, items, notes = '', numbered = false) => add('SADRZAJ', { oznaka: tag(tg), title: [T(ttl)], telo: numbered ? nl(items) : bl(items) }, [], notes);
  const columns = (tg, ttl, lh, rh, li, ri) => add('KOLONE', { oznaka: tag(tg), title: [T(ttl)], 'levo-naslov': [T(lh)], 'desno-naslov': [T(rh)], levo: bl(li), desno: bl(ri) }, [],
    'Raspored „Dve kolone“: poređenja (postojeće/predloženo, pre/posle, prednosti/mane).');
  const figure = (tg, ttl, intro, steps, cap) => {
    const pic = Ls.SLIKA.ph.find(x => x.name === 'slika'), ih = pic.h - 0.42;
    add('SLIKA', { oznaka: tag(tg), title: [T(ttl)], opis: [{ runs: [{ t: T(intro) }], after: 12 }, ...nl(steps)] },
      [Img(pic.x, pic.y, pic.w, ih, diagram(pic.w, ih), T(cap)), Tx(pic.x, pic.y + ih + 0.1, pic.w, 0.3, [T(cap)], st(bf, 11, p.muted))],
      'Tvrdnja i dokaz: naslov je zaključak, a slika ga dokazuje. Na novom slajdu klikni ikonicu u levom polju da ubaciš sliku.');
  };
  const code = (tg, ttl) => add('NASLOV', { oznaka: tag(tg), title: [T(ttl)] }, codeBlock({ lang: 'python', title: 'planer.py', lines: CODE.split('\n') }, b, { p, bf, mf, rr }),
    'Kod: prikaži samo deo koji objašnjavaš, ne ceo fajl.');
  const stats = (tg, ttl, data, source) => add('NASLOV', { oznaka: tag(tg), title: [T(ttl)] }, statsObjs(data, source, b, { p, W, hf, bf, rr }),
    'Ključni brojevi: najviše tri po slajdu, uz kratko objašnjenje i izvor.');
  // tabela: brojevi poravnati udesno, izgled iz kartice Elementi
  const table = (tg, ttl, head, rows, hi, caption, fr) => {
    const tb = {
      k: 'table', x: b.x, y: b.y + 0.2, w: b.w, colW: fr.map(f => f * b.w), rowH: 0.5, font: bf, size: W < 11 ? 13 : 15,
      head: head.map(T), rows: rows.map(r => r.map(v => (isNum(v) ? v : T(v)))),
      align: head.map((_, i) => (i && rows.every(r => isNum(r[i])) ? 'right' : 'left')),
      hi, look: S.opts.tableStyle, c: tableColors(p), alt: T(caption),
    };
    add('NASLOV', { oznaka: tag(tg), title: [T(ttl)] }, [...tableShapes(tb, rr), Tx(b.x, tb.y + (rows.length + 1) * tb.rowH + 0.2, b.w, 0.3, [T(caption)], st(bf, 11, p.muted))],
      'Tabela: brojevi poravnati udesno, tvoj rezultat podebljan. Izgled tabele biraš u kartici Elementi.');
  };
  const statement = (lab, text, desc) => add('IZJAVA', { oznaka: tag(lab), title: [T(text)], opis: one(desc && T(desc)) }, [],
    'Raspored „Izjava“: jedna rečenica, pitanje ili citat koje publika treba da zapamti.');
  const chartSlide = (tg, ttl, spec) => {
    let y = b.y, h = b.h; const ex = [];
    if (spec.y) { ex.push(Tx(b.x, y, b.w, 0.3, [T(spec.y)], st(bf, 12, p.muted))); y += 0.4; h -= 0.4; }
    if (spec.source) { ex.push(Tx(b.x, b.y + b.h - 0.3, b.w, 0.3, [T('Izvor: ' + spec.source)], st(bf, 10, p.muted))); h -= 0.42; }
    ex.push(...chartShapes(chartObj(spec, b.x, y, b.w, h, p, bf, W < 11 ? 12 : 13), rr));
    const shapes = ['zaobljeni', 'trake'].includes(S.opts.chartStyle) && spec.type !== 'linije';
    add('NASLOV', { oznaka: tag(tg), title: [T(ttl)] }, ex, shapes ? 'Grafikon od oblika: podatke menjaš u aplikaciji, pa ponovo preuzmeš prezentaciju.' : 'Pravi PowerPoint grafikon: desni klik → Uredi podatke.');
  };
  const closing = sub => {
    const kontakt = [m.author && { runs: [{ t: T(m.author), bold: true }] }, m.email].filter(Boolean);
    add('KRAJ', { title: [T('Hvala na pažnji')], podnaslov: [T(sub)], kontakt: kontakt.length ? kontakt : null }, [], 'Završni slajd sa kontaktom.');
  };

  const STATS = [['3,4×', 'brže izvršavanje', 'Medijana na 120 test upita', 'Brzina'], ['−41%', 'manje memorije', 'Vršna potrošnja tokom spajanja', 'Memorija'], ['120', 'test upita', 'Iz standardnog skupa LDBC SNB', 'Obim']];
  const CMP = [['Sistem', 'Vreme (ms)', 'Memorija (MB)', 'Tačnost'], [['Referentni sistem A', '412', '980', '100%'], ['Referentni sistem B', '356', '1.120', '100%'], ['Predloženi pristup', '121', '578', '100%']]];
  const FIG = ['Upit prolazi kroz tri faze:', ['Parsiranje i normalizacija', 'Izbor plana izvršavanja', 'Izvršavanje uz praćenje statistika'], 'Slika 1. Tok obrade upita'];

  titleSlide();
  if (userMd('slides')) {
    const defense = S.deck === 'odbrana', [main, backup] = defense ? splitBackup(userMd('slides')) : [userMd('slides'), ''];
    mdSlides(main, { add, tag, Ls, p, W, bf, mf, rr });
    closing(defense ? 'Pitanja komisije' : 'Pitanja i diskusija');
    if (backup) {
      section('Dodatak', 'Rezervni slajdovi', 'Za pitanja komisije; ne prikazuju se u glavnom izlaganju');
      mdSlides(backup, { add, tag, Ls, p, W, bf, mf, rr, backup: true });
    }
  }
  else if (S.opts.samples && activeTech(S)) { const at = activeTech(S); mdSlides(at.md, { add, tag, Ls, p, W, bf, mf, rr }); closing(at.next); }
  else if (!S.opts.samples) {
    list('Celina', 'Naslov slajda', ['Novi slajd: Početak → Novi slajd, svi rasporedi su već podešeni', 'Boje i fontovi su deo teme: Dizajn → Varijante', 'Izgled svih rasporeda menjaš u Prikaz → Matrica slajdova']);
    closing('Pitanja i diskusija');
  } else if (S.deck === 'predavanje') {
    list('Uvod', 'Ciljevi: posle predavanja moći ćete da', ['Objasnite zašto izbor plana određuje brzinu upita', 'Uporedite statički i adaptivni izbor plana', 'Procenite cenu plana na jednostavnom primeru'],
      'Ciljevi predavanja: dva do četiri glagola koji opisuju šta će studenti umeti posle časa.', true);
    section('Deo 1', 'Kako baza bira plan izvršavanja', 'Od upita do plana u tri koraka');
    figure('Deo 1', 'Optimizator bira plan na osnovu procene cene', ...FIG);
    code('Deo 1', 'Procena cene je obična funkcija nad statistikama');
    statement('Pitanje za vas', 'Zašto plan izabran pre izvršavanja ne može da ispravi lošu procenu?', 'Razmislite dva minuta, pa uporedite odgovor sa kolegom do sebe.');
    section('Deo 2', 'Adaptivni izbor plana', 'Preispitivanje plana tokom izvršavanja');
    columns('Deo 2', 'Adaptivni pristup koristi stvarne veličine međurezultata', 'Statički izbor', 'Adaptivni izbor',
      ['Plan se bira jednom, pre izvršavanja', 'Oslanja se na unapred prikupljene statistike', 'Greške u proceni ostaju do kraja'],
      ['Plan se preispituje tokom izvršavanja', 'Koristi veličine stvarnih međurezultata', 'Preuređuje preostale spojeve po potrebi']);
    list('Vežba', 'Zadatak za vežbe', ['Učitajte priloženi graf u bazu podataka', 'Izmerite vreme za tri zadata upita', 'Uključite adaptivni izbor i ponovite merenje', 'Rezultate unesite u tabelu izveštaja'],
      'Zadatak: koraci numerisani redom kojim se izvode.', true);
    list('Rezime', 'Rezime: tri stvari koje treba zapamtiti', ['Brzina upita zavisi od izabranog plana', 'Procene veličine međurezultata često greše', 'Adaptivni izbor ispravlja plan tokom izvršavanja'],
      'Rezime: ponovi ciljeve sa početka kao zaključke.', true);
    closing('Sledeće predavanje: distribuirano izvršavanje upita');
  } else if (S.deck === 'odbrana') {
    agenda([['Problem', 'Šta rešavamo i zašto'], ['Pristup', 'Predloženi metod'], ['Rezultati', 'Eksperimenti i poređenje'], ['Zaključak', 'Doprinos, ograničenja i dalji rad']]);
    statement('Problem', 'Optimizatori biraju plan pre izvršavanja i ne ispravljaju greške u proceni', 'Posledica: upiti sa više spojeva traju i po nekoliko sekundi.');
    columns('Postojeća rešenja', 'Postojeća rešenja popravljaju procenu, ali ne i izabrani plan', 'Bolje statistike', 'Adaptivno izvršavanje',
      ['Preciznije procene pre izvršavanja', 'Skupo održavanje statistika', 'Greška i dalje moguća'],
      ['Ispravljanje plana u toku rada', 'Postoji za relacione baze', 'Nije primenjeno na grafove']);
    figure('Pristup', 'Optimizator koristi statistike prikupljene tokom izvršavanja', ...FIG);
    stats('Rezultati', 'Adaptivni izbor plana je 3,4 puta brži uz istu tačnost', STATS, 'Izvor: sopstvena merenja, prosek od 5 ponavljanja');
    table('Rezultati', 'Predloženi pristup je najbrži i troši najmanje memorije', CMP[0], CMP[1], 2, 'Tabela 1. Prosečne vrednosti na 120 test upita', [0.4, 0.2, 0.2, 0.2]);
    list('Ograničenja', 'Pristup ima tri poznata ograničenja', ['Praćenje statistika dodaje oko 3% vremena', 'Merenja su izvedena na jednom računaru', 'Rekurzivni upiti nisu obuhvaćeni'], 'Ograničenja: komisija ih ceni više nego kad ih sama otkrije.');
    list('Zaključak', 'Zaključak i dalji rad', ['Adaptivni izbor plana skraćuje vreme odgovora bez gubitka tačnosti', 'Pristup se može dodati postojećim grafovskim bazama', { runs: [{ t: 'Dalji rad: ', bold: true }, { t: 'paralelno izvršavanje i distribuirani grafovi' }] }]);
    closing('Pitanja komisije');
    section('Dodatak', 'Rezervni slajdovi', 'Za pitanja komisije; ne prikazuju se u glavnom izlaganju');
    table('Dodatak', 'A1 · Parametri eksperimenta', ['Parametar', 'Vrednost'], [['Skup podataka', 'LDBC SNB, 10 GB'], ['Broj upita', '120'], ['Ponavljanja', '5'], ['Računar', '8 jezgara, 32 GB RAM']], -1, 'Tabela A1. Podešavanja eksperimenata', [0.5, 0.5]);
    code('Dodatak', 'A2 · Izbor plana u implementaciji');
  } else {
    agenda([['Uvod i motivacija', 'Zašto je problem važan'], ['Pristup', 'Metod i arhitektura sistema'], ['Rezultati', 'Eksperimenti i poređenje'], ['Zaključak', 'Doprinos i dalji rad']]);
    section('Deo 1', 'Uvod i motivacija', 'Kontekst problema i ciljevi rada');
    list('Uvod', 'Klasični optimizatori ne prate rast povezanih podataka', ['Količina povezanih podataka raste brže od mogućnosti indeksa', 'Upiti preko više veza postaju usko grlo sistema', 'Procene veličine međurezultata su često pogrešne', { runs: [{ t: 'Cilj rada: ', bold: true }, { t: 'kraće vreme odgovora uz istu tačnost' }] }],
      'Akcioni naslov: umesto „Motivacija“ napiši zaključak slajda u jednoj rečenici. Najviše 4–5 stavki.');
    columns('Pristup', 'Plan izvršavanja se bira prerano i kasnije se ne menja', 'Postojeći pristup', 'Predloženi pristup',
      ['Plan se bira jednom, pre izvršavanja', 'Oslanja se na unapred prikupljene statistike', 'Greške u proceni se ne ispravljaju'],
      ['Plan se preispituje tokom izvršavanja', 'Koristi veličine stvarnih međurezultata', 'Preuređuje preostale spojeve po potrebi']);
    figure('Pristup', 'Optimizator koristi statistike prikupljene tokom izvršavanja', ...FIG);
    code('Pristup', 'Izbor plana je jedna funkcija nad statistikama');
    stats('Rezultati', 'Adaptivni izbor plana je 3,4 puta brži uz istu tačnost', STATS, 'Izvor: sopstvena merenja, prosek od 5 ponavljanja');
    chartSlide('Rezultati', 'Predloženi pristup odgovara za trećinu vremena referentnih sistema', SAMPLE_CHART);
    table('Rezultati', 'Predloženi pristup je najbrži i troši najmanje memorije', CMP[0], CMP[1], 2, 'Tabela 1. Prosečne vrednosti na 120 test upita', [0.4, 0.2, 0.2, 0.2]);
    statement('Ključna poruka', 'Plan izvršavanja treba preispitati dok upit traje', 'Sve ostalo u radu je posledica ove ideje.');
    list('Zaključak', 'Zaključak i dalji rad', ['Adaptivni izbor plana skraćuje vreme odgovora bez gubitka tačnosti', 'Pristup se može dodati postojećim grafovskim bazama', { runs: [{ t: 'Dalji rad: ', bold: true }, { t: 'paralelno izvršavanje i distribuirani grafovi' }] }]);
    closing('Pitanja i diskusija');
  }
  // odbrana: vodič za vreme u beleškama za izlagača
  if (S.deck === 'odbrana') timingNotes(out, minutesOf(m.minutes));
  // linija napretka na slajdovima sekcija (stil Traka)
  const pr = Ls.SEKCIJA.slots.prog;
  if (pr) out.forEach((s, i) => { if (s.layout === 'SEKCIJA') s.extras.push(Ln(pr.x, pr.y, pr.w * (i + 1) / out.length, p.accent, 2)); });
  return out;
}


// odbrana: članovi komisije (jedan u redu), vreme za izlaganje i rezervni slajdovi iz „# Dodatak“
export const committee = () => String(S.meta.committee || '').split(/\n|;/).map(x => x.trim()).filter(Boolean);
export const minutesOf = v => { const n = parseInt(v, 10); return n >= 3 && n <= 120 ? n : 15; };
const BACKUP_RE = /^#\s+(dodatak|prilog|prilozi|rezervni slajdovi|appendix)\b.*$/im;
export function splitBackup(src) {
  const m = src.match(BACKUP_RE);
  return m ? [src.slice(0, m.index), src.slice(m.index + m[0].length)] : [src, ''];
}
// vreme po slajdu: sekcija i izjava traju kraće; posle završnog slajda su rezervni slajdovi (ne ulaze u vreme)
const WEIGHT = { NASLOVNI: 0, KRAJ: 0, SEKCIJA: 0.25, IZJAVA: 0.5 };
const fmtTime = min => (min < 1 ? `oko ${Math.max(15, Math.round(min * 4) * 15)} s` : `oko ${String(Math.round(min * 2) / 2).replace('.', ',')} min`);
export function timingNotes(out, minutes) {
  const end = out.findIndex(s => s.layout === 'KRAJ'), main = out.slice(1, end < 0 ? out.length : end);
  const total = main.reduce((a, s) => a + (WEIGHT[s.layout] ?? 1), 0) || 1, per = minutes / total;
  const note = (s, line) => { s.notes = (s.notes ? s.notes + '\n\n' : '') + line; };
  // srpski oblik: 1 slajd, 2–4 slajda, 5 slajdova (21 slajd, 22 slajda…)
  const n = main.length, n10 = n % 10, n100 = n % 100, word = n10 === 1 && n100 !== 11 ? 'slajd' : n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? 'slajda' : 'slajdova';
  // upozorenje kad je slajdova mnogo ili malo za zadato vreme (uobičajeno je oko minut po slajdu)
  const pace = per < 0.5 ? ' Slajdova je mnogo za ovo vreme: računaj oko minut po slajdu.' : per > 3 ? ' Slajdova je malo za ovo vreme: možeš da razdeliš sadržaj na više slajdova.' : '';
  note(out[0], `Vreme: plan je ${minutes} min za ${n} ${word}, ${fmtTime(per)} po slajdu sa sadržajem. Pitanja komisije dolaze posle izlaganja.${pace}`);
  let cum = 0;
  main.forEach(s => {
    const w = WEIGHT[s.layout] ?? 1; cum += w * per;
    note(s, `Vreme: ${fmtTime(w * per)} za ovaj slajd; posle njega treba da si na oko ${Math.round(cum)} od ${minutes} min.`);
  });
  if (end >= 0) {
    note(out[end], `Vreme: ovde treba da si na ${minutes} min. Rezervni slajdovi su posle ovog; otvori ih samo ako komisija pita.`);
    out.slice(end + 1).forEach(s => note(s, 'Rezervni slajd: otvori ga samo ako komisija pita.'));
  }
}

// ključni brojevi u polju a (1–4 kolone), izgled iz kartice Elementi (data-styles.js); red: [broj, opis, sitan tekst, oznaka]
export function statsObjs(data, source, a, { p, W, hf, bf, rr = 0 }) {
  const n = Math.max(1, Math.min(4, data.length)), gap = n > 3 ? 0.35 : 0.45, cw = (a.w - (n - 1) * gap) / n, look = S.opts.statStyle, items = data.slice(0, n);
  const hasE = items.some(x => x[3]), c0 = statLook(look, p), big = Math.round(((W < 11 ? 40 : 48) - (n > 3 ? 8 : 0)) * c0.size);
  // visina sadržaja: oznaka, broj, opis i sitan tekst; kartice su toliko visoke, a krupni brojevi malo niže od naslova
  const vh = big * 1.15 / 72, inner = (hasE ? 0.42 : 0) + vh + 0.15 + 1.05, pad = c0.card || statLook(look, p, 1).card ? 0.28 : 0;
  const sy = a.y + (look === 'krupni' ? 0.45 : 0.25), ch = Math.min(inner + 2 * pad + (c0.bar ? 0.32 : 0), a.h - 0.7), out = [];
  items.forEach(([v, l, d, e], i) => {
    const c = statLook(look, p, i), x = a.x + i * (cw + gap), px = c.card ? pad : 0;
    let ty = sy + (c.card ? pad : look === 'linija' ? 0.22 : 0);
    if (look === 'linija') out.push(Ln(x, sy, cw, p.pText, 1.5));
    // kartice i crtica prate izbor „Uglovi“
    if (c.card) out.push(R(x, sy, cw, ch, c.card, rr ? 0.16 : 0));
    if (c.bar) { out.push(R(x, ty, 0.5, 0.07, c.bar, rr ? 0.035 : 0)); ty += 0.32; }
    if (hasE) { out.push(Tx(x + px, ty, cw - 2 * px, 0.3, [up(T(e || ''))], st(bf, 11, c.eyebrow, { bold: true, cs: 1.5 }))); ty += 0.42; }
    out.push(Tx(x + px, ty, cw - 2 * px, vh, [v], st(hf, big, c.value, { bold: true })));
    ty += vh + 0.15;
    out.push(Tx(x + px, ty, cw - 2 * px, Math.max(0.6, sy + ch - pad - ty), [{ runs: [{ t: T(l || ''), bold: true }], size: W < 11 ? 15 : 16, after: 4 }, ...(d ? [{ runs: [{ t: T(d), color: c.desc }], size: 12 }] : [])], st(bf, 16, c.label, { spacing: 1.1 })));
  });
  if (source) out.push(Tx(a.x, Math.min(sy + ch + 0.25, a.y + a.h - 0.3), a.w, 0.3, [T(source)], st(bf, 10, p.muted)));
  return out.map(o => ({ ...o, part: 'stats' }));
}
// koji elementi su na slajdu (pregled skače na prvi slajd sa izabranim elementom)
export function slideKinds(s) {
  const k = new Set(), paras = Object.values(s.fill).flat().concat(s.extras.filter(o => o.k === 'text').flatMap(o => o.paras));
  for (const o of s.extras) {
    if (o.k === 'table') k.add('table');
    if (o.k === 'chart' || o.part === 'chart') k.add('chart');
    if (['stats', 'code', 'terminal'].includes(o.part)) k.add(o.part);
  }
  if (s.layout === 'IZJAVA') k.add('quote');
  if (paras.some(x => x && x.bullet)) k.add('list');
  return [...k];
}

/* ---------- blok koda ----------
   kod kao u editoru: kartica sa imenom fajla i brojevi redova levo; terminal ima svoje boje i oblik (odziv, kartica) */
export function codeBlock(x, a, { p, bf, mf, rr }) {
  const term = isTerminal(x.lang), pal = term ? p.term : { bg: p.code, syn: p.syn }, shape = term ? S.opts.termShape : 'editor', tech = !!activeTech(S);
  const file = term ? null : codeFile(x.lang, x.lines, x.title, tech ? 'ocene' : ''), lines = file ? file.lines : x.lines;
  const paras = term ? terminalParas(lines, pal.syn, shape, tech ? 'ocene' : 'projekat') : highlight((lines.length ? lines : [' ']).join('\n'), pal.syn, x.lang);
  const longest = Math.max(10, ...paras.map(q => q.runs.map(r => r.t).join('').length));
  const head = shape === 'editor' ? 0.5 : shape === 'vscode' || shape === 'windows' ? 0.42 : 0;
  // kolona sa brojevima redova: širina najvećeg broja i razmak od jednog znaka do koda
  const gut = file ? String(paras.length).length + 1.5 : 0;
  const fs = Math.max(10, Math.min(18, Math.floor((a.h - 0.6 - head) * 72 / (paras.length * 1.2 * 1.1)), Math.floor((a.w - 0.9) * 72 / ((longest + gut) * 0.6))));
  const lift = shape === 'obican' ? 0.1 : 0, ph = Math.min(a.h, paras.length * fs * 1.32 / 72 + 0.7 + head + lift), out = [], line = mix(pal.bg, pal.syn.out || pal.syn.base, 0.18);
  // traka (kartica fajla, TERMINAL, PowerShell) raste sa kodom, kao u editoru gde je malo sitnija od koda
  const us = Math.max(10, Math.min(14, Math.round(fs * 0.8))), ui = (color, more = {}) => st(bf, us, color, { valign: 'middle', ...more });
  if (shape === 'windows') {
    // traka sa karticama: kartica u boji terminala sa imenom ljuske, pa „+“; sadržaj ispod ima ravan gornji rub
    const strip = mix(pal.bg, lum(pal.bg) > 0.4 ? '#000000' : '#FFFFFF', 0.08);
    out.push(R(a.x, a.y, a.w, ph, strip, rr), R(a.x, a.y + head, a.w, ph - head, pal.bg, rr), R(a.x, a.y + head, a.w, 0.12, pal.bg),
      R(a.x + 0.15, a.y + 0.08, us * 0.15, head, pal.bg, rr ? 0.06 : 0),
      Tx(a.x + 0.15, a.y + 0.08, us * 0.15, head - 0.08, ['PowerShell'], ui(pal.syn.base, { align: 'center' })), Tx(a.x + 0.2 + us * 0.15, a.y + 0.08, 0.4, head - 0.08, ['+'], ui(pal.syn.com, { align: 'center' })));
  } else out.push(R(a.x, a.y, a.w, ph, pal.bg, rr));
  if (shape === 'vscode') {
    // panel kao u editoru: kartica TERMINAL sa podvlakom, ime ljuske desno, tanka linija ispod
    out.push(Tx(a.x + 0.3, a.y + 0.05, 1.8, head - 0.08, ['TERMINAL'], ui(pal.syn.base, { bold: true, cs: 1 })), Ln(a.x + 0.3, a.y + head - 0.05, us * 0.087, pal.syn.fn, 1.5),
      Tx(a.x + a.w - 1.3, a.y + 0.05, 1.0, head - 0.08, ['bash'], ui(pal.syn.com, { align: 'right' })), Ln(a.x, a.y + head, a.w, line, 0.75));
  }
  if (shape === 'editor') {
    // kartica fajla: ime sa podvlakom u boji ključnih reči, široka koliko ime (procena po slovima), tanka linija ispod trake
    const em = [...file.name].reduce((w, c) => w + (/[ijlt.,:;!|'fr1I]/.test(c) ? 0.27 : /[mwMW]/.test(c) ? 0.8 : /[A-Z]/.test(c) ? 0.62 : 0.5), 0);
    const tw = Math.min(a.w - 0.5, em * us / 72 + 0.36);
    out.push(Tx(a.x + 0.2, a.y + 0.06, tw, head - 0.1, [file.name], ui(pal.syn.base, { bold: true, align: 'center' })),
      Ln(a.x + 0.2, a.y + head - 0.03, tw, pal.syn.kw, 1.5), Ln(a.x, a.y + head, a.w, line, 0.75));
  }
  // običan terminal: samo oznaka jezika gore desno, iznad prvog reda
  if (shape === 'obican') out.push(Tx(a.x + a.w - 2.0, a.y + 0.12, 1.7, 0.26, [x.lang], st(mf, 10, pal.syn.com, { align: 'right' })));
  const top = head ? head + 0.22 : 0.34 + lift, ch = fs * 0.6 / 72, cx = file ? a.x + 0.2 + gut * ch : a.x + 0.45, th = ph - top - 0.26;
  // brojevi su poseban okvir istog fonta i proreda kao kod, pa stoje tačno uz svoj red
  if (file) out.push(Tx(a.x + 0.2, a.y + top, (gut - 1) * ch, th, paras.map((_, i) => ({ runs: [{ t: String(i + 1) }] })), st(mf, fs, mix(pal.syn.base, pal.bg, 0.45), { spacing: 1.1, align: 'right' })));
  out.push(Tx(cx, a.y + top, a.x + a.w - 0.45 - cx, th, paras, st(mf, fs, pal.syn.base, { spacing: 1.1 })));
  // oznaka dela: pregled skače na prvi slajd sa kodom, odnosno sa terminalom
  return out.map(o => ({ ...o, part: term ? 'terminal' : 'code' }));
}

/* ---------- slajdovi iz sopstvenog sadržaja ----------
   # Celina → slajd sekcije; ## Naslov → slajd; ### Levo / ### Desno → dve kolone; > izjava → slajd „Izjava“;
   kod, tabela, grafikon, ključni brojevi i slika dobijaju ceo slajd (ili desno od teksta); „Beleške:“ → beleške za izlagača */
export function mdSlides(src, H) {
  const { add, tag, Ls, p, W, bf, mf, rr } = H, b = Ls.NASLOV.box, hf = S.fonts.heading;
  let bn = 0;
  const runsP = (runs, more = {}) => ({ runs: resolveRuns(runs).map(r => ({ t: r.code ? r.t : T(r.t), ...(r.b ? { bold: true } : {}), ...(r.i ? { italic: true } : {}), ...(r.code ? { font: mf } : {}) })), after: 10, ...more });
  const parasOf = blocks => {
    const out = [];
    for (const x of blocks) {
      if (x.k === 'p') out.push(runsP(x.runs));
      else if (x.k === 'ul' || x.k === 'ol') x.items.forEach(it => out.push(runsP(it, { bullet: x.k === 'ul' ? 'dot' : 'num' })));
      else if (x.k === 'quote') out.push(runsP(x.runs.map(r => ({ ...r, i: true }))));
      else if (x.k === 'h') { const q = runsP(x.runs, { size: 20, after: 6 }); q.runs = q.runs.map(r => ({ ...r, bold: true, color: p.pText })); out.push(q); }
    }
    return out;
  };
  // smanji font dok tekst ne stane u polje
  const fitParas = (paras, w, h, base, min = 12) => {
    for (let s = base; s > min; s -= 1) {
      let tot = 0;
      for (const q of paras) { const sz = q.size ? q.size * s / base : s; tot += estLines(q.runs.map(r => r.t).join(''), w - (q.bullet ? 0.3 : 0), sz) * sz * 1.2 * 1.1 + (q.after || 0); }
      if (tot <= h * 72) return s;
    }
    return min;
  };
  const parasH = (paras, w, s, base) => paras.reduce((tot, q) => { const sz = q.size ? q.size * s / base : s; return tot + estLines(q.runs.map(r => r.t).join(''), w - (q.bullet ? 0.3 : 0), sz) * sz * 1.2 * 1.1 + (q.after || 0); }, 0) / 72;
  const sized = (paras, s, base) => paras.map(q => ({ ...q, size: q.size ? Math.round(q.size * s / base) : s }));
  // ćelija sa kodom ostaje kakva je (bez tipografije i preslovljavanja u ćirilicu)
  const cell = (x, i, j, v) => (x.code && x.code[i] && x.code[i][j] ? v : isNum(v) ? v : T(v));
  const tableObjs = (x, a) => {
    const n = x.head.length, fr = n > 2 ? [0.34, ...Array(n - 1).fill(0.66 / (n - 1))] : Array(n).fill(1 / n);
    const rowH = Math.max(0.34, Math.min(0.62, (a.h - 0.5) / (x.rows.length + 1))), size = (rowH >= 0.6 ? 18 : rowH >= 0.5 ? 16 : rowH >= 0.42 ? 14 : 12) - (W < 11 ? 1 : 0);
    const tb = { k: 'table', x: a.x, y: a.y + 0.1, w: a.w, colW: fr.map(f => f * a.w), rowH, font: bf, size, head: x.head.map(T), rows: x.rows.map((r, i) => r.map((v, j) => cell(x, i, j, v))),
      align: x.head.map((_, i) => (i && x.rows.every(r => isNum(r[i])) ? 'right' : 'left')), hi: x.hi >= 0 ? x.hi : -1, look: S.opts.tableStyle, c: tableColors(p),
      code: x.code, mono: mf, alt: T(x.caption || 'Tabela: ' + x.head.join(', ')) };
    const out = tableShapes(tb, rr);
    if (x.caption) out.push(Tx(a.x, tb.y + (x.rows.length + 1) * rowH + 0.15, a.w, 0.3, [T(x.caption)], st(bf, 11, p.muted)));
    return out;
  };
  const chartObjs = (x, a) => {
    const sp = x.spec, out = []; let y = a.y, h = a.h;
    if (sp.y) { out.push(Tx(a.x, y, a.w, 0.3, [T(sp.y)], st(bf, 12, p.muted))); y += 0.4; h -= 0.4; }
    if (sp.source) { out.push(Tx(a.x, a.y + a.h - 0.3, a.w, 0.3, [T('Izvor: ' + sp.source)], st(bf, 10, p.muted))); h -= 0.42; }
    out.push(...chartShapes(chartObj(sp, a.x, y, a.w, h, p, bf, W < 11 ? 12 : 13), rr));
    return out;
  };
  const imgObjs = (x, a) => [Img(a.x, a.y, a.w, a.h - 0.42, placeholderPNG(a.w, a.h - 0.42, x.alt, p), T(x.alt)), Tx(a.x, a.y + a.h - 0.32, a.w, 0.3, [T(x.alt)], st(bf, 11, p.muted))];

  // grupisanje u slajdove
  const groups = []; let cur = null, sec = 0;
  for (const x of parseMd(src)) {
    if (x.k === 'h' && x.level === 1) { cur = null; groups.push({ kind: 'sec', n: ++sec, title: x.text, blocks: [] }); continue; }
    if (x.k === 'h' && x.level === 2) { cur = { kind: 'slide', title: x.text, blocks: [], notes: [], sec: groups.filter(g => g.kind === 'sec').pop() }; groups.push(cur); continue; }
    if (x.k === 'hr') { if (cur) { cur = { ...cur, blocks: [], notes: [] }; groups.push(cur); } continue; }
    if (x.k === 'p' && /^(bele[šs]k[ae]|notes?)\s*:/i.test(plainRuns(x.runs))) { const tgt = cur || groups[groups.length - 1]; if (tgt) (tgt.notes = tgt.notes || []).push(plainRuns(x.runs).replace(/^(bele[šs]k[ae]|notes?)\s*:\s*/i, '')); continue; }
    if (!cur) {
      const last = groups[groups.length - 1];
      if (last && last.kind === 'sec') { last.blocks.push(x); continue; }
      cur = { kind: 'slide', title: '', blocks: [], notes: [] }; groups.push(cur);
    }
    cur.blocks.push(x);
  }
  for (const g of groups) {
    if (g.kind === 'sec') {
      const d = g.blocks.find(x => x.k === 'p');
      add('SEKCIJA', { oznaka: tag('Deo ' + g.n), title: [T(g.title)], opis: d ? [runsP(d.runs, { after: 0 })] : null }, [], (g.notes || []).join('\n'));
      continue;
    }
    // rezervni slajd: oznaka u naslovu (A1 · …), jer stilovi Traka i Minimalni nemaju oznaku iznad naslova
    const bk = H.backup ? 'A' + (++bn) + ' · ' : '', notes = g.notes.join('\n'), title = g.title ? [T(bk + g.title)] : null, oznaka = tag(bk ? 'Dodatak' : g.sec ? g.sec.title : 'Uvod');
    const vis = g.blocks.filter(x => ['code', 'table', 'chart', 'stats', 'img'].includes(x.k)), txt = g.blocks.filter(x => !vis.includes(x));
    const h3i = txt.map((x, i) => (x.k === 'h' && x.level >= 3 ? i : -1)).filter(i => i >= 0);
    if (!vis.length && h3i.length === 2) {
      add('KOLONE', { oznaka, title, 'levo-naslov': [T(txt[h3i[0]].text)], 'desno-naslov': [T(txt[h3i[1]].text)], levo: parasOf(txt.slice(h3i[0] + 1, h3i[1])), desno: parasOf(txt.slice(h3i[1] + 1)) }, [], notes);
      continue;
    }
    if (!vis.length && txt.length && txt[0].k === 'quote' && txt.every(x => x.k === 'quote' || x.k === 'p')) {
      const rest = txt.slice(1).find(x => x.k === 'p');
      add('IZJAVA', { oznaka: tag(g.title || 'Izjava'), title: [T(plainRuns(txt[0].runs))], opis: rest ? [runsP(rest.runs, { after: 0 })] : null }, [], notes);
      continue;
    }
    if (!vis.length) {
      const paras = parasOf(txt);
      if (!paras.length) { add('NASLOV', { oznaka, title }, [], notes); continue; }
      const s0 = fitParas(paras, b.w, b.h, 20);
      // lista ide u polje rasporeda (PowerPoint nudi tačke), a običan tekst u slobodno polje
      if (txt[0].k === 'ul' || txt[0].k === 'ol') add('SADRZAJ', { oznaka, title, telo: sized(paras, s0, 20) }, [], notes);
      else add('NASLOV', { oznaka, title }, [Tx(b.x, b.y, b.w, b.h, sized(paras, s0, 20), st(bf, s0, p.text, { spacing: 1.1 }))], notes);
      continue;
    }
    vis.forEach((v, i) => {
      let a = { x: b.x, y: b.y, w: b.w, h: b.h }, ex = [];
      if (i === 0 && txt.length) {
        const paras = parasOf(txt), wide = (v.k === 'code' && Math.max(...v.lines.map(l => l.length)) > 44) || v.k === 'table' || v.k === 'stats';
        if (wide) {
          // širok kod ili tabela: kratak uvod iznad, sadržaj preko cele širine
          const s0 = fitParas(paras, b.w, 1.4, 18, 14), th = Math.min(1.4, parasH(paras, b.w, s0, 18) + 0.1);
          ex.push(Tx(b.x, b.y, b.w, th, sized(paras, s0, 18), st(bf, s0, p.text, { spacing: 1.1 })));
          a = { x: b.x, y: b.y + th + 0.15, w: b.w, h: b.h - th - 0.15 };
        } else {
          const tw = b.w * 0.36, s0 = fitParas(paras, tw, b.h, 18);
          ex.push(Tx(b.x, b.y, tw, b.h, sized(paras, s0, 18), st(bf, s0, p.text, { spacing: 1.1 })));
          a = { x: b.x + tw + 0.5, y: b.y, w: b.w - tw - 0.5, h: b.h };
        }
      }
      ex = ex.concat(v.k === 'code' ? codeBlock(v, a, H) : v.k === 'table' ? tableObjs(v, a) : v.k === 'chart' ? chartObjs(v, a)
        : v.k === 'stats' ? statsObjs(v.items, v.source, a, { p, W, hf, bf, rr }) : imgObjs(v, a));
      add('NASLOV', { oznaka, title: title || (v.k === 'chart' && v.spec.title ? [T(v.spec.title)] : null) }, ex, notes);
    });
  }
  if (CTX.listed.length) {
    const refs = refList().map(r => ({ runs: [...(r.label ? [{ t: r.label + ' ' }] : []), ...r.runs.map(x => ({ t: x.raw ? x.t : T(x.t), italic: !!x.i }))], after: 6 }));
    const s0 = fitParas(refs, b.w, b.h, 14, 9);
    add('NASLOV', { oznaka: tag('Literatura'), title: [T('Literatura')] }, [Tx(b.x, b.y, b.w, b.h, sized(refs, s0, 14), st(bf, s0, p.text, { spacing: 1.1 }))], '');
  }
}
