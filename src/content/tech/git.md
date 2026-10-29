## Ciljevi: posle ovog časa moći ćete da
1. Napravite repozitorijum i sačuvate izmene kao commit
2. Pročitate istoriju i vratite raniju verziju fajla
3. Radite na grani i spojite je sa glavnom
4. Pošaljete izmene na GitHub i otvorite pull request

Beleške: Ubrzani kurs za studente koji do sada nisu koristili Git. Na kraju časa ponovi ciljeve kao rezime.

# Šta je Git
Istorija projekta, na vašem računaru

## Git pamti svaku sačuvanu verziju projekta i ko ju je napravio
### Dobar je za
- Kod i tekstualne fajlove
- Rad više ljudi na istom projektu
- Vraćanje na bilo koju raniju verziju
### Nije najbolji za
- Velike binarne fajlove, kao video i skupove podataka
- Lozinke i tajne ključeve
- Fajlove koje pravi alat pri prevođenju

Beleške: Git radi lokalno, bez interneta. GitHub je servis koji čuva kopiju repozitorijuma i dodaje pregled izmena.

## Git se podešava jednom, a projekat počinje sa git init
```terminal
$ git config --global user.name "Ime Prezime"
$ git config --global user.email "ime.prezime@fakultet.rs"
$ git config --global init.defaultBranch main
$ mkdir ocene
$ cd ocene
$ git init
Initialized empty Git repository in /home/ana/ocene/.git/
```

Beleške: Git se instalira sa git-scm.com. Ime i e-pošta se upisuju u svaki commit.

# Osnove
Pet stvari koje su dovoljne za svakodnevni rad

## Izmena prolazi tri mesta: radni folder, pripremu i istoriju
| Mesto | Šta je tu | Komanda koja vodi dalje |
|---|---|---|
| Radni folder | fajlovi koje menjate | `git add` |
| Priprema | izmene za sledeći commit | `git commit` |
| Istorija | sačuvani commit-ovi | `git push` |
Tabela: Put jedne izmene kroz Git

Beleške: Priprema (staging) dozvoljava da u jedan commit stavite samo deo izmena.

## Status pokazuje šta je izmenjeno, a commit čuva izmenu
```terminal
$ git status --short
?? ocene.py
$ git add ocene.py
$ git commit -m "Dodaj računanje proseka"
[main (root-commit) 3f2a91c] Dodaj računanje proseka
 1 file changed, 13 insertions(+)
 create mode 100644 ocene.py
$ git status
On branch main
nothing to commit, working tree clean
```

Beleške: Poruka commit-a je kratka rečenica u imperativu: šta izmena radi, ne šta ste vi radili.

## Log prikazuje istoriju, a diff tačne izmene
```terminal
$ git log --oneline
b7c41e0 Vrati poruku kada niko nije položio
3f2a91c Dodaj računanje proseka
$ git diff 3f2a91c b7c41e0
     polozeno = [o for o in ocene if o >= 6]
+    if not polozeno:
+        return "Niko nije položio"
```

Beleške: Ispis je skraćen. Red sa + je dodat, sa - obrisan, a red bez znaka je okolina izmene.

## Izmena se vraća bez straha: restore za fajl, revert za commit
```terminal
$ git restore ocene.py
$ git restore --staged ocene.py
$ git revert --no-edit b7c41e0
[main 9d04e1a] Revert "Vrati poruku kada niko nije položio"
 1 file changed, 2 deletions(-)
```

Beleške: restore odbacuje nepripremljene izmene u fajlu, restore --staged vraća fajl iz pripreme, a revert pravi novi commit koji poništava stari. Istorija se ne briše.

## Fajl .gitignore isključuje ono što ne pripada istoriji
Git ne prati fajlove i foldere koji se poklapaju sa redovima iz `.gitignore`.

```gitignore
# .gitignore
__pycache__/
.venv/
*.log
.env
```

Beleške: Fajl .env obično sadrži lozinke. Ako je jednom poslat na GitHub, lozinku treba promeniti, jer ostaje u istoriji.

# U praksi
Rad na grani i deljenje izmena

## Grana je odvojena linija rada, a main ostaje ispravan
```terminal
$ git switch -c prazna-lista
Switched to a new branch 'prazna-lista'
$ git commit -am "Ispiši poruku za praznu listu ocena"
[prazna-lista 5e8d2b4] Ispiši poruku za praznu listu ocena
 1 file changed, 2 insertions(+)
$ git switch main
Switched to branch 'main'
$ git merge prazna-lista
Updating 9d04e1a..5e8d2b4
Fast-forward
```

## Konflikt nastaje kada dve grane menjaju isti red
Izaberite verziju, obrišite oznake, pa `git add` i `git commit`.

```python ocene.py
<<<<<<< HEAD
    return f"Prosek: {prosek:.2f}"
=======
    return f"Prosek položenih: {prosek:.1f}"
>>>>>>> prazna-lista
```

## GitHub čuva kopiju, a pull request je mesto za pregled izmena
Posle `git push` na GitHub-u otvorite pull request: kolega pregleda izmene i komentariše pre spajanja u main.

```terminal
$ git remote add origin https://github.com/korisnik/ocene.git
$ git push -u origin prazna-lista
$ git switch main
$ git pull
```

## Najčešće poruke Git-a kažu i šta treba uraditi
| Poruka | Uzrok | Rešenje |
|---|---|---|
| `not a git repository` | komanda van foldera projekta | uđi u folder ili pokreni git init |
| `nothing added to commit` | izmene nisu pripremljene | prvo git add, pa git commit |
| `CONFLICT (content)` | dve grane menjaju isti red | izaberi verziju, pa add i commit |
| `rejected (fetch first)` | na serveru ima novih izmena | git pull, pa ponovo git push |
| `detached HEAD` | izabran je stari commit | vrati se sa git switch main |
Tabela: Poruke Git-a koje studenti najčešće vide

## Pitanje za vas
> Zašto je bolje napraviti granu za svaku izmenu nego raditi direktno na main?

Razmislite minut, pa uporedite odgovor sa kolegom do sebe.

## Podsetnik: najvažnije sa ovog časa
| Šta | Kako |
|---|---|
| Novi repozitorijum | `git init` |
| Stanje | `git status` |
| Priprema | `git add ocene.py` |
| Čuvanje | `git commit -m "Dodaj prosek"` |
| Istorija | `git log --oneline` |
| Razlike | `git diff` |
| Nova grana | `git switch -c ime-grane` |
| Spajanje | `git merge ime-grane` |
| Slanje | `git push` |
| Preuzimanje | `git pull` |
Tabela: Podsetnik za Git

Beleške: Ovaj slajd studenti najčešće fotografišu. Ostavi ga na ekranu dok zadaješ zadatak.

## Zadatak za vežbe
1. Napravite repozitorijum `ocene` sa programom iz kursa
2. Napravite tri commit-a sa jasnim porukama
3. Na grani `najbolja-ocena` dodajte najbolju ocenu i spojite je u main
4. Pošaljite repozitorijum na GitHub i otvorite pull request

## Šta dalje: zvanična knjiga i sledeće teme
- Zvanična knjiga: git-scm.com/book
- Vežba grana u pregledaču: learngitbranching.js.org
- Sledeće teme: rebase, tagovi i GitHub Actions
- Poruka commit-a: kratka rečenica u imperativu

## Rezime: četiri stvari koje treba zapamtiti
1. Izmena ide u pripremu sa add, a u istoriju sa commit
2. log i diff pokazuju istoriju, a restore i revert vraćaju izmene
3. Grana čuva main ispravnim dok izmena nije gotova
4. push šalje izmene na GitHub, a pull request je mesto za pregled
