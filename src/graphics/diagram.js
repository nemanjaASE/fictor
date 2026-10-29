// Primer dijagrama arhitekture, nacrtan na canvas-u.
import { fcss } from '../core/fonts.js';
import { S } from '../core/state.js';
import { T } from '../core/text.js';
import { ensure, mix } from '../lib/color.js';
import { P } from '../slides/layout.js';

/* ---------- slika arhitekture (canvas) ---------- */
export const dgCache = new Map();
export function rrect(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
export function arrow(g, x1, y1, x2, y2, color, s) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = s * 0.16;
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2 - Math.cos(a) * s * 0.5, y2 - Math.sin(a) * s * 0.5); g.stroke();
  g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)); g.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)); g.closePath(); g.fill();
}
export function diagram(wIn, hIn, pp) {
  const p = pp || P();
  const key = [wIn.toFixed(2), hIn.toFixed(2), p.primary, p.accent, p.text, p.muted, p.bg, p.surface, S.fonts.heading, S.fonts.body, S.corners, S.opts.script].join('|');
  if (dgCache.has(key)) return dgCache.get(key);
  const cw = Math.round(Math.min(2800, Math.max(1400, wIn * 200))), ch = Math.round(cw * hIn / wIn);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  const g = cv.getContext('2d'), round = S.corners === 'round';
  g.fillStyle = p.surface; rrect(g, 0, 0, cw, ch, round ? 34 : 0); g.fill();
  const nodes = [[T('Upit'), T('parsiranje')], [T('Optimizator'), T('izbor plana')], [T('Izvršni sloj'), T('izvršavanje')]];
  const horiz = cw / ch > 1.25, s = Math.min(cw, ch);
  let boxes;
  if (horiz) {
    const pad = cw * 0.06, gap = cw * 0.075, bw = (cw - 2 * pad - 2 * gap) / 3, bh = Math.min(ch * 0.3, bw * 0.62), y = ch * 0.4 - bh / 2;
    boxes = nodes.map((_, i) => ({ x: pad + i * (bw + gap), y, w: bw, h: bh }));
  } else {
    const pad = ch * 0.07, gap = ch * 0.08, bh = (ch - 2 * pad - 2 * gap) / 3, bw = Math.min(cw * 0.56, bh * 2.4), x = cw * 0.42 - bw / 2;
    boxes = nodes.map((_, i) => ({ x, y: pad + i * (bh + gap), w: bw, h: bh }));
  }
  const ah = s * 0.035, fb = ensure(p.accent, p.surface, 3);
  for (let i = 0; i < 2; i++) {
    const a = boxes[i], b = boxes[i + 1];
    if (horiz) arrow(g, a.x + a.w + ah * 0.4, a.y + a.h / 2, b.x - ah * 0.4, b.y + b.h / 2, p.muted, ah);
    else arrow(g, a.x + a.w / 2, a.y + a.h + ah * 0.4, b.x + b.w / 2, b.y - ah * 0.4, p.muted, ah);
  }
  // povratna sprega: statistike iz izvršnog sloja nazad u optimizator
  const a = boxes[2], b = boxes[1];
  g.save(); g.setLineDash([s * 0.02, s * 0.014]); g.strokeStyle = fb; g.lineWidth = ah * 0.16; g.beginPath();
  let lx, ly, ex, ey;
  if (horiz) {
    const y0 = a.y + a.h + ah * 0.6, dip = ch * 0.2;
    g.moveTo(a.x + a.w / 2, y0); g.bezierCurveTo(a.x + a.w / 2, y0 + dip, b.x + b.w / 2, y0 + dip, b.x + b.w / 2, y0 + ah * 0.9);
    ex = b.x + b.w / 2; ey = y0; lx = (a.x + b.x + b.w) / 2 + b.w * 0.05; ly = y0 + dip * 0.95;
  } else {
    const x0 = a.x + a.w + ah * 0.6, bulge = cw * 0.14;
    g.moveTo(x0, a.y + a.h / 2); g.bezierCurveTo(x0 + bulge, a.y + a.h / 2, x0 + bulge, b.y + b.h / 2, x0 + ah * 0.9, b.y + b.h / 2);
    ex = x0; ey = b.y + b.h / 2; lx = x0 + bulge * 0.9; ly = (a.y + b.y + b.h) / 2 + a.h * 0.12;
  }
  g.stroke(); g.restore();
  if (horiz) arrow(g, ex, ey + ah * 1.2, ex, ey, fb, ah); else arrow(g, ex + ah * 1.2, ey, ex, ey, fb, ah);
  // natpis povratne sprege: prelomi u dva reda ako je preširok i drži ga unutar slike
  const fsz = Math.round(s * 0.034), label = T('statistike tokom izvršavanja');
  g.font = `600 ${fsz}px ${fcss(S.fonts.body)}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  let lines = [label];
  const room = horiz ? cw * 0.6 : cw * 0.34;
  if (g.measureText(label).width > room) { const w = label.split(' '), h = Math.ceil(w.length / 2); lines = [w.slice(0, h).join(' '), w.slice(h).join(' ')]; }
  const lw = Math.max(...lines.map(t => g.measureText(t).width)), lh = fsz * 1.25, padX = fsz * 0.5;
  lx = Math.min(Math.max(lx, lw / 2 + padX + 8), cw - lw / 2 - padX - 8);
  g.fillStyle = p.surface; rrect(g, lx - lw / 2 - padX, ly - lh * lines.length / 2 - fsz * 0.25, lw + 2 * padX, lh * lines.length + fsz * 0.5, fsz * 0.4); g.fill();
  g.fillStyle = fb; lines.forEach((t, i) => g.fillText(t, lx, ly + (i - (lines.length - 1) / 2) * lh));
  boxes.forEach((bx, i) => {
    const mid = i === 1, r = round ? s * 0.025 : 0;
    g.fillStyle = mid ? p.primary : p.bg; rrect(g, bx.x, bx.y, bx.w, bx.h, r); g.fill();
    if (!mid) { g.strokeStyle = p.hair; g.lineWidth = 3; rrect(g, bx.x, bx.y, bx.w, bx.h, r); g.stroke(); }
    const fs = Math.min(bx.h * 0.24, bx.w * 0.12);
    g.fillStyle = mid ? p.onP : p.text; g.font = `700 ${Math.round(fs)}px ${fcss(S.fonts.heading)}`;
    g.fillText(nodes[i][0], bx.x + bx.w / 2, bx.y + bx.h * 0.42);
    g.fillStyle = mid ? mix(p.onP, p.primary, 0.3) : p.muted; g.font = `400 ${Math.round(fs * 0.68)}px ${fcss(S.fonts.body)}`;
    g.fillText(nodes[i][1], bx.x + bx.w / 2, bx.y + bx.h * 0.68);
  });
  const url = cv.toDataURL('image/png');
  dgCache.set(key, url); if (dgCache.size > 24) dgCache.delete(dgCache.keys().next().value);
  return url;
}
