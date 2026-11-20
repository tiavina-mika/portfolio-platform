import React from 'react';
import { injectCss, cx } from '../_shared/css.js';
import { icon } from '../_shared/icons.jsx';

injectCss('ald-alert', `
.ald-alert{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:start;padding:14px 16px;border-radius:var(--radius-lg);border:1px solid var(--border);background:var(--card);color:var(--foreground);font-size:14px;line-height:1.5}
.ald-alert__icon{display:flex;padding-top:1px;color:var(--muted-foreground)}
.ald-alert__title{font-weight:600;font-size:15px;margin:0 0 2px}
.ald-alert__body{color:var(--muted-foreground)}
.ald-alert--info{background:var(--info-subtle);border-color:transparent}.ald-alert--info .ald-alert__icon,.ald-alert--info .ald-alert__title{color:var(--info)}
.ald-alert--success{background:var(--success-subtle);border-color:transparent}.ald-alert--success .ald-alert__icon,.ald-alert--success .ald-alert__title{color:var(--success)}
.ald-alert--warning{background:var(--warning-subtle);border-color:transparent}.ald-alert--warning .ald-alert__icon,.ald-alert--warning .ald-alert__title{color:var(--warning)}
.ald-alert--destructive{background:var(--danger-subtle);border-color:transparent}.ald-alert--destructive .ald-alert__icon,.ald-alert--destructive .ald-alert__title{color:var(--destructive)}
.ald-alert--info .ald-alert__body,.ald-alert--success .ald-alert__body,.ald-alert--warning .ald-alert__body,.ald-alert--destructive .ald-alert__body{color:var(--foreground)}
.ald-alert__actions{display:flex;gap:8px;align-items:center}
`);

const ICON = { neutral: 'info', info: 'info', success: 'success', warning: 'warning', destructive: 'error' };
export function Alert({ variant = 'neutral', title, icon: custom, action, className, children }) {
  return (
    <div className={cx('ald-alert', variant !== 'neutral' && 'ald-alert--' + variant, className)} role={variant === 'destructive' || variant === 'warning' ? 'alert' : 'status'}>
      <span className="ald-alert__icon">{custom || icon(ICON[variant], 20)}</span>
      <div>{title && <p className="ald-alert__title">{title}</p>}{children && <div className="ald-alert__body">{children}</div>}</div>
      {action ? <div className="ald-alert__actions">{action}</div> : <span />}
    </div>
  );
}
