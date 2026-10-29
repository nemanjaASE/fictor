## Ciljevi: posle ovog časa moći ćete da
1. Napravite i pokrenete Rust projekat alatom cargo
2. Koristite promenljive, uslove, petlje i funkcije
3. Objasnite vlasništvo i pozajmljivanje vrednosti
4. Obradite grešku tipom `Result` i napišete test

Beleške: Ubrzani kurs za studente koji već znaju osnove nekog drugog jezika. Na kraju časa ponovi ciljeve kao rezime.

# Šta je Rust
Brz jezik u kome prevodilac čuva memoriju

## Rust je izbor kada su važni i brzina i bezbedna memorija
### Dobar je za
- Alate za komandnu liniju i servise
- Sistemske programe i ugrađene uređaje
- Delove programa kojima je presudna brzina
### Nije najbolji za
- Brze prototipove i jednokratne skripte
- Prve korake u programiranju
- Projekte sa rokom kraćim od učenja jezika

Beleške: Rust nema sakupljač smeća: memoriju oslobađa kraj opsega, a pravila proverava prevodilac pre pokretanja.

## Cargo pravi projekat, prevodi ga i pokreće jednom komandom
Novi projekat ima `Cargo.toml` (opis i zavisnosti) i `src/main.rs` sa prvim programom.

```terminal
$ cargo new ocene
    Creating binary (application) `ocene` package
$ cd ocene
$ cargo run
   Compiling ocene v0.1.0
    Finished `dev` profile [unoptimized + debuginfo]
     Running `target/debug/ocene`
Hello, world!
```

Beleške: Ispis je skraćen. Rust se instalira alatom rustup sa rustup.rs, a verzija se proverava sa rustc --version.

# Osnove
Pet stvari koje su dovoljne za prve programe

## Promenljiva je nepromenljiva, osim ako je označite sa mut
```rust
fn main() {
    let ime = "Ana";        // &str
    let ocena: u8 = 9;      // ceo broj od 0 do 255
    let prosek = 8.75;      // f64
    let mut broj = 0;       // mut: vrednost sme da se menja
    broj += 1;

    println!("{ime} ima ocenu {ocena}");   // Ana ima ocenu 9
    println!("{prosek} {broj}");           // 8.75 1
}
```

## Uslov i petlja ne traže zagrade, a if vraća vrednost
```rust
fn main() {
    let ocene = [9, 5, 7, 10];

    for ocena in ocene {
        let status = if ocena >= 6 { "položeno" } else { "nije položeno" };
        println!("{ocena} {status}");
    }

    let mut i = 0;
    while i < 3 {
        i += 1;
    }
}
```

## Funkcija navodi tipove, a poslednji izraz je povratna vrednost
```rust
fn prosek(ocene: &[u8]) -> f64 {
    let zbir: u32 = ocene.iter().map(|&o| o as u32).sum();
    zbir as f64 / ocene.len() as f64
}

fn ocena_slovima(ocena: u8) -> &'static str {
    match ocena {
        10 => "izuzetan",
        9 => "odličan",
        8 => "vrlo dobar",
        7 => "dobar",
        6 => "dovoljan",
        _ => "nije položio",
    }
}

fn main() {
    println!("{}", prosek(&[8, 9, 10]));   // 9
    println!("{}", ocena_slovima(7));      // dobar
}
```

Beleške: Red bez tačke-zareza na kraju funkcije je njena vrednost. match mora da pokrije sve slučajeve, zato postoji grana _.

## Vektor čuva niz vrednosti, a HashMap vrednost po ključu
```rust
use std::collections::HashMap;

fn main() {
    let mut ocene = vec![9, 7, 10];
    ocene.push(8);
    println!("{} {}", ocene[0], ocene.len());   // 9 4

    let mut student = HashMap::new();
    student.insert("ime", "Ana");
    student.insert("indeks", "IN 12/2023");
    println!("{}", student["ime"]);             // Ana

    for (kljuc, vrednost) in &student {
        println!("{kljuc} = {vrednost}");
    }
}
```

## Dodela premešta vrednost, a referenca je samo pozajmljuje
```rust
fn duzina(s: &str) -> usize {
    s.chars().count()
}

fn main() {
    let s1 = String::from("ocene");
    let s2 = s1;                  // s1 je premešten u s2
    // println!("{s1}");          // greška: s1 više ne važi

    let n = duzina(&s2);          // pozajmica: s2 ostaje vlasnik
    println!("{s2} ima {n} slova");    // ocene ima 5 slova
}
```

Beleške: Pravilo pozajmljivanja: u isto vreme mnogo čitalaca (&) ili jedan pisac (&mut), nikad oboje.

# U praksi
Mali program od početka do kraja

## Greška je vrednost tipa Result, a ? je prosleđuje pozivaocu
```rust
use std::error::Error;
use std::fs;

fn ucitaj_ocene(putanja: &str) -> Result<Vec<u8>, Box<dyn Error>> {
    let tekst = fs::read_to_string(putanja)?;
    let mut ocene = Vec::new();
    for red in tekst.lines().filter(|r| !r.trim().is_empty()) {
        ocene.push(red.trim().parse()?);
    }
    Ok(ocene)
}

fn main() -> Result<(), Box<dyn Error>> {
    let ocene = ucitaj_ocene("ocene.txt")?;
    println!("{}", izvestaj(&ocene));
    Ok(())
}
```

Beleške: Ako fajl ne postoji ili red nije broj, ? vraća grešku iz funkcije, a main je ispisuje. Fajl ocene.txt je u korenu projekta, po jedna ocena u redu.

## Izveštaj računa prosek samo položenih ocena
```rust
fn izvestaj(ocene: &[u8]) -> String {
    let polozeno: Vec<u8> = ocene.iter().copied().filter(|&o| o >= 6).collect();
    let zbir: u32 = polozeno.iter().map(|&o| o as u32).sum();
    let prosek = zbir as f64 / polozeno.len() as f64;
    format!(
        "Studenata: {}, položilo: {}, prosek položenih: {prosek:.2}",
        ocene.len(),
        polozeno.len()
    )
}
```

## Test se piše u istom fajlu i pokreće sa cargo test
```rust
#[cfg(test)]
mod testovi {
    use super::*;

    #[test]
    fn izvestaj_broji_polozene() {
        let tekst = izvestaj(&[10, 5, 6, 8]);
        assert!(tekst.contains("Studenata: 4"));
        assert!(tekst.contains("položilo: 3"));
    }
}
```

## Program i testovi se pokreću iz terminala
```terminal
$ cargo run
Studenata: 6, položilo: 4, prosek položenih: 8.50
$ cargo test
running 1 test
test testovi::izvestaj_broji_polozene ... ok

test result: ok. 1 passed; 0 failed
```

Beleške: Ispis je skraćen: cargo pre programa ispisuje i redove Compiling i Finished.

## Najčešće greške prevodioca imaju broj i jasno objašnjenje
| Poruka | Uzrok | Rešenje |
|---|---|---|
| `E0382` | vrednost je premeštena | pozajmi je referencom |
| `E0384` | menja se promenljiva bez mut | dodaj mut uz let |
| `E0308` | pogrešan tip vrednosti | pretvori tip, na primer sa as |
| `E0502` | čitanje i pisanje u isto vreme | skrati trajanje pozajmice |
| `panicked` | unwrap na grešci | obradi grešku sa ? ili match |
Tabela: Greške koje studenti najčešće vide; rustc --explain E0382 daje ceo opis

## Pitanje za vas
> Šta program ispisuje kada niko nije položio, i zašto Rust tu ne prijavljuje grešku?

Razmislite minut, pa uporedite odgovor sa kolegom do sebe.

## Podsetnik: najvažnije sa ovog časa
| Šta | Kako |
|---|---|
| Novi projekat | `cargo new ocene` |
| Promenljiva | `let mut broj: u32 = 0;` |
| Ispis | `println!("{ime}: {prosek:.2}");` |
| Uslov | `if x >= 6 { … } else { … }` |
| Petlja | `for o in &ocene { … }` |
| Funkcija | `fn prosek(o: &[u8]) -> f64 { … }` |
| Vektor | `let mut v = vec![1, 2]; v.push(3);` |
| Greška | `let t = fs::read_to_string(p)?;` |
| Pokretanje | `cargo run` |
| Testovi | `cargo test` |
Tabela: Podsetnik za Rust

Beleške: Ovaj slajd studenti najčešće fotografišu. Ostavi ga na ekranu dok zadaješ zadatak.

## Zadatak za vežbe
1. Napravite projekat `ocene` i prenesite program sa slajdova
2. Napišite `ocena_slovima(ocena)` sa `match` za ocene od 5 do 10
3. Kada niko nije položio, ispišite poruku umesto NaN
4. Dodajte dva testa i pokrenite `cargo test` i `cargo clippy`

## Šta dalje: zvanična knjiga i sledeće teme
- Zvanična knjiga: doc.rust-lang.org/book
- Primeri po temama: doc.rust-lang.org/rust-by-example
- Sledeće teme: strukture, enum, trait i iteratori
- Biblioteke: serde za JSON, clap za komandnu liniju

## Rezime: četiri stvari koje treba zapamtiti
1. Projekat se pravi sa cargo new, a pokreće sa cargo run
2. Promenljiva je nepromenljiva dok je ne označite sa mut
3. Dodela premešta vrednost, a & je samo pozajmljuje
4. Greške su vrednosti tipa Result, a ? ih prosleđuje dalje
