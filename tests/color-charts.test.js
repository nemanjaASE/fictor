import { describe, it, expect } from 'vitest';
import { contrast, dominantColor, ensure, mix } from '../src/lib/color.js';
import { parseNum, fmtNum, niceScale, chartColorsFor } from '../src/graphics/charts.js';

describe('boje', () => {
  it('računa kontrast po WCAG formuli', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrast('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });
  it('ensure() zatamni boju dok ne dostigne traženi kontrast', () => {
    expect(contrast(ensure('#F5C842', '#FFFFFF', 4.5), '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });
  it('mix() meša boje', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });
});

describe('grafikoni', () => {
  it('čita i piše brojeve u srpskom formatu', () => {
    expect(parseNum('1.120')).toBe(1120);
    expect(parseNum('3,4')).toBe(3.4);
    expect(parseNum('12.5')).toBe(12.5);
    expect(parseNum('−41')).toBe(-41);
    expect(fmtNum(1120)).toBe('1.120');
    expect(fmtNum(3.4)).toBe('3,4');
    expect(fmtNum(-41)).toBe('−41');
  });
  it('bira lepu skalu ose', () => {
    expect(niceScale(0, 412)).toEqual({ lo: 0, hi: 500, step: 100 });
  });
  it('ističe izabranu kategoriju, a ostale boji sivo', () => {
    const p = { primary: '#1B365D', accent: '#9E2A2B', muted: '#5E5E5E', bg: '#FFFFFF', text: '#1A1A1A' };
    const cols = chartColorsFor({ type: 'stubici', highlight: 'B', cats: ['A', 'B'], series: [{ name: 'x', values: [1, 2] }] }, p);
    expect(cols[1]).toBe('#1B365D');
    expect(cols[0]).not.toBe('#1B365D');
  });
});

describe('boja sa logotipa', () => {
  const pixels = list => Uint8ClampedArray.from(list.flatMap(([hex, n, a = 255]) => {
    const v = parseInt(hex.slice(1), 16);
    return Array.from({ length: n }, () => [v >> 16 & 255, v >> 8 & 255, v & 255, a]).flat();
  }));

  it('bira izraženu boju, a belu, crnu, sivu i providnu preskače', () => {
    expect(dominantColor(pixels([['#FFFFFF', 500], ['#111111', 200], ['#7A1F3D', 80], ['#0E4C92', 300, 0]]))).toBe('#7A1F3D');
  });

  it('od dve boje bira onu koje ima više', () => {
    expect(dominantColor(pixels([['#0E4C92', 120], ['#C8102E', 40], ['#FFFFFF', 400]]))).toBe('#0E4C92');
  });

  it('za logo bez izražene boje vraća null', () => {
    expect(dominantColor(pixels([['#FFFFFF', 100], ['#808080', 100], ['#000000', 100]]))).toBe(null);
  });
});
