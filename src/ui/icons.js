// Ikonice interfejsa (Lucide). U HTML-u: <i data-icon="ime"></i>, zameni ih mountIcons().
import {
  createElement, Download, Eye, Pipette, Plus, Search, FileInput, FlaskConical, FolderOpen, GraduationCap, IdCard, Info,
  LayoutDashboard, LayoutGrid, LayoutTemplate, Lightbulb, Moon, NotebookPen, Palette, PencilLine,
  Presentation, RectangleHorizontal, Save, Shapes, SlidersHorizontal, Sun, SwatchBook, Trash2, Type, ImagePlus, X,
} from 'lucide';

const ICONS = {
  'download': Download, 'pipette': Pipette, 'plus': Plus, 'search': Search, 'eye': Eye, 'file-input': FileInput, 'flask-conical': FlaskConical, 'folder-open': FolderOpen,
  'graduation-cap': GraduationCap, 'id-card': IdCard, 'info': Info, 'layout-dashboard': LayoutDashboard,
  'layout-grid': LayoutGrid, 'layout-template': LayoutTemplate, 'lightbulb': Lightbulb, 'moon': Moon,
  'notebook-pen': NotebookPen, 'palette': Palette, 'pencil-line': PencilLine, 'presentation': Presentation,
  'rectangle-horizontal': RectangleHorizontal, 'save': Save, 'shapes': Shapes, 'sliders-horizontal': SlidersHorizontal, 'sun': Sun,
  'swatch-book': SwatchBook, 'trash': Trash2, 'type': Type, 'image-plus': ImagePlus, 'x': X,
};

export function icon(name) {
  const svg = createElement(ICONS[name], { 'stroke-width': 1.75, 'aria-hidden': 'true', focusable: 'false' });
  svg.setAttribute('class', 'ic');
  svg.dataset.icon = name;
  return svg;
}
export function mountIcons(root = document) {
  root.querySelectorAll('i[data-icon]').forEach(i => i.replaceWith(icon(i.dataset.icon)));
}
// zamena ikonice u dugmetu (npr. sunce ↔ mesec)
export function setIcon(host, name) {
  const old = host.querySelector('svg.ic');
  if (old && old.dataset.icon === name) return;
  if (old) old.replaceWith(icon(name)); else host.prepend(icon(name));
}
