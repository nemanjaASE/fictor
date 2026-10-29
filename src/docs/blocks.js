// Word dokumenti: blokovi sadržaja (koncept, seminarski, izveštaj) i paleta za belu stranu.
import { CTX, refGuide, withCites } from '../content/citations.js';
import { parseMd, userMd } from '../content/markdown.js';
import { S } from '../core/state.js';
import { chartObj } from '../graphics/charts.js';
import { tableColors } from '../graphics/data-styles.js';
import { ensure, lum, mix, onColor } from '../lib/color.js';
import { SAMPLE_CHART } from '../slides/deck.js';

/* ---------- Word dokumenti: zajednički sadržaj za pregled i .docx ---------- */
export const DOC_NAMES = { koncept: 'Koncept rada', seminarski: 'Seminarski rad', izvestaj: 'Izveštaj sa vežbi' };
export const docType = () => (S.meta.docTypes && S.meta.docTypes[S.doc]) || '';
export const mentorLbl = () => (S.doc === 'izvestaj' ? 'Asistent' : 'Mentor');

/* ---------- Word dokument iz sopstvenog sadržaja ----------
   # Poglavlje (numerisano)  ## Odeljak (1.1.)  ### podnaslov  # Naslov {-} bez broja
   naslovi bez broja pre prvog poglavlja idu na početak (npr. Rezime) i ne ulaze u sadržaj */
export function mdDocBlocks(src) {
  const B = [], blocks = parseMd(src); let seenNum = false, toc = false, refs = false, fig = 0, tab = 0, lst = 0;
  const refHead = t => /^(literatura|reference|bibliografija|izvori)$/i.test(t.trim());
  for (const x of blocks) {
    if (x.k === 'h') {
      if (x.level === 1) {
        if (!x.unnumbered && !seenNum && S.doc === 'seminarski' && !toc) { B.push({ k: 'unh', t: 'Sadržaj', gap: B.length > 0 }, { k: 'toc' }, { k: 'pagebreak' }); toc = true; }
        if (x.unnumbered && !seenNum) B.push({ k: 'unh', t: x.text, gap: B.length > 0 });
        else if (x.unnumbered) B.push({ k: 'h1u', t: x.text });
        else { B.push({ k: 'h1', t: x.text }); seenNum = true; }
        if (refHead(x.text)) { B.push({ k: 'refs' }); refs = true; }
      } else if (x.level === 2 && !x.unnumbered) B.push({ k: 'h2', t: x.text });
      else B.push({ k: 'h3', runs: x.runs });
    }
    else if (x.k === 'p') B.push({ k: 'p', runs: x.runs });
    else if (x.k === 'ul') B.push({ k: 'bullets', items: x.items });
    else if (x.k === 'ol') B.push({ k: 'numbered', items: x.items });
    else if (x.k === 'quote') B.push({ k: 'note', runs: x.runs });
    else if (x.k === 'code') B.push({ k: 'code', caption: `Listing ${++lst}.` + (x.title ? ' ' + x.title : ''), lines: x.lines });
    else if (x.k === 'table') {
      const n = x.head.length;
      B.push({ k: 'table', caption: `Tabela ${++tab}.` + (x.caption ? ' ' + x.caption : ''), head: x.head, rows: x.rows, hi: x.hi, widths: n > 2 ? [0.34, ...Array(n - 1).fill(0.66 / (n - 1))] : Array(n).fill(1 / n) });
    }
    else if (x.k === 'chart') B.push({ k: 'chart', spec: x.spec, caption: `Slika ${++fig}.` + (x.spec.title ? ' ' + x.spec.title : '') });
    else if (x.k === 'stats') {
      // u dokumentu nema mesta za krupne brojeve: lista sa podebljanim brojem
      B.push({ k: 'bullets', items: x.items.map(([v, l, d]) => [{ t: v, b: true }, { t: (l ? ' ' + l : '') + (d ? ` (${d})` : '') }]) });
      if (x.source) B.push({ k: 'p', runs: [{ t: 'Izvor: ' + x.source }] });
    }
    else if (x.k === 'img') B.push({ k: 'figure', caption: `Slika ${++fig}. ${x.alt}`, placeholder: x.alt });
  }
  if (S.doc === 'seminarski' && !toc) B.unshift({ k: 'unh', t: 'Sadržaj' }, { k: 'toc' }, { k: 'pagebreak' });
  if (!refs && CTX.listed.length) B.push({ k: 'h1u', t: 'Literatura' }, { k: 'refs' });
  return B;
}


export function docBlocks() {
  if (userMd(S.doc)) return mdDocBlocks(userMd(S.doc));
  const B = [], g = S.opts.guides;
  const h1 = t => B.push({ k: 'h1', t }), h2 = t => B.push({ k: 'h2', t });
  const guide = t => { if (g) B.push({ k: 'guide', t: withCites(t) }); };
  const p = t => B.push({ k: 'p', runs: (typeof t === 'string' ? [{ t }] : t).map(r => ({ ...r, t: withCites(r.t) })) });
  if (S.doc === 'seminarski') {
    // IMRaD: uvod, osnove, srodni radovi, pristup, rezultati, zaključak
    B.push({ k: 'unh', t: 'Rezime' });
    guide('Rezime ima 150–250 reči: problem, cilj, metod, glavni rezultat i zaključak. Piše se na kraju, kada je rad gotov.');
    p('Rad se bavi izborom plana izvršavanja upita u grafovskim bazama podataka. Predložen je adaptivni pristup koji plan preispituje tokom izvršavanja, na osnovu stvarnih veličina međurezultata. Na 120 upita iz standardnog skupa podataka pristup je u proseku 3,4 puta brži od statičkog izbora plana, uz iste rezultate.');
    B.push({ k: 'kw', t: 'grafovske baze podataka, optimizacija upita, plan izvršavanja, adaptivno izvršavanje' });
    B.push({ k: 'unh', t: 'Sadržaj', gap: true });
    B.push({ k: 'toc' });
    B.push({ k: 'pagebreak' });
    h1('Uvod');
    guide('Uvod predstavlja temu, problem i cilj rada, a na kraju ukratko opisuje strukturu rada po poglavljima.');
    p('Grafovske baze podataka čuvaju podatke kao čvorove i veze između njih. Sa rastom skupova podataka izbor plana izvršavanja postaje presudan za performanse, pa je cilj ovog rada da ispita da li adaptivni izbor plana skraćuje vreme odgovora.');
    p('U drugom poglavlju uvode se osnovni pojmovi, u trećem su prikazani srodni radovi, u četvrtom predloženi pristup, a u petom rezultati eksperimenata.');
    h1('Teorijske osnove');
    h2('Grafovski model podataka'); guide('Definišite pojmove koje rad koristi i svaku definiciju potkrepite izvorom.');
    p('Grafovski model predstavlja podatke kao čvorove sa svojstvima i usmerene veze između njih {c:1}.');
    h2('Plan izvršavanja upita'); guide('Objasnite kako sistem bira plan i zašto procena veličine međurezultata utiče na brzinu.');
    h1('Pregled srodnih radova');
    guide('Grupišite radove po pristupu i za svaku grupu navedite šta rešava, a šta ne. Završite prazninom koju vaš rad popunjava.');
    p('Postojeći radovi uglavnom poboljšavaju procene pre izvršavanja {c:1,2}, dok se adaptivnim izvršavanjem bave ređe {c:3}.');
    h1('Predloženi pristup');
    guide('Opišite pristup tako da ga čitalac može ponoviti. Slika sa arhitekturom često vredi više od pasusa teksta.');
    B.push({ k: 'figure', caption: 'Slika 1. Tok obrade upita u predloženom pristupu' });
    h1('Eksperimentalna evaluacija');
    h2('Postavka eksperimenta');
    p('Eksperimenti su izvedeni na standardnom skupu LDBC SNB veličine 10 GB, sa po pet ponavljanja svakog upita.');
    h2('Rezultati');
    B.push({ k: 'chart', spec: SAMPLE_CHART, caption: 'Slika 2. Vreme odgovora po sistemu' });
    B.push({ k: 'table', caption: 'Tabela 1. Prosečne vrednosti na 120 test upita', head: ['Sistem', 'Vreme (ms)', 'Memorija (MB)'], widths: [0.5, 0.25, 0.25], rows: [['Referentni sistem A', '412', '980'], ['Referentni sistem B', '356', '1.120'], ['Predloženi pristup', '121', '578']] });
    guide('Posle tabele ili slike u tekstu objasnite šta pokazuje, da čitalac ne bi sam izvodio zaključak.');
    h1('Zaključak');
    guide('Odgovorite na cilj iz uvoda, navedite ograničenja i pravce daljeg rada. Ne uvodite nove rezultate.');
    p('Adaptivni izbor plana skraćuje vreme odgovora bez gubitka tačnosti. Dalji rad uključuje paralelno izvršavanje i distribuirane grafove.');
    B.push({ k: 'h1u', t: 'Literatura' });
    guide(refGuide());
    B.push({ k: 'refs' });
  } else if (S.doc === 'izvestaj') {
    h1('Zadatak vežbe');
    guide('Prepišite zadatak ili ga opišite svojim rečima: šta treba uraditi i šta je cilj vežbe.');
    p('Cilj vežbe je da se izmeri kako izbor plana izvršavanja utiče na vreme odgovora upita nad grafovskom bazom podataka.');
    B.push({ k: 'bullets', items: ['Učitati zadati graf u bazu podataka', 'Izmeriti vreme izvršavanja tri zadata upita', 'Uporediti statički i adaptivni izbor plana'] });
    h1('Teorijska osnova');
    guide('Ukratko, do pola strane, objasnite pojmove i formule potrebne za razumevanje vežbe.');
    h1('Postupak');
    h2('Oprema i alati');
    B.push({ k: 'bullets', items: ['Računar sa 8 jezgara i 32 GB RAM-a', 'Python 3.12 i biblioteka za rad sa grafovima', 'Skup podataka LDBC SNB, 1 GB'] });
    h2('Koraci');
    B.push({ k: 'numbered', items: ['Pokrenuti bazu i učitati skup podataka', 'Izvršiti svaki upit pet puta i zabeležiti vreme', 'Uključiti adaptivni izbor plana i ponoviti merenja'] });
    h1('Rezultati');
    guide('Rezultate prikažite tabelom ili grafikonom. Tabela ima naslov iznad, a slika i listing opis ispod ili iznad, dosledno kroz ceo izveštaj.');
    B.push({ k: 'table', caption: 'Tabela 1. Vreme izvršavanja upita (ms)', head: ['Upit', 'Statički plan', 'Adaptivni plan'], widths: [0.4, 0.3, 0.3], rows: [['Q1', '212', '98'], ['Q2', '1.045', '301'], ['Q3', '87', '85']] });
    B.push({ k: 'code', caption: 'Listing 1. Merenje vremena izvršavanja', lines: ['import time', '', 'def izmeri(upit, ponavljanja=5):', '    vremena = []', '    for _ in range(ponavljanja):', '        t0 = time.perf_counter()', '        baza.izvrsi(upit)', '        vremena.append(time.perf_counter() - t0)', '    return sum(vremena) / len(vremena)'] });
    h1('Diskusija');
    guide('Objasnite rezultate: šta je očekivano, šta nije i zašto. Navedite moguće izvore greške.');
    p('Adaptivni plan najviše pomaže upitu Q2, gde je početna procena veličine međurezultata bila najlošija. Kod upita Q3 razlika je u granicama greške merenja.');
    h1('Zaključak');
    guide('U dve do tri rečenice odgovorite na cilj vežbe.');
    B.push({ k: 'h1u', t: 'Literatura' });
    guide(refGuide());
    B.push({ k: 'refs' });
  } else {
    h1('Uvod i kontekst');
    guide('U dva do tri pasusa predstavite oblast kojoj tema pripada i zašto je aktuelna. Uvedite ključne pojmove i navedite izvore koji su vas uveli u temu {c:1}.');
    p('Grafovske baze podataka čuvaju podatke kao čvorove i veze između njih, pa su upiti nad povezanim podacima prirodniji nego u relacionom modelu. Sa rastom skupova podataka izbor plana izvršavanja postaje presudan za performanse.');
    h1('Problem i motivacija');
    guide('Opišite konkretan problem: šta ne funkcioniše, u kojim uslovima i koliko to košta. Problem treba da bude dovoljno uzak da se reši u okviru rada.');
    B.push({ k: 'note', label: 'Savet', t: 'Dobra formulacija problema je proverljiva. Umesto „upiti su spori“ napišite „upiti sa tri i više spojeva traju duže od 2 s na grafu od 10 miliona čvorova“.' });
    h1('Cilj i zadaci rada');
    p([{ t: 'Opšti cilj: ', b: true }, { t: 'razviti i evaluirati pristup koji skraćuje vreme izvršavanja upita uz istu tačnost rezultata.' }]);
    B.push({ k: 'bullets', items: ['Analizirati postojeće metode optimizacije upita', 'Implementirati prototip adaptivnog izbora plana', 'Uporediti prototip sa dva referentna sistema'] });
    h1('Istraživačka pitanja');
    B.push({ k: 'rq', items: [['IP1', 'Koliko adaptivni izbor plana skraćuje vreme odgovora u odnosu na statički izbor?'], ['IP2', 'Kako se pristup ponaša sa rastom veličine grafa?']] });
    h1('Metodologija');
    h2('Podaci'); guide('Navedite skup podataka, izvor, veličinu i licencu.');
    p('Koristiće se standardni skup LDBC SNB u tri veličine (1, 10 i 30 GB).');
    h2('Metode i alati'); guide('Opišite metode, programske jezike, biblioteke i okruženje u kom radite.');
    h2('Evaluacija'); guide('Kako ćete meriti uspeh? Navedite metrike (npr. vreme odgovora, potrošnja memorije) i sa čim poredite rezultate.');
    h1('Očekivani rezultati i doprinos');
    B.push({ k: 'bullets', items: ['Prototip otvorenog koda sa dokumentacijom', 'Eksperimentalno poređenje na standardnom skupu podataka', 'Preporuke za izbor strategije u praksi'] });
    h1('Plan rada');
    B.push({ k: 'table', head: ['Faza', 'Aktivnosti', 'Rok'], widths: [0.24, 0.52, 0.24], caption: 'Tabela 1. Okvirni plan rada',
      rows: [['Istraživanje', 'Pregled literature i postojećih rešenja', '1–2. nedelja'], ['Dizajn', 'Specifikacija pristupa i plana eksperimenata', '3. nedelja'], ['Implementacija', 'Razvoj prototipa i testova', '4–6. nedelja'], ['Evaluacija', 'Merenja, analiza i poređenje', '7–8. nedelja'], ['Pisanje', 'Izrada rada i prezentacije', '9–10. nedelja']] });
    h1('Preliminarna struktura rada');
    B.push({ k: 'numbered', items: ['Uvod', 'Teorijske osnove', 'Pregled srodnih radova', 'Predloženi pristup', 'Eksperimentalna evaluacija', 'Zaključak i dalji rad'] });
    h1('Literatura');
    guide(refGuide());
    B.push({ k: 'refs' });
  }
  return B;
}
// paleta za belu A4 stranu (tamne teme se prevode u čitljive boje; pravilnik = crn tekst i Times New Roman)
export function K() {
  const c = S.colors, Wt = '#FFFFFF', prav = S.opts.pravilnik;
  const text = lum(c.text) > 0.35 ? '#1F2328' : c.text;
  const brand = ensure(c.primary, Wt, 4.5), primary = prav ? text : brand, onP = onColor(primary);
  return {
    text, primary, onP, soft: mix(onP, primary, 0.25),
    muted: ensure(lum(c.muted) > 0.45 ? '#5F6670' : c.muted, Wt, 4.5),
    accent: c.accent, accentText: ensure(c.accent, Wt, 3.2),
    surface: lum(c.surface) < 0.8 ? mix(brand, Wt, 0.93) : c.surface,
    hair: mix(text, Wt, 0.8),
    head: prav ? 'Times New Roman' : S.fonts.heading, body: prav ? 'Times New Roman' : S.fonts.body,
  };
}
// paleta za sliku u Word dokumentu (bela strana)
export const docPal = k => ({ primary: k.primary, accent: k.accent, text: k.text, muted: k.muted, bg: '#FFFFFF', surface: k.surface, onP: k.onP, hair: k.hair });
export const FIG_IN = [6.0, 2.9];
export const docChart = (spec, k) => chartObj(spec, 0, 0, 6.0, 3.2, docPal(k), k.body, 9);
// tabela u dokumentu u izabranom izgledu (za tableGrid); boje za belu stranu
export const docTable = (b, k) => ({ look: S.opts.tableStyle, c: tableColors({ ...docPal(k), pText: k.primary }), head: b.head, rows: b.rows, hi: b.hi >= 0 ? b.hi : -1 });
