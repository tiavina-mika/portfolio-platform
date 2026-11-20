import React from 'react';
import { injectCss, cx } from '../_shared/css.js';
import { icon } from '../_shared/icons.jsx';

injectCss('ald-checkbox', `
.ald-check{display:inline-flex;align-items:flex-start;gap:10px;min-height:var(--hit-min);padding:12px 0;cursor:pointer;font-size:15px;line-height:20px;color:var(--foreground)}
.ald-check[data-disabled=true]{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-check__box{flex:none;width:20px;height:20px;border-radius:var(--radius-sm);border:1px solid var(--input);background:var(--card);color:var(--primary-foreground);display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:inherit;transition:background-color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ald-check:hover .ald-check__box,.ald-check__box[data-force=hover]{border-color:color-mix(in oklab,var(--input),var(--foreground) 35%)}
.ald-check__box:focus-visible,.ald-check__box[data-force=focus]{outline:none;box-shadow:var(--focus-ring)}
.ald-check__box[aria-checked=true],.ald-check__box[aria-checked=mixed]{background:var(--primary);border-color:var(--primary)}
.ald-check__box[aria-invalid=true]{border-color:var(--destructive)}
.ald-check__text{display:grid;gap:2px}
.ald-check__desc{font-size:13px;color:var(--muted-foreground);line-height:18px}
`);

export function Checkbox({ checked, defaultChecked = false, indeterminate = false, onChange, label, description, disabled, invalid, id, forceState }) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked !== undefined ? checked : inner;
  const toggle = () => { if (disabled) return; const n = !on; if (checked === undefined) setInner(n); onChange && onChange(n); };
  const state = indeterminate ? 'mixed' : on;
  return (
    <label className="ald-check" data-disabled={disabled || undefined} onClick={e => { e.preventDefault(); toggle(); }}>
      <button type="button" id={id} role="checkbox" aria-checked={state} aria-invalid={invalid || undefined} disabled={disabled} className="ald-check__box" data-force={forceState}>
        {indeterminate ? icon('minus', 14) : on ? icon('check', 14) : null}
      </button>
      {(label || description) && <span className="ald-check__text">{label && <span>{label}</span>}{description && <span className="ald-check__desc">{description}</span>}</span>}
    </label>
  );
}
