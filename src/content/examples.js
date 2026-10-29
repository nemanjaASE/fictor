// Primeri za uređivač sadržaja.
import { S } from '../core/state.js';
import { activeTech } from './tech.js';

/* ---------- primeri za uređivač ---------- */
export const MD_EXAMPLES = {
  slides: `# Uvod i motivacija
Kontekst problema i ciljevi rada

## Klasični optimizatori ne prate rast povezanih podataka
- Količina povezanih podataka raste brže od mogućnosti indeksa
- Upiti preko više veza postaju usko grlo sistema [@autor2024]
- **Cilj rada:** kraće vreme odgovora uz istu tačnost

Beleške: Ovde pišeš beleške za izlagača; vide se samo u prikazu izlagača.

## Plan se bira prerano i kasnije se ne menja
### Postojeći pristup
- Plan se bira jednom, pre izvršavanja
- Greške u proceni se ne ispravljaju
### Predloženi pristup
- Plan se preispituje tokom izvršavanja
- Koristi stvarne veličine međurezultata

# Rezultati

## Adaptivni izbor plana je 3,4 puta brži
Merenja na 120 upita iz skupa LDBC SNB, prosek od 5 ponavljanja.
\`\`\`grafikon
tip: stubici
istakni: Predloženi
y: Vreme odgovora (ms)
izvor: sopstvena merenja
| Sistem | Vreme (ms) |
|---|---|
| Sistem A | 412 |
| Sistem B | 356 |
| Predloženi | 121 |
\`\`\`

## Predloženi pristup troši najmanje memorije
| Sistem | Vreme (ms) | Memorija (MB) |
|---|---|---|
| Sistem A | 412 | 980 |
| Sistem B | 356 | 1.120 |
| Predloženi | 121 | 578 |
Tabela: Prosečne vrednosti na 120 upita
istakni: Predloženi

## Brže, uz manje memorije i istu tačnost
\`\`\`brojevi
3,4× | brže izvršavanje | medijana na 120 test upita | Brzina
−41% | manje memorije | vršna potrošnja tokom spajanja | Memorija
100% | ista tačnost | rezultati jednaki referentnim | Tačnost
izvor: sopstvena merenja, prosek od 5 ponavljanja
\`\`\`

## Implementacija je jedna funkcija
\`\`\`python
def izaberi_plan(upit, statistike):
    kandidati = generisi_planove(upit)
    return min(kandidati, key=lambda p: proceni(p, statistike))
\`\`\`

## Ključna poruka
> Plan izvršavanja treba preispitati dok upit traje.

Sve ostalo je posledica ove ideje.

## Zaključak i dalji rad
1. Adaptivni izbor skraćuje vreme odgovora [@pisac2022]
2. Pristup se može dodati postojećim bazama
3. Dalji rad: paralelno izvršavanje
`,
  doc: `# Rezime {-}
Rad se bavi izborom plana izvršavanja upita u grafovskim bazama podataka. Predloženi pristup je u proseku **3,4 puta brži** od statičkog izbora plana.

**Ključne reči:** grafovske baze podataka, optimizacija upita

# Uvod
Grafovske baze podataka čuvaju podatke kao čvorove i veze [@autor2024]. Cilj rada je da ispita da li adaptivni izbor plana skraćuje vreme odgovora.

## Struktura rada
U drugom poglavlju opisan je pristup, a u trećem rezultati merenja.

# Predloženi pristup
Plan se preispituje tokom izvršavanja, na osnovu stvarnih veličina međurezultata [@istrazivac2023; @pisac2022].

> **Napomena:** citati u tekstu i spisak literature prate stil izabran u podešavanjima.

\`\`\`python Izbor plana
def izaberi_plan(upit, statistike):
    return min(generisi_planove(upit), key=lambda p: proceni(p, statistike))
\`\`\`

# Rezultati
\`\`\`grafikon
naslov: Vreme odgovora po sistemu
istakni: Predloženi
y: Vreme odgovora (ms)
izvor: sopstvena merenja
| Sistem | Vreme (ms) |
|---|---|
| Sistem A | 412 |
| Sistem B | 356 |
| Predloženi | 121 |
\`\`\`

| Sistem | Vreme (ms) | Memorija (MB) |
|---|---|---|
| Sistem A | 412 | 980 |
| Sistem B | 356 | 1.120 |
| Predloženi | 121 | 578 |
Tabela: Prosečne vrednosti na 120 upita
istakni: Predloženi

# Zaključak
Adaptivni izbor plana skraćuje vreme odgovora bez gubitka tačnosti.
`,
  poster: `## Problem
Optimizatori biraju plan pre pokretanja upita. Kada procena pogreši, plan ostaje loš do kraja.

## Metod
Plan se preispituje tokom izvršavanja, na osnovu stvarnih veličina međurezultata [@autor2024].

## Rezultati
Na 120 upita adaptivni izbor je 3,4 puta brži i troši 41% manje memorije.

\`\`\`grafikon
tip: vodoravni
naslov: Vreme odgovora po sistemu (ms)
istakni: Predloženi
| Sistem | Vreme (ms) |
|---|---|
| Sistem A | 412 |
| Sistem B | 356 |
| Predloženi | 121 |
\`\`\`

## Zaključak
Adaptivni izbor plana može se dodati postojećim grafovskim bazama.
`,
};
export const BIB_EXAMPLE = `@article{autor2024,
  author  = {Autor, Ana and Saradnik, Bojan},
  title   = {Naslov rada o optimizaciji upita},
  journal = {Naziv časopisa},
  year    = {2024}, volume = {12}, number = {3}, pages = {45--67},
  doi     = {10.xxxx/xxxxx}
}
@book{pisac2022,
  author = {Pisac, Petar}, title = {Naslov knjige}, edition = {2},
  address = {Beograd}, publisher = {Izdava{\\v{c}}}, year = {2022}
}
@inproceedings{istrazivac2023,
  author = {Istra{\\v{z}}iva{\\v{c}}, Ivana and Kolega, Dragan and Pisac, Petar},
  title = {Naslov rada sa konferencije}, booktitle = {Zbornik radova konferencije},
  pages = {101--110}, year = {2023}
}
@misc{sajt2025,
  author = {{Naziv organizacije}}, title = {Naslov stranice}, howpublished = {Naziv sajta},
  url = {https://example.org/stranica}, year = {2025}, urldate = {2026-10-01}
}
`;
export const mdExample = () => (S.doc === 'slides' ? (activeTech(S) ? activeTech(S).md : MD_EXAMPLES.slides) : S.doc === 'poster' ? MD_EXAMPLES.poster : MD_EXAMPLES.doc);
