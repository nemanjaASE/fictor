// Izvoz se učitava tek kad zatreba: PptxGenJS, docx i JSZip su veći od cele ostale aplikacije,
// pa ih Vite stavlja u posebne delove koje pregledač preuzima na prvi klik na „Preuzmi“.
export class LoadError extends Error {}

// svi klikovi čekaju isto učitavanje; posle greške (prekinuta veza, nova verzija sajta) sledeći klik ponovo zove import(),
// ali Chrome pamti neuspeli modul do osvežavanja stranice, pa poruka o grešci traži osvežavanje (stanje je u localStorage)
export function lazy(imp) {
  let p = null, ready = false;
  const load = () => (p ||= imp().then(m => { ready = true; return m; }, e => { p = null; throw new LoadError(String(e?.message || e), { cause: e }); }));
  load.ready = () => ready;
  return load;
}
export const loadPptx = lazy(() => import('./pptx.js'));
export const loadDocx = lazy(() => import('./docx.js'));
