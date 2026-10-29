// Obrazac ubrzanog kursa za jezik koji nema gotov kurs: isti redosled slajdova kao gotovi kursevi,
// sa uputstvom šta ide na koji slajd i blokovima koda u tom jeziku (komentari koje predavač zamenjuje).

// znak za komentar u jezicima koji ne koriste //
const COMMENT = {
  python: '#', ruby: '#', r: '#', perl: '#', bash: '#', elixir: '#', julia: '#', nim: '#', crystal: '#',
  powershell: '#', tcl: '#', coffeescript: '#', sql: '--', haskell: '--', lua: '--', ada: '--', elm: '--',
  vhdl: '--', erlang: '%', prolog: '%', matlab: '%', octave: '%', lisp: ';', clojure: ';', racket: ';',
  scheme: ';', fortran: '!', fortranlang: '!',
};

export const customMeta = name => ({ title: `${name}: ubrzani kurs`, subtitle: 'Od prvog programa do funkcija, kolekcija i testova', course: `Programiranje u jeziku ${name}` });

export function courseTemplate(name, lang, cmd) {
  const c = (COMMENT[lang] || '//') + ' ';
  const code = (...lines) => '```' + lang + '\n' + lines.map(l => c + l).join('\n') + '\n```';
  const run = cmd || 'komanda za pokretanje';
  return `## Ciljevi: posle ovog časa moći ćete da
1. Pokrenete ${name} program iz terminala
2. Koristite promenljive, uslove, petlje i funkcije
3. Čuvate podatke u kolekcijama
4. Napišete mali program sa obradom greške i testom

Beleške: Obrazac ubrzanog kursa. Na svakom slajdu zameni tekst i kod; redosled je isti kao u gotovim kursevima.

# Šta je ${name}
Jedna rečenica: čemu jezik služi i po čemu se razlikuje

## Za šta je ${name} dobar, a za šta nije
### Dobar je za
- Prva oblast u kojoj se koristi
- Druga oblast u kojoj se koristi
- Treća oblast u kojoj se koristi
### Nije najbolji za
- Prvo ograničenje
- Drugo ograničenje
- Treće ograničenje

## Instalaciju proverite i program pokrenite iz terminala
Prvi program ispisuje jedan red. Napiši odakle se jezik instalira i kako se proverava verzija.

\`\`\`terminal
$ ${run}
Zdravo, svete!
\`\`\`

# Osnove
Pet stvari koje su dovoljne za prve programe

## Promenljiva: kako se uvodi, menja i ispisuje
${code('tekst, ceo broj, decimalni broj i logička vrednost', 'promenljiva koja sme da se menja', 'ispis vrednosti u rečenici')}

## Uslov i petlja: kako program bira i ponavlja
${code('ocene = [9, 5, 7, 10]', 'za svaku ocenu: „položeno“ ako je 6 ili više', 'petlja koja se ponavlja tri puta')}

## Funkcija: ulaz, izlaz i tipovi
${code('funkcija prosek(ocene) koja vraća decimalni broj', 'funkcija ocena_slovima(ocena): 10 izuzetan … 6 dovoljan', 'dva poziva i ispis rezultata')}

## Kolekcije: niz vrednosti i vrednost po ključu
${code('niz ocena: dodavanje, prvi element, dužina', 'student kao parovi ključ i vrednost', 'prolazak kroz sve parove')}

## Greška: šta se dešava kada nešto pođe naopako
${code('čitanje fajla ocene.txt', 'obrada greške kada fajl ne postoji', 'sve ostale greške idu dalje')}

# U praksi
Mali program od početka do kraja

## Ceo program staje na jedan slajd: učitavanje, obrada i ispis
Program čita ocene iz fajla ocene.txt (9, 5, 7, 10, 5 i 8) i ispisuje broj studenata, broj položenih i prosek položenih.

${code('učitaj ocene iz fajla ocene.txt', 'izdvoji položene (6 ili više) i izračunaj njihov prosek', 'ispiši: Studenata: 6, položilo: 4, prosek položenih: 8.50')}

## Test proverava da program radi i posle izmene
${code('test: izveštaj za ocene 10, 5, 6 i 8', 'očekuje se „Studenata: 4“ i „položilo: 3“')}

## Program i testovi se pokreću iz terminala
\`\`\`terminal
$ ${run}
Studenata: 6, položilo: 4, prosek položenih: 8.50
\`\`\`

Beleške: Dodaj i komandu za testove i njen ispis.

## Najčešće greške na prvim vežbama imaju jasnu poruku
| Poruka | Uzrok | Rešenje |
|---|---|---|
| \`prva poruka\` | uzrok | rešenje |
| \`druga poruka\` | uzrok | rešenje |
| \`treća poruka\` | uzrok | rešenje |
Tabela: Poruke o greškama koje studenti najčešće vide

## Pitanje za vas
> Šta program ispisuje kada niko nije položio, i kako biste to popravili?

Razmislite minut, pa uporedite odgovor sa kolegom do sebe.

## Podsetnik: najvažnije sa ovog časa
| Šta | Kako |
|---|---|
| Ispis | \`…\` |
| Promenljiva | \`…\` |
| Uslov | \`…\` |
| Petlja | \`…\` |
| Funkcija | \`…\` |
| Kolekcija | \`…\` |
| Greška | \`…\` |
| Pokretanje | \`${run}\` |
Tabela: Podsetnik za ${name}

Beleške: Ovaj slajd studenti najčešće fotografišu. Ostavi ga na ekranu dok zadaješ zadatak.

## Zadatak za vežbe
1. Prenesite program sa slajdova i pokrenite ga
2. Napišite funkciju koja ocenu pretvara u reči, od 5 do 10
3. Kada niko nije položio, ispišite poruku umesto greške
4. Napišite dva testa i pokrenite ih

## Šta dalje: zvanična dokumentacija i sledeće teme
- Zvanična dokumentacija: adresa vodiča za ${name}
- Sledeće teme: tri teme za naredni čas
- Biblioteke: dve najkorisnije za studente

## Rezime: četiri stvari koje treba zapamtiti
1. Kako se program pokreće
2. Kako se uvode promenljive i funkcije
3. Koja kolekcija čuva niz, a koja vrednost po ključu
4. Kako se obrađuje greška i proverava kod testom
`;
}
