// Uređivač sopstvenog sadržaja (Markdown) i literature (BibTeX).
import { parseBib } from '../content/bibtex.js';
import { CTX } from '../content/citations.js';
import { BIB_EXAMPLE, mdExample } from '../content/examples.js';
import { userMd } from '../content/markdown.js';
import { S, persist } from '../core/state.js';
import { slug } from '../core/text.js';
import { offer } from '../export/save.js';
import { $, $$, esc } from '../lib/dom.js';
import { t } from './i18n.js';
import { render, schedule } from './render.js';
import { toast } from './toast.js';

/* ---------- uređivač sopstvenog sadržaja ---------- */
export const HELP = k => t('help.' + k);
export function edStatus() {
  const st = $('#edStatus'); if (!st) return;
  if (S.editTab === 'bib') {
    const n = (S.bib || '').trim() ? parseBib(S.bib).length : 0;
    st.innerHTML = n ? t('st.bib', n) : t('st.bibEmpty');
    return;
  }
  if (!userMd(S.doc)) { st.textContent = t('st.mdEmpty'); return; }
  let html = t('st.mine') + (CTX.listed.length ? t('st.cited', CTX.listed.length) : '');
  if (CTX.unknown.length) html += ` · <span class="warn">${t('st.unknown')}${esc(CTX.unknown.join(', '))}</span>`;
  st.innerHTML = html;
}
export let clearArm = 0;
export function syncEditor(force) {
  const on = !!S.editing, ta = $('#edText');
  $('#stage').classList.toggle('editing', on); $('#editor').hidden = !on;
  $$('#editmode button').forEach(b => b.setAttribute('aria-pressed', (b.dataset.edit === '1') === on));
  $$('#edtab button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === S.editTab));
  const val = S.editTab === 'bib' ? S.bib : S.content[S.doc] || '';
  if ((force || document.activeElement !== ta) && ta.value !== val) ta.value = val;
  ta.placeholder = S.editTab === 'bib' ? t('ed.phBib') : t('ed.phMd');
  $('#edSave span').textContent = S.editTab === 'bib' ? t('ed.saveTxt') : t('ed.saveMd');
  if (!clearArm) $('#edClear span').textContent = t('ed.clear');
  $('#edHelp').innerHTML = HELP(S.editTab === 'bib' ? 'bib' : S.doc === 'slides' ? 'slides' : S.doc === 'poster' ? 'poster' : 'doc');
  edStatus();
}
$('#editmode').addEventListener('click', e => { const b = e.target.closest('[data-edit]'); if (b) { S.editing = b.dataset.edit === '1'; persist(); syncEditor(true); schedule(); } });
$('#edtab').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { S.editTab = b.dataset.tab; persist(); syncEditor(true); } });
export let edT = 0;
export const edChanged = () => { clearTimeout(edT); edT = setTimeout(() => { persist(); render(); }, 300); };
$('#edText').addEventListener('input', e => { if (S.editTab === 'bib') S.bib = e.target.value; else S.content[S.doc] = e.target.value; edChanged(); });
$('#edText').addEventListener('keydown', e => {
  if (e.key !== 'Tab' || e.shiftKey || e.ctrlKey || e.altKey) return;
  e.preventDefault(); const t = e.target, a = t.selectionStart; t.setRangeText('    ', a, t.selectionEnd, 'end'); t.dispatchEvent(new Event('input'));
});
$('#edExample').addEventListener('click', () => {
  if (S.editTab === 'bib') S.bib = BIB_EXAMPLE;
  else { S.content[S.doc] = mdExample(); if (!(S.bib || '').trim()) S.bib = BIB_EXAMPLE; }
  persist(); syncEditor(true); render(); toast(t('ed.inserted'));
});
$('#edClear').addEventListener('click', () => {
  const b = $('#edClear'), lbl = $('#edClear span');
  if (!clearArm) { lbl.textContent = t('ed.confirm'); b.classList.add('armed'); clearArm = setTimeout(() => { clearArm = 0; lbl.textContent = t('ed.clear'); b.classList.remove('armed'); }, 3000); return; }
  clearTimeout(clearArm); clearArm = 0; lbl.textContent = t('ed.clear'); b.classList.remove('armed');
  if (S.editTab === 'bib') S.bib = ''; else S.content[S.doc] = '';
  persist(); syncEditor(true); render(); toast(t('ed.cleared'));
});
$('#edSave').addEventListener('click', () => {
  const bib = S.editTab === 'bib', text = bib ? S.bib : S.content[S.doc] || '';
  if (!text.trim()) { toast(t('ed.nothing')); return; }
  offer(slug(S.meta.title || 'sadrzaj') + (bib ? '-literatura.txt' : '-' + S.doc + '.md'), text);
});
$('#edOpen').addEventListener('click', () => $('#edFile').click());
$('#edFile').addEventListener('change', e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  file.text().then(txt => {
    if (/\.bib$/i.test(file.name) || S.editTab === 'bib') { S.bib = txt; S.editTab = 'bib'; } else S.content[S.doc] = txt;
    persist(); syncEditor(true); render(); toast(t('ed.loaded') + file.name);
  }).catch(() => toast(t('ed.readFail')));
});
