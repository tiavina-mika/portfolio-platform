import React from 'react';
// Tracés Lucide (ISC) — sous-ensemble interne utilisé par les composants.
const C = (r = 10) => ({ t: 'circle', cx: 12, cy: 12, r });
const P = {
  check: ['M20 6 9 17l-5-5'],
  minus: ['M5 12h14'],
  chevronDown: ['m6 9 6 6 6-6'],
  chevronsUpDown: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  info: [C(), 'M12 16v-4', 'M12 8h.01'],
  success: [C(), 'm9 12 2 2 4-4'],
  warning: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  error: [C(), 'M12 8v4', 'M12 16h.01'],
  loader: ['M21 12a9 9 0 1 1-6.219-8.56'],
};
export function icon(name, size = 16, style) {
  const parts = P[name] || [];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={size <= 16 ? 2 : 1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', ...style }}>
      {parts.map((p, i) => typeof p === 'string' ? <path key={i} d={p} /> : <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />)}
    </svg>
  );
}
