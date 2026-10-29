import { describe, it, expect } from 'vitest';
import { checkCommitMsg } from '../.githooks/commit-msg.mjs';

describe('poruke commit-a', () => {
  it('prihvata vrstu, oblast i opis', () => {
    expect(checkCommitMsg('feat(poster): add A2 size\n')).toEqual([]);
    expect(checkCommitMsg('fix: keep đ and ž in file names')).toEqual([]);
    expect(checkCommitMsg('feat(themes)!: new saved theme format\n\nOld themes are converted on load.\n')).toEqual([]);
  });
  it('preskače komentare iz šablona i razliku ispod makaza (git commit -v)', () => {
    const msg = '\n# type(scope): short summary\nperf(preview): draw only visible slides\n# Types: ...\n# ------------------------ >8 ------------------------\nan extremely long diff line that is not part of the message and is never counted at all\n';
    expect(checkCommitMsg(msg)).toEqual([]);
  });
  it('propušta poruke koje pravi sam git', () => {
    for (const m of ['Merge branch \'themes\'', 'Revert "feat(poster): add A2 size"', 'fixup! fix: fix spacing']) expect(checkCommitMsg(m)).toEqual([]);
  });
  it('odbija poruku bez vrste ili sa nepoznatom vrstom', () => {
    expect(checkCommitMsg('Fictor: first version')).toHaveLength(1);
    expect(checkCommitMsg('added a table')).toHaveLength(1);
    expect(checkCommitMsg('Feat: add table')).toHaveLength(1);
    expect(checkCommitMsg('feat:add table')).toHaveLength(1);
    expect(checkCommitMsg('feat(Poster): add A2')).toHaveLength(1);
  });
  it('broji znakove, ne bajtove, i odbija predugačak prvi red', () => {
    expect(checkCommitMsg('fix: ' + 'č'.repeat(67))).toEqual([]);
    expect(checkCommitMsg('fix: ' + 'č'.repeat(68))[0]).toMatch(/73 characters/);
  });
  it('odbija tačku na kraju, spojen opis i praznu poruku', () => {
    expect(checkCommitMsg('docs: describe deployment.')).toHaveLength(1);
    expect(checkCommitMsg('docs: describe deployment\nwhat and why')).toHaveLength(1);
    expect(checkCommitMsg('# only a comment\n\n')).toEqual(['The message is empty.']);
  });
});
