// Svetla ili tamna tema interfejsa. Bez izbora prati podešavanje sistema; pregled dokumenata se ne menja.
import { $ } from '../lib/dom.js';
import { t } from './i18n.js';
import { setIcon } from './icons.js';

const KEY = 'fictor:ui-theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');
const stored = () => { try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; } };
export const isDark = () => (stored() || (media.matches ? 'dark' : 'light')) === 'dark';

export function syncTheme() {
  const pick = stored(), root = document.documentElement, btn = $('#themeBtn');
  if (pick) root.dataset.theme = pick; else root.removeAttribute('data-theme');
  const label = isDark() ? t('ui.toLight') : t('ui.toDark');
  setIcon(btn, isDark() ? 'sun' : 'moon');
  btn.setAttribute('aria-label', label); btn.title = label;
}
$('#themeBtn').addEventListener('click', () => {
  try { localStorage.setItem(KEY, isDark() ? 'light' : 'dark'); } catch (e) { /* bez lokalnog skladišta */ }
  syncTheme();
});
media.addEventListener('change', () => { if (!stored()) syncTheme(); });
