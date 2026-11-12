import React from 'react';
import { injectCss, cx } from '../_shared/css.js';

injectCss('ald-input', `
.ald-field{position:relative;display:flex;align-items:center;width:100%}
.ald-input{width:100%;height:var(--control-h);padding:0 14px;border:1px solid var(--input);border-radius:var(--radius-md);background:var(--card);color:var(--foreground);font:400 15px/1.4 var(--font-sans);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out);outline:none}
.ald-input::placeholder{color:var(--muted-foreground)}
.ald-input:hover:not(:disabled),.ald-input[data-force=hover]{border-color:color-mix(in oklab,var(--input),var(--foreground) 28%)}
.ald-input:focus-visible,.ald-input[data-force=focus]{border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklab,var(--ring) 22%,transparent)}
.ald-input[aria-invalid=true]{border-color:var(--destructive)}
.ald-input[aria-invalid=true]:focus-visible{box-shadow:0 0 0 3px color-mix(in oklab,var(--destructive) 20%,transparent)}
.ald-input:disabled{opacity:var(--disabled-opacity);cursor:not-allowed;background:var(--muted)}
.ald-input--sm{height:var(--control-h-sm);font-size:14px;padding:0 12px}
.ald-input--lead{padding-left:40px}.ald-input--trail{padding-right:44px}
.ald-field__lead,.ald-field__trail{position:absolute;display:flex;align-items:center;color:var(--muted-foreground);pointer-events:none}
.ald-field__lead{left:13px}.ald-field__trail{right:14px;font:500 13px var(--font-mono)}
textarea.ald-input{height:auto;min-height:112px;padding:12px 14px;resize:vertical;line-height:1.55}
`);

export const Input = React.forwardRef(function Input({ size = 'md', invalid, leading, trailing, className, forceState, ...rest }, ref) {
  return (
    <span className="ald-field">
      {leading && <span className="ald-field__lead">{leading}</span>}
      <input ref={ref} className={cx('ald-input', size === 'sm' && 'ald-input--sm', leading && 'ald-input--lead', trailing && 'ald-input--trail', className)} aria-invalid={invalid || undefined} data-force={forceState} {...rest} />
      {trailing && <span className="ald-field__trail">{trailing}</span>}
    </span>
  );
});

export const Textarea = React.forwardRef(function Textarea({ invalid, className, ...rest }, ref) {
  return <textarea ref={ref} className={cx('ald-input', className)} aria-invalid={invalid || undefined} {...rest} />;
});
