## Ciljevi: posle ovog časa moći ćete da
1. Pokrenete Python program iz terminala
2. Koristite promenljive, uslove, petlje i funkcije
3. Čuvate podatke u listi i rečniku
4. Napišete mali program sa obradom greške i testom

Beleške: Ubrzani kurs za studente koji do sada nisu pisali Python. Na kraju časa ponovi ciljeve kao rezime.

# Šta je Python
Jezik za brzo pisanje čitljivih programa

## Python je prvi izbor za skripte, analizu podataka i veb servise
### Dobar je za
- Automatizaciju i skripte
- Analizu podataka i mašinsko učenje
- Veb servise i alate za komandnu liniju
### Nije najbolji za
- Igre i grafiku u realnom vremenu
- Mobilne aplikacije
- Programe kojima je presudna brzina procesora

Beleške: Python je interpretiran: kod se izvršava red po red, bez posebnog prevođenja. Zato se brzo piše, a sporije izvršava od C-a ili Rusta.

## Instalaciju proverite i program pokrenite iz terminala
Fajl `zdravo.py` ima jedan red: `print("Zdravo, svete!")`. Interaktivni režim (`>>>`) služi za brze probe.

```terminal
$ python3 --version
Python 3.12.4
$ python3 zdravo.py
Zdravo, svete!
$ python3
>>> 2 + 3
5
```

Beleške: Na Windows-u je komanda py ili python. Iz interaktivnog režima se izlazi sa exit().

# Osnove
Pet stvari koje su dovoljne za prve programe

## Promenljiva dobija tip od vrednosti, bez deklaracije
Tip se ne piše unapred: Python ga zna iz vrednosti, a `type()` ga pokazuje.

```python
ime = "Ana"          # str
ocena = 9            # int
prosek = 8.75        # float
polozila = True      # bool

print(f"{ime} ima ocenu {ocena}")   # Ana ima ocenu 9
print(type(prosek))                 # <class 'float'>
```

## Uvlačenje određuje blok, umesto vitičastih zagrada
```python
ocene = [9, 5, 7, 10]

for ocena in ocene:
    if ocena >= 6:
        print(ocena, "položeno")
    else:
        print(ocena, "nije položeno")

broj = 0
while broj < 3:
    broj += 1
```

Beleške: Četiri razmaka po nivou, ne tab. Najčešća greška na prvom času je IndentationError.

## Funkcija se definiše sa def i vraća vrednost sa return
```python
def prosek(ocene: list[int]) -> float:
    """Vraća prosek ocena."""
    return sum(ocene) / len(ocene)

def ocena_slovima(ocena: int) -> str:
    nazivi = {10: "izuzetan", 9: "odličan", 8: "vrlo dobar",
              7: "dobar", 6: "dovoljan"}
    return nazivi.get(ocena, "nije položio")

print(prosek([8, 9, 10]))     # 9.0
print(ocena_slovima(7))       # dobar
```

Beleške: Tipovi u zagradama (list[int], float) nisu obavezni, ali editor zbog njih nudi bolje dopune i ranije pokazuje greške.

## Lista čuva niz vrednosti, a rečnik vrednost po ključu
```python
ocene = [9, 7, 10]
ocene.append(8)
print(ocene[0], len(ocene))    # 9 4

student = {"ime": "Ana", "indeks": "IN 12/2023"}
student["prosek"] = 8.5
print(student["ime"])          # Ana

for kljuc, vrednost in student.items():
    print(kljuc, "=", vrednost)
```

## Izuzetak prekida program, osim ako ga uhvatite
Hvatajte samo grešku koju očekujete i znate da obradite.

```python
def ucitaj_ocene(putanja: str) -> list[int]:
    ocene = []
    try:
        with open(putanja, encoding="utf-8") as f:
            for red in f:
                ocene.append(int(red))
    except FileNotFoundError:
        print(f"Nema fajla: {putanja}")
    return ocene
```

# U praksi
Mali program od početka do kraja

## Ceo program staje na jedan slajd: učitavanje, obrada i ispis
`[o for o in ocene if o >= 6]` je kraći zapis petlje koja pravi novu listu.

```python
from statistics import mean

def ucitaj_ocene(putanja: str) -> list[int]:
    with open(putanja, encoding="utf-8") as f:
        return [int(red) for red in f if red.strip()]

def izvestaj(ocene: list[int]) -> str:
    polozeno = [o for o in ocene if o >= 6]
    return (f"Studenata: {len(ocene)}, položilo: {len(polozeno)}, "
            f"prosek položenih: {mean(polozeno):.2f}")

if __name__ == "__main__":
    print(izvestaj(ucitaj_ocene("ocene.txt")))
```

Beleške: Fajl ocene.txt ima po jednu ocenu u redu, na primer 9, 5, 7, 10, 5 i 8. Blok if __name__ == "__main__" se izvršava samo kad se fajl pokrene, a ne kad ga uveze test.

## Test je obična funkcija čije ime počinje sa test_
```python
# test_ocene.py
from ocene import izvestaj

def test_izvestaj():
    tekst = izvestaj([10, 5, 6, 8])
    assert "Studenata: 4" in tekst
    assert "položilo: 3" in tekst
```

## Program i testovi se pokreću iz terminala
```terminal
$ python3 ocene.py
Studenata: 6, položilo: 4, prosek položenih: 8.50
$ pip install pytest
$ pytest -q
.                                                    [100%]
1 passed in 0.01s
```

Beleške: Pakete instaliraj u virtuelno okruženje: python3 -m venv .venv, pa source .venv/bin/activate (na Windows-u .venv\Scripts\activate).

## Najčešće greške na prvim vežbama imaju jasnu poruku
| Poruka | Uzrok | Rešenje |
|---|---|---|
| `IndentationError` | pomešani razmaci i tabovi | četiri razmaka po nivou |
| `NameError` | ime nije definisano | proveri slova i redosled |
| `TypeError` | tekst i broj u istom računu | `int()` ili `str()` pre računa |
| `IndexError` | indeks van liste | indeksi idu od 0 do len - 1 |
| `KeyError` | ključ ne postoji | `recnik.get(kljuc)` |
Tabela: Poruke o greškama koje studenti najčešće vide

## Pitanje za vas
> Zašto program iz primera puca kada niko nije položio, i kako biste to popravili?

Razmislite minut, pa uporedite odgovor sa kolegom do sebe.

## Podsetnik: najvažnije sa ovog časa
| Šta | Kako |
|---|---|
| Ispis | `print(f"Prosek: {p:.2f}")` |
| Unos | `ocena = int(input("Ocena: "))` |
| Uslov | `if x >= 6: … else: …` |
| Petlja | `for o in ocene: …` |
| Funkcija | `def prosek(l): return sum(l) / len(l)` |
| Lista | `l.append(x); l[0]; len(l)` |
| Rečnik | `d["ime"]; d.get("ime"); d.items()` |
| Greška | `try: … except ValueError: …` |
| Pokretanje | `python3 ocene.py` |
| Testovi | `pytest -q` |
Tabela: Podsetnik za Python

Beleške: Ovaj slajd studenti najčešće fotografišu. Ostavi ga na ekranu dok zadaješ zadatak.

## Zadatak za vežbe
1. Napišite `ocena_slovima(ocena)` za ocene od 5 do 10
2. Proširite `izvestaj` tako da vrati i najbolju ocenu
3. Kada niko nije položio, ispišite poruku umesto greške
4. Napišite dva testa u pytest-u i pokrenite ih

## Šta dalje: zvanični vodič i sledeće teme
- Zvanični vodič: docs.python.org/3/tutorial
- Stil koda: PEP 8 i alat ruff
- Sledeće teme: klase, moduli i fajlovi CSV i JSON
- Biblioteke: pandas za tabele, requests za veb servise

## Rezime: četiri stvari koje treba zapamtiti
1. Program se pokreće sa python3 ime.py, a probe u režimu >>>
2. Uvlačenje je deo sintakse: blok je sve što je uvučeno
3. Lista čuva niz vrednosti, a rečnik vrednost po ključu
4. Hvatajte konkretan izuzetak i proverite kod testom
