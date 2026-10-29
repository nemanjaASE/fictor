// Kratke poruke na dnu ekrana.
import { $ } from '../lib/dom.js';

/* ---------- toast ---------- */
export let tt = 0;
// duža poruka (npr. greška sa uputstvom) ostaje duže, da stigne da se pročita
export function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), Math.max(3200, String(msg).length * 60)); }
