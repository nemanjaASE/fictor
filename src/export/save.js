// Čuvanje generisanog fajla na disk (preuzimanje iz pregledača).
import { el } from '../lib/dom.js';
import { t } from '../ui/i18n.js';
import { toast } from '../ui/toast.js';

export function offer(name, data) {
  const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data]));
  const a = el('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast(t('saved') + name);
  return true;
}
