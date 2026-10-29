<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/logo-dark.svg">
    <img src="public/logo.svg" alt="Fictor" height="40">
  </picture>
</h1>

Generator profesionalnih šablona za fakultet: **prezentacije** i **naučne postere** (.pptx) i **Word dokumente** (.docx), u bojama i fontovima koje izabereš. Radi u pregledaču, bez servera; fajlovi se prave na tvom računaru.

## Šta ume

- **Prezentacije** (izlaganje, predavanje, odbrana rada) sa pravom matricom slajdova: 8 rasporeda koje PowerPoint nudi pod *Početak → Novi slajd*, tema boja u *Dizajn → Varijante*.
- **Odbrana rada** ima svoja pravila: na naslovnom slajdu vrsta rada (npr. „Master rad“), kandidat, mentor i članovi komisije (polja u kartici *Podaci*); završni slajd je „Pitanja komisije“; celina `# Dodatak` (ili `# Prilog`) u sadržaju postaje rezervni slajdovi A1, A2… posle završnog slajda. U beleškama za izlagača je vodič za vreme: plan za zadato trajanje (podrazumevano 15 minuta), vreme po slajdu i gde treba da si posle svakog slajda.
- **Naučni poster** A0 ili A1, položeno ili uspravno, po pristupu *Better Poster*: glavni nalaz krupno u sredini i QR kod ka radu.
- **Word dokumenti**: koncept rada, seminarski rad (sa automatskim sadržajem) i izveštaj sa vežbi. Mogu i u formatu „Pravilnik“ (Times New Roman 12, prored 1,5).
- **Sopstveni sadržaj** u jednostavnom Markdown-u i **literatura** u BibTeX-u. Citiranje u stilu IEEE, APA 7, Harvard ili Chicago (autor–datum).
- **Grafikoni**: u PowerPoint-u pravi grafikoni koji se menjaju, u Word-u slike. Paleta teme ili Okabe–Ito, koju razlikuju i osobe sa daltonizmom.
- **Izgled elemenata** bira se u kartici *Elementi*, iz kartica sa malim pregledom u bojama teme. Izgled je isti u pregledu, PowerPoint-u, Word-u i na posteru.
  - Kompleti jednim klikom usklađuju sve elemente: Akademski, Moderan, Meki (uključuje i obline) i Tamni. Posle se svaki element menja posebno; dugme kompleta ostaje uključeno dok izgledi odgovaraju kompletu. Svaka tema predlaže svoj komplet (tačka uz dugme): Noć uz Tamni, Medicina uz Meki, Pravo uz Akademski, ostale uz Moderan. Uz izbor teme komplet se menja sam, dok ne promeniš neki izgled pojedinačno.
  - Kad izabereš izgled elementa, pregled skače na prvi slajd (ili deo strane) sa tim elementom; ako ga u sadržaju nema, poruka to kaže.
  - *Uglovi* važe za sve kartice, trake i podloge (oštri ili obli). Samo zaobljeni stubići i trake grafikona ostaju zaobljeni, jer im je to suština.
  - Tabele: moderna (sitno zaglavlje velikim slovima, tanke linije, istaknut red na nijansi glavne boje), istaknut red (tvoj rezultat u zaobljenoj traci u glavnoj boji), redovi kao kartice, tamna, akademska (tri linije, kao u časopisima) i mreža.
  - Grafikoni: moderan (široki stubići, ostali u svetloj nijansi glavne boje, krupni brojevi, bez mreže), zaobljeni stubići (vrednost u „pilulici“), trake (vodoravne zaobljene trake), tamni i klasičan (mreža i brojevi na osi). Moderan, tamni i klasičan su pravi PowerPoint grafikoni; zaobljeni i trake su oblici, jer PowerPoint grafikoni nemaju zaobljene stubiće, pa se njihovi podaci menjaju u aplikaciji. Linijski grafikon ostaje pravi grafikon u svakom izgledu.
  - Ključni brojevi: krupni (veliki brojevi bez ukrasa), kartice (zaobljene meke kartice), istaknut prvi (prvi broj u kartici u glavnoj boji), crtica (kratka crtica u boji akcenta iznad broja) i linija iznad.
  - Izjava i citat (raspored „Izjava“): centrirano, podeljeno (leva trećina u glavnoj boji sa krupnim navodnikom), kartica, krupno i obična.
  - Liste: tačke, kvadratići u glavnoj boji, crtice ili strelice u boji akcenta; brojevi numerisanih listi su u boji znaka (i u Word-u).
- **Predavanja o tehnologijama**: Python, Rust, Docker, Git, JavaScript i SQL. Biraju se u kartici *Tema* posle *Vrsta prezentacije → Predavanje*, a boje tehnologije su prva opcija u *Izgledu*. Predavanje na naslovnom slajdu ima predavača, bez mentora. Svako je ubrzani kurs od nule, od 21–22 slajda, istim redom: šta je tehnologija i kada se koristi, instalacija, pet osnova sa kodom, mali program iz serije „ocene“ sa testom, najčešće greške, pitanje za studente, podsetnik, zadatak, šta dalje i rezime. U bojama je te tehnologije, sa znakom tehnologije i komandom iz kursa na naslovnom slajdu. Za jezik kog nema na spisku izaberi *Drugi jezik*: upiši naziv i komandu, a aplikacija preuzme zvanični znak iz [Simple Icons](https://simpleicons.org) (treba internet) i napravi obrazac kursa istim redom, sa uputstvima šta ide na koji slajd.
- 11 tema (i po jedna za inženjerstvo, medicinu, pravo, ekonomiju i slabe projektore), podeljenih u sekcije (opšte, po oblasti studija, za posebne uslove), boje fakulteta iz jedne boje ili sa logotipa, uz pregled palete pre primene, latinica ili ćirilica, srpska tipografija („navodnici“, crte, tvrdi razmaci) i srpski jezik teksta za proveru pravopisa.
- Interfejs na srpskom ili engleskom, u svetloj ili tamnoj temi (prati sistem dok ne izabereš). Dokumenti koje aplikacija pravi su na srpskom.

## Pokretanje

Potreban je [Node.js](https://nodejs.org) 22 ili noviji.

```bash
npm install
npm run dev
```

Aplikacija se otvara na `http://localhost:5173`.

| Komanda | Šta radi |
|---|---|
| `npm run dev` | razvojni server; menja se čim sačuvaš fajl |
| `npm run build` | pravi statičku verziju u `dist/` |
| `npm run preview` | pokreće verziju iz `dist/` lokalno |
| `npm test` | pokreće testove (Vitest) |
| `npm run lint` | proverava kod (ESLint) |

## Objavljivanje na GitHub Pages

1. Napravi repozitorijum na GitHub-u i pošalji kod na granu `main`.
2. Na GitHub-u otvori **Settings → Pages** i za **Source** izaberi **GitHub Actions**.
3. Svaki `push` na `main` pokreće proveru, testove i build, pa objavljuje aplikaciju na `https://<korisnik>.github.io/<repozitorijum>/`. Podešavanja su u `.github/workflows/deploy.yml`.

## Poruke commit-a

Poruke se pišu **na engleskom** i prate [Conventional Commits](https://www.conventionalcommits.org/). Opis je u zapovednom načinu i počinje malim slovom („add“, „fix“, „remove“, ne „added“ ili „Fixes“).

```
type(scope): short summary

Optional body: what changes and why.
```

| Vrsta | Kada |
|---|---|
| `feat` | nova mogućnost |
| `fix` | ispravka greške |
| `docs` | dokumentacija (README, komentari) |
| `style` | izgled koda, ponašanje isto |
| `refactor` | preuređen kod, ponašanje isto |
| `perf` | brzina |
| `test` | testovi |
| `build` | paketi, Vite |
| `ci` | GitHub Actions |
| `chore` | ostalo (podešavanja, čišćenje) |
| `revert` | vraća raniji commit |

- Oblast (scope) nije obavezna i piše se malim slovima: `slides`, `poster`, `pptx`, `docx`, `export`, `preview`, `themes`, `fonts`, `editor`, `bib`, `i18n`, `ui`.
- Prvi red ima najviše 72 znaka i ne završava se tačkom. Između njega i dužeg opisa ide prazan red.
- Promena posle koje stare sačuvane teme ili fajlovi više ne rade dobija `!` posle vrste: `feat(themes)!: new saved theme format`.
- Primeri: `feat(poster): add A2 size`, `fix(pptx): fix spacing below table caption`, `docs: describe GitHub Pages deployment`.

Pravilo proverava git pre svakog commit-a (`.githooks/commit-msg`), a `git commit` bez `-m` otvara šablon sa podsetnikom (`.gitmessage`). Uključi oboje jednom, u folderu projekta:

```
git config core.hooksPath .githooks
git config commit.template .gitmessage
```

## Struktura projekta

```
index.html              izgled stranice (bočna kolona, pregled, uređivač)
src/
  main.js               ulazna tačka
  styles.css            stilovi aplikacije i pregleda
  lib/                  pomoćnici: DOM, boje (kontrast, mešanje)
  core/                 fontovi, teme, stanje, ćirilica i tipografija
  content/              Markdown, BibTeX, citiranje, primeri za uređivač
  graphics/             grafikoni, dijagram, bojenje koda, izgledi koda, terminala, tabela i grafikona,
                        znakovi tehnologija
  slides/               rasporedi slajdova, sadržaj prezentacije, pregled
  poster/               naučni poster i QR kod
  docs/                 sadržaj Word dokumenata i njihov pregled
  export/               izvoz u .pptx i .docx, čuvanje fajla
  ui/                   kontrole, kartice, uređivač, crtanje pregleda, poruke,
                        jezik (i18n.js), svetla/tamna tema (theme.js), ikonice (icons.js)
tests/                  testovi za tipografiju, Markdown, BibTeX, citate, boje, grafikone, izglede tabela i fontove
```

Pregled i izvoz koriste isti opis: `slides/layout.js` i `slides/deck.js` opisuju slajdove u inčima, a `slides/preview.js` ih crta u HTML-u, dok ih `export/pptx.js` piše u PowerPoint. Promena rasporeda se zato vidi i u pregledu i u fajlu.

## Česte izmene

**Nova tema.** Dodaj unos u `PRESETS` u `src/core/themes.js`:

```js
moja: {
  name: 'Moja tema', note: 'kratak opis',
  colors: { primary: '#1B365D', accent: '#9E2A2B', text: '#1A1A1A', muted: '#5E5E5E', bg: '#FFFFFF', surface: '#F2F3F4' },
  fonts: { heading: 'Source Serif Pro', body: 'Source Sans Pro', mono: 'Source Code Pro' },
  style: 'akademski', corners: 'sharp',
},
```

Font mora postojati u `FONTS` ili `MONO` u `src/core/fonts.js`. Tema sme da koristi samo font koji PowerPoint prikazuje bez instalacije (`src` nije `'g'`, vidi Napomene o fontovima); `tests/fonts.test.js` to proverava. Novi Google font dodaj i u link u `index.html`, da ga pregled prikaže.

**Novi stil citiranja.** Dodaj ga u `CITE_STYLES` i u funkcije `refRuns` i `cite` u `src/content/citations.js`, a dugme u `index.html` (`#citestyle`). Testovi su u `tests/citations.test.js`.

**Prevod interfejsa.** Svi natpisi su u `src/ui/i18n.js`, u rečnicima `sr` i `en` sa istim ključevima. U `index.html` element dobija prevod preko `data-i18n="ključ"`, a atribut preko `data-i18n-attr="title:ključ"`.

**Ikonice.** Koriste se [Lucide](https://lucide.dev) ikonice. Novu dodaj u spisak u `src/ui/icons.js`, pa je u HTML-u napiši kao `<i data-icon="ime"></i>`.

**Nova tehnologija.** Napiši ubrzani kurs u Markdown-u u `src/content/tech/ime.md`, po uzoru na postojeće (isti zapis kao u uređivaču), pa ga dodaj u `TECH` u `src/content/tech.js` sa naslovom, bojama, fontovima i komandom (`cmd`, na primer `cargo run`) koja na naslovnom slajdu stoji iznad naslova, kao u terminalu. Uzmi komandu iz samog predavanja. Znak tehnologije (dugme u aplikaciji, naslovni slajd i podnožje svakog slajda) je u `src/graphics/marks.js`: putanja iz [Simple Icons](https://simpleicons.org) (`icons/<ime>.svg`, licenca CC0) u `PATHS`, ili Lucide ikonica u `LUCIDE` ako tehnologija nema zvanični znak (kao SQL). U PowerPoint-u je znak SVG slika (uz PNG za stariji Office), pa mu se boja menja u *Prikaz → Matrica slajdova*, kartica *Format grafike*. Znakovi su žigovi svojih vlasnika i služe samo da označe tehnologiju. Kod u temi za tehnologiju mora biti u fontu Consolas: kad font za kod nije instaliran, PowerPoint ga menja proporcionalnim fontom i uvlačenje se raspada. Test u `tests/tech.test.js` proverava to pravilo, dužinu naslova i koda i kontrast boja.

Bojenje koda (`src/graphics/highlight.js`) zna Python, Rust, JavaScript/TypeScript, SQL, Dockerfile, YAML i bash. Izgled koda i terminala bira se u kartici *Elementi*, iz kartica sa malim pregledom. Kod: u bojama teme ili u šemi poznatog editora (VS Code, GitHub, One Dark, Dracula, Monokai, Nord, Tokyo Night, Catppuccin, Gruvbox, Solarized). Na slajdu kod izgleda kao u editoru: gore kartica sa imenom fajla, levo brojevi redova. Ime fajla se piše posle jezika (` ```python ocene.py `) ili kao komentar u prvom redu (`# ocene.py`, `// izvestaj.js`), koji tada prelazi na karticu. Bez toga kartica dobija uobičajeno ime za jezik (`main.py`, `index.js`, `main.rs`, `Dockerfile`), a u predavanju o tehnologiji ime iz serije „ocene“. Terminal: kao kod, klasični, PowerShell, Dracula, One Dark, Nord, Tokyo Night, Catppuccin, Gruvbox, Solarized ili svetli. Oblik terminala je poseban izbor: običan (`$`), kao terminal u VS Code-u (`student@fakultet:~/ocene$`), moderan (folder i grana iznad komande, odziv `›`) ili kao Windows Terminal (`PS C:\Users\student\ocene>`). Sadržaj se uvek piše sa `$ `, a odziv se menja tek pri crtanju. Kartice za izbor šeme terminala pokazuju izabrani oblik, isto kao na slajdu. Boje šema se pojačavaju do kontrasta 4,5:1 gde su slabije. Palete su u `src/graphics/code-styles.js`; Word dokumenti zadržavaju svetli kod. Blok ` ```terminal ` prikazuje komande (red sa `$ `) i ispis programa.

**Tekst primera.** Primeri slajdova su u `src/slides/deck.js`, primeri Word dokumenata u `src/docs/blocks.js`, a primeri za uređivač u `src/content/examples.js`.

## Pisanje sadržaja

Klikni **Moj sadržaj** iznad pregleda. U uređivaču su dugme **Ubaci primer** i kratko uputstvo za izabranu vrstu dokumenta.

```markdown
# Celina                  → slajd sekcije (u Word-u: poglavlje 1.)
## Naslov slajda          → novi slajd (u Word-u: odeljak 1.1.)
# Rezime {-}              → naslov bez broja
- stavka / 1. stavka      → lista
### Levo / ### Desno      → dve kolone na slajdu
> rečenica                → slajd „Izjava“ (u Word-u: napomena)
| A | B |                 → tabela; red „Tabela: opis“ ispod daje naslov
istakni: Predloženi       → (odmah ispod tabele) istaknut red, po prvoj ćeliji ili rednom broju
# Dodatak                 → (odbrana) rezervni slajdovi A1, A2… posle završnog slajda
[@kljuc]                  → citat iz BibTeX literature
Beleške: …                → beleške za izlagača
```

Grafikon:

````markdown
```grafikon
tip: stubici              (ili: vodoravni, linije)
istakni: Predloženi
y: Vreme odgovora (ms)
izvor: sopstvena merenja
| Sistem | Vreme (ms) |
|---|---|
| Sistem A | 412 |
| Predloženi | 121 |
```
````

Ključni brojevi (do četiri na slajdu; u Word-u lista sa podebljanim brojem). Četvrti deo reda je oznaka iznad broja i nije obavezan:

````markdown
```brojevi
3,4× | brže izvršavanje | medijana na 120 test upita | Brzina
−41% | manje memorije | vršna potrošnja tokom spajanja | Memorija
izvor: sopstvena merenja
```
````

## Napomene o fontovima

**Fontovi se ne ugrađuju u fajlove.** PowerPoint i Word prikazuju samo fontove koje imaju. Font koji nedostaje Office menja drugim: tekst dobija čudne razmake, reč na prelomu reda se ponovi („umesto umesto“) ili nestane, a kod u proporcionalnom fontu gubi poravnanje. Zato su fontovi u menijima podeljeni u tri grupe:

| Grupa | `src` u `fonts.js` | Primeri | Šta treba |
|---|---|---|---|
| Office ih preuzima sam (Microsoft 365) | `c` | Source Serif Pro, Source Sans Pro, Source Code Pro, IBM Plex, Fira, Roboto, Lora, PT Serif | ništa: Office ih preuzme čim otvoriš fajl |
| Windows i Office | `w`, `o` | Segoe UI, Georgia, Calibri, Cambria, Consolas | ništa |
| Google Fonts (instaliraj ih) | `g` | Source Serif 4, Source Sans 3, Literata, Inter, JetBrains Mono | instaliraj font na računar na kom prikazuješ |

- Sve gotove teme koriste samo prve dve grupe. Tema „Univerzalni“ (Segoe UI, Consolas) radi i u starijem Office-u (2016, 2019) i bez interneta. Tamo fontove iz prve grupe treba instalirati.
- Office zna stara imena **Source Serif Pro** i **Source Sans Pro**, ali ne i nova (Source Serif 4, Source Sans 3). Dizajn je isti, pa fajl koristi staro ime, a pregled u aplikaciji novo sa Google Fonts.
- Kad Office prvi put preuzima font, kurziv ili podebljano može kratko da se vidi u zamenskom fontu. Posle preuzimanja prikaz je ispravan.
- Spisak fontova koje Office preuzima sam nalazi se u Office-ovom katalogu na računaru: `%LOCALAPPDATA%\Microsoft\FontCache\4\Catalog\ListAll.Json`. Font dodaj u grupu `c` samo ako je u tom spisku pod istim imenom.

## Napomene

- **Verzije biblioteka su zaključane** (`pptxgenjs`, `docx`, `jszip`, `qrcode-generator` u `package.json`). `export/pptx.js` posle generisanja dorađuje XML koji pravi PptxGenJS (tema boja, razmaci u matrici, jezik). Pre nadogradnje biblioteke proveri da li to i dalje radi.
- **Izvoz se učitava tek na „Preuzmi“.** PptxGenJS, docx i JSZip su u posebnim delovima build-a koje `src/export/load.js` učitava na prvi klik, pa stranica pri otvaranju preuzima oko 280 kB JavaScript-a umesto 1 MB. Zato `export/pptx.js` i `export/docx.js` ne uvozi statički nijedan drugi modul; zajednička pomoćna funkcija ide u `core/` (kao `slug` u `core/text.js`). `tests/export-split.test.js` to proverava.
- U Word-u su grafikoni slike, jer biblioteka `docx` ne pravi Word grafikone.
- Izgledi elemenata su u `src/graphics/data-styles.js`. Za tabele postoji jedan opis svake ćelije (podloga, boja teksta, ivice), iz kog crtaju pregled, PowerPoint i Word. Na slajdu su tamna kartica, traka istaknutog reda i kartice redova zasebni zaobljeni oblici iza tabele; u Word-u te boje dobijaju same ćelije. Zaobljeni stubići i trake su na slajdu pravougaonici i tekst (`chartPrims` u `src/graphics/charts.js`), a za Word se isti oblici crtaju u sliku. Raniji nazivi izgleda iz sačuvanih tema prelaze u najbliže nove. Slike i grafikoni imaju opis za čitače ekrana: grafikon sa vrstom, naslovom i svim vrednostima, slika sa svojim opisom, logotip i znak tehnologije sa nazivom. U PowerPoint-u opis grafikona od oblika i tabele (za koje PptxGenJS nema opis) i oznaku zaglavlja tabele dopisuje `src/export/alt.js`; u Word-u slike i grafikoni dobijaju opis kroz `docx`. Tekst grafikona (kategorije, serije, osa i izvor) ide kroz istu tipografiju i preslovljavanje kao ostatak dokumenta. Ukrasni navodnik na slajdu „Izjava“ je uvek u fontu Georgia, jer ga neki fontovi naslova crtaju kao dve kose crte. PptxGenJS ne zadaje boju ni font znaka liste, pa ih `bulletXml` dodaje u XML posle generisanja (znak se crta fontom Arial). Test u `tests/data-styles.test.js` proverava kontrast teksta za sve teme i sve izglede.
- **Drugi jezik** traži znak na `cdn.jsdelivr.net` (paket `simple-icons@16.33.0`, `src/graphics/marks.js`). Iz SVG-a se uzima samo putanja i proverava pre upotrebe. Neki brendovi nemaju znak u Simple Icons (na primer C#); za Javu se koristi znak OpenJDK-a.

## Licenca

[MIT](LICENSE)
