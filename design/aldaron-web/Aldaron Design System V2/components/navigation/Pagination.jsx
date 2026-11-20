
import React from 'react';
import { injectCss, cx } from '../_shared/css.js';

injectCss('ald-pagination', `
.ald-pg{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px}
.ald-pg__list{display:flex;align-items:center;gap:4px;list-style:none;margin:0;padding:0}
.ald-pg__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:var(--hit-min);min-height:var(--hit-min);padding:0 12px;border-radius:var(--radius-md);border:1px solid transparent;background:transparent;color:var(--foreground);font:500 15px/1 var(--font-sans);cursor:pointer;transition:background-color var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ald-pg__btn--num{font-family:var(--font-mono);font-size:14px;padding:0}
.ald-pg__btn--nav{border-color:var(--input)}
.ald-pg__btn:hover:not(:disabled):not([aria-current=page]),.ald-pg__btn[data-force=hover]{background:var(--muted)}
.ald-pg__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ald-pg__btn:disabled{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-pg__btn[aria-current=page]{background:var(--primary);color:var(--primary-foreground);cursor:default}
.ald-pg__gap{display:inline-flex;align-items:center;justify-content:center;min-width:var(--hit-min);min-height:var(--hit-min);font:500 14px/1 var(--font-mono);color:var(--muted-foreground)}
.ald-pg__status{display:inline-flex;align-items:center;min-height:var(--hit-min);padding:0 8px;font:500 14px/1 var(--font-mono);color:var(--muted-foreground)}
`);

const DEFAULT_LABELS = { nav: 'Pagination', prev: 'Précédent', next: 'Suivant', page: 'Page' };

function range(page, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out = [1];
  const a = Math.max(2, page - 1), b = Math.min(count - 1, page + 1);
  if (a > 2) out.push('…');
  for (let i = a; i <= b; i++) out.push(i);
  if (b < count - 1) out.push('…');
  out.push(count);
  return out;
}

export function Pagination({ page = 1, pageCount = 1, onChange, compact = false, labels, className }) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const go = p => { if (p >= 1 && p <= pageCount && p !== page) onChange && onChange(p); };
  const prev = <button type="button" className="ald-pg__btn ald-pg__btn--nav" disabled={page <= 1} onClick={() => go(page - 1)}>{L.prev}</button>;
  const next = <button type="button" className="ald-pg__btn ald-pg__btn--nav" disabled={page >= pageCount} onClick={() => go(page + 1)}>{L.next}</button>;
  return (
    <nav aria-label={L.nav} className={cx('ald-pg', className)}>
      {prev}
      {compact
        ? <span className="ald-pg__status" aria-current="page">{page} / {pageCount}</span>
        : <ul className="ald-pg__list">
            {range(page, pageCount).map((p, i) => (
              <li key={p === '…' ? 'g' + i : p}>
                {p === '…'
                  ? <span className="ald-pg__gap" aria-hidden="true">…</span>
                  : <button type="button" className="ald-pg__btn ald-pg__btn--num" aria-label={L.page + ' ' + p} aria-current={p === page ? 'page' : undefined} onClick={() => go(p)}>{p}</button>}
              </li>
            ))}
          </ul>}
      {next}
    </nav>
  );
}
