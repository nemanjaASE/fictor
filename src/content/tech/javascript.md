## Ciljevi: posle ovog časa moći ćete da
1. Pokrenete JavaScript program u Node.js i u pregledaču
2. Koristite promenljive, uslove, petlje i funkcije
3. Čuvate podatke u nizu i objektu
4. Učitate fajl sa await, obradite grešku i napišete test

Beleške: Ubrzani kurs za studente koji do sada nisu pisali JavaScript. Na kraju časa ponovi ciljeve kao rezime.

# Šta je JavaScript
Jezik veba koji radi i van pregledača

## JavaScript radi u svakom pregledaču, a uz Node.js i na serveru
### Dobar je za
- Interaktivne veb stranice
- Veb servise i alate za komandnu liniju
- Brze prototipove uz mnogo gotovih paketa
### Nije najbolji za
- Teške numeričke proračune
- Programe kojima je presudna brzina procesora
- Velike projekte bez provere tipova

Beleške: Za velike projekte postoji TypeScript: isti jezik, uz tipove koje proverava prevodilac.

## Node.js pokreće program iz terminala, a pregledač iz konzole
Fajl `zdravo.js` ima jedan red: `console.log("Zdravo, svete!");`. Isti kod radi i u konzoli pregledača (F12).

```terminal
$ node --version
v24.16.0
$ node zdravo.js
Zdravo, svete!
$ node
> 2 + 3
5
```

Beleške: Node.js se instalira sa nodejs.org (verzija LTS). Iz interaktivnog režima se izlazi sa .exit ili Ctrl+D.

# Osnove
Pet stvari koje su dovoljne za prve programe

## Promenljiva se uvodi sa const ili let, a tip nosi vrednost
```javascript
const ime = "Ana";       // string
const ocena = 9;         // number
let prosek = 8.75;       // let: vrednost sme da se menja
const polozila = true;   // boolean
prosek += 0.25;

console.log(`${ime} ima ocenu ${ocena}`);   // Ana ima ocenu 9
console.log(typeof prosek, prosek);         // number 9
```

Beleške: Podrazumevano const; let samo kada se vrednost zaista menja. Stari var se više ne koristi.

## Uslov i petlja liče na C, a === poredi i tip vrednosti
```javascript
const ocene = [9, 5, 7, 10];

for (const ocena of ocene) {
  if (ocena >= 6) {
    console.log(ocena, "položeno");
  } else {
    console.log(ocena, "nije položeno");
  }
}

console.log(5 == "5", 5 === "5");   // true false
```

## Funkcija se piše sa function ili kao strelica
```javascript
function prosek(ocene) {
  return ocene.reduce((zbir, o) => zbir + o, 0) / ocene.length;
}

const ocenaSlovima = (ocena) => {
  const nazivi = { 10: "izuzetan", 9: "odličan", 8: "vrlo dobar",
    7: "dobar", 6: "dovoljan" };
  return nazivi[ocena] ?? "nije položio";
};

console.log(prosek([8, 9, 10]));   // 9
console.log(ocenaSlovima(7));      // dobar
```

Beleške: Operator ?? daje desnu vrednost samo kada je leva undefined ili null.

## Niz čuva niz vrednosti, a objekat vrednost po ključu
```javascript
const ocene = [9, 7, 10];
ocene.push(8);
console.log(ocene[0], ocene.length);   // 9 4

const student = { ime: "Ana", indeks: "IN 12/2023" };
student.prosek = 8.5;
console.log(student.ime);              // Ana

for (const [kljuc, vrednost] of Object.entries(student)) {
  console.log(kljuc, "=", vrednost);
}
```

## Spor posao vraća Promise, a await čeka njegov rezultat
Dok se fajl čita, program ne stoji: await samo pauzira ovu funkciju.

```javascript
import { readFile } from "node:fs/promises";

async function ucitajOcene(putanja) {
  try {
    const tekst = await readFile(putanja, "utf8");
    return tekst.split("\n").filter(Boolean).map(Number);
  } catch (greska) {
    if (greska.code !== "ENOENT") throw greska;
    console.log(`Nema fajla: ${putanja}`);
    return [];
  }
}
```

Beleške: Hvata se samo greška „fajl ne postoji“ (ENOENT); svaka druga ide dalje.

# U praksi
Mali program od početka do kraja

## Program ima modul sa logikom i skriptu koja ga pokreće
```javascript
// izvestaj.js
export function izvestaj(ocene) {
  const polozeno = ocene.filter((o) => o >= 6);
  const prosek = polozeno.reduce((a, b) => a + b, 0) / polozeno.length;
  return `Studenata: ${ocene.length}, položilo: ${polozeno.length}, ` +
    `prosek položenih: ${prosek.toFixed(2)}`;
}

// ocene.js
import { readFile } from "node:fs/promises";
import { izvestaj } from "./izvestaj.js";

const tekst = await readFile("ocene.txt", "utf8");
const ocene = tekst.split("\n").filter(Boolean).map(Number);
console.log(izvestaj(ocene));
```

Beleške: Fajl ocene.txt ima po jednu ocenu u redu. Modul izvestaj.js nema ulaz ni izlaz, pa ga test uvozi bez pokretanja programa.

## Test koristi ugrađeni node:test, bez dodatnih paketa
```javascript
// izvestaj.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { izvestaj } from "./izvestaj.js";

test("izveštaj broji položene", () => {
  const tekst = izvestaj([10, 5, 6, 8]);
  assert.match(tekst, /Studenata: 4/);
  assert.match(tekst, /položilo: 3/);
});
```

## Program i testovi se pokreću iz terminala
```terminal
$ npm init -y
$ npm pkg set type=module
$ node ocene.js
Studenata: 6, položilo: 4, prosek položenih: 8.50
$ node --test
✔ izveštaj broji položene
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

Beleške: Ispis je skraćen. Podešavanje type=module u package.json uključuje import i export u .js fajlovima.

## Najčešće greške na prvim vežbama imaju jasnu poruku
| Poruka | Uzrok | Rešenje |
|---|---|---|
| `ReferenceError` | ime nije definisano | proveri slova i redosled |
| `TypeError` | vrednost je undefined ili null | proveri vrednost pre upotrebe |
| `SyntaxError` | fali zagrada ili zarez | editor pokazuje mesto greške |
| `NaN` | račun sa tekstom ili praznim nizom | pretvori tekst u broj sa Number |
| `ERR_MODULE_NOT_FOUND` | pogrešna putanja u import | putanja sa ./ i nastavkom .js |
Tabela: Poruke o greškama koje studenti najčešće vide

## Pitanje za vas
> Šta program ispisuje kada niko nije položio, i zašto JavaScript tu ne prijavljuje grešku?

Razmislite minut, pa uporedite odgovor sa kolegom do sebe.

## Podsetnik: najvažnije sa ovog časa
| Šta | Kako |
|---|---|
| Ispis | `console.log("Prosek:", p.toFixed(2));` |
| Promenljiva | `const x = 1; let y = 2;` |
| Uslov | `if (x >= 6) { … } else { … }` |
| Petlja | `for (const o of ocene) { … }` |
| Funkcija | `const zbir = (a, b) => a + b;` |
| Niz | `niz.push(x); niz.filter((o) => o >= 6);` |
| Objekat | `obj.ime; obj["ime"]; Object.keys(obj);` |
| Čekanje | `const t = await readFile(p, "utf8");` |
| Pokretanje | `node ocene.js` |
| Testovi | `node --test` |
Tabela: Podsetnik za JavaScript

Beleške: Ovaj slajd studenti najčešće fotografišu. Ostavi ga na ekranu dok zadaješ zadatak.

## Zadatak za vežbe
1. Napišite `ocenaSlovima(ocena)` za ocene od 5 do 10
2. Proširite `izvestaj` tako da vrati i najbolju ocenu
3. Kada niko nije položio, ispišite poruku umesto NaN
4. Napišite dva testa i pokrenite ih sa `node --test`

## Šta dalje: zvanična dokumentacija i sledeće teme
- Vodič i referenca: developer.mozilla.org/docs/Web/JavaScript
- Node.js: nodejs.org/docs
- Sledeće teme: DOM, fetch i rad sa JSON-om
- TypeScript: isti jezik, uz proveru tipova

## Rezime: četiri stvari koje treba zapamtiti
1. Program se pokreće sa node ime.js, a probe u konzoli pregledača
2. Podrazumevano const, let samo za promenljive vrednosti, === za poređenje
3. Niz čuva niz vrednosti, a objekat vrednost po ključu
4. await čeka spor posao, a try i catch hvataju očekivanu grešku
