import { describe, expect, it } from 'vitest';
import { buildCtx } from '../src/content/citations.js';
import { S } from '../src/core/state.js';
import { minutesOf, slides, splitBackup } from '../src/slides/deck.js';
import { layouts } from '../src/slides/layout.js';

const MD = ['## Problem', '- Plan se bira prerano', '', '> Plan treba preispitati dok upit traje.', '', '## Rezultati', '- 3,4 puta brže',
  '# Dodatak', '## Parametri eksperimenta', '- LDBC SNB, 10 GB', '## Izbor plana u kodu', '- jedna funkcija'].join('\n');
// prezentacija iz sadržaja MD u izabranoj vrsti (odbrana, izlaganje)
const deck = (kind, meta = {}) => {
  const before = { deck: S.deck, tech: S.tech, md: S.content.slides, meta: { ...S.meta } };
  try {
    Object.assign(S, { deck: kind, tech: '' }); Object.assign(S.meta, meta); S.content.slides = MD; buildCtx();
    return slides(layouts());
  } finally { Object.assign(S, { deck: before.deck, tech: before.tech, meta: before.meta }); S.content.slides = before.md; }
};
const text = paras => (paras || []).map(p => (typeof p === 'string' ? p : p.runs.map(r => r.t).join(''))).join(' | ');

describe('odbrana rada', () => {
  it('naslovni slajd: vrsta rada iznad naslova, mentor i komisija', () => {
    const t = deck('odbrana', { workType: 'Master rad', committee: 'prof. dr Ana Anić\ndoc. dr Petar Perić' })[0];
    expect(t.fill.oznaka).toEqual(['MASTER RAD']);
    expect(text(t.fill.detalji)).toContain('Mentor: prof. dr Ime Prezime');
    expect(text(t.fill.detalji)).toContain('Komisija: prof. dr Ana Anić, doc. dr Petar Perić');
    // izlaganje i dalje ima predmet iznad naslova i bez komisije
    const i = deck('izlaganje')[0];
    expect(text(i.fill.detalji)).not.toContain('Komisija');
  });

  it('završni slajd su pitanja komisije, a „# Dodatak“ su rezervni slajdovi A1, A2 posle njega', () => {
    const list = deck('odbrana'), end = list.findIndex(s => s.layout === 'KRAJ');
    expect(text(list[end].fill.podnaslov)).toBe('Pitanja komisije');
    const after = list.slice(end + 1);
    expect(after[0]).toMatchObject({ layout: 'SEKCIJA' });
    expect(text(after[0].fill.title)).toBe('Rezervni slajdovi');
    expect(after.slice(1).map(s => text(s.fill.title))).toEqual(['A1 · Parametri eksperimenta', 'A2 · Izbor plana u kodu']);
    expect(after.slice(1).map(s => text(s.fill.oznaka))).toEqual(['DODATAK', 'DODATAK']);
    // pre završnog slajda nema rezervnih
    expect(list.slice(0, end).some(s => /Parametri/.test(text(s.fill.title)))).toBe(false);
  });

  it('kod izlaganja „# Dodatak“ ostaje obična celina pre završnog slajda', () => {
    const list = deck('izlaganje'), end = list.findIndex(s => s.layout === 'KRAJ');
    expect(text(list[end].fill.podnaslov)).toBe('Pitanja i diskusija');
    expect(end).toBe(list.length - 1);
    expect(list.some(s => /^A\d · /.test(text(s.fill.title)))).toBe(false);
  });

  it('beleške vode kroz vreme: plan, vreme po slajdu i kraj tačno na zadato vreme', () => {
    const list = deck('odbrana', { minutes: '12' }), end = list.findIndex(s => s.layout === 'KRAJ');
    expect(list[0].notes).toContain('plan je 12 min za 2 slajda');
    // malo slajdova za 12 minuta: upozorenje
    expect(list[0].notes).toContain('Slajdova je malo');
    for (const s of list.slice(1, end)) expect(s.notes).toMatch(/Vreme: oko .* za ovaj slajd/);
    expect(list[end - 1].notes).toContain('na oko 12 od 12 min');
    expect(list[end].notes).toContain('ovde treba da si na 12 min');
    for (const s of list.slice(end + 1)) expect(s.notes).toContain('Rezervni slajd');
    // ostale vrste prezentacija nemaju vodič za vreme
    expect(deck('izlaganje').some(s => /Vreme:/.test(s.notes))).toBe(false);
  });

  it('čita vreme i deli sadržaj na glavni deo i dodatak', () => {
    expect([minutesOf('20'), minutesOf(''), minutesOf('abc'), minutesOf('500')]).toEqual([20, 15, 15, 15]);
    const [main, backup] = splitBackup('## A\n# Prilog\n## B');
    expect(main).toBe('## A\n');
    expect(backup).toBe('\n## B');
    expect(splitBackup('## A')).toEqual(['## A', '']);
  });
});
