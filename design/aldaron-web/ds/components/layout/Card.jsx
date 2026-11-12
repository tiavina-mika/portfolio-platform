import React from 'react';
import { injectCss, cx } from '../_shared/css.js';

injectCss('ald-card', `
.ald-card{background:var(--card);color:var(--card-foreground);border:1px solid var(--border);border-radius:var(--radius-lg);display:flex;flex-direction:column;min-width:0}
.ald-card--muted{background:var(--muted);border-color:transparent}
.ald-card--inverted{background:var(--primary);color:var(--primary-foreground);border-color:transparent}
.ald-card--inverted .ald-card__desc{color:color-mix(in oklab,var(--primary-foreground) 72%,var(--primary))}
.ald-card--elevated{box-shadow:var(--shadow-md);border-color:transparent}
.ald-card--interactive{cursor:pointer;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ald-card--interactive:hover{border-color:color-mix(in oklab,var(--border),var(--foreground) 22%);box-shadow:var(--shadow-sm)}
.ald-card--interactive:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ald-card__head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:var(--card-pad) var(--card-pad) 0}
.ald-card__eyebrow{font:500 12px/1 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted-foreground);margin-bottom:10px}
.ald-card__title{margin:0;font:700 20px/1.25 var(--font-display);letter-spacing:-0.01em}
.ald-card__desc{margin:6px 0 0;font-size:14px;line-height:1.5;color:var(--muted-foreground)}
.ald-card__body{padding:var(--card-pad);flex:1}
.ald-card__foot{padding:16px var(--card-pad);border-top:1px solid var(--border);display:flex;gap:8px;align-items:center;justify-content:flex-end}
.ald-card--inverted .ald-card__foot{border-color:color-mix(in oklab,var(--primary-foreground) 16%,transparent)}
`);

export function Card({ variant = 'default', padding = 24, eyebrow, title, description, action, footer, interactive, onClick, className, style, children }) {
  return (
    <div className={cx('ald-card', variant !== 'default' && 'ald-card--' + variant, interactive && 'ald-card--interactive', className)} style={{ '--card-pad': padding + 'px', ...style }} onClick={onClick} tabIndex={interactive ? 0 : undefined}>
      {(title || eyebrow || action) && (
        <div className="ald-card__head">
          <div>{eyebrow && <div className="ald-card__eyebrow">{eyebrow}</div>}{title && <h3 className="ald-card__title">{title}</h3>}{description && <p className="ald-card__desc">{description}</p>}</div>
          {action}
        </div>
      )}
      {children !== undefined && <div className="ald-card__body">{children}</div>}
      {footer && <div className="ald-card__foot">{footer}</div>}
    </div>
  );
}
