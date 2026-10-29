## Ciljevi: posle ovog časa moći ćete da
1. Objasnite razliku između slike i kontejnera
2. Pokrenete gotov kontejner i pratite njegove logove
3. Napišete Dockerfile i napravite sliku za svoj program
4. Pokrenete aplikaciju i bazu zajedno pomoću compose.yaml

Beleške: Ubrzani kurs za studente koji do sada nisu koristili Docker. Na kraju časa ponovi ciljeve kao rezime.

# Šta je Docker
Program i sve što mu treba, u jednom paketu

## Docker pakuje program sa okruženjem, pa radi isto na svakom računaru
### Dobar je za
- Isto okruženje na laptopu, serveru i u CI
- Pokretanje baze ili servisa jednom komandom
- Aplikacije od više delova, kao servis i baza
### Nije najbolji za
- Grafičke aplikacije za desktop
- Programe kojima treba direktan pristup hardveru
- Jednokratne skripte bez zavisnosti

Beleške: Kontejner nije virtuelna mašina: deli jezgro operativnog sistema sa računarom, pa se pokreće za sekundu.

## Instalaciju proverite pokretanjem prvog kontejnera
```terminal
$ docker --version
Docker version 27.3.1, build ce12230
$ docker run --rm hello-world
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

Beleške: Na Windows-u i macOS-u Docker radi kroz Docker Desktop, a na Linux-u se instalira Docker Engine. Opcija --rm briše kontejner kada se program završi.

# Osnove
Pet stvari koje su dovoljne za prve kontejnere

## Slika je recept, a kontejner pokrenut primerak slike
| Pojam | Šta je | Primer |
|---|---|---|
| Slika | šablon samo za čitanje | `python:3.12-slim` |
| Kontejner | pokrenuta slika | `docker ps` |
| Registar | mesto gde se čuvaju slike | `hub.docker.com` |
| Volumen | podaci koji ostaju | `docker volume ls` |
Tabela: Četiri pojma koja treba razlikovati

## Run pokreće kontejner, a -p i -e ga povezuju sa okolinom
Opcija `-p` prosleđuje port računara u kontejner, a `-e` zadaje promenljivu okruženja.

```terminal
$ docker run -d --name db -p 5432:5432 -e POSTGRES_PASSWORD=tajna postgres:17
$ docker ps
CONTAINER ID   IMAGE         STATUS         PORTS                    NAMES
3c1f0a9b2d7e   postgres:17   Up 5 seconds   0.0.0.0:5432->5432/tcp   db
$ docker logs db
$ docker stop db
```

Beleške: Ispis docker ps je skraćen. Opcija -d pokreće kontejner u pozadini, a logove tada čitaš sa docker logs.

## Dockerfile opisuje kako se pravi slika za vaš program
Program `ocene.py` je iz ubrzanog kursa za Python.

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY ocene.py ocene.txt ./

CMD ["python", "ocene.py"]
```

## Build pravi sliku, a run je pokreće
```terminal
$ docker build -t ocene:1.0 .
[+] Building 6.2s (8/8) FINISHED
$ docker run --rm ocene:1.0
Studenata: 6, položilo: 4, prosek položenih: 8.50
$ docker images ocene
REPOSITORY   TAG   IMAGE ID       CREATED          SIZE
ocene        1.0   4b1d2c3e5f60   10 seconds ago   153MB
```

Beleške: Ispis je skraćen. Tačka na kraju komande build je folder iz koga se kopiraju fajlovi.

## Slojevi se pamte, pa redosled u Dockerfile-u štedi vreme
```dockerfile
FROM python:3.12-slim
WORKDIR /app

# zavisnosti se menjaju retko: ovaj sloj se gradi jednom
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# kod se menja često, pa se kopira poslednji
COPY . .
CMD ["python", "ocene.py"]
```

Beleške: Fajl .dockerignore isključuje iz slike foldere kao .venv i .git, kao .gitignore u Git-u.

# U praksi
Aplikacija i baza zajedno

## compose.yaml opisuje sve servise aplikacije na jednom mestu
```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgres://postgres:tajna@db:5432/postgres
    depends_on: [db]
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: tajna
    volumes:
      - podaci:/var/lib/postgresql/data

volumes:
  podaci:
```

Beleške: Servis api je veb verzija programa za ocene, a db je PostgreSQL iz kursa za SQL. Servisi se vide po imenu: api se povezuje na bazu preko adrese db, bez IP adrese.

## Compose pokreće ceo sistem jednom komandom
```terminal
$ docker compose up -d
[+] Running 4/4
 ✔ Network ocene_default   Created
 ✔ Volume "ocene_podaci"   Created
 ✔ Container ocene-db-1    Started
 ✔ Container ocene-api-1   Started
$ docker compose logs -f api
$ docker compose down
```

## Najčešće greške imaju poruku koja kaže gde da tražite
| Poruka | Uzrok | Rešenje |
|---|---|---|
| `Cannot connect to the Docker daemon` | Docker nije pokrenut | pokreni Docker Desktop |
| `port is already allocated` | port zauzima drugi program | promeni levi broj u -p |
| `pull access denied` | pogrešno ime slike | proveri ime i oznaku slike |
| `failed to compute cache key` | fajla nema u folderu | pokreni build u folderu projekta |
| `exited with code 1` | program u kontejneru je pao | pročitaj docker logs |
Tabela: Poruke Docker-a koje studenti najčešće vide

## Pitanje za vas
> Šta se desi sa podacima u bazi posle docker compose down, a šta posle down -v?

Razmislite minut, pa uporedite odgovor sa kolegom do sebe.

## Podsetnik: najvažnije sa ovog časa
| Šta | Kako |
|---|---|
| Pokretanje | `docker run -d -p 8000:8000 slika` |
| Spisak | `docker ps -a` |
| Logovi | `docker logs -f ime` |
| Zaustavljanje | `docker stop ime` |
| Ulazak u kontejner | `docker exec -it ime sh` |
| Pravljenje slike | `docker build -t ime:1.0 .` |
| Slike | `docker images` |
| Ceo sistem | `docker compose up -d` |
| Gašenje | `docker compose down` |
| Čišćenje | `docker system prune` |
Tabela: Podsetnik za Docker

Beleške: Ovaj slajd studenti najčešće fotografišu. Ostavi ga na ekranu dok zadaješ zadatak.

## Zadatak za vežbe
1. Napravite sliku za program `ocene.py` i pokrenite je
2. Promenite `ocene.txt` i proverite koji se sloj ponovo gradi
3. Dodajte bazu u `compose.yaml` i pokrenite sve sa `docker compose up`
4. Proverite da podaci ostaju posle `docker compose down` i `up`

## Šta dalje: zvanični vodič i sledeće teme
- Zvanični vodič: docs.docker.com/get-started
- Gotove slike: hub.docker.com, sa oznakom Docker Official Image
- Sledeće teme: višefazni build, healthcheck i tajne
- Posle Docker-a: Kubernetes za mnogo kontejnera na više računara

## Rezime: četiri stvari koje treba zapamtiti
1. Slika je recept, a kontejner njen pokrenut primerak
2. Dockerfile opisuje sliku, a docker build je pravi
3. Redosled slojeva određuje šta se ponovo gradi
4. compose.yaml pokreće ceo sistem jednom komandom
