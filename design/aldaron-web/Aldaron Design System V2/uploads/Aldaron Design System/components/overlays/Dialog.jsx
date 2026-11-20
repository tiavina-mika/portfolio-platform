import React from 'react';
import { injectCss, cx } from '../_shared/css.js';
import { icon } from '../_shared/icons.jsx';

injectCss('ald-dialog', `
@keyframes ald-fade{from{opacity:0}}
@keyframes ald-pop{from{opacity:0;transform:translateY(8px) scale(.98)}}
.ald-dlg__overlay{position:fixed;inset:0;z-index:100;background:var(--overlay);display:flex;align-items:center;justify-content:center;padding:24px;animation:ald-fade var(--dur-slow) var(--ease-out)}
.ald-dlg{position:relative;width:100%;max-width:var(--dlg-w);max-height:calc(100vh - 48px);overflow:auto;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);animation:ald-pop var(--dur-slow) var(--ease-out)}
.ald-dlg--inline{animation:none}
.ald-dlg__head{padding:24px 56px 0 24px}
.ald-dlg__title{margin:0;font:700 20px/1.25 var(--font-display);letter-spacing:-0.01em}
.ald-dlg__desc{margin:8px 0 0;font-size:15px;line-height:1.5;color:var(--muted-foreground)}
.ald-dlg__body{padding:20px 24px}
.ald-dlg__foot{display:flex;justify-content:flex-end;gap:8px;padding:0 24px 24px;flex-wrap:wrap}
.ald-dlg__close{position:absolute;top:12px;right:12px;width:var(--hit-min);height:var(--hit-min);display:flex;align-items:center;justify-content:center;border:0;background:none;color:var(--muted-foreground);border-radius:var(--radius-md);cursor:pointer}
.ald-dlg__close:hover{background:var(--muted);color:var(--foreground)}
.ald-dlg__close:focus-visible{outline:none;box-shadow:var(--focus-ring)}
@media (prefers-reduced-motion:reduce){.ald-dlg,.ald-dlg__overlay{animation:none}}
`);

let n = 0;
export function Dialog({ open, onClose, title, description, footer, size = 'md', inline = false, closeLabel = 'Fermer', children }) {
  const [id] = React.useState(() => 'ald-dlg-' + (++n));
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open || inline) return;
    const prev = document.activeElement;
    const f = ref.current?.querySelector('input,select,textarea,button:not(.ald-dlg__close),[href]') || ref.current;
    f && f.focus();
    const k = e => {
      if (e.key === 'Escape') onClose && onClose();
      if (e.key === 'Tab' && ref.current) {
        const els = [...ref.current.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled);
        if (!els.length) return;
        const a = els[0], z = els[els.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('keydown', k); prev && prev.focus && prev.focus(); };
  }, [open, inline]);
  if (!open && !inline) return null;
  const w = { sm: 400, md: 520, lg: 720 }[size] + 'px';
  const box = (
    <div ref={ref} className={cx('ald-dlg', inline && 'ald-dlg--inline')} role="dialog" aria-modal={!inline} aria-labelledby={id + '-t'} aria-describedby={description ? id + '-d' : undefined} tabIndex={-1} style={{ '--dlg-w': w }} onMouseDown={e => e.stopPropagation()}>
      <div className="ald-dlg__head">
        <h2 id={id + '-t'} className="ald-dlg__title">{title}</h2>
        {description && <p id={id + '-d'} className="ald-dlg__desc">{description}</p>}
      </div>
      {children ? <div className="ald-dlg__body">{children}</div> : <div style={{ height: 20 }} />}
      {footer && <div className="ald-dlg__foot">{footer}</div>}
      {onClose && <button type="button" className="ald-dlg__close" aria-label={closeLabel} onClick={onClose}>{icon('x', 18)}</button>}
    </div>
  );
  if (inline) return box;
  return <div className="ald-dlg__overlay" onMouseDown={() => onClose && onClose()}>{box}</div>;
}
