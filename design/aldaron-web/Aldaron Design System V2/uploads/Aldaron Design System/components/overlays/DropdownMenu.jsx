import React from 'react';
import { injectCss, cx } from '../_shared/css.js';

injectCss('ald-menu', `
.ald-menu{position:relative;display:inline-block}
.ald-menu__list{position:absolute;z-index:60;top:calc(100% + 6px);min-width:220px;padding:4px;margin:0;list-style:none;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);animation:ald-menu-in var(--dur-base) var(--ease-out)}
.ald-menu__list--start{left:0}.ald-menu__list--end{right:0}
.ald-menu--static .ald-menu__list{position:static;animation:none}
@keyframes ald-menu-in{from{opacity:0;transform:translateY(-4px)}}
.ald-menu__item{display:flex;align-items:center;gap:10px;width:100%;min-height:40px;padding:0 10px;border:0;background:none;border-radius:var(--radius-sm);font:400 15px/1 var(--font-sans);color:inherit;cursor:pointer;text-align:left}
.ald-menu__item:hover,.ald-menu__item:focus-visible,.ald-menu__item[data-force=hover]{outline:none;background:var(--muted)}
.ald-menu__item:disabled{opacity:var(--disabled-opacity);cursor:not-allowed;background:none}
.ald-menu__item--danger{color:var(--destructive)}
.ald-menu__item--danger:hover{background:var(--danger-subtle)}
.ald-menu__icon{display:flex;color:var(--muted-foreground)}
.ald-menu__item--danger .ald-menu__icon{color:inherit}
.ald-menu__kbd{margin-left:auto;font:500 12px var(--font-mono);color:var(--muted-foreground)}
.ald-menu__sep{height:1px;background:var(--border);margin:4px -4px}
.ald-menu__label{padding:10px 10px 6px;font:500 11px/1 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted-foreground)}
`);

export function DropdownMenu({ trigger, items = [], align = 'start', open: forced, staticMenu = false }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const isOpen = forced ?? open;
  React.useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = e => {
      if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('[aria-haspopup]')?.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const els = [...ref.current.querySelectorAll('.ald-menu__item:not(:disabled)')];
        const i = els.indexOf(document.activeElement);
        els[(i + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length]?.focus();
      }
    };
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [open]);
  const trig = React.isValidElement(trigger)
    ? React.cloneElement(trigger, { 'aria-haspopup': 'menu', 'aria-expanded': isOpen, onClick: () => setOpen(o => !o) })
    : trigger;
  return (
    <div className={cx('ald-menu', staticMenu && 'ald-menu--static')} ref={ref}>
      {trig}
      {isOpen && (
        <div className={cx('ald-menu__list', 'ald-menu__list--' + align)} role="menu">
          {items.map((it, i) => it.type === 'separator' ? <div key={i} className="ald-menu__sep" role="separator" />
            : it.type === 'label' ? <div key={i} className="ald-menu__label">{it.label}</div>
            : <button key={i} type="button" role="menuitem" disabled={it.disabled} className={cx('ald-menu__item', it.destructive && 'ald-menu__item--danger')} onClick={() => { it.onSelect && it.onSelect(); setOpen(false); }}>
                {it.icon && <span className="ald-menu__icon">{it.icon}</span>}{it.label}{it.shortcut && <span className="ald-menu__kbd">{it.shortcut}</span>}
              </button>)}
        </div>
      )}
    </div>
  );
}
