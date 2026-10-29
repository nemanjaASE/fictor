// Crtanje pregleda: slajdovi, poster ili A4 strane.
import { CITE_STYLES, buildCtx } from '../content/citations.js';
import { fcss } from '../core/fonts.js';
import { S } from '../core/state.js';
import { T } from '../core/text.js';
import { K, docBlocks, docType } from '../docs/blocks.js';
import { userMd } from '../content/markdown.js';
import { blockEl, coverEl } from '../docs/preview.js';
import { $, el, esc } from '../lib/dom.js';
import { poster, posterGeo } from '../poster/poster.js';
import { slideKinds, slides } from '../slides/deck.js';
import { activeTech } from '../content/tech.js';
import { DPI, G, ORDER, layouts } from '../slides/layout.js';
import { objEl, slideEl } from '../slides/preview.js';
import { edStatus } from './editor.js';
import { toast } from './toast.js';
import { lang, num, t } from './i18n.js';

/* ---------- prikaz ---------- */
// natpisi ispod pregleda: na srpskom prate izabrano pismo dokumenta
const capT = s => (lang === 'sr' ? T(s) : s);
export let lastSpec = '';
export function render() {
  buildCtx();
  const view = $('#view');
  const big = S.density === 'big';
  if (S.doc === 'slides') {
    const Ls = layouts(), list = slides(Ls), { W, H } = G();
    view.className = 'deck' + (big ? ' big' : '');
    view.style.cssText = '';
    const frag = document.createDocumentFragment();
    list.forEach((s, i) => {
      const L = Ls[s.layout], card = el('figure', 'card'), fr = el('div', 'frame');
      fr.style.aspectRatio = `${W} / ${H}`; fr.style.background = L.bg;
      fr.append(slideEl(L, s, i + 1)); card.append(fr); card.dataset.has = slideKinds(s).join(' ');
      const cap = el('figcaption', 'cap'); cap.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b><span>${esc(lang === 'sr' ? T(L.name) : t('layout.' + s.layout))}</span>`; card.append(cap);
      frag.append(card);
    });
    view.replaceChildren(frag);
    view.dataset.base = W * DPI;
    $('#stageTitle').textContent = activeTech(S) && !userMd('slides') ? t('title.tech', activeTech(S).name) : t('title.' + S.deck);
    lastSpec = t('spec.slides', list.length, S.ratio, num(W * 2.54, 2), num(H * 2.54, 2), ORDER.length);
    $('#tip').innerHTML = t('tip.slides');
  } else if (S.doc === 'poster') {
    const Pst = poster(), { land, mm } = posterGeo();
    view.className = 'deck big' + (land ? '' : ' poster-port');
    view.style.cssText = '';
    const card = el('figure', 'card'), fr = el('div', 'frame'), root = el('div', 'sl');
    fr.style.aspectRatio = `${Pst.W} / ${Pst.H}`; fr.style.background = Pst.bg;
    root.style.width = Pst.W * DPI + 'px'; root.style.height = Pst.H * DPI + 'px'; root.style.background = Pst.bg;
    Pst.objects.forEach(o => root.append(objEl(o)));
    fr.append(root); card.append(fr);
    const cap = el('figcaption', 'cap'); cap.innerHTML = `<b>${S.poster.size}</b><span>${esc(capT(t(land ? 'porient.land' : 'porient.port')))} · ${mm[0]} × ${mm[1]} mm</span>`; card.append(cap);
    view.replaceChildren(card);
    view.dataset.base = Pst.W * DPI;
    $('#stageTitle').textContent = 'Poster ' + S.poster.size;
    lastSpec = t('spec.poster', S.poster.size, mm[0], mm[1], land);
    $('#tip').innerHTML = t('tip.poster');
  } else {
    const k = K(), prav = S.opts.pravilnik;
    view.className = 'pages' + (big ? ' big' : '');
    view.style.cssText = `--d-text:${k.text};--d-muted:${k.muted};--d-primary:${k.primary};--d-onP:${k.onP};--d-soft:${k.soft};--d-accent:${k.accent};--d-accentText:${k.accentText};--d-surface:${k.surface};--d-hair:${k.hair};--d-head:${fcss(k.head)};--d-body:${fcss(k.body)};--d-mono:${fcss(S.fonts.mono)};--d-size:${prav ? '16px' : '14.67px'};--d-lh:${prav ? 1.72 : 1.4};--d-align:${prav ? 'justify' : 'left'}`;
    view.replaceChildren();
    view.dataset.base = 794;
    const pages = [];
    const page = (cover) => {
      const card = el('figure', 'card'), fr = el('div', 'frame'), pg = el('div', 'pg');
      fr.style.aspectRatio = '210 / 297'; fr.append(pg); card.append(fr);
      const cap = el('figcaption', 'cap'); card.append(cap); view.append(card);
      let body;
      if (cover) { body = coverEl(k); pg.append(body); }
      else {
        const hd = el('div', 'pg-hd'), a = el('span'), b = el('span');
        a.textContent = T(S.meta.title); b.textContent = T(docType()); hd.append(a, b);
        body = el('div', 'pg-body'); const ft = el('div', 'pg-ft');
        pg.append(hd, body, ft);
      }
      const P0 = { pg, body, cap, cover }; pages.push(P0); return P0;
    };
    page(true);
    let cur = page(false), n1 = 0, n2 = 0;
    for (const b of docBlocks()) {
      if (b.k === 'pagebreak') { if (cur.body.children.length) cur = page(false); continue; }
      let label = '';
      if (b.k === 'h1') { n1++; n2 = 0; label = n1 + '.'; } else if (b.k === 'h2') { n2++; label = `${n1}.${n2}.`; }
      const node = blockEl(b, label, k);
      cur.body.append(node);
      if (cur.body.scrollHeight > cur.body.clientHeight + 1 && cur.body.children.length > 1) {
        const moved = [node];
        let prev = node.previousElementSibling;
        while (prev && prev.dataset.keep && cur.body.children.length > moved.length + 1) { moved.unshift(prev); prev = prev.previousElementSibling; }
        cur = page(false);
        moved.forEach(x => cur.body.append(x));
      }
    }
    const content = pages.filter(x => !x.cover);
    // sadržaj u pregledu: naslovi i brojevi strana posle preloma
    const toc = view.querySelector('.d-toc');
    if (toc) content.forEach((pg, i) => pg.body.querySelectorAll('.d-h1, .d-h2').forEach(h => {
      const e = el('div', 'e' + (h.classList.contains('d-h2') ? ' l2' : ''));
      e.innerHTML = `<span class="t">${esc((h.dataset.n ? h.dataset.n + ' ' : '') + h.dataset.t)}</span><span class="d"></span><span class="pn">${i + 1}</span>`;
      toc.append(e);
    }));
    content.forEach((x, i) => { x.pg.querySelector('.pg-ft').textContent = T(`Strana ${i + 1} od ${content.length}`); });
    pages.forEach((x, i) => { x.cap.innerHTML = i === 0 ? `<b>01</b><span>${esc(capT(t('cap.cover')))}</span>` : `<b>${String(i + 1).padStart(2, '0')}</b><span>${esc(capT(t('cap.page', i)))}</span>`; });
    $('#stageTitle').textContent = t('title.' + S.doc);
    lastSpec = t('spec.docs', pages.length, CITE_STYLES[S.opts.cite], prav);
    $('#tip').innerHTML = t('tip.' + S.doc) + t('tip.docx');
  }
  $('#spec').textContent = lastSpec;
  fit();
  edStatus();
  if (focusKind) { const k = focusKind; focusKind = null; focusEl(k); }
}
// skok na prvi slajd ili deo strane sa izabranim elementom, posle sledećeg crtanja pregleda
let focusKind = null;
export const focusOn = k => { focusKind = k; };
const DOC_SEL = { table: '.d-tbl', chart: '.d-chart', list: '.d-list' };
function focusEl(k) {
  const view = $('#view'), hit = S.doc === 'slides' ? [...view.querySelectorAll('.card')].find(c => (c.dataset.has || '').split(' ').includes(k))
    : S.doc === 'poster' ? null : DOC_SEL[k] && view.querySelector(DOC_SEL[k]);
  if (hit) { hit.scrollIntoView({ block: 'center', behavior: 'smooth' }); hit.classList.remove('flash'); void hit.offsetWidth; hit.classList.add('flash'); }
  else if (S.doc !== 'poster') toast(t('jump.none', t('jump.' + k)));
}
export function fit() {
  const view = $('#view'), f = view.querySelector('.frame');
  if (!f) return;
  view.style.setProperty('--k', f.clientWidth / (+view.dataset.base || 1));
}
new ResizeObserver(() => fit()).observe($('#view'));
export let raf = 0;
export const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
