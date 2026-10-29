// Pravilo za poruke commit-a: Conventional Commits, na engleskom (README → Poruke commit-a).
// Git ga poziva kroz .githooks/commit-msg kad je uključeno: git config core.hooksPath .githooks
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];
export const MAX = 72;
const HEAD = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9-]+\\))?!?: \\S`);

// spisak grešaka; prazan znači da je poruka u redu
export function checkCommitMsg(text) {
  const all = text.replace(/\r/g, '').split('\n');
  // git commit -v: ispod linije sa makazama je razlika, ne poruka
  const cut = all.findIndex(l => l.startsWith('# ------------------------ >8'));
  const lines = (cut < 0 ? all : all.slice(0, cut)).filter(l => !l.startsWith('#'));
  const i = lines.findIndex(l => l.trim()), first = i < 0 ? '' : lines[i];
  // poruke koje pravi sam git ostaju kakve jesu
  if (/^(Merge|Revert) |^(fixup|squash|amend)! /.test(first)) return [];
  if (!first) return ['The message is empty.'];
  const err = [], len = [...first].length;
  if (!HEAD.test(first)) err.push('The first line must look like "type: summary" or "type(scope): summary", lowercase, with a space after the colon.');
  if (len > MAX) err.push(`The first line has ${len} characters; the limit is ${MAX}.`);
  if (/[.\s]$/.test(first)) err.push('The first line must not end with a period or a space.');
  if (lines[i + 1] !== undefined && lines[i + 1].trim()) err.push('Leave a blank line between the first line and the body.');
  return err;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const err = checkCommitMsg(fs.readFileSync(process.argv[2], 'utf8'));
  if (err.length) {
    console.error(['', 'Commit message does not follow the convention:', ...err.map(e => '  - ' + e), '',
      'Format:  type(scope): short summary',
      'Example: fix(pptx): fix spacing below table caption',
      'Types:   ' + TYPES.join(', '),
      'See README.md, section "Poruke commit-a".', ''].join('\n'));
    process.exit(1);
  }
}
