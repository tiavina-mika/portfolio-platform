import React from 'react';
import { injectCss, cx } from '../_shared/css.js';
import { icon } from '../_shared/icons.jsx';

injectCss('ald-select', `
.ald-select{position:relative;width:100%}
.ald-select__trigger{width:100%;height:var(--control-h);padding:0 12px 0 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--input);border-radius:var(--radius-md);background:var(--card);color:var(--foreground);font:400 15px/1 var(--font-sans);cursor:pointer;text-align:left;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ald-select__trigger:hover:not(:disabled),.ald-select__trigger[data-force=hover]{border-color:color-mix(in oklab,var(--input),var(--foreground) 28%)}
.ald-select__trigger:focus-visible,.ald-select__trigger[data-force=focus],.ald-select__trigger[aria-expanded=true]{outline:none;border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklab,var(--ring) 22%,transparent)}
.ald-select__trigger[aria-invalid=true]{border-color:var(--destructive)}
.ald-select__trigger:disabled{opacity:var(--disabled-opacity);cursor:not-allowed;background:var(--muted)}
.ald-select__ph{color:var(--muted-foreground)}
.ald-select__chev{color:var(--muted-foreground);display:flex}
.ald-select__list{position:absolute;z-index:50;left:0;right:0;top:calc(100% + 6px);margin:0;padding:4px;list-style:none;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);max-height:260px;overflow:auto}
.ald-select__opt{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:40px;padding:0 10px;border-radius:var(--radius-sm);font-size:15px;cursor:pointer}
.ald-select__opt[data-active=true]{background:var(--muted)}
.ald-select__opt[aria-disabled=true]{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-select__opt[aria-selected=true]{font-weight:600}
`);

export function Select({ options = [], value, defaultValue, onChange, placeholder = 'Choisir…', invalid, disabled, id, open: forcedOpen, forceState, 'aria-label': ariaLabel }) {
  const [inner, setInner] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const ref = React.useRef(null);
  const cur = value !== undefined ? value : inner;
  const isOpen = forcedOpen ?? open;
  const sel = options.find(o => o.value === cur);
  React.useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const pick = o => { if (o.disabled) return; if (value === undefined) setInner(o.value); onChange && onChange(o.value); setOpen(false); };
  const move = d => { let i = active; for (let n = 0; n < options.length; n++) { i = (i + d + options.length) % options.length; if (!options[i].disabled) break; } setActive(i); };
  const onKey = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!open) { setOpen(true); setActive(Math.max(0, options.indexOf(sel))); } else move(e.key === 'ArrowDown' ? 1 : -1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (open && active >= 0) pick(options[active]); else setOpen(true); }
    else if (e.key === 'Escape') setOpen(false);
  };
  return (
    <div className="ald-select" ref={ref}>
      <button type="button" id={id} className="ald-select__trigger" role="combobox" aria-haspopup="listbox" aria-expanded={isOpen} aria-invalid={invalid || undefined} aria-label={ariaLabel} disabled={disabled} data-force={forceState} onClick={() => setOpen(o => !o)} onKeyDown={onKey}>
        <span className={sel ? '' : 'ald-select__ph'}>{sel ? sel.label : placeholder}</span>
        <span className="ald-select__chev">{icon('chevronsUpDown', 16)}</span>
      </button>
      {isOpen && (
        <ul className="ald-select__list" role="listbox">
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === cur} aria-disabled={o.disabled || undefined} data-active={i === active} className="ald-select__opt" onMouseEnter={() => setActive(i)} onMouseDown={e => { e.preventDefault(); pick(o); }}>
              <span>{o.label}</span>{o.value === cur && icon('check', 16)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
