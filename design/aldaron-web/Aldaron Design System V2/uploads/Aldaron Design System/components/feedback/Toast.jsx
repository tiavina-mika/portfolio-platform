import React from 'react';
import { injectCss, cx } from '../_shared/css.js';
import { icon } from '../_shared/icons.jsx';

injectCss('ald-toast', `
@keyframes ald-toast-in{from{opacity:0;transform:translateY(12px)}}
.ald-toast{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:start;width:380px;max-width:calc(100vw - 32px);padding:14px 8px 14px 16px;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);font-size:14px;line-height:1.45;animation:ald-toast-in var(--dur-slow) var(--ease-out)}
.ald-toast--static{animation:none}
.ald-toast--inverted{background:var(--primary);color:var(--primary-foreground);border-color:transparent}
.ald-toast__icon{display:flex;padding-top:1px}
.ald-toast--success .ald-toast__icon{color:var(--success)}.ald-toast--destructive .ald-toast__icon{color:var(--destructive)}.ald-toast--warning .ald-toast__icon{color:var(--warning)}.ald-toast--info .ald-toast__icon{color:var(--info)}
.ald-toast__title{font-weight:600;font-size:15px}
.ald-toast__desc{color:var(--muted-foreground);margin-top:2px}
.ald-toast--inverted .ald-toast__desc{color:color-mix(in oklab,var(--primary-foreground) 72%,var(--primary))}
.ald-toast__action{margin-top:10px}
.ald-toast__close{width:32px;height:32px;margin-top:-6px;display:flex;align-items:center;justify-content:center;border:0;background:none;border-radius:var(--radius-sm);color:inherit;opacity:.6;cursor:pointer}
.ald-toast__close:hover{opacity:1;background:color-mix(in oklab,currentColor 10%,transparent)}
.ald-toast__close:focus-visible{outline:none;box-shadow:var(--focus-ring);opacity:1}
.ald-toaster{position:fixed;z-index:200;bottom:24px;right:24px;display:flex;flex-direction:column;gap:10px;align-items:flex-end}
@media (prefers-reduced-motion:reduce){.ald-toast{animation:none}}
`);

const ICON = { success: 'success', destructive: 'error', warning: 'warning', info: 'info' };
export function Toast({ variant = 'default', title, description, action, onClose, isStatic, closeLabel = 'Fermer' }) {
  const ic = ICON[variant];
  return (
    <div className={cx('ald-toast', 'ald-toast--' + variant, isStatic && 'ald-toast--static')} role={variant === 'destructive' ? 'alert' : 'status'} aria-live="polite">
      {ic ? <span className="ald-toast__icon">{icon(ic, 20)}</span> : <span />}
      <div>
        {title && <div className="ald-toast__title">{title}</div>}
        {description && <div className="ald-toast__desc">{description}</div>}
        {action && <div className="ald-toast__action">{action}</div>}
      </div>
      {onClose ? <button type="button" className="ald-toast__close" aria-label={closeLabel} onClick={onClose}>{icon('x', 16)}</button> : <span />}
    </div>
  );
}

let push = null;
export function Toaster({ duration = 5000 }) {
  const [list, setList] = React.useState([]);
  React.useEffect(() => {
    push = t => {
      const id = Math.random().toString(36).slice(2);
      setList(l => [...l, { ...t, id }]);
      if ((t.duration ?? duration) > 0) setTimeout(() => setList(l => l.filter(x => x.id !== id)), t.duration ?? duration);
    };
    return () => { push = null; };
  }, [duration]);
  return (
    <div className="ald-toaster" aria-live="polite">
      {list.map(t => <Toast key={t.id} {...t} onClose={() => setList(l => l.filter(x => x.id !== t.id))} />)}
    </div>
  );
}
Toaster.show = t => push && push(t);
