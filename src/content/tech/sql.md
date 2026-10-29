## Ciljevi: posle ovog časa moći ćete da
1. Napravite tabele i unesete podatke
2. Izaberete, filtrirate i poređate redove
3. Spojite tabele i izračunate zbirne podatke po grupi
4. Bezbedno izmenite podatke i proverite da li upit koristi indeks

Beleške: Ubrzani kurs za studente koji do sada nisu radili sa bazom. Na kraju časa ponovi ciljeve kao rezime.

# Šta je SQL
Jezik za rad sa podacima u relacionoj bazi

## SQL opisuje koje podatke želite, a baza bira kako da ih nađe
### Dobar je za
- Podatke sa jasnom strukturom i vezama
- Izveštaje, filtriranje i zbirne podatke
- Aplikacije u kojima je presudna tačnost podataka
### Nije najbolji za
- Podatke bez stalne strukture
- Složenu logiku programa
- Ogromne tokove događaja u realnom vremenu

Beleške: Primeri su za PostgreSQL. Ista sintaksa uglavnom radi i u SQLite-u i MySQL-u.

## Baza se pravi jednom komandom, a upit završava tačka-zarez
```terminal
$ createdb fakultet
$ psql -d fakultet
fakultet=# SELECT 2 + 3 AS zbir;
 zbir
------
    5
(1 row)
fakultet=# \q
```

Beleške: PostgreSQL se instalira sa postgresql.org. Na Windows-u uz njega dolazi i grafički alat pgAdmin.

# Osnove
Pet upita koji su dovoljni za prve izveštaje

## Tabela se pravi sa CREATE TABLE, a svaka kolona ima tip
```sql
CREATE TABLE student (
  id      INTEGER PRIMARY KEY,
  ime     TEXT NOT NULL,
  godina  INTEGER CHECK (godina BETWEEN 1 AND 4)
);

CREATE TABLE ispit (
  student_id INTEGER REFERENCES student (id),
  predmet    TEXT NOT NULL,
  ocena      INTEGER CHECK (ocena BETWEEN 5 AND 10)
);
```

Beleške: PRIMARY KEY je jedinstven za svaki red, a REFERENCES ne dozvoljava ispit za studenta koji ne postoji.

## INSERT dodaje redove, a SELECT ih čita
```sql
INSERT INTO student (id, ime, godina) VALUES
  (1, 'Ana', 2), (2, 'Marko', 2), (3, 'Jelena', 3),
  (4, 'Nikola', 2), (5, 'Milica', 1), (6, 'Stefan', 2);

INSERT INTO ispit (student_id, predmet, ocena) VALUES
  (1, 'Baze podataka', 9), (2, 'Baze podataka', 5),
  (3, 'Baze podataka', 7), (4, 'Baze podataka', 10),
  (5, 'Baze podataka', 5), (6, 'Baze podataka', 8),
  (1, 'Programiranje', 8);

SELECT ime, godina FROM student;
```

## WHERE bira redove, a ORDER BY ih ređa
Tekst ide u jednostruke navodnike, a `LIMIT` ograničava broj redova.

```sql
SELECT student_id, ocena
FROM ispit
WHERE predmet = 'Baze podataka' AND ocena >= 6
ORDER BY ocena DESC
LIMIT 3;
```

## JOIN spaja tabele po ključu
Za studente bez ispita koristite `LEFT JOIN`: oni dobijaju NULL umesto ocene.

```sql
SELECT s.ime, i.predmet, i.ocena
FROM student AS s
JOIN ispit AS i ON i.student_id = s.id
WHERE i.ocena >= 6
ORDER BY s.ime;
```

## GROUP BY sabira redove u grupe, a HAVING filtrira grupe
```sql
SELECT s.ime, COUNT(*) AS ispita, ROUND(AVG(i.ocena), 2) AS prosek
FROM student AS s
JOIN ispit AS i ON i.student_id = s.id
WHERE i.ocena >= 6
GROUP BY s.ime
HAVING AVG(i.ocena) >= 8
ORDER BY prosek DESC;
```

Beleške: WHERE bira redove pre grupisanja, a HAVING grupe posle. Rezultat: Nikola 10, Ana 8,50 i Stefan 8.

# U praksi
Izveštaj o ocenama od tabele do rezultata

## Ceo izveštaj o ocenama je jedan upit
```sql izvestaj.sql
SELECT predmet,
       COUNT(*) AS studenata,
       SUM(CASE WHEN ocena >= 6 THEN 1 ELSE 0 END) AS polozilo,
       ROUND(AVG(CASE WHEN ocena >= 6 THEN ocena END), 2) AS prosek_polozenih
FROM ispit
GROUP BY predmet
ORDER BY predmet;
```

Beleške: CASE bez ELSE daje NULL za nepoložene ocene, a AVG preskače NULL. Zato je prosek samo od položenih.

## Rezultat se proverava odmah, u istom terminalu
```terminal
fakultet=# \i izvestaj.sql
    predmet    | studenata | polozilo | prosek_polozenih
---------------+-----------+----------+------------------
 Baze podataka |         6 |        4 |             8.50
 Programiranje |         1 |        1 |             8.00
(2 rows)
```

Beleške: Komanda \i izvršava upit iz fajla. Isti rezultat daje i program iz kurseva za Python, Rust i JavaScript.

## UPDATE i DELETE uvek idu uz WHERE
```sql
UPDATE ispit
SET ocena = 6
WHERE student_id = 2 AND predmet = 'Baze podataka';

DELETE FROM ispit
WHERE student_id = 5 AND ocena = 5;

-- bez WHERE menja se ili briše svaki red tabele
```

Beleške: Pre izmene pokreni isti WHERE uz SELECT i proveri koje redove pogađa.

## Indeks ubrzava pretragu, a EXPLAIN pokazuje da li se koristi
```terminal
fakultet=# CREATE INDEX ON ispit (student_id);
CREATE INDEX
fakultet=# EXPLAIN SELECT * FROM ispit WHERE student_id = 42;
 Index Scan using ispit_student_id_idx on ispit
   Index Cond: (student_id = 42)
```

Beleške: Ispis je skraćen i odnosi se na veliku tabelu. Na tabeli od nekoliko redova baza bira Seq Scan, jer je tada brži.

## Najčešće greške imaju poruku koja kaže gde da tražite
| Poruka | Uzrok | Rešenje |
|---|---|---|
| `syntax error at or near` | fali zarez ili zagrada | proveri deo pre navedene reči |
| `column does not exist` | tekst u dvostrukim navodnicima | tekst ide u jednostruke navodnike |
| `relation does not exist` | tabela ne postoji | proveri ime tabele i bazu |
| `violates foreign key` | student ne postoji | prvo unesi studenta |
| `must appear in GROUP BY` | kolona nije grupisana | dodaj je u GROUP BY ili AVG |
Tabela: Poruke PostgreSQL-a koje studenti najčešće vide

## Pitanje za vas
> Šta izveštaj vraća za predmet na kome niko nije položio, i zašto tu nema greške?

Razmislite minut, pa uporedite odgovor sa kolegom do sebe.

## Podsetnik: najvažnije sa ovog časa
| Šta | Kako |
|---|---|
| Tabela | `CREATE TABLE t (id INTEGER PRIMARY KEY);` |
| Unos | `INSERT INTO t (a, b) VALUES (1, 'x');` |
| Čitanje | `SELECT a, b FROM t WHERE a >= 6;` |
| Redosled | `ORDER BY a DESC LIMIT 10` |
| Spoj | `JOIN t2 ON t2.t_id = t.id` |
| Grupe | `GROUP BY a HAVING COUNT(*) > 1` |
| Funkcije | `COUNT(*), AVG(x), MIN(x), MAX(x)` |
| Izmena | `UPDATE t SET b = 'y' WHERE a = 1;` |
| Brisanje | `DELETE FROM t WHERE a = 1;` |
| Plan upita | `EXPLAIN SELECT …` |
Tabela: Podsetnik za SQL

Beleške: Ovaj slajd studenti najčešće fotografišu. Ostavi ga na ekranu dok zadaješ zadatak.

## Zadatak za vežbe
1. Napravite bazu `fakultet` i tabele sa slajdova
2. Napišite upit koji vraća studente bez ijednog ispita
3. Dopunite izveštaj tako da vraća i najbolju ocenu po predmetu
4. Kada niko nije položio, prikažite 0 umesto NULL

## Šta dalje: zvanična dokumentacija i sledeće teme
- Zvanični vodič: postgresql.org/docs/current/tutorial.html
- Grafički alat: pgAdmin ili DBeaver
- Sledeće teme: transakcije, pogledi i normalizacija
- Iz programa: Python sa psycopg, JavaScript sa paketom pg

## Rezime: četiri stvari koje treba zapamtiti
1. Tabela ima kolone sa tipovima i primarni ključ
2. SELECT, WHERE i ORDER BY čitaju, biraju i ređaju redove
3. JOIN spaja tabele po ključu, a GROUP BY daje zbir po grupi
4. UPDATE i DELETE uvek idu uz WHERE
