import React from 'react';
import { injectCss, cx } from '../_shared/css.js';

injectCss('ald-badge', `
.ald-badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:var(--radius-full);font:500 12px/1 var(--font-sans);white-space:nowrap;border:1px solid transparent;background:var(--muted);color:var(--foreground)}
.ald-badge--mono{font-family:var(--font-mono);letter-spacing:.02em}
.ald-badge--sm{height:20px;padding:0 7px;font-size:11px}
.ald-badge--square{border-radius:var(--radius-sm)}
.ald-badge--primary{background:var(--primary);color:var(--primary-foreground)}
.ald-badge--brand{background:var(--accent);color:var(--accent-foreground)}
.ald-badge--success{background:var(--success-subtle);color:var(--success)}
.ald-badge--warning{background:var(--warning-subtle);color:var(--warning)}
.ald-badge--destructive{background:var(--danger-subtle);color:var(--destructive)}
.ald-badge--info{background:var(--info-subtle);color:var(--info)}
.ald-badge--outline{background:transparent;border-color:var(--input);color:var(--foreground)}
.ald-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
`);

export function Badge({ variant = 'default', size = 'md', dot, mono, square, icon, className, children }) {
  return (
    <span className={cx('ald-badge', variant !== 'default' && 'ald-badge--' + variant, size === 'sm' && 'ald-badge--sm', mono && 'ald-badge--mono', square && 'ald-badge--square', className)}>
      {dot && <span className="ald-badge__dot" />}{icon}{children}
    </span>
  );
}
