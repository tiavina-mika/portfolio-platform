import React from 'react';
import { injectCss, cx } from '../_shared/css.js';
import { icon } from '../_shared/icons.jsx';

injectCss('ald-button', `
.ald-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:var(--control-h);padding:0 18px;border-radius:var(--radius-md);border:1px solid transparent;font:500 15px/1 var(--font-sans);letter-spacing:-0.005em;cursor:pointer;white-space:nowrap;text-decoration:none;user-select:none;transition:background-color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out)}
.ald-btn:focus-visible,.ald-btn[data-force=focus]{outline:none;box-shadow:var(--focus-ring)}
.ald-btn:active:not(:disabled){transform:translateY(1px)}
.ald-btn:disabled,.ald-btn[aria-disabled=true]{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-btn--primary{background:var(--primary);color:var(--primary-foreground)}
.ald-btn--primary:hover:not(:disabled),.ald-btn--primary[data-force=hover]{background:color-mix(in oklab,var(--primary) 86%,var(--background))}
.ald-btn--brand{background:var(--brand);color:var(--brand-foreground)}
.ald-btn--brand:hover:not(:disabled),.ald-btn--brand[data-force=hover]{background:color-mix(in oklab,var(--brand) 88%,#000)}
.ald-btn--secondary{background:var(--secondary);color:var(--secondary-foreground)}
.ald-btn--secondary:hover:not(:disabled),.ald-btn--secondary[data-force=hover]{background:color-mix(in oklab,var(--secondary),var(--foreground) 8%)}
.ald-btn--outline{background:transparent;color:var(--foreground);border-color:var(--input)}
.ald-btn--outline:hover:not(:disabled),.ald-btn--outline[data-force=hover]{background:var(--muted);border-color:color-mix(in oklab,var(--input),var(--foreground) 20%)}
.ald-btn--ghost{background:transparent;color:var(--foreground)}
.ald-btn--ghost:hover:not(:disabled),.ald-btn--ghost[data-force=hover]{background:var(--muted)}
.ald-btn--destructive{background:var(--destructive);color:var(--destructive-foreground)}
.ald-btn--destructive:hover:not(:disabled),.ald-btn--destructive[data-force=hover]{background:color-mix(in oklab,var(--destructive) 88%,#000)}
.ald-btn--link{background:none;color:var(--brand-text);height:auto;padding:0;text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
.ald-btn--link:hover:not(:disabled),.ald-btn--link[data-force=hover]{color:var(--foreground)}
.ald-btn--sm{height:var(--control-h-sm);padding:0 12px;font-size:14px;gap:6px}
.ald-btn--lg{height:var(--control-h-lg);padding:0 24px;font-size:16px}
.ald-btn--icon{width:var(--control-h);padding:0}
.ald-btn--icon.ald-btn--sm{width:var(--control-h-sm)}
.ald-btn--block{width:100%}
@keyframes ald-spin{to{transform:rotate(360deg)}}
.ald-btn__spin{animation:ald-spin .8s linear infinite}
`);

export function Button({ variant = 'primary', size = 'md', iconLeft, iconRight, loading = false, block = false, as, href, className, children, disabled, forceState, type = 'button', ...rest }) {
  const Tag = as || (href ? 'a' : 'button');
  const cls = cx('ald-btn', 'ald-btn--' + variant, size !== 'md' && 'ald-btn--' + size, block && 'ald-btn--block', className);
  const isBtn = Tag === 'button';
  return (
    <Tag className={cls} href={href} type={isBtn ? type : undefined} disabled={isBtn ? (disabled || loading) : undefined} aria-disabled={!isBtn && disabled ? true : undefined} aria-busy={loading || undefined} data-force={forceState} {...rest}>
      {loading ? <span className="ald-btn__spin" style={{ display: 'inline-flex' }}>{icon('loader', size === 'sm' ? 14 : 16)}</span> : iconLeft}
      {children}
      {iconRight}
    </Tag>
  );
}
