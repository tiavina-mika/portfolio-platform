import React from 'react';
import { injectCss } from '../_shared/css.js';

injectCss('ald-switch', `
.ald-sw{display:inline-flex;align-items:center;gap:12px;min-height:var(--hit-min);cursor:pointer;font-size:15px;color:var(--foreground)}
.ald-sw[data-disabled=true]{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-sw__track{flex:none;position:relative;width:40px;height:24px;border-radius:var(--radius-full);border:1px solid transparent;background:var(--input);padding:0;cursor:inherit;transition:background-color var(--dur-base) var(--ease-out)}
.ald-sw:hover .ald-sw__track,.ald-sw__track[data-force=hover]{background:color-mix(in oklab,var(--input),var(--foreground) 22%)}
.ald-sw__track[aria-checked=true]{background:var(--primary)}
.ald-sw:hover .ald-sw__track[aria-checked=true]{background:color-mix(in oklab,var(--primary) 86%,var(--background))}
.ald-sw__track:focus-visible,.ald-sw__track[data-force=focus]{outline:none;box-shadow:var(--focus-ring)}
.ald-sw__thumb{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--card);box-shadow:var(--shadow-sm);transition:transform var(--dur-base) var(--ease-out)}
.ald-sw__track[aria-checked=true] .ald-sw__thumb{transform:translateX(16px);background:var(--primary-foreground)}
.ald-sw__desc{display:block;font-size:13px;color:var(--muted-foreground)}
`);

export function Switch({ checked, defaultChecked = false, onChange, label, description, disabled, id, forceState }) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked !== undefined ? checked : inner;
  const toggle = () => { if (disabled) return; const n = !on; if (checked === undefined) setInner(n); onChange && onChange(n); };
  return (
    <label className="ald-sw" data-disabled={disabled || undefined} onClick={e => { e.preventDefault(); toggle(); }}>
      <button type="button" id={id} role="switch" aria-checked={on} disabled={disabled} className="ald-sw__track" data-force={forceState}><span className="ald-sw__thumb" /></button>
      {(label || description) && <span>{label}{description && <span className="ald-sw__desc">{description}</span>}</span>}
    </label>
  );
}
