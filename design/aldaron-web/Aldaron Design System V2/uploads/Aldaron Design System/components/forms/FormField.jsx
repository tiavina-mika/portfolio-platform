import React from 'react';
import { injectCss } from '../_shared/css.js';
import { icon } from '../_shared/icons.jsx';

injectCss('ald-formfield', `
.ald-ff{display:grid;gap:6px;min-width:0}
.ald-label{font:500 14px/1.3 var(--font-sans);color:var(--foreground);display:flex;gap:4px;align-items:baseline}
.ald-label__req{color:var(--brand-text)}
.ald-label__opt{font-weight:400;color:var(--muted-foreground);font-size:13px}
.ald-ff__desc{font-size:13px;line-height:1.45;color:var(--muted-foreground)}
.ald-ff__err{font-size:13px;line-height:1.45;color:var(--destructive);display:flex;gap:6px;align-items:flex-start}
.ald-ff__err svg{margin-top:2px}
`);

export function Label({ htmlFor, required, optional, children }) {
  return (
    <label className="ald-label" htmlFor={htmlFor}>
      {children}
      {required && <span className="ald-label__req" aria-hidden="true">*</span>}
      {optional && <span className="ald-label__opt">(facultatif)</span>}
    </label>
  );
}

export function FormField({ label, htmlFor, description, error, required, optional, children }) {
  return (
    <div className="ald-ff">
      {label && <Label htmlFor={htmlFor} required={required} optional={optional}>{label}</Label>}
      {children}
      {error ? <div className="ald-ff__err" role="alert">{icon('error', 14)}<span>{error}</span></div> : description && <div className="ald-ff__desc">{description}</div>}
    </div>
  );
}
