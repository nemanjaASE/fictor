import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { S } from '../src/core/state.js';
import { slug } from '../src/core/text.js';
import { LoadError, lazy } from '../src/export/load.js';

// statički uvozi od main.js (bez import()): sve što pregledač preuzima pri otvaranju stranice
const SRC = path.resolve(import.meta.dirname, '../src');
function startGraph() {
  const files = new Set(), pkgs = new Set(), todo = [path.join(SRC, 'main.js')];
  while (todo.length) {
    const f = todo.pop();
    if (files.has(f)) continue;
    files.add(f);
    for (const [, spec] of fs.readFileSync(f, 'utf8').matchAll(/^\s*(?:import\s+(?:[^;'"]*?from\s*)?|export\s[^;'"]*?from\s*)['"]([^'"]+)['"]/gm)) {
      if (!spec.startsWith('.')) { pkgs.add(spec); continue; }
      const p = path.resolve(path.dirname(f), spec.replace(/\?.*$/, ''));
      if (p.endsWith('.js') && fs.existsSync(p)) todo.push(p);
    }
  }
  return { files: [...files].map(f => path.relative(SRC, f).replaceAll('\\', '/')), pkgs: [...pkgs] };
}

describe('početni paket bez izvoza', () => {
  const { files, pkgs } = startGraph();
  it('graf obuhvata interfejs i lake delove izvoza', () => {
    expect(files).toEqual(expect.arrayContaining(['ui/controls.js', 'ui/editor.js', 'ui/render.js', 'export/load.js', 'export/save.js']));
    expect(pkgs).toEqual(expect.arrayContaining(['lucide', 'qrcode-generator']));
  });
  it('PptxGenJS, docx i JSZip se ne uvoze statički', () => {
    expect(files).not.toContain('export/pptx.js');
    expect(files).not.toContain('export/docx.js');
    for (const p of ['pptxgenjs', 'docx', 'jszip']) expect(pkgs).not.toContain(p);
  });
});

describe('učitavanje izvoza', () => {
  it('svi pozivi čekaju isto učitavanje', async () => {
    let n = 0;
    const load = lazy(async () => { n++; return { ok: 1 }; });
    expect(load.ready()).toBe(false);
    const [a, b] = await Promise.all([load(), load()]);
    expect(a).toBe(b);
    expect(n).toBe(1);
    expect(load.ready()).toBe(true);
  });
  it('greška daje LoadError, a sledeći poziv pokušava ponovo', async () => {
    let n = 0;
    const load = lazy(async () => { if (++n === 1) throw new TypeError('Failed to fetch dynamically imported module'); return { ok: 1 }; });
    const e = await load().catch(x => x);
    expect(e).toBeInstanceOf(LoadError);
    expect(e.cause).toBeInstanceOf(TypeError);
    expect(load.ready()).toBe(false);
    expect(await load()).toEqual({ ok: 1 });
    expect(n).toBe(2);
  });
});

describe('ime fajla (slug)', () => {
  beforeEach(() => { S.opts.script = 'lat'; });
  it('bez dijakritika, mala slova i crtice', () => {
    expect(slug('Optimizacija upita: Đurđevdan & ČŠŽ')).toBe('optimizacija-upita-djurdjevdan-csz');
    expect(slug('  --Šta je  novo?? ')).toBe('sta-je-novo');
    expect(slug('')).toBe('sablon');
  });
  it('ćirilica ostaje', () => {
    S.opts.script = 'cyr';
    expect(slug('Uvod u Git')).toBe('увод-у-гит');
    S.opts.script = 'lat';
  });
});
