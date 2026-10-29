import { describe, expect, it } from 'vitest';
import { highlight } from '../src/graphics/highlight.js';

const syn = { base: 'base', kw: 'kw', str: 'str', fn: 'fn', com: 'com' };
// tekst svakog dela sa oznakom boje, npr. "kw:fn"
const marks = (code, lang) => highlight(code, syn, lang).map(l => l.runs.filter(r => r.color).map(r => `${r.color}:${r.t.trim()}`));

describe('bojenje koda', () => {
  it('ne gubi ni jedan znak', () => {
    const code = 'fn main() {\n    println!("{}", 1); // x\n}';
    expect(highlight(code, syn, 'rust').map(l => l.runs.map(r => r.t).join('')).join('\n')).toBe(code.replace(/^$/gm, ' '));
  });
  it('python: ključne reči, dekorator, string i komentar', () => {
    const [a, b] = marks('@dataclass\ndef f(x="a"):  # k', 'python');
    expect(a).toEqual(['kw:@dataclass']);
    expect(b).toEqual(['kw:def', 'fn:f', 'str:"a"', 'com:# k']);
  });
  it('rust: atribut, makro i životni vek nije string', () => {
    const [a, b] = marks("#[derive(Debug)]\nlet s: &'a str = x!(1);", 'rs');
    expect(a).toEqual(['kw:#[derive(Debug)]']);
    expect(b).toContain('fn:x!');
    expect(b.some(m => m.startsWith('str:'))).toBe(false);
  });
  it('sql: ključne reči bez obzira na velika slova, komentar sa --', () => {
    expect(marks('select x from t -- k', 'sql')[0]).toEqual(['kw:select', 'kw:from', 'com:-- k']);
  });
  it('dockerfile i yaml', () => {
    expect(marks('FROM python:3.12 AS build', 'dockerfile')[0][0]).toBe('kw:FROM');
    expect(marks('  image: "nginx"', 'yml')[0]).toEqual(['kw:image', 'str:"nginx"']);
  });
  it('terminal: odziv, ime programa i ispis', () => {
    const [cmd, out, sql] = marks('$ docker ps -a\nCONTAINER ID\nbaza=# SELECT 1;', 'terminal');
    expect(cmd.slice(0, 2)).toEqual(['com:$', 'fn:docker']);
    expect(out).toEqual(['com:CONTAINER ID']);
    expect(sql).toContain('kw:SELECT');
  });
});
