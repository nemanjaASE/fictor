// Kontrole u bočnoj koloni: teme, boje, fontovi, podaci, logo, preuzimanje.
import { cite } from '../content/citations.js';
import { CUSTOM, TECH, activeTech } from '../content/tech.js';
import { FONTS, MONO, fcss } from '../core/fonts.js';
import { S, defaults, persist, sanitize, setState } from '../core/state.js';
import { slug } from '../core/text.js';
import { COLOR_FIELDS, GROUPS, PRESETS, STYLES } from '../core/themes.js';
import { docType } from '../docs/blocks.js';
import { LoadError, loadDocx, loadPptx } from '../export/load.js';
import { offer } from '../export/save.js';
import { chartCache, chartObj, drawChart } from '../graphics/charts.js';
import { CODE_IDS, TERM_IDS, codePalette, terminalParas, termPalette } from '../graphics/code-styles.js';
import { CHART_STYLES, LIST_STYLES, QUOTE_STYLES, STAT_STYLES, TABLE_STYLES, activeSet, applySet, listLook, statLook, tableCell, tableColors, tableShapes, themeSet } from '../graphics/data-styles.js';
import { dgCache } from '../graphics/diagram.js';
import { fetchMark, hasMark, markSvg } from '../graphics/marks.js';
import { contrast, dominantColor, ensure, fromHsl, isHex, lum, mix, normHex, onColor, toHsl } from '../lib/color.js';
import { $, $$, esc } from '../lib/dom.js';
import { P } from '../slides/layout.js';
import { syncEditor } from './editor.js';
import { lang, num, setLang, t } from './i18n.js';
import { icon } from './icons.js';
import { focusOn, schedule } from './render.js';
import { toast } from './toast.js';

/* ---------- kontrole (pravi ih ponovo i promena jezika) ---------- */
export const presetMini = pr => `<span class="mini mini-${pr.style}" style="--p:${pr.colors.primary};--a:${pr.colors.accent};--b:${pr.colors.bg};--t:${pr.colors.text};--o:${onColor(pr.colors.primary)}"><i></i><i></i><i></i></span>`;
export const fontOptions = (list) => {
  // od najbezbednijih za PowerPoint: Office ih sam preuzima, Windows i Office, pa fontovi koje treba instalirati
  const grp = (srcs, label) => `<optgroup label="${label}">` + Object.entries(list).filter(([, f]) => srcs.includes(f.src)).map(([n]) => `<option value="${esc(n)}">${esc(n)}</option>`).join('') + '</optgroup>';
  return grp(['c'], t('font.c')) + grp(['w', 'o'], t('font.w')) + grp(['g'], t('font.g'));
};
export function buildControls() {
  // gotove teme po sekcijama; ispod imena piše čemu tema služi, a fontovi su u opisu
  const card = k => {
    const pr = PRESETS[k], [name, note] = t('preset.' + k);
    return `<button type="button" class="preset" id="pr-${k}" data-preset="${k}" aria-pressed="false" title="${esc(name)}: ${esc(note)} (${esc(pr.fonts.heading)} / ${esc(pr.fonts.body)})">${presetMini(pr)}<span class="pn">${esc(name)}</span><span class="pf">${esc(t('use.' + k))}</span></button>`;
  };
  $('#presets').innerHTML = GROUPS.map(([g, ids]) => `<div class="look-sec"><span class="look-h">${esc(t('look.g.' + g))}</span><div class="presets">${ids.map(card).join('')}</div></div>`).join('');
  // tvoje boje: boje izabrane tehnologije (ostale su skrivene); boje fakulteta su ispod, u index.html
  $('#techLooks').innerHTML = Object.entries(TECH).map(([k, tc]) =>
    `<button type="button" class="preset" data-techlook="${k}" aria-pressed="false" hidden title="${esc(tc.name)}: ${esc(t('look.tech'))}">${presetMini(tc.look)}<span class="pn">${esc(tc.name)}</span><span class="pf">${esc(t('look.tech'))}</span></button>`).join('');
  $('#colors').innerHTML = COLOR_FIELDS.map(([k]) => {
    const [l, d] = t('color.' + k);
    return `<div class="crow"><label class="sw" title="${esc(t('color.pick', l))}"><span></span><input type="color" id="c-${k}" data-color="${k}" aria-label="${esc(l)}"></label><div class="cl"><b>${esc(l)}</b><small>${esc(d)}</small></div><input class="hex" id="h-${k}" data-hex="${k}" aria-label="${esc(t('color.hex', l))}" spellcheck="false" autocomplete="off" maxlength="7"></div>`;
  }).join('');
  $('#f-heading').innerHTML = fontOptions(FONTS); $('#f-body').innerHTML = fontOptions(FONTS); $('#f-mono').innerHTML = fontOptions(MONO);
  const mark = k => (k ? markSvg(k) : '<span class="tsw"></span>');
  // poslednje dugme je jezik koji korisnik unese sam; njegov znak i naziv osvežava sync()
  // terminal: kartice sa malim pregledom, kao kartice tema; boje upisuje sync()
  // tabele i grafikoni: kartice sa malim pregledom u bojama teme; sliku crta sync()
  const dcard = (attr, k, key) => `<button type="button" class="tcard" ${attr}="${k}" aria-pressed="false" title="${esc(t(key + k))}"><span class="dmini"></span><span class="pn">${esc(t(key + k))}</span></button>`;
  $('#tableStyle').innerHTML = TABLE_STYLES.map(k => dcard('data-tbl', k, 'tbl.')).join('');
  $('#chartStyle').innerHTML = CHART_STYLES.map(k => dcard('data-chs', k, 'chs.')).join('');
  $('#listStyle').innerHTML = LIST_STYLES.map(k => dcard('data-lst', k, 'lst.')).join('');
  $('#quoteStyle').innerHTML = QUOTE_STYLES.map(k => dcard('data-qt', k, 'qt.')).join('');
  $('#statStyle').innerHTML = STAT_STYLES.map(k => dcard('data-stt', k, 'stt.')).join('');
  // kod: kartice sa malim pregledom koda u editoru; boje upisuje sync()
  $('#codeStyle').innerHTML = CODE_IDS.map(k => `<button type="button" class="tcard" data-code="${k}" aria-pressed="false"><span class="emini"></span><span class="pn">${esc(t('code.' + k))}</span></button>`).join('');
  $('#termStyle').innerHTML = TERM_IDS.map(k => `<button type="button" class="tcard" data-term="${k}" aria-pressed="false"><span class="emini"></span><span class="pn">${esc(t('term.' + k))}</span></button>`).join('');
  $('#techs').innerHTML = [['', null], ...Object.entries(TECH)].map(([k, tc]) =>
    `<button type="button" class="tech" data-tech="${k}" aria-pressed="false">${mark(k)}${esc(tc ? tc.name : t('tech.none'))}</button>`).join('') +
    `<button type="button" class="tech" data-tech="${CUSTOM}" aria-pressed="false"></button>`;
  $('#styles').innerHTML = STYLES.map(([k]) => `<button type="button" class="stc" id="st-${k}" data-style="${k}" aria-pressed="false"><span class="mini mini-${k}"><i></i><i></i><i></i></span>${esc(t('style.' + k))}</button>`).join('');
}
buildControls();

/* „Moj fakultet“: cela paleta iz jedne boje */
export function facultyPalette(hex) {
  const base = normHex(hex), primary = ensure(base, '#FFFFFF', 4.5), [h, s] = toHsl(primary), darkened = primary !== base;
  return {
    darkened,
    colors: {
      primary,
      accent: darkened ? base : fromHsl(h + 28, Math.min(s * 0.6, 0.55), 0.42),
      text: fromHsl(h, Math.min(s, 0.3) * 0.5, 0.11),
      muted: fromHsl(h, Math.min(s, 0.25) * 0.4, 0.40),
      bg: '#FFFFFF',
      surface: fromHsl(h, Math.min(s, 0.35) * 0.5, 0.955),
    },
  };
}
export function facSync() {
  const c = $('#fac-color'), h = $('#fac-hex');
  c.value = S.faculty.toLowerCase(); c.parentElement.style.setProperty('--c', S.faculty);
  if (document.activeElement !== h) { h.value = S.faculty; h.removeAttribute('aria-invalid'); }
  // paleta pre primene i dugme koje kaže na koju temu se boje primenjuju
  const r = facultyPalette(S.faculty), base = S.preset ? t('preset.' + S.preset)[0] : S.techLook && TECH[S.tech] ? TECH[S.tech].name : '';
  $('#fac-prev').innerHTML = ['primary', 'accent', 'text', 'muted', 'surface'].map(k => `<span style="background:${r.colors[k]}" title="${esc(t('color.' + k)[0])}"></span>`).join('');
  $('#fac-note').textContent = r.darkened ? t('fac.darkened') : ''; $('#fac-note').hidden = !r.darkened;
  $('#fac-logo').hidden = !S.logo;
  $('#fac-apply').textContent = S.fromFaculty ? t('fac.reapply') : base ? t('fac.applyTo', base) : t('fac.apply');
}
// naziv teme u fajlovima (paleta u PowerPoint-u, ime .json fajla) ostaje na srpskom
export const themeLabel = () => (S.preset ? PRESETS[S.preset].name : S.fromFaculty ? 'Boje fakulteta' : S.techLook && TECH[S.tech] ? TECH[S.tech].name : 'Prilagođena');
const uiThemeLabel = () => (S.preset ? t('preset.' + S.preset)[0] : S.fromFaculty ? t('theme.faculty') : S.techLook && TECH[S.tech] ? TECH[S.tech].name : t('theme.custom'));
export function chips() {
  const c = S.colors, out = [];
  const add = (label, a, b, min) => { const r = contrast(a, b); out.push(`<span class="chip${r < min ? ' warn' : ''}" title="${esc(t('chip.min', num(min)))}">${r < min ? '!' : '✓'} ${label} ${num(r)}:1</span>`); };
  add(t('chip.text'), c.text, c.bg, 4.5);
  add(t('chip.muted'), c.muted, c.bg, 4.5);
  add(t('chip.onP'), onColor(c.primary), c.primary, 4.5);
  return out.join('');
}
export function sync() {
  const c = S.colors, a = document.activeElement;
  $$('#docSwitch button').forEach(b => b.setAttribute('aria-pressed', b.dataset.doc === S.doc));
  if (!$('#dlBtn').disabled) $('#dlLabel').textContent = S.doc === 'slides' || S.doc === 'poster' ? t('dl.pptx') : t('dl.docx');
  $$('#langSwitch button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
  $$('[data-preset]').forEach(b => b.setAttribute('aria-pressed', b.dataset.preset === S.preset));
  $$('[data-techlook]').forEach(b => { b.hidden = b.dataset.techlook !== S.tech; b.setAttribute('aria-pressed', S.techLook && b.dataset.techlook === S.tech); });
  $('#presetName').textContent = uiThemeLabel();
  for (const [k] of COLOR_FIELDS) {
    const ci = $('#c-' + k), hi = $('#h-' + k);
    ci.value = c[k].toLowerCase(); ci.parentElement.style.setProperty('--c', c[k]);
    if (a !== hi) { hi.value = c[k]; hi.removeAttribute('aria-invalid'); }
  }
  $('#checks').innerHTML = chips();
  for (const k of ['heading', 'body', 'mono']) {
    const sel = $('#f-' + k); sel.value = S.fonts[k];
    const f = (k === 'mono' ? MONO : FONTS)[S.fonts[k]], src = $('#s-' + k);
    src.className = 'src ' + f.src;
    if (f.src === 'g') src.innerHTML = `${t('src.g')} · <a href="https://fonts.google.com/specimen/${encodeURIComponent(S.fonts[k]).replace(/%20/g, '+')}" target="_blank" rel="noopener">${t('src.get')}</a>`;
    else src.textContent = t('src.' + f.src);
  }
  const rail = $('#rail');
  rail.style.setProperty('--p', c.primary); rail.style.setProperty('--a', c.accent); rail.style.setProperty('--b', c.bg); rail.style.setProperty('--t', c.text); rail.style.setProperty('--o', onColor(c.primary));
  $$('.stc').forEach(b => b.setAttribute('aria-pressed', b.dataset.style === S.style));
  $$('#ratio button').forEach(b => b.setAttribute('aria-pressed', b.dataset.ratio === S.ratio));
  $$('#corners button').forEach(b => b.setAttribute('aria-pressed', b.dataset.corners === S.corners));
  $$('#script button').forEach(b => b.setAttribute('aria-pressed', b.dataset.script === S.opts.script));
  $$('#density button').forEach(b => b.setAttribute('aria-pressed', b.dataset.density === S.density));
  $$('[data-meta]').forEach(i => { if (i !== a) i.value = i.dataset.meta === 'docType' ? docType() : (S.meta[i.dataset.meta] ?? ''); });
  $$('[data-opt]').forEach(i => { i.checked = !!S.opts[i.dataset.opt]; });
  const grp = S.doc === 'slides' || S.doc === 'poster' ? S.doc : 'docx';
  $$('[data-for]').forEach(x => { x.hidden = !x.dataset.for.split(' ').includes(grp); });
  // tehnologija je primer predavanja; predavanje ima predavača umesto autora i mentora
  const lecture = grp === 'slides' && S.deck === 'predavanje', defense = grp === 'slides' && S.deck === 'odbrana';
  if (grp === 'slides' && !lecture) $('#techField').hidden = true;
  // polja samo za jednu vrstu prezentacije (odbrana: vrsta rada, komisija, vreme)
  $$('[data-deck-only]').forEach(x => { x.hidden = !(grp === 'slides' && S.deck === x.dataset.deckOnly); });
  $('#lbl-author').textContent = lecture ? t('m.lecturer') : defense ? t('m.candidate') : t('m.author');
  // drugi jezik: dugme sa znakom (ili plusom) i nazivom, polja samo kada je izabran
  const cname = S.custom.name.trim();
  $(`[data-tech="${CUSTOM}"]`).innerHTML = (hasMark(CUSTOM) ? markSvg(CUSTOM) : icon('plus').outerHTML) + esc(cname || t('tech.custom'));
  $('#customTech').hidden = !lecture || S.tech !== CUSTOM;
  if (a !== $('#ct-name')) $('#ct-name').value = S.custom.name;
  if (a !== $('#ct-cmd')) $('#ct-cmd').value = S.custom.cmd;
  $('#ct-prev').innerHTML = hasMark(CUSTOM) ? markSvg(CUSTOM) : '';
  $('#ct-status').textContent = hasMark(CUSTOM) ? t('ct.found') : cname ? t('ct.none') : t('ct.hint');
  $('#m-mentor').closest('.field').hidden = lecture;
  $$('.tech').forEach(b => b.setAttribute('aria-pressed', b.dataset.tech === S.tech));
  $$('#psize button').forEach(b => b.setAttribute('aria-pressed', b.dataset.psize === S.poster.size));
  $$('#citestyle button').forEach(b => b.setAttribute('aria-pressed', b.dataset.cite === S.opts.cite));
  $('#citeHint').textContent = S.opts.cite === 'ieee' ? t('cite.ieee') : t('cite.other', cite([1]));
  $$('#porient button').forEach(b => b.setAttribute('aria-pressed', b.dataset.porient === S.poster.orient));
  $$('#deck button').forEach(b => b.setAttribute('aria-pressed', b.dataset.deck === S.deck));
  $$('#textfmt button').forEach(b => b.setAttribute('aria-pressed', (b.dataset.prav === '1') === !!S.opts.pravilnik));
  $('#lbl-mentor').textContent = S.doc === 'izvestaj' ? t('m.asistent') : t('m.mentor');
  facSync();
  $$('#chartpal button').forEach(b => b.setAttribute('aria-pressed', b.dataset.pal === (S.opts.chartPal || 'tema')));
  $$('#codeStyle [data-code]').forEach(b => { codeMini(b.querySelector('.emini'), b.dataset.code); b.setAttribute('aria-pressed', b.dataset.code === S.opts.codeStyle); });
  $$('#termShape button').forEach(b => b.setAttribute('aria-pressed', b.dataset.shape === S.opts.termShape));
  // „Kao kod“ prati izgled koda, ostale kartice pokazuju boje svoje šeme; odziv je u izabranom obliku terminala
  const pc = P();
  $$('#termStyle [data-term]').forEach(b => { termMini(b.querySelector('.emini'), b.dataset.term, pc); b.setAttribute('aria-pressed', b.dataset.term === S.opts.termStyle); });
  // uključen komplet i tačka na kompletu koji tema predlaže
  const set = activeSet(S), rec = S.preset ? PRESETS[S.preset].set : S.techLook ? 'moderan' : null;
  $$('#lookSet [data-set]').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.set === set);
    b.classList.toggle('rec', b.dataset.set === rec);
    b.title = b.dataset.set === rec ? t('set.rec') : '';
  });
  $$('#tableStyle [data-tbl]').forEach(b => { b.querySelector('.dmini').innerHTML = tableMini(b.dataset.tbl, pc); b.setAttribute('aria-pressed', b.dataset.tbl === S.opts.tableStyle); });
  $$('#chartStyle [data-chs]').forEach(b => { b.querySelector('.dmini').innerHTML = chartMini(b.dataset.chs, pc); b.setAttribute('aria-pressed', b.dataset.chs === S.opts.chartStyle); });
  for (const [sel, attr, key, mini] of [['#listStyle', 'lst', 'listStyle', listMini], ['#quoteStyle', 'qt', 'quoteStyle', quoteMini], ['#statStyle', 'stt', 'statStyle', statMini]]) {
    $$(`${sel} [data-${attr}]`).forEach(b => { b.querySelector('.dmini').innerHTML = mini(b.dataset[attr], pc); b.setAttribute('aria-pressed', b.dataset[attr] === S.opts[key]); });
  }
  syncEditor();
  const th = $('#logoThumb');
  th.style.backgroundImage = S.logo ? `url(${S.logo.data})` : ''; th.classList.toggle('has', !!S.logo);
  $('#logoLabel').textContent = S.logo ? t('logo.replace') : t('logo.add');
  $('#logoRemove').hidden = !S.logo;
}
// mali pregled tabele: zaglavlje i tri reda iz istog opisa ćelija i oblika kao na slajdu (poslednji red je istaknut)
function tableMini(look, p) {
  const c = tableColors(p), n = 3, rh = 15, y0 = 20, fr = [0.46, 0.27, 0.27];
  const tb = { look, c, x: 14, y: y0, w: 132, rowH: rh, hi: n - 1, rows: [[], [], []], colW: fr.map(f => f * 132) };
  let s = `<rect width="160" height="100" fill="${p.bg}"/>`, t = tb;
  // oblici iza tabele (tamna kartica, traka istaknutog reda, kartice redova), u jedinicama pregleda
  for (const o of tableShapes(tb, S.corners === 'round' ? 7 : 0, 50)) {
    if (o.k === 'rect') s += `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="${o.r}" fill="${o.fill}"/>`;
    else t = o;
  }
  const lines = [];
  for (let r = 0; r <= n; r++) {
    let cx = t.x;
    t.colW.forEach((cw, i) => {
      const x = tableCell(look, c, r, n, r === n), cy = y0 + r * rh, bw = cw * (i ? 0.42 : 0.6) * (x.small ? 0.8 : 1), bh = x.small ? 3 : r ? 3.5 : 4.5;
      if (x.fill) s += `<rect x="${cx}" y="${cy}" width="${cw + 0.6}" height="${rh}" fill="${x.fill}"/>`;
      s += `<rect x="${i ? cx + cw - 5 - bw : cx + 5}" y="${cy + (rh - bh) / 2}" width="${bw}" height="${bh}" rx="1" fill="${x.fg}" opacity="${x.bold ? 1 : 0.7}"/>`;
      const ln = (e, x1, y1, x2, y2) => e && lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${e.c}" stroke-width="${e.w * 1.3}"/>`);
      ln(x.top, cx, cy, cx + cw, cy); ln(x.bottom, cx, cy + rh, cx + cw, cy + rh); ln(x.left, cx, cy, cx, cy + rh); ln(x.right, cx + cw, cy, cx + cw, cy + rh);
      cx += cw;
    });
  }
  return `<svg viewBox="0 0 160 100" aria-hidden="true">${s}${lines.join('')}</svg>`;
}
// mali editor, isti kao na slajdu: kartica fajla i pravi kod sa brojevima redova, u boji šeme (za „Tema“ u bojama teme) i fontu za kod
const CODE_SAMPLE = [
  [['def', 'kw'], [' ', 'base'], ['prosek', 'fn'], ['(ocene):', 'base']],
  [['    ', 'base'], ['# srednja ocena', 'com']],
  [['    ', 'base'], ['return', 'kw'], [' ', 'base'], ['sum', 'fn'], ['(ocene) / ', 'base'], ['len', 'fn'], ['(ocene)', 'base']],
  [['print', 'fn'], ['(', 'base'], ['"Prosek:"', 'str'], [', ', 'base'], ['prosek', 'fn'], ['(o))', 'base']],
];
const span = (t, color) => `<span style="color:${color}">${esc(t)}</span>`;
function miniEditor(el, bg, bar, lines, lineNo) {
  el.style.background = bg;
  el.innerHTML = bar + `<span class="ed-code${lineNo ? '' : ' nn'}" style="font-family:${fcss(S.fonts.mono)}">` +
    lines.map((l, i) => `<span class="ed-l">${lineNo ? `<span class="ed-n" style="color:${lineNo}">${i + 1}</span>` : ''}${l}</span>`).join('') + '</span>';
}
function codeMini(el, id) {
  const p = P(), c = codePalette(id) || { bg: p.code, ...p.syn };
  miniEditor(el, c.bg, `<span class="ed-bar"><span style="color:${c.base};border-color:${c.kw}">ocene.py</span></span>`,
    CODE_SAMPLE.map(l => l.map(([t, k]) => span(t, c[k])).join('')), mix(c.base, c.bg, 0.45));
}
// terminal u izabranom obliku, kao na slajdu: panel TERMINAL (VS Code), kartica PowerShell (Windows), oznaka „terminal“ (običan), bez trake (moderan)
function termMini(el, id, p) {
  const pal = termPalette(id) || { bg: p.code, syn: p.syn }, s = pal.syn, sh = S.opts.termShape;
  const sample = ['$ python3 ocene.py', 'Prosek: 8,5', '$ pytest -q', '3 passed in 0.02s'];
  const paras = terminalParas(sh === 'moderan' ? sample.slice(0, 2) : sample, s, sh, 'ocene');
  const bar = sh === 'vscode' ? `<span class="ed-bar"><span class="up" style="color:${s.base};border-color:${s.fn}">TERMINAL</span><i style="color:${s.com}">bash</i></span>`
    : sh === 'windows' ? `<span class="ed-bar win" style="background:${mix(pal.bg, lum(pal.bg) > 0.4 ? '#000000' : '#FFFFFF', 0.08)}"><span style="color:${s.base};background:${pal.bg}">PowerShell</span><i style="color:${s.com}">+</i></span>`
      : sh === 'obican' ? `<span class="ed-bar plain"><i style="color:${s.com};font-family:${fcss(S.fonts.mono)}">terminal</i></span>` : '';
  miniEditor(el, pal.bg, bar, paras.map(q => q.runs.map(r => span(r.t, r.color || s.base)).join('')), null);
}
// mali pregled grafikona: isti crtež kao na slajdu (tri stubića, istaknut poslednji), umanjen
function chartMini(look, p) {
  const o = chartObj({ type: 'stubici', highlight: 'C', cats: ['A', 'B', 'C'], series: [{ name: '', values: [412, 356, 121] }] }, 0, 0, 3.2, 2.0, p, S.fonts.body, 10, look);
  return `<img src="${drawChart(o, { frame: true })}" alt="">`;
}
// mali pregled liste: tri stavke sa znakom izabranog izgleda
function listMini(look, p) {
  const bu = listLook(look, p), font = bu.code === '2022' ? 'inherit' : 'Arial';
  const rows = [74, 58, 66].map((w, i) => `<text x="22" y="${33 + i * 20}" font-size="15" font-family="${font}" font-weight="700" fill="${bu.color || p.text}" text-anchor="middle">${bu.char}</text><rect x="34" y="${25 + i * 20}" width="${w + 30}" height="5" rx="1.5" fill="${p.text}" opacity="0.7"/>`).join('');
  return `<svg viewBox="0 0 160 100" aria-hidden="true"><rect width="160" height="100" fill="${p.bg}"/>${rows}</svg>`;
}
// mali pregled slajda „Izjava“ u izabranom izgledu
function quoteMini(look, p) {
  const acc = ensure(p.accent, p.bg, 3), fg = S.style === 'minimalni' ? p.text : p.pText, sub = p.muted, q = (x, y, size, color, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" font-family="Georgia, serif" font-weight="700" fill="${color}" text-anchor="${anchor}">“</text>`;
  const bars = (x, y, w1, w2, color, h = 8) => `<rect x="${x}" y="${y}" width="${w1}" height="${h}" rx="2" fill="${color}"/><rect x="${x}" y="${y + h + 4}" width="${w2}" height="${h}" rx="2" fill="${color}"/>`;
  let s = `<rect width="160" height="100" fill="${p.bg}"/>`;
  if (look === 'centrirano') s += q(80, 42, 40, acc, 'middle') + `<rect x="30" y="42" width="100" height="8" rx="2" fill="${fg}"/><rect x="45" y="54" width="70" height="8" rx="2" fill="${fg}"/>` + `<rect x="74" y="70" width="12" height="2.5" rx="1" fill="${acc}"/><rect x="55" y="77" width="50" height="3.5" rx="1" fill="${sub}"/>`;
  else if (look === 'podeljeno') s += `<rect width="54" height="100" fill="${p.primary}"/>` + q(27, 70, 64, mix(p.onP, p.primary, 0.45), 'middle') + `<rect x="66" y="32" width="26" height="3" rx="1" fill="${sub}"/>` + bars(66, 41, 80, 56, p.text) + `<rect x="66" y="70" width="46" height="3.5" rx="1" fill="${sub}"/>`;
  else if (look === 'kartica') { const card = mix(p.text, p.bg, 0.955); s += `<rect x="10" y="14" width="140" height="72" rx="${S.corners === 'round' ? 8 : 0}" fill="${card}"/>` + q(18, 44, 30, ensure(p.accent, card, 3)) + bars(20, 42, 104, 70, ensure(fg, card, 4.5)) + `<rect x="20" y="68" width="48" height="3.5" rx="1" fill="${sub}"/>`; }
  else if (look === 'krupno') s += `<rect x="14" y="22" width="30" height="3" rx="1" fill="${ensure(p.accent, p.bg, 4.5)}"/>` + bars(14, 31, 128, 96, p.text, 12) + `<rect x="14" y="72" width="56" height="3.5" rx="1" fill="${sub}"/>`;
  else s += `<rect x="16" y="34" width="34" height="3" rx="1" fill="${sub}"/>` + bars(16, 44, 102, 68, fg) + `<rect x="16" y="74" width="60" height="4" rx="1" fill="${sub}"/>`;
  return `<svg viewBox="0 0 160 100" aria-hidden="true">${s}</svg>`;
}
// mali pregled ključnih brojeva: tri kolone sa oznakom, brojem i opisom, u izgledu iz data-styles.js
function statMini(look, p) {
  const cw = 42, gap = 7, x0 = 12, y0 = look === 'krupni' ? 26 : 20, h = 60;
  let s = `<rect width="160" height="100" fill="${p.bg}"/>`;
  for (let i = 0; i < 3; i++) {
    const c = statLook(look, p, i), x = x0 + i * (cw + gap), pad = c.card ? 5 : 0, vh = c.size > 1 ? 15 : 11;
    let y = y0 + (c.card ? 6 : 0);
    if (look === 'linija') { s += `<rect x="${x}" y="${y0}" width="${cw}" height="1.5" fill="${p.pText}"/>`; y += 6; }
    if (c.card) s += `<rect x="${x}" y="${y0}" width="${cw}" height="${h}" rx="${S.corners === 'round' ? 5 : 0}" fill="${c.card}"/>`;
    if (c.bar) { s += `<rect x="${x}" y="${y}" width="12" height="3" rx="1.5" fill="${c.bar}"/>`; y += 8; }
    s += `<rect x="${x + pad}" y="${y}" width="${cw * 0.4}" height="2.5" rx="1" fill="${c.eyebrow}"/>`;
    s += `<rect x="${x + pad}" y="${y + 6}" width="${cw * (c.size > 1 ? 0.78 : 0.62)}" height="${vh}" rx="2" fill="${c.value}"/>`;
    s += `<rect x="${x + pad}" y="${y + vh + 10}" width="${cw * 0.66 - pad}" height="4" rx="1" fill="${c.label}"/><rect x="${x + pad}" y="${y + vh + 17}" width="${cw * 0.5}" height="3" rx="1" fill="${c.desc}"/>`;
  }
  return `<svg viewBox="0 0 160 100" aria-hidden="true">${s}</svg>`;
}
export function update(re = true) { persist(); sync(); if (re) schedule(); }
export function themeChanged() { S.preset = null; S.fromFaculty = false; S.techLook = false; dgCache.clear(); update(); }

$('#docSwitch').addEventListener('click', e => { const b = e.target.closest('[data-doc]'); if (b) { S.doc = b.dataset.doc; update(); } });
// izgled: boje, fontovi, stil i uglovi gotove teme ili tehnologije
const applyLook = (lk, flags) => {
  const was = activeSet(S);
  Object.assign(S, { fromFaculty: false, ...flags, colors: { ...lk.colors }, fonts: { ...lk.fonts }, style: lk.style, corners: lk.corners });
  // izgled tehnologije može da zada i izgled koda i terminala; crtica važi samo dok je taj izgled izabran
  if (lk.code) S.opts.codeStyle = lk.code;
  if (lk.term) S.opts.termStyle = lk.term;
  if (lk.shape) S.opts.termShape = lk.shape;
  S.opts.accentRule = !!lk.accentRule;
  // komplet izgleda elemenata koji tema predlaže (izgled tehnologije uz Moderan)
  themeSet(S, lk.set || 'moderan', was);
};
/* tehnologija: primer predavanja i boje tehnologije; naslov menja samo ako je još iz nekog primera */
function setTech(id) {
  const prev = activeTech(S), next = activeTech({ ...S, tech: id }), base = defaults().meta;
  const samples = [base, ...Object.values(TECH).map(x => x.meta), ...(prev ? [prev.meta] : [])];
  for (const k of ['title', 'subtitle', 'course']) if (samples.some(m => m[k] === S.meta[k])) S.meta[k] = (next ? next.meta : base)[k];
  S.tech = id;
  if (next && next.look) applyLook(next.look, { preset: null, techLook: true, deck: 'predavanje' });
  else {
    if (next) S.deck = 'predavanje';
    // boje tehnologije bez te tehnologije nemaju smisla: vrati podrazumevanu temu (druga izabrana tema ostaje)
    if (S.techLook) applyLook(PRESETS.akademski, { preset: 'akademski', techLook: false });
  }
  dgCache.clear(); chartCache.clear();
}
$('#techs').addEventListener('click', e => {
  const b = e.target.closest('[data-tech]'); if (!b || b.dataset.tech === S.tech) return;
  setTech(b.dataset.tech); loadFonts(); update();
  if (S.tech === CUSTOM && !S.custom.name) $('#ct-name').focus();
});
/* drugi jezik: naziv i komanda idu na naslovni slajd, a znak se traži po nazivu na Simple Icons */
$('#ct-name').addEventListener('input', e => {
  const before = activeTech(S).meta;
  S.custom.name = e.target.value.slice(0, 40);
  if (!S.custom.name.trim()) S.custom.mark = '';
  // naslov, podnaslov i predmet prate naziv dok su još iz obrasca
  const after = activeTech(S).meta;
  for (const k of ['title', 'subtitle', 'course']) if (S.meta[k] === before[k]) S.meta[k] = after[k];
  update();
});
$('#ct-cmd').addEventListener('input', e => { S.custom.cmd = e.target.value.slice(0, 80); update(); });
async function findMark() {
  const name = S.custom.name.trim(); if (!name) return;
  $('#ct-status').textContent = t('ct.searching');
  const mark = await fetchMark(name);
  if (S.custom.name.trim() !== name) return; // naziv je u međuvremenu promenjen
  S.custom.mark = mark; dgCache.clear(); update();
  if (!mark) $('#ct-status').textContent = t('ct.notFound', name);
}
$('#ct-name').addEventListener('change', findMark);
$('#ct-find').addEventListener('click', findMark);
const onLook = e => {
  const tl = e.target.closest('[data-techlook]');
  if (tl) { applyLook(TECH[tl.dataset.techlook].look, { preset: null, techLook: true }); loadFonts(); update(); return; }
  const b = e.target.closest('[data-preset]'); if (!b) return;
  applyLook(PRESETS[b.dataset.preset], { preset: b.dataset.preset, techLook: false });
  loadFonts(); update();
};
$('#presets').addEventListener('click', onLook);
$('#techLooks').addEventListener('click', onLook);
$('#colors').addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.color) { S.colors[t.dataset.color] = t.value.toUpperCase(); themeChanged(); }
  else if (t.dataset.hex) {
    const v = t.value.trim().startsWith('#') ? t.value.trim() : '#' + t.value.trim();
    if (isHex(v)) { t.removeAttribute('aria-invalid'); S.colors[t.dataset.hex] = normHex(v); themeChanged(); }
    else t.setAttribute('aria-invalid', 'true');
  }
});
$('#colors').addEventListener('focusout', e => { if (e.target.dataset.hex) sync(); });
$$('[data-font]').forEach(s => s.addEventListener('change', () => { S.fonts[s.dataset.font] = s.value; loadFonts(); themeChanged(); }));
$('#styles').addEventListener('click', e => { const b = e.target.closest('[data-style]'); if (b) { S.style = b.dataset.style; themeChanged(); } });
// izgled koda i terminala: posle crtanja pregled skače na prvi slajd sa kodom, odnosno terminalom
$('#termShape').addEventListener('click', e => { const b = e.target.closest('[data-shape]'); if (b) { S.opts.termShape = b.dataset.shape; focusOn('terminal'); update(); } });
$('#codeStyle').addEventListener('click', e => { const b = e.target.closest('[data-code]'); if (b) { S.opts.codeStyle = b.dataset.code; focusOn('code'); update(); } });
$('#termStyle').addEventListener('click', e => { const b = e.target.closest('[data-term]'); if (b) { S.opts.termStyle = b.dataset.term; focusOn('terminal'); update(); } });
// izgled elementa: posle crtanja pregled skače na prvi slajd sa tim elementom
for (const [sel, attr, key, kind] of [['#tableStyle', 'tbl', 'tableStyle', 'table'], ['#chartStyle', 'chs', 'chartStyle', 'chart'], ['#listStyle', 'lst', 'listStyle', 'list'], ['#quoteStyle', 'qt', 'quoteStyle', 'quote'], ['#statStyle', 'stt', 'statStyle', 'stats']]) {
  $(sel).addEventListener('click', e => { const b = e.target.closest(`[data-${attr}]`); if (b) { S.opts[key] = b.dataset[attr]; focusOn(kind); update(); } });
}
$('#lookSet').addEventListener('click', e => { const b = e.target.closest('[data-set]'); if (b) { applySet(S, b.dataset.set); update(); } });
$('#ratio').addEventListener('click', e => { const b = e.target.closest('[data-ratio]'); if (b) { S.ratio = b.dataset.ratio; update(); } });
$('#corners').addEventListener('click', e => { const b = e.target.closest('[data-corners]'); if (b) { S.corners = b.dataset.corners; themeChanged(); } });
$('#script').addEventListener('click', e => { const b = e.target.closest('[data-script]'); if (b) { S.opts.script = b.dataset.script; update(); } });
$('#density').addEventListener('click', e => { const b = e.target.closest('[data-density]'); if (b) { S.density = b.dataset.density; update(); } });
$$('[data-meta]').forEach(i => i.addEventListener('input', () => {
  const key = i.dataset.meta;
  if (key === 'docType') { if (S.doc !== 'slides') S.meta.docTypes[S.doc] = i.value; }
  else { S.meta[key] = i.value; $$(`[data-meta="${key}"]`).forEach(o => { if (o !== i) o.value = i.value; }); }
  update();
}));
$$('[data-opt]').forEach(i => i.addEventListener('change', () => { S.opts[i.dataset.opt] = i.checked; dgCache.clear(); update(); }));
// tehnologija postoji samo uz predavanje
$('#deck').addEventListener('click', e => {
  const b = e.target.closest('[data-deck]'); if (!b) return;
  S.deck = b.dataset.deck;
  if (S.deck !== 'predavanje' && S.tech) setTech('');
  update();
});
$('#citestyle').addEventListener('click', e => { const b = e.target.closest('[data-cite]'); if (b) { S.opts.cite = b.dataset.cite; update(); } });
$('#psize').addEventListener('click', e => { const b = e.target.closest('[data-psize]'); if (b) { S.poster.size = b.dataset.psize; dgCache.clear(); update(); } });
$('#porient').addEventListener('click', e => { const b = e.target.closest('[data-porient]'); if (b) { S.poster.orient = b.dataset.porient; dgCache.clear(); update(); } });
$('#textfmt').addEventListener('click', e => { const b = e.target.closest('[data-prav]'); if (b) { S.opts.pravilnik = b.dataset.prav === '1'; dgCache.clear(); update(); } });
$('#fac-color').addEventListener('input', e => { S.faculty = e.target.value.toUpperCase(); facSync(); persist(); });
// boja sa logotipa: slika se umanji i bira se najizraženija boja (bela, crna i siva se preskaču)
$('#fac-logo').addEventListener('click', () => {
  if (!S.logo) return;
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, 96 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(img.width * k)); cv.height = Math.max(1, Math.round(img.height * k));
    const g = cv.getContext('2d'); g.drawImage(img, 0, 0, cv.width, cv.height);
    const hex = dominantColor(g.getImageData(0, 0, cv.width, cv.height).data);
    if (!hex) { toast(t('fac.logoNone')); return; }
    S.faculty = hex; facSync(); persist();
  };
  img.src = S.logo.data;
});
$('#fac-hex').addEventListener('input', e => {
  const v = e.target.value.trim().startsWith('#') ? e.target.value.trim() : '#' + e.target.value.trim();
  if (isHex(v)) { S.faculty = normHex(v); e.target.removeAttribute('aria-invalid'); facSync(); persist(); } else e.target.setAttribute('aria-invalid', 'true');
});
$('#fac-apply').addEventListener('click', () => {
  const r = facultyPalette(S.faculty);
  Object.assign(S, { colors: r.colors, preset: null, fromFaculty: true, techLook: false }); dgCache.clear(); update();
  toast(t('fac.done'));
});
$('#langSwitch').addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) setLang(b.dataset.lang); });


$('#chartpal').addEventListener('click', e => { const b = e.target.closest('[data-pal]'); if (b) { S.opts.chartPal = b.dataset.pal; chartCache.clear(); update(); } });

/* logo: uvek se pretvara u PNG da bi radio i u .pptx i u .docx */
export function readLogo(file) {
  if (!file || !/^image\//.test(file.type)) { toast(t('logo.pick')); return; }
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const w0 = img.naturalWidth || 600, h0 = img.naturalHeight || 300, sc = Math.min(1, 900 / Math.max(w0, h0));
      const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w0 * sc)); cv.height = Math.max(1, Math.round(h0 * sc));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      S.logo = { data: cv.toDataURL('image/png'), ar: cv.width / cv.height };
      update(); toast(t('logo.added'));
    };
    img.onerror = () => toast(t('logo.bad'));
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}
$('#logoFile').addEventListener('change', e => { readLogo(e.target.files[0]); e.target.value = ''; });
export const drop = $('#drop');
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); readLogo(e.dataTransfer.files[0]); });
$('#logoRemove').addEventListener('click', () => { S.logo = null; update(); });

/* fontovi za pregled: učitaj izabrane, pa ponovo nacrtaj (canvas ih koristi tek posle učitavanja) */
export function loadFonts() {
  if (!document.fonts || !document.fonts.load) return;
  // ceo niz iz css-a: za „Source Sans Pro“ pregled učitava Google font „Source Sans 3“ (isti dizajn)
  const fams = [S.fonts.heading, S.fonts.body, S.fonts.mono].flatMap(n => (FONTS[n] || MONO[n]).css.split(',').map(f => f.trim()));
  Promise.all(fams.flatMap(f => [document.fonts.load(`400 20px ${f}`), document.fonts.load(`700 20px ${f}`)])).then(() => { dgCache.clear(); schedule(); }).catch(() => {});
}


/* preuzimanje: izvoz (PptxGenJS ili docx) stiže tek na prvi klik, vidi export/load.js */
const loaderFor = doc => (doc === 'slides' || doc === 'poster' ? loadPptx : loadDocx);
// vrsta dokumenta može da se promeni dok se izvoz učitava: pravi se ona koja je izabrana kad učitavanje završi
async function build() {
  const doc = S.doc, m = await loaderFor(doc)();
  if (S.doc !== doc) return build();
  $('#dlLabel').textContent = t('dl.busy');
  return doc === 'slides' ? m.buildPptx() : doc === 'poster' ? m.buildPoster() : m.buildDocx();
}
$('#dlBtn').addEventListener('click', async () => {
  const btn = $('#dlBtn');
  btn.disabled = true; btn.setAttribute('aria-busy', 'true');
  $('#dlLabel').textContent = t(loaderFor(S.doc).ready() ? 'dl.busy' : 'dl.loading');
  try { const r = await build(); await offer(r.name, r.blob); }
  catch (e) { console.error(e); toast(e instanceof LoadError ? t('dl.loadFail') : t('dl.fail') + (e.message || e)); }
  finally { btn.disabled = false; btn.removeAttribute('aria-busy'); sync(); }
});
$('#saveTheme').addEventListener('click', () => {
  const data = { app: 'fictor', verzija: 2, tech: S.tech, techLook: S.techLook, custom: S.custom, poster: S.poster, preset: S.preset, fromFaculty: S.fromFaculty, faculty: S.faculty, deck: S.deck, colors: S.colors, fonts: S.fonts, style: S.style, corners: S.corners, ratio: S.ratio, opts: S.opts, meta: S.meta, logo: S.logo };
  offer('tema-' + slug(themeLabel()) + '.json', JSON.stringify(data, null, 2));
});
$('#loadThemeBtn').addEventListener('click', () => $('#loadTheme').click());
$('#loadTheme').addEventListener('change', e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  f.text().then(txt => {
    const j = JSON.parse(txt);
    if (!j || !['fictor', 'sablonar'].includes(j.app)) throw new Error('nije tema');
    setState(sanitize({ ...j, doc: S.doc, density: S.density, content: S.content, bib: S.bib, editing: S.editing, editTab: S.editTab }, defaults()));
    dgCache.clear(); loadFonts(); update(); toast(t('theme.loaded'));
  }).catch(() => toast(t('theme.bad')));
});
