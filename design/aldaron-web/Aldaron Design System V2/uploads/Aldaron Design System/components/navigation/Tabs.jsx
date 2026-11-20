import React from 'react';
import { injectCss, cx } from '../_shared/css.js';

injectCss('ald-tabs', `
.ald-tabs__list{display:flex;gap:4px;align-items:stretch;overflow-x:auto;scrollbar-width:none}
.ald-tabs__list--underline{gap:24px;border-bottom:1px solid var(--border)}
.ald-tabs__list--pill{display:inline-flex;padding:4px;background:var(--muted);border-radius:var(--radius-lg)}
.ald-tab{position:relative;display:inline-flex;align-items:center;gap:8px;min-height:var(--hit-min);padding:0 2px;background:none;border:0;font:500 15px/1 var(--font-sans);color:var(--muted-foreground);cursor:pointer;white-space:nowrap;transition:color var(--dur-fast) var(--ease-out),background-color var(--dur-fast) var(--ease-out)}
.ald-tab:hover:not(:disabled),.ald-tab[data-force=hover]{color:var(--foreground)}
.ald-tab:focus-visible{outline:none;box-shadow:var(--focus-ring);border-radius:var(--radius-sm)}
.ald-tab:disabled{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-tabs__list--underline .ald-tab[aria-selected=true]{color:var(--foreground)}
.ald-tabs__list--underline .ald-tab[aria-selected=true]::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--foreground)}
.ald-tabs__list--pill .ald-tab{min-height:36px;padding:0 14px;border-radius:var(--radius-md);font-size:14px}
.ald-tabs__list--pill .ald-tab[aria-selected=true]{background:var(--card);color:var(--foreground);box-shadow:var(--shadow-sm)}
.ald-tab__count{font:500 12px/1 var(--font-mono);padding:3px 6px;border-radius:var(--radius-full);background:var(--muted);color:var(--muted-foreground)}
.ald-tabs__list--pill .ald-tab__count{background:var(--background)}
.ald-tabs__panel{padding-top:20px}
.ald-tabs__panel:focus-visible{outline:none;box-shadow:var(--focus-ring)}
`);

let uid = 0;
export function Tabs({ items = [], value, defaultValue, onChange, variant = 'underline', className }) {
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.value);
  const [id] = React.useState(() => 'ald-tabs-' + (++uid));
  const cur = value !== undefined ? value : inner;
  const set = v => { if (value === undefined) setInner(v); onChange && onChange(v); };
  const refs = React.useRef([]);
  const onKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const d = e.key === 'ArrowRight' ? 1 : -1; let j = i;
    do { j = (j + d + items.length) % items.length; } while (items[j].disabled && j !== i);
    set(items[j].value); refs.current[j]?.focus();
  };
  const active = items.find(t => t.value === cur);
  return (
    <div className={className}>
      <div role="tablist" className={cx('ald-tabs__list', 'ald-tabs__list--' + variant)}>
        {items.map((t, i) => (
          <button key={t.value} ref={el => refs.current[i] = el} role="tab" type="button" id={id + '-t-' + t.value} aria-controls={id + '-p-' + t.value} aria-selected={t.value === cur} tabIndex={t.value === cur ? 0 : -1} disabled={t.disabled} className="ald-tab" onClick={() => set(t.value)} onKeyDown={e => onKey(e, i)}>
            {t.icon}{t.label}{t.count !== undefined && <span className="ald-tab__count">{t.count}</span>}
          </button>
        ))}
      </div>
      {active && active.content !== undefined && <div role="tabpanel" id={id + '-p-' + active.value} aria-labelledby={id + '-t-' + active.value} tabIndex={0} className="ald-tabs__panel">{active.content}</div>}
    </div>
  );
}
