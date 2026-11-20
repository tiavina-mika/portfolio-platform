import React from 'react';
import { injectCss, cx } from '../_shared/css.js';

injectCss('ald-table', `
.ald-table-wrap{width:100%;overflow-x:auto;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--card)}
.ald-table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.4}
.ald-table th{text-align:left;font:500 12px/1 var(--font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted-foreground);padding:12px 16px;border-bottom:1px solid var(--border);background:var(--background);white-space:nowrap}
.ald-table td{padding:14px 16px;border-bottom:1px solid var(--border);vertical-align:middle}
.ald-table--dense td{padding:9px 16px}
.ald-table tbody tr:last-child td{border-bottom:0}
.ald-table tbody tr{transition:background-color var(--dur-fast) var(--ease-out)}
.ald-table--hover tbody tr:hover{background:color-mix(in oklab,var(--muted) 60%,transparent)}
.ald-table tr[aria-selected=true]{background:var(--accent)}
.ald-table__num{text-align:right;font-family:var(--font-mono);font-variant-numeric:tabular-nums}
th.ald-table__num{text-align:right}
.ald-table__empty{padding:40px 16px;text-align:center;color:var(--muted-foreground)}
.ald-table__foot{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-top:1px solid var(--border);font-size:13px;color:var(--muted-foreground)}
`);

export function Table({ columns = [], rows = [], rowKey = 'id', dense, hover = true, selected = [], onRowClick, empty = 'Aucun élément.', footer, caption }) {
  return (
    <div className="ald-table-wrap">
      <table className={cx('ald-table', dense && 'ald-table--dense', hover && 'ald-table--hover')}>
        {caption && <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{caption}</caption>}
        <thead><tr>{columns.map(c => <th key={c.key} className={c.align === 'right' || c.numeric ? 'ald-table__num' : ''} style={{ width: c.width }} scope="col">{c.header}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="ald-table__empty">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={r[rowKey] ?? i} aria-selected={selected.includes(r[rowKey]) || undefined} onClick={onRowClick ? () => onRowClick(r) : undefined} style={onRowClick ? { cursor: 'pointer' } : undefined}>
              {columns.map(c => <td key={c.key} className={c.align === 'right' || c.numeric ? 'ald-table__num' : ''}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && <div className="ald-table__foot">{footer}</div>}
    </div>
  );
}
