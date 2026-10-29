// Kartice bočne kolone: Tema, Boje, Fontovi, Raspored, Elementi, Podaci, Opcije (jedna vidljiva).
import { $, $$ } from '../lib/dom.js';

const KEY = 'fictor:ui-sec';
const tabs = () => $$('#secNav [role="tab"]');

export function showSection(id, focus = false) {
  if (!tabs().some(b => b.dataset.sec === id)) id = tabs()[0].dataset.sec;
  for (const b of tabs()) {
    const on = b.dataset.sec === id;
    b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
    $('#' + b.getAttribute('aria-controls')).hidden = !on;
    if (on && focus) b.focus();
  }
  $('#rail').scrollTop = 0;
  try { localStorage.setItem(KEY, id); } catch (e) { /* bez lokalnog skladišta */ }
}
$('#secNav').addEventListener('click', e => { const b = e.target.closest('[data-sec]'); if (b) showSection(b.dataset.sec); });
// strelice menjaju karticu, kao u svakoj listi kartica
$('#secNav').addEventListener('keydown', e => {
  const list = tabs(), i = list.indexOf(document.activeElement);
  if (i < 0) return;
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
  const to = step ? list[(i + step + list.length) % list.length] : e.key === 'Home' ? list[0] : e.key === 'End' ? list[list.length - 1] : null;
  if (to) { e.preventDefault(); showSection(to.dataset.sec, true); }
});
let start = null;
try { start = localStorage.getItem(KEY); } catch (e) { /* bez lokalnog skladišta */ }
showSection(start || 'tema');
