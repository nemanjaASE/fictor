// Opisi za čitače ekrana u .pptx: slike i pravi grafikoni dobijaju opis kroz PptxGenJS (altText), a oblici i tabele
// (za koje PptxGenJS nema opis) dobijaju privremeno ime koje finishPptx menja imenom i opisom u XML-u.
export const ALT = [];
export const altReset = () => { ALT.length = 0; };
export function altName(name, descr) { ALT.push({ name, descr }); return 'FictorAlt' + (ALT.length - 1); }
const xe = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// ime i opis umesto privremenog imena; prvi red svake tabele je zaglavlje (čitač ekrana ga čita kao naslove kolona)
export function altXml(x, list = ALT) {
  return x.replace(/name="FictorAlt(\d+)"/g, (m, i) => (list[i] ? `name="${xe(list[i].name)}" descr="${xe(list[i].descr)}"` : m))
    .split('<a:tblPr/>').join('<a:tblPr firstRow="1"/>');
}
