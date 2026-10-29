import { describe, it, expect, beforeEach } from 'vitest';
import { S } from '../src/core/state.js';
import { typo, toCyr, T } from '../src/core/text.js';

describe('srpska tipografija', () => {
  it('pretvara navodnike, raspone, crtu i tri tačke', () => {
    expect(typo('Pogledaj "Uvod" - str. 12-15...')).toBe('Pogledaj „Uvod“ – str. 12–15…');
  });
  it('ostavlja raspon pre tačke rednog broja, ali ne dira datume ni verzije', () => {
    expect(typo('1-2. nedelja')).toBe('1–2. nedelja');
    expect(typo('2024-01-02')).toBe('2024-01-02');
    expect(typo('verzija 3.12-1')).toBe('verzija 3.12-1');
    expect(typo('opseg 1-2.5')).toBe('opseg 1-2.5');
  });
  it('stavlja tvrdi razmak pre jedinice mere', () => {
    expect(typo('10 GB i 25 %')).toBe('10 GB i 25 %');
    expect(typo('3 sata')).toBe('3 sata');
  });
});

describe('ćirilica', () => {
  it('preslovljava i dvoslove lj, nj, dž', () => {
    expect(toCyr('Ljubav, njiva, džep')).toBe('Љубав, њива, џеп');
    expect(toCyr('Đorđe Čačak Šabac Žabalj')).toBe('Ђорђе Чачак Шабац Жабаљ');
  });
  describe('T() poštuje izabrano pismo', () => {
    beforeEach(() => { S.opts.typo = true; });
    it('latinica', () => { S.opts.script = 'lat'; expect(T('Uvod')).toBe('Uvod'); });
    it('ćirilica', () => { S.opts.script = 'cyr'; expect(T('Uvod')).toBe('Увод'); S.opts.script = 'lat'; });
  });
});
