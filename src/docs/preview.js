// HTML pregled Word dokumenata (A4 strane).
import { refList } from '../content/citations.js';
import { resolveRuns } from '../content/markdown.js';
import { S } from '../core/state.js';
import { T, up } from '../core/text.js';
import { FIG_IN, docChart, docPal, docTable, docType, mentorLbl } from './blocks.js';
import { drawChart, placeholderPNG } from '../graphics/charts.js';
import { diagram } from '../graphics/diagram.js';
import { cellCss, listLook, tableGrid } from '../graphics/data-styles.js';
import { el } from '../lib/dom.js';
import { isNum } from '../slides/deck.js';

export function runsEl(target, runs) {
  resolveRuns(runs).forEach(r => { const x = el(r.code ? 'code' : r.b ? 'b' : r.i ? 'i' : 'span', r.code ? 'd-c' : ''); x.textContent = r.code ? r.t : T(r.t); target.append(x); });
}

/* ---------- pregled Word dokumenata ---------- */
export function blockEl(b, label, k) {
  const e = (tag, cls, txt) => { const x = el(tag, cls); if (txt != null) x.textContent = txt; return x; };
  const head = (cls, num) => { const h = e('h2', cls); if (num) h.append(e('span', 'n', num)); h.append(T(b.t)); h.dataset.keep = '1'; h.dataset.t = T(b.t); h.dataset.n = num || ''; return h; };
  switch (b.k) {
    case 'h1': return head('d-h1', label);
    case 'h2': return head('d-h2', label);
    case 'h1u': return head('d-h1 u', '');
    case 'unh': { const h = e('div', 'd-unh', T(b.t)); if (b.gap) h.style.marginTop = '28px'; h.dataset.keep = '1'; return h; }
    case 'kw': { const p = e('p', 'd-p'); p.append(e('b', null, T('Ključne reči: ')), T(b.t)); return p; }
    case 'toc': return e('div', 'd-toc');
    case 'guide': return e('p', 'd-guide', T(b.t));
    case 'p': { const p = e('p', 'd-p'); runsEl(p, b.runs); return p; }
    case 'h3': { const p = e('p', 'd-h3'); runsEl(p, b.runs); p.dataset.keep = '1'; return p; }
    case 'note': { const p = e('p', 'd-note'); if (b.label) p.append(e('b', null, T(b.label) + ': '), T(b.t)); else runsEl(p, b.runs); return p; }
    case 'bullets': case 'numbered': {
      const l = e('ul', 'd-list ' + (b.k === 'bullets' ? 'ul' : 'ol')), bu = listLook(S.opts.listStyle, { pText: k.primary, muted: k.muted, aText: k.accentText });
      // znak i boja liste kao u Word-u
      l.style.setProperty('--bu', JSON.stringify(bu.char));
      if (bu.color) l.style.setProperty('--bc', bu.color);
      if (bu.code !== '2022') l.style.setProperty('--bf', 'Arial, sans-serif');
      b.items.forEach(t => { const li = e('li'); if (typeof t === 'string') li.textContent = T(t); else runsEl(li, t); l.append(li); });
      return l;
    }
    case 'rq': { const d = e('div'); b.items.forEach(([tag, t]) => { const p = e('p', 'd-rq'); p.append(e('b', null, T(tag)), T(t)); d.append(p); }); return d; }
    case 'figure': {
      const d = e('div'), f = e('div', 'd-fig'), i = e('img'); i.alt = ''; i.src = b.placeholder ? placeholderPNG(FIG_IN[0], FIG_IN[1], b.placeholder, docPal(k)) : diagram(FIG_IN[0], FIG_IN[1], docPal(k)); i.style.width = FIG_IN[0] * 96 + 'px';
      f.append(i); d.append(f, e('p', 'd-figcap', T(b.caption))); return d;
    }
    case 'chart': {
      const d = e('div', 'd-chart'), f = e('div', 'd-fig'), i = e('img'), co = docChart(b.spec, k); i.alt = ''; i.src = drawChart(co, { labels: true, frame: true }); i.alt = co.alt; i.style.width = co.w * 96 + 'px';
      f.append(i); d.append(f, e('p', 'd-figcap', T(b.caption))); return d;
    }
    case 'code': { const d = e('div'); d.append(e('p', 'd-tcap', T(b.caption)), e('pre', 'd-code', b.lines.join('\n'))); return d; }
    case 'table': {
      // naslov tabele iznad, kao u časopisima
      const d = e('div'), t = e('table', 'd-tbl'), cg = e('colgroup');
      const right = b.head.map((_, i) => i && b.rows.every(r => isNum(r[i])));
      b.widths.forEach(w => { const c = e('col'); c.style.width = (w * 100) + '%'; cg.append(c); }); t.append(cg);
      // isti izgled ćelija kao u Word-u
      tableGrid(docTable(b, k), true).forEach((row, r) => {
        const tr = e('tr');
        row.forEach(({ t: v, i, x }) => { const c = e(r ? 'td' : 'th', null, T(v)); c.style.cssText = `color:${x.fg};font-weight:${x.bold ? 700 : 400};${x.small ? 'font-size:0.8em;letter-spacing:0.06em;' : ''}${cellCss(x, 96 / 72)}`; if (right[i]) c.style.textAlign = 'right'; tr.append(c); });
        t.append(tr);
      });
      d.append(e('p', 'd-tcap', T(b.caption)), t); return d;
    }
    case 'refs': { const d = e('div'); refList().forEach(r => { const p = e('p', 'd-ref' + (r.label ? '' : ' ad')); if (r.label) p.append(e('b', null, r.label)); r.runs.forEach(x => p.append(e(x.i ? 'i' : 'span', null, x.raw ? x.t : T(x.t)))); d.append(p); }); return d; }
  }
  return e('div');
}
export function coverEl(k) {
  const m = S.meta, body = el('div', 'pg-body cv-' + S.style), ml = mentorLbl();
  const add = (cls, txt, parent = body) => { const e = el('div', cls); e.textContent = txt; parent.append(e); return e; };
  const spacer = h => { const s = el('div'); s.style.height = h + 'px'; body.append(s); };
  if (S.logo) { const i = el('img', 'cv-logo'); i.src = S.logo.data; i.alt = ''; body.append(i); }
  if (m.institution) add('cv-inst', up(T(m.institution)));
  if (m.course) add('cv-course', T(m.course));
  const metaTable = () => {
    const tbl = el('table', 'cv-meta');
    [['Student', m.author], ['Broj indeksa', m.index], ['Predmet', m.course], [ml, m.mentor], ['Datum', m.date]].filter(r => r[1]).forEach(([l, v]) => {
      const tr = el('tr'), a = el('td'), b = el('td'); a.textContent = up(T(l)); b.textContent = T(v); tr.append(a, b); tbl.append(tr);
    });
    body.append(tbl);
  };
  if (S.style === 'akademski') {
    // tradicionalna naslovna strana: sve centrirano, mentor levo i student desno pri dnu
    spacer(S.logo ? 150 : 190);
    add('cv-type', up(T(docType())));
    add('cv-title', T(m.title));
    if (m.subtitle) add('cv-sub', T(m.subtitle));
    spacer(170);
    const sign = el('div', 'cv-sign'), l = el('div'), r = el('div');
    add('cv-lbl', T(ml + ':'), l); if (m.mentor) add('', T(m.mentor), l);
    add('cv-lbl', T('Student:'), r); [m.author, m.index].filter(Boolean).forEach(v => add('', T(v), r));
    sign.append(l, r); body.append(sign);
    spacer(60);
    if (m.date) add('cv-date', T(m.date));
  } else if (S.style === 'korporativni') {
    spacer(S.logo ? 110 : 160);
    const bx = el('div', 'cv-box'); body.append(bx);
    add('cv-type', up(T(docType())), bx); add('cv-title', T(m.title), bx); if (m.subtitle) add('cv-sub', T(m.subtitle), bx);
    spacer(130);
    metaTable();
  } else {
    spacer(S.logo ? 120 : 173);
    add('cv-type', up(T(docType())));
    add('cv-title', T(m.title));
    if (m.subtitle) add('cv-sub', T(m.subtitle));
    body.append(el('div', 'cv-rule'));
    spacer(120);
    metaTable();
  }
  return body;
}
