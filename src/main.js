import './styles.css';
import { dgCache } from './graphics/diagram.js';
import { buildControls, loadFonts, sync } from './ui/controls.js';
import { applyStatic, onLang } from './ui/i18n.js';
import { mountIcons } from './ui/icons.js';
import { render, schedule } from './ui/render.js';
import { syncTheme } from './ui/theme.js';
import './ui/editor.js';
import './ui/nav.js';

mountIcons(); applyStatic(); syncTheme();
loadFonts(); sync(); render();
onLang(() => { buildControls(); syncTheme(); sync(); render(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { dgCache.clear(); schedule(); });
