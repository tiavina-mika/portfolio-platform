/* @ds-bundle: {"format":4,"namespace":"AldaronDesignSystem_1daf3c","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Toaster","sourcePath":"components/feedback/Toast.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Label","sourcePath":"components/forms/FormField.jsx"},{"name":"FormField","sourcePath":"components/forms/FormField.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Card","sourcePath":"components/layout/Card.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Dialog","sourcePath":"components/overlays/Dialog.jsx"},{"name":"DropdownMenu","sourcePath":"components/overlays/DropdownMenu.jsx"}],"sourceHashes":{"components/_shared/css.js":"e80b2ec6263e","components/_shared/icons.jsx":"8b76b88c6f14","components/actions/Button.jsx":"90efddaaafdb","components/data/Table.jsx":"ce28e3ad3cbf","components/feedback/Alert.jsx":"2f9585fe8c3b","components/feedback/Badge.jsx":"4d62f91e709b","components/feedback/Toast.jsx":"4bcb6f142889","components/forms/Checkbox.jsx":"bb4a3ca3eb96","components/forms/FormField.jsx":"78924cadcbea","components/forms/Input.jsx":"2422094a8520","components/forms/Select.jsx":"b471d2492080","components/forms/Switch.jsx":"beb98621437d","components/layout/Card.jsx":"ab258658d1ff","components/navigation/Tabs.jsx":"1e8771b3bd8b","components/overlays/Dialog.jsx":"c44174c10d10","components/overlays/DropdownMenu.jsx":"979482e4819e","export/nextjs/tailwind.config.ts":"6c8a8e09691f","ui_kits/back-office/Content.jsx":"8b16f1c95ff5","ui_kits/back-office/Dashboard.jsx":"46df664dae70","ui_kits/back-office/Login.jsx":"28a405f07746","ui_kits/back-office/Settings.jsx":"1b0796f0ba47","ui_kits/back-office/Shell.jsx":"4fe47a66b0b1","ui_kits/back-office/Users.jsx":"c8f23a30fce4"},"inlinedExternals":[],"unexposedExports":[{"name":"cx","sourcePath":"components/_shared/css.js"},{"name":"icon","sourcePath":"components/_shared/icons.jsx"},{"name":"injectCss","sourcePath":"components/_shared/css.js"}]} */

(() => {

const __ds_ns = (window.AldaronDesignSystem_1daf3c = window.AldaronDesignSystem_1daf3c || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/_shared/css.js
try { (() => {
function injectCss(id, css) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id;
  s.textContent = css;
  document.head.appendChild(s);
}
function cx(...a) {
  return a.filter(Boolean).join(' ');
}
Object.assign(__ds_scope, { injectCss, cx });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/_shared/css.js", error: String((e && e.message) || e) }); }

// components/_shared/icons.jsx
try { (() => {
// Tracés Lucide (ISC) — sous-ensemble interne utilisé par les composants.
const C = (r = 10) => ({
  t: 'circle',
  cx: 12,
  cy: 12,
  r
});
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
  loader: ['M21 12a9 9 0 1 1-6.219-8.56']
};
function icon(name, size = 16, style) {
  const parts = P[name] || [];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: size <= 16 ? 2 : 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      flex: 'none',
      ...style
    }
  }, parts.map((p, i) => typeof p === 'string' ? /*#__PURE__*/React.createElement("path", {
    key: i,
    d: p
  }) : /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p.cx,
    cy: p.cy,
    r: p.r
  })));
}
Object.assign(__ds_scope, { icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/_shared/icons.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
__ds_scope.injectCss('ald-button', `
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
function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  block = false,
  as,
  href,
  className,
  children,
  disabled,
  forceState,
  type = 'button',
  ...rest
}) {
  const Tag = as || (href ? 'a' : 'button');
  const cls = __ds_scope.cx('ald-btn', 'ald-btn--' + variant, size !== 'md' && 'ald-btn--' + size, block && 'ald-btn--block', className);
  const isBtn = Tag === 'button';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls,
    href: href,
    type: isBtn ? type : undefined,
    disabled: isBtn ? disabled || loading : undefined,
    "aria-disabled": !isBtn && disabled ? true : undefined,
    "aria-busy": loading || undefined,
    "data-force": forceState
  }, rest), loading ? /*#__PURE__*/React.createElement("span", {
    className: "ald-btn__spin",
    style: {
      display: 'inline-flex'
    }
  }, __ds_scope.icon('loader', size === 'sm' ? 14 : 16)) : iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
__ds_scope.injectCss('ald-table', `
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
function Table({
  columns = [],
  rows = [],
  rowKey = 'id',
  dense,
  hover = true,
  selected = [],
  onRowClick,
  empty = 'Aucun élément.',
  footer,
  caption
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ald-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: __ds_scope.cx('ald-table', dense && 'ald-table--dense', hover && 'ald-table--hover')
  }, caption && /*#__PURE__*/React.createElement("caption", {
    style: {
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)'
    }
  }, caption), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    className: c.align === 'right' || c.numeric ? 'ald-table__num' : '',
    style: {
      width: c.width
    },
    scope: "col"
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    className: "ald-table__empty"
  }, empty)), rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r[rowKey] ?? i,
    "aria-selected": selected.includes(r[rowKey]) || undefined,
    onClick: onRowClick ? () => onRowClick(r) : undefined,
    style: onRowClick ? {
      cursor: 'pointer'
    } : undefined
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    className: c.align === 'right' || c.numeric ? 'ald-table__num' : ''
  }, c.render ? c.render(r) : r[c.key])))))), footer && /*#__PURE__*/React.createElement("div", {
    className: "ald-table__foot"
  }, footer));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
__ds_scope.injectCss('ald-alert', `
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
const ICON = {
  neutral: 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  destructive: 'error'
};
function Alert({
  variant = 'neutral',
  title,
  icon: custom,
  action,
  className,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: __ds_scope.cx('ald-alert', variant !== 'neutral' && 'ald-alert--' + variant, className),
    role: variant === 'destructive' || variant === 'warning' ? 'alert' : 'status'
  }, /*#__PURE__*/React.createElement("span", {
    className: "ald-alert__icon"
  }, custom || __ds_scope.icon(ICON[variant], 20)), /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("p", {
    className: "ald-alert__title"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    className: "ald-alert__body"
  }, children)), action ? /*#__PURE__*/React.createElement("div", {
    className: "ald-alert__actions"
  }, action) : /*#__PURE__*/React.createElement("span", null));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
__ds_scope.injectCss('ald-badge', `
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
function Badge({
  variant = 'default',
  size = 'md',
  dot,
  mono,
  square,
  icon,
  className,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: __ds_scope.cx('ald-badge', variant !== 'default' && 'ald-badge--' + variant, size === 'sm' && 'ald-badge--sm', mono && 'ald-badge--mono', square && 'ald-badge--square', className)
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: "ald-badge__dot"
  }), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
__ds_scope.injectCss('ald-toast', `
@keyframes ald-toast-in{from{opacity:0;transform:translateY(12px)}}
.ald-toast{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:start;width:380px;max-width:calc(100vw - 32px);padding:14px 8px 14px 16px;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);font-size:14px;line-height:1.45;animation:ald-toast-in var(--dur-slow) var(--ease-out)}
.ald-toast--static{animation:none}
.ald-toast--inverted{background:var(--primary);color:var(--primary-foreground);border-color:transparent}
.ald-toast__icon{display:flex;padding-top:1px}
.ald-toast--success .ald-toast__icon{color:var(--success)}.ald-toast--destructive .ald-toast__icon{color:var(--destructive)}.ald-toast--warning .ald-toast__icon{color:var(--warning)}.ald-toast--info .ald-toast__icon{color:var(--info)}
.ald-toast__title{font-weight:600;font-size:15px}
.ald-toast__desc{color:var(--muted-foreground);margin-top:2px}
.ald-toast--inverted .ald-toast__desc{color:color-mix(in oklab,var(--primary-foreground) 72%,var(--primary))}
.ald-toast__action{margin-top:10px}
.ald-toast__close{width:32px;height:32px;margin-top:-6px;display:flex;align-items:center;justify-content:center;border:0;background:none;border-radius:var(--radius-sm);color:inherit;opacity:.6;cursor:pointer}
.ald-toast__close:hover{opacity:1;background:color-mix(in oklab,currentColor 10%,transparent)}
.ald-toast__close:focus-visible{outline:none;box-shadow:var(--focus-ring);opacity:1}
.ald-toaster{position:fixed;z-index:200;bottom:24px;right:24px;display:flex;flex-direction:column;gap:10px;align-items:flex-end}
@media (prefers-reduced-motion:reduce){.ald-toast{animation:none}}
`);
const ICON = {
  success: 'success',
  destructive: 'error',
  warning: 'warning',
  info: 'info'
};
function Toast({
  variant = 'default',
  title,
  description,
  action,
  onClose,
  isStatic,
  closeLabel = 'Fermer'
}) {
  const ic = ICON[variant];
  return /*#__PURE__*/React.createElement("div", {
    className: __ds_scope.cx('ald-toast', 'ald-toast--' + variant, isStatic && 'ald-toast--static'),
    role: variant === 'destructive' ? 'alert' : 'status',
    "aria-live": "polite"
  }, ic ? /*#__PURE__*/React.createElement("span", {
    className: "ald-toast__icon"
  }, __ds_scope.icon(ic, 20)) : /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("div", {
    className: "ald-toast__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "ald-toast__desc"
  }, description), action && /*#__PURE__*/React.createElement("div", {
    className: "ald-toast__action"
  }, action)), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ald-toast__close",
    "aria-label": closeLabel,
    onClick: onClose
  }, __ds_scope.icon('x', 16)) : /*#__PURE__*/React.createElement("span", null));
}
let push = null;
function Toaster({
  duration = 5000
}) {
  const [list, setList] = React.useState([]);
  React.useEffect(() => {
    push = t => {
      const id = Math.random().toString(36).slice(2);
      setList(l => [...l, {
        ...t,
        id
      }]);
      if ((t.duration ?? duration) > 0) setTimeout(() => setList(l => l.filter(x => x.id !== id)), t.duration ?? duration);
    };
    return () => {
      push = null;
    };
  }, [duration]);
  return /*#__PURE__*/React.createElement("div", {
    className: "ald-toaster",
    "aria-live": "polite"
  }, list.map(t => /*#__PURE__*/React.createElement(Toast, _extends({
    key: t.id
  }, t, {
    onClose: () => setList(l => l.filter(x => x.id !== t.id))
  }))));
}
Toaster.show = t => push && push(t);
Object.assign(__ds_scope, { Toast, Toaster });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
__ds_scope.injectCss('ald-checkbox', `
.ald-check{display:inline-flex;align-items:flex-start;gap:10px;min-height:var(--hit-min);padding:12px 0;cursor:pointer;font-size:15px;line-height:20px;color:var(--foreground)}
.ald-check[data-disabled=true]{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-check__box{flex:none;width:20px;height:20px;border-radius:var(--radius-sm);border:1px solid var(--input);background:var(--card);color:var(--primary-foreground);display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:inherit;transition:background-color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ald-check:hover .ald-check__box,.ald-check__box[data-force=hover]{border-color:color-mix(in oklab,var(--input),var(--foreground) 35%)}
.ald-check__box:focus-visible,.ald-check__box[data-force=focus]{outline:none;box-shadow:var(--focus-ring)}
.ald-check__box[aria-checked=true],.ald-check__box[aria-checked=mixed]{background:var(--primary);border-color:var(--primary)}
.ald-check__box[aria-invalid=true]{border-color:var(--destructive)}
.ald-check__text{display:grid;gap:2px}
.ald-check__desc{font-size:13px;color:var(--muted-foreground);line-height:18px}
`);
function Checkbox({
  checked,
  defaultChecked = false,
  indeterminate = false,
  onChange,
  label,
  description,
  disabled,
  invalid,
  id,
  forceState
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked !== undefined ? checked : inner;
  const toggle = () => {
    if (disabled) return;
    const n = !on;
    if (checked === undefined) setInner(n);
    onChange && onChange(n);
  };
  const state = indeterminate ? 'mixed' : on;
  return /*#__PURE__*/React.createElement("label", {
    className: "ald-check",
    "data-disabled": disabled || undefined,
    onClick: e => {
      e.preventDefault();
      toggle();
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    id: id,
    role: "checkbox",
    "aria-checked": state,
    "aria-invalid": invalid || undefined,
    disabled: disabled,
    className: "ald-check__box",
    "data-force": forceState
  }, indeterminate ? __ds_scope.icon('minus', 14) : on ? __ds_scope.icon('check', 14) : null), (label || description) && /*#__PURE__*/React.createElement("span", {
    className: "ald-check__text"
  }, label && /*#__PURE__*/React.createElement("span", null, label), description && /*#__PURE__*/React.createElement("span", {
    className: "ald-check__desc"
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/FormField.jsx
try { (() => {
__ds_scope.injectCss('ald-formfield', `
.ald-ff{display:grid;gap:6px;min-width:0}
.ald-label{font:500 14px/1.3 var(--font-sans);color:var(--foreground);display:flex;gap:4px;align-items:baseline}
.ald-label__req{color:var(--brand-text)}
.ald-label__opt{font-weight:400;color:var(--muted-foreground);font-size:13px}
.ald-ff__desc{font-size:13px;line-height:1.45;color:var(--muted-foreground)}
.ald-ff__err{font-size:13px;line-height:1.45;color:var(--destructive);display:flex;gap:6px;align-items:flex-start}
.ald-ff__err svg{margin-top:2px}
`);
function Label({
  htmlFor,
  required,
  optional,
  children
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "ald-label",
    htmlFor: htmlFor
  }, children, required && /*#__PURE__*/React.createElement("span", {
    className: "ald-label__req",
    "aria-hidden": "true"
  }, "*"), optional && /*#__PURE__*/React.createElement("span", {
    className: "ald-label__opt"
  }, "(facultatif)"));
}
function FormField({
  label,
  htmlFor,
  description,
  error,
  required,
  optional,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ald-ff"
  }, label && /*#__PURE__*/React.createElement(Label, {
    htmlFor: htmlFor,
    required: required,
    optional: optional
  }, label), children, error ? /*#__PURE__*/React.createElement("div", {
    className: "ald-ff__err",
    role: "alert"
  }, __ds_scope.icon('error', 14), /*#__PURE__*/React.createElement("span", null, error)) : description && /*#__PURE__*/React.createElement("div", {
    className: "ald-ff__desc"
  }, description));
}
Object.assign(__ds_scope, { Label, FormField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FormField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
__ds_scope.injectCss('ald-input', `
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
const Input = React.forwardRef(function Input({
  size = 'md',
  invalid,
  leading,
  trailing,
  className,
  forceState,
  ...rest
}, ref) {
  return /*#__PURE__*/React.createElement("span", {
    className: "ald-field"
  }, leading && /*#__PURE__*/React.createElement("span", {
    className: "ald-field__lead"
  }, leading), /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    className: __ds_scope.cx('ald-input', size === 'sm' && 'ald-input--sm', leading && 'ald-input--lead', trailing && 'ald-input--trail', className),
    "aria-invalid": invalid || undefined,
    "data-force": forceState
  }, rest)), trailing && /*#__PURE__*/React.createElement("span", {
    className: "ald-field__trail"
  }, trailing));
});
const Textarea = React.forwardRef(function Textarea({
  invalid,
  className,
  ...rest
}, ref) {
  return /*#__PURE__*/React.createElement("textarea", _extends({
    ref: ref,
    className: __ds_scope.cx('ald-input', className),
    "aria-invalid": invalid || undefined
  }, rest));
});
Object.assign(__ds_scope, { Input, Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
__ds_scope.injectCss('ald-select', `
.ald-select{position:relative;width:100%}
.ald-select__trigger{width:100%;height:var(--control-h);padding:0 12px 0 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--input);border-radius:var(--radius-md);background:var(--card);color:var(--foreground);font:400 15px/1 var(--font-sans);cursor:pointer;text-align:left;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ald-select__trigger:hover:not(:disabled),.ald-select__trigger[data-force=hover]{border-color:color-mix(in oklab,var(--input),var(--foreground) 28%)}
.ald-select__trigger:focus-visible,.ald-select__trigger[data-force=focus],.ald-select__trigger[aria-expanded=true]{outline:none;border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in oklab,var(--ring) 22%,transparent)}
.ald-select__trigger[aria-invalid=true]{border-color:var(--destructive)}
.ald-select__trigger:disabled{opacity:var(--disabled-opacity);cursor:not-allowed;background:var(--muted)}
.ald-select__ph{color:var(--muted-foreground)}
.ald-select__chev{color:var(--muted-foreground);display:flex}
.ald-select__list{position:absolute;z-index:50;left:0;right:0;top:calc(100% + 6px);margin:0;padding:4px;list-style:none;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);max-height:260px;overflow:auto}
.ald-select__opt{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:40px;padding:0 10px;border-radius:var(--radius-sm);font-size:15px;cursor:pointer}
.ald-select__opt[data-active=true]{background:var(--muted)}
.ald-select__opt[aria-disabled=true]{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-select__opt[aria-selected=true]{font-weight:600}
`);
function Select({
  options = [],
  value,
  defaultValue,
  onChange,
  placeholder = 'Choisir…',
  invalid,
  disabled,
  id,
  open: forcedOpen,
  forceState,
  'aria-label': ariaLabel
}) {
  const [inner, setInner] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const ref = React.useRef(null);
  const cur = value !== undefined ? value : inner;
  const isOpen = forcedOpen ?? open;
  const sel = options.find(o => o.value === cur);
  React.useEffect(() => {
    if (!open) return;
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const pick = o => {
    if (o.disabled) return;
    if (value === undefined) setInner(o.value);
    onChange && onChange(o.value);
    setOpen(false);
  };
  const move = d => {
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + d + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  };
  const onKey = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(Math.max(0, options.indexOf(sel)));
      } else move(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && active >= 0) pick(options[active]);else setOpen(true);
    } else if (e.key === 'Escape') setOpen(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ald-select",
    ref: ref
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    id: id,
    className: "ald-select__trigger",
    role: "combobox",
    "aria-haspopup": "listbox",
    "aria-expanded": isOpen,
    "aria-invalid": invalid || undefined,
    "aria-label": ariaLabel,
    disabled: disabled,
    "data-force": forceState,
    onClick: () => setOpen(o => !o),
    onKeyDown: onKey
  }, /*#__PURE__*/React.createElement("span", {
    className: sel ? '' : 'ald-select__ph'
  }, sel ? sel.label : placeholder), /*#__PURE__*/React.createElement("span", {
    className: "ald-select__chev"
  }, __ds_scope.icon('chevronsUpDown', 16))), isOpen && /*#__PURE__*/React.createElement("ul", {
    className: "ald-select__list",
    role: "listbox"
  }, options.map((o, i) => /*#__PURE__*/React.createElement("li", {
    key: o.value,
    role: "option",
    "aria-selected": o.value === cur,
    "aria-disabled": o.disabled || undefined,
    "data-active": i === active,
    className: "ald-select__opt",
    onMouseEnter: () => setActive(i),
    onMouseDown: e => {
      e.preventDefault();
      pick(o);
    }
  }, /*#__PURE__*/React.createElement("span", null, o.label), o.value === cur && __ds_scope.icon('check', 16)))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
__ds_scope.injectCss('ald-switch', `
.ald-sw{display:inline-flex;align-items:center;gap:12px;min-height:var(--hit-min);cursor:pointer;font-size:15px;color:var(--foreground)}
.ald-sw[data-disabled=true]{opacity:var(--disabled-opacity);cursor:not-allowed}
.ald-sw__track{flex:none;position:relative;width:40px;height:24px;border-radius:var(--radius-full);border:1px solid transparent;background:var(--input);padding:0;cursor:inherit;transition:background-color var(--dur-base) var(--ease-out)}
.ald-sw:hover .ald-sw__track,.ald-sw__track[data-force=hover]{background:color-mix(in oklab,var(--input),var(--foreground) 22%)}
.ald-sw__track[aria-checked=true]{background:var(--primary)}
.ald-sw:hover .ald-sw__track[aria-checked=true]{background:color-mix(in oklab,var(--primary) 86%,var(--background))}
.ald-sw__track:focus-visible,.ald-sw__track[data-force=focus]{outline:none;box-shadow:var(--focus-ring)}
.ald-sw__thumb{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--card);box-shadow:var(--shadow-sm);transition:transform var(--dur-base) var(--ease-out)}
.ald-sw__track[aria-checked=true] .ald-sw__thumb{transform:translateX(16px);background:var(--primary-foreground)}
.ald-sw__desc{display:block;font-size:13px;color:var(--muted-foreground)}
`);
function Switch({
  checked,
  defaultChecked = false,
  onChange,
  label,
  description,
  disabled,
  id,
  forceState
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked !== undefined ? checked : inner;
  const toggle = () => {
    if (disabled) return;
    const n = !on;
    if (checked === undefined) setInner(n);
    onChange && onChange(n);
  };
  return /*#__PURE__*/React.createElement("label", {
    className: "ald-sw",
    "data-disabled": disabled || undefined,
    onClick: e => {
      e.preventDefault();
      toggle();
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    id: id,
    role: "switch",
    "aria-checked": on,
    disabled: disabled,
    className: "ald-sw__track",
    "data-force": forceState
  }, /*#__PURE__*/React.createElement("span", {
    className: "ald-sw__thumb"
  })), (label || description) && /*#__PURE__*/React.createElement("span", null, label, description && /*#__PURE__*/React.createElement("span", {
    className: "ald-sw__desc"
  }, description)));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/layout/Card.jsx
try { (() => {
__ds_scope.injectCss('ald-card', `
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
function Card({
  variant = 'default',
  padding = 24,
  eyebrow,
  title,
  description,
  action,
  footer,
  interactive,
  onClick,
  className,
  style,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: __ds_scope.cx('ald-card', variant !== 'default' && 'ald-card--' + variant, interactive && 'ald-card--interactive', className),
    style: {
      '--card-pad': padding + 'px',
      ...style
    },
    onClick: onClick,
    tabIndex: interactive ? 0 : undefined
  }, (title || eyebrow || action) && /*#__PURE__*/React.createElement("div", {
    className: "ald-card__head"
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "ald-card__eyebrow"
  }, eyebrow), title && /*#__PURE__*/React.createElement("h3", {
    className: "ald-card__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "ald-card__desc"
  }, description)), action), children !== undefined && /*#__PURE__*/React.createElement("div", {
    className: "ald-card__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "ald-card__foot"
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Card.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
__ds_scope.injectCss('ald-tabs', `
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
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  variant = 'underline',
  className
}) {
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.value);
  const [id] = React.useState(() => 'ald-tabs-' + ++uid);
  const cur = value !== undefined ? value : inner;
  const set = v => {
    if (value === undefined) setInner(v);
    onChange && onChange(v);
  };
  const refs = React.useRef([]);
  const onKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const d = e.key === 'ArrowRight' ? 1 : -1;
    let j = i;
    do {
      j = (j + d + items.length) % items.length;
    } while (items[j].disabled && j !== i);
    set(items[j].value);
    refs.current[j]?.focus();
  };
  const active = items.find(t => t.value === cur);
  return /*#__PURE__*/React.createElement("div", {
    className: className
  }, /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    className: __ds_scope.cx('ald-tabs__list', 'ald-tabs__list--' + variant)
  }, items.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    ref: el => refs.current[i] = el,
    role: "tab",
    type: "button",
    id: id + '-t-' + t.value,
    "aria-controls": id + '-p-' + t.value,
    "aria-selected": t.value === cur,
    tabIndex: t.value === cur ? 0 : -1,
    disabled: t.disabled,
    className: "ald-tab",
    onClick: () => set(t.value),
    onKeyDown: e => onKey(e, i)
  }, t.icon, t.label, t.count !== undefined && /*#__PURE__*/React.createElement("span", {
    className: "ald-tab__count"
  }, t.count)))), active && active.content !== undefined && /*#__PURE__*/React.createElement("div", {
    role: "tabpanel",
    id: id + '-p-' + active.value,
    "aria-labelledby": id + '-t-' + active.value,
    tabIndex: 0,
    className: "ald-tabs__panel"
  }, active.content));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Dialog.jsx
try { (() => {
__ds_scope.injectCss('ald-dialog', `
@keyframes ald-fade{from{opacity:0}}
@keyframes ald-pop{from{opacity:0;transform:translateY(8px) scale(.98)}}
.ald-dlg__overlay{position:fixed;inset:0;z-index:100;background:var(--overlay);display:flex;align-items:center;justify-content:center;padding:24px;animation:ald-fade var(--dur-slow) var(--ease-out)}
.ald-dlg{position:relative;width:100%;max-width:var(--dlg-w);max-height:calc(100vh - 48px);overflow:auto;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);animation:ald-pop var(--dur-slow) var(--ease-out)}
.ald-dlg--inline{animation:none}
.ald-dlg__head{padding:24px 56px 0 24px}
.ald-dlg__title{margin:0;font:700 20px/1.25 var(--font-display);letter-spacing:-0.01em}
.ald-dlg__desc{margin:8px 0 0;font-size:15px;line-height:1.5;color:var(--muted-foreground)}
.ald-dlg__body{padding:20px 24px}
.ald-dlg__foot{display:flex;justify-content:flex-end;gap:8px;padding:0 24px 24px;flex-wrap:wrap}
.ald-dlg__close{position:absolute;top:12px;right:12px;width:var(--hit-min);height:var(--hit-min);display:flex;align-items:center;justify-content:center;border:0;background:none;color:var(--muted-foreground);border-radius:var(--radius-md);cursor:pointer}
.ald-dlg__close:hover{background:var(--muted);color:var(--foreground)}
.ald-dlg__close:focus-visible{outline:none;box-shadow:var(--focus-ring)}
@media (prefers-reduced-motion:reduce){.ald-dlg,.ald-dlg__overlay{animation:none}}
`);
let n = 0;
function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  inline = false,
  closeLabel = 'Fermer',
  children
}) {
  const [id] = React.useState(() => 'ald-dlg-' + ++n);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open || inline) return;
    const prev = document.activeElement;
    const f = ref.current?.querySelector('input,select,textarea,button:not(.ald-dlg__close),[href]') || ref.current;
    f && f.focus();
    const k = e => {
      if (e.key === 'Escape') onClose && onClose();
      if (e.key === 'Tab' && ref.current) {
        const els = [...ref.current.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled);
        if (!els.length) return;
        const a = els[0],
          z = els[els.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('keydown', k);
      prev && prev.focus && prev.focus();
    };
  }, [open, inline]);
  if (!open && !inline) return null;
  const w = {
    sm: 400,
    md: 520,
    lg: 720
  }[size] + 'px';
  const box = /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: __ds_scope.cx('ald-dlg', inline && 'ald-dlg--inline'),
    role: "dialog",
    "aria-modal": !inline,
    "aria-labelledby": id + '-t',
    "aria-describedby": description ? id + '-d' : undefined,
    tabIndex: -1,
    style: {
      '--dlg-w': w
    },
    onMouseDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "ald-dlg__head"
  }, /*#__PURE__*/React.createElement("h2", {
    id: id + '-t',
    className: "ald-dlg__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    id: id + '-d',
    className: "ald-dlg__desc"
  }, description)), children ? /*#__PURE__*/React.createElement("div", {
    className: "ald-dlg__body"
  }, children) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  }), footer && /*#__PURE__*/React.createElement("div", {
    className: "ald-dlg__foot"
  }, footer), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ald-dlg__close",
    "aria-label": closeLabel,
    onClick: onClose
  }, __ds_scope.icon('x', 18)));
  if (inline) return box;
  return /*#__PURE__*/React.createElement("div", {
    className: "ald-dlg__overlay",
    onMouseDown: () => onClose && onClose()
  }, box);
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/overlays/DropdownMenu.jsx
try { (() => {
__ds_scope.injectCss('ald-menu', `
.ald-menu{position:relative;display:inline-block}
.ald-menu__list{position:absolute;z-index:60;top:calc(100% + 6px);min-width:220px;padding:4px;margin:0;list-style:none;background:var(--popover);color:var(--popover-foreground);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);animation:ald-menu-in var(--dur-base) var(--ease-out)}
.ald-menu__list--start{left:0}.ald-menu__list--end{right:0}
.ald-menu--static .ald-menu__list{position:static;animation:none}
@keyframes ald-menu-in{from{opacity:0;transform:translateY(-4px)}}
.ald-menu__item{display:flex;align-items:center;gap:10px;width:100%;min-height:40px;padding:0 10px;border:0;background:none;border-radius:var(--radius-sm);font:400 15px/1 var(--font-sans);color:inherit;cursor:pointer;text-align:left}
.ald-menu__item:hover,.ald-menu__item:focus-visible,.ald-menu__item[data-force=hover]{outline:none;background:var(--muted)}
.ald-menu__item:disabled{opacity:var(--disabled-opacity);cursor:not-allowed;background:none}
.ald-menu__item--danger{color:var(--destructive)}
.ald-menu__item--danger:hover{background:var(--danger-subtle)}
.ald-menu__icon{display:flex;color:var(--muted-foreground)}
.ald-menu__item--danger .ald-menu__icon{color:inherit}
.ald-menu__kbd{margin-left:auto;font:500 12px var(--font-mono);color:var(--muted-foreground)}
.ald-menu__sep{height:1px;background:var(--border);margin:4px -4px}
.ald-menu__label{padding:10px 10px 6px;font:500 11px/1 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted-foreground)}
`);
function DropdownMenu({
  trigger,
  items = [],
  align = 'start',
  open: forced,
  staticMenu = false
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const isOpen = forced ?? open;
  React.useEffect(() => {
    if (!open) return;
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const k = e => {
      if (e.key === 'Escape') {
        setOpen(false);
        ref.current?.querySelector('[aria-haspopup]')?.focus();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const els = [...ref.current.querySelectorAll('.ald-menu__item:not(:disabled)')];
        const i = els.indexOf(document.activeElement);
        els[(i + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length]?.focus();
      }
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', k);
    };
  }, [open]);
  const trig = React.isValidElement(trigger) ? React.cloneElement(trigger, {
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    onClick: () => setOpen(o => !o)
  }) : trigger;
  return /*#__PURE__*/React.createElement("div", {
    className: __ds_scope.cx('ald-menu', staticMenu && 'ald-menu--static'),
    ref: ref
  }, trig, isOpen && /*#__PURE__*/React.createElement("div", {
    className: __ds_scope.cx('ald-menu__list', 'ald-menu__list--' + align),
    role: "menu"
  }, items.map((it, i) => it.type === 'separator' ? /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ald-menu__sep",
    role: "separator"
  }) : it.type === 'label' ? /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ald-menu__label"
  }, it.label) : /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    role: "menuitem",
    disabled: it.disabled,
    className: __ds_scope.cx('ald-menu__item', it.destructive && 'ald-menu__item--danger'),
    onClick: () => {
      it.onSelect && it.onSelect();
      setOpen(false);
    }
  }, it.icon && /*#__PURE__*/React.createElement("span", {
    className: "ald-menu__icon"
  }, it.icon), it.label, it.shortcut && /*#__PURE__*/React.createElement("span", {
    className: "ald-menu__kbd"
  }, it.shortcut)))));
}
Object.assign(__ds_scope, { DropdownMenu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/DropdownMenu.jsx", error: String((e && e.message) || e) }); }

// export/nextjs/tailwind.config.ts
try { (() => {
// Tailwind CSS v3 uniquement. En v4, tout est dans globals.css (@theme inline) : ce fichier est inutile.
// En v3, utiliser des variables CSS en hex dans :root/.dark (comme globals.css) et ce mapping.

const v = name => `var(--${name})`;
let __ds_default_export_nextjs_tailwind_config_1apssw1;
try {
  __ds_default_export_nextjs_tailwind_config_1apssw1 = {
    darkMode: ['class'],
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
    theme: {
      container: {
        center: true,
        padding: '1.5rem',
        screens: {
          '2xl': '1200px'
        }
      },
      extend: {
        fontFamily: {
          sans: ['var(--font-familjen)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          display: ['var(--font-familjen)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace']
        },
        colors: {
          background: v('background'),
          foreground: v('foreground'),
          card: {
            DEFAULT: v('card'),
            foreground: v('card-foreground')
          },
          popover: {
            DEFAULT: v('popover'),
            foreground: v('popover-foreground')
          },
          primary: {
            DEFAULT: v('primary'),
            foreground: v('primary-foreground')
          },
          secondary: {
            DEFAULT: v('secondary'),
            foreground: v('secondary-foreground')
          },
          muted: {
            DEFAULT: v('muted'),
            foreground: v('muted-foreground')
          },
          accent: {
            DEFAULT: v('accent'),
            foreground: v('accent-foreground')
          },
          brand: {
            DEFAULT: v('brand'),
            foreground: v('brand-foreground'),
            text: v('brand-text')
          },
          destructive: {
            DEFAULT: v('destructive'),
            foreground: v('destructive-foreground')
          },
          success: {
            DEFAULT: v('success'),
            subtle: v('success-subtle')
          },
          warning: {
            DEFAULT: v('warning'),
            subtle: v('warning-subtle')
          },
          info: {
            DEFAULT: v('info'),
            subtle: v('info-subtle')
          },
          'danger-subtle': v('danger-subtle'),
          border: v('border'),
          input: v('input'),
          ring: v('ring'),
          chart: {
            1: v('chart-1'),
            2: v('chart-2'),
            3: v('chart-3'),
            4: v('chart-4'),
            5: v('chart-5')
          }
        },
        borderRadius: {
          sm: 'calc(var(--radius) - 2px)',
          md: 'var(--radius)',
          lg: 'calc(var(--radius) + 2px)',
          xl: 'calc(var(--radius) + 6px)'
        },
        fontSize: {
          display: ['3.5rem', {
            lineHeight: '1.02',
            letterSpacing: '-0.03em'
          }]
        },
        transitionTimingFunction: {
          out: 'cubic-bezier(.2,.7,.2,1)'
        }
      }
    },
    plugins: [require('tailwindcss-animate')]
  };
} catch {}
Object.assign(__ds_scope, { __ds_default_export_nextjs_tailwind_config_1apssw1 });
})(); } catch (e) { __ds_ns.__errors.push({ path: "export/nextjs/tailwind.config.ts", error: String((e && e.message) || e) }); }

// ui_kits/back-office/Content.jsx
try { (() => {
(() => {
  const DS = window.AldaronDesignSystem_1daf3c;
  const L = window.LucideReact || {};
  const Ic = (n, s = 18) => {
    const C = L[n];
    return C ? /*#__PURE__*/React.createElement(C, {
      size: s,
      strokeWidth: 1.75
    }) : null;
  };
  const ARTICLES = [{
    id: 1,
    title: 'Lancement de la bêta publique',
    cat: 'Annonces',
    status: 'published',
    lang: 'FR · EN',
    date: '05/11/2026'
  }, {
    id: 2,
    title: 'Comment nous protégeons vos données',
    cat: 'Sécurité',
    status: 'published',
    lang: 'FR · EN',
    date: '28/10/2026'
  }, {
    id: 3,
    title: 'Feuille de route du T1',
    cat: 'Produit',
    status: 'draft',
    lang: 'FR',
    date: '—'
  }, {
    id: 4,
    title: 'Étude de cas : Finly',
    cat: 'Clients',
    status: 'review',
    lang: 'FR · EN',
    date: '—'
  }];
  const AS = {
    published: ['success', 'Publié'],
    draft: ['default', 'Brouillon'],
    review: ['info', 'En relecture']
  };
  function Editor({
    onBack
  }) {
    const {
      Card,
      Input,
      Textarea,
      FormField,
      Select,
      Switch,
      Tabs,
      Button,
      Badge,
      Toaster
    } = DS;
    const [lang, setLang] = React.useState('fr');
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 300px',
        gap: 20,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Tabs, {
      value: lang,
      onChange: setLang,
      items: [{
        value: 'fr',
        label: 'Français'
      }, {
        value: 'en',
        label: 'English'
      }]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 18,
        marginTop: 20
      }
    }, /*#__PURE__*/React.createElement(FormField, {
      label: "Titre",
      htmlFor: "t"
    }, /*#__PURE__*/React.createElement(Input, {
      id: "t",
      key: lang,
      defaultValue: lang === 'fr' ? 'Feuille de route du T1' : '',
      placeholder: lang === 'en' ? 'Q1 roadmap' : ''
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "Adresse",
      htmlFor: "slug",
      description: "G\xE9n\xE9r\xE9e depuis le titre."
    }, /*#__PURE__*/React.createElement(Input, {
      id: "slug",
      leading: /*#__PURE__*/React.createElement("span", {
        style: {
          font: '400 13px var(--font-mono)'
        }
      }, "/"),
      defaultValue: lang === 'fr' ? 'blog/feuille-de-route-t1' : 'en/blog/q1-roadmap',
      key: 's' + lang
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "Contenu",
      htmlFor: "body"
    }, /*#__PURE__*/React.createElement(Textarea, {
      id: "body",
      rows: 8,
      defaultValue: lang === 'fr' ? 'Ce trimestre, nous livrons trois chantiers : la facturation, l\'export des données et l\'application mobile.' : '',
      key: 'b' + lang
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      title: "Publication",
      action: /*#__PURE__*/React.createElement(Badge, null, "Brouillon"),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "outline",
        size: "sm",
        onClick: onBack
      }, "Enregistrer"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        onClick: () => {
          Toaster.show({
            variant: 'success',
            title: 'Article publié'
          });
          onBack();
        }
      }, "Publier"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Switch, {
      defaultChecked: true,
      label: "Afficher sur l'accueil"
    }), /*#__PURE__*/React.createElement(Switch, {
      label: "Envoyer aux abonn\xE9s",
      description: "1 204 destinataires"
    }))), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      title: "Classement"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(FormField, {
      label: "Cat\xE9gorie",
      htmlFor: "cat"
    }, /*#__PURE__*/React.createElement(Select, {
      id: "cat",
      defaultValue: "p",
      options: [{
        value: 'a',
        label: 'Annonces'
      }, {
        value: 'p',
        label: 'Produit'
      }, {
        value: 's',
        label: 'Sécurité'
      }, {
        value: 'c',
        label: 'Clients'
      }]
    })))), /*#__PURE__*/React.createElement(Card, {
      padding: 20,
      variant: "muted",
      title: "Historique",
      description: "3 versions \xB7 derni\xE8re par Marie Rakoto, il y a 2 h"
    })));
  }
  function Content({
    editing,
    setEditing
  }) {
    const {
      Table,
      Badge,
      Tabs
    } = DS;
    const [f, setF] = React.useState('all');
    if (editing) return /*#__PURE__*/React.createElement(Editor, {
      onBack: () => setEditing(false)
    });
    const rows = ARTICLES.filter(a => f === 'all' || a.status === f);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: f,
      onChange: setF,
      items: [{
        value: 'all',
        label: 'Tous',
        count: 4
      }, {
        value: 'published',
        label: 'Publiés'
      }, {
        value: 'draft',
        label: 'Brouillons'
      }, {
        value: 'review',
        label: 'En relecture'
      }]
    }), /*#__PURE__*/React.createElement(Table, {
      onRowClick: () => setEditing(true),
      columns: [{
        key: 'title',
        header: 'Titre',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 500
          }
        }, r.title)
      }, {
        key: 'cat',
        header: 'Catégorie'
      }, {
        key: 'lang',
        header: 'Langues',
        render: r => /*#__PURE__*/React.createElement(Badge, {
          mono: true,
          size: "sm",
          square: true
        }, r.lang)
      }, {
        key: 'status',
        header: 'Statut',
        render: r => /*#__PURE__*/React.createElement(Badge, {
          variant: AS[r.status][0],
          dot: true
        }, AS[r.status][1])
      }, {
        key: 'date',
        header: 'Publié le',
        numeric: true
      }],
      rows: rows
    }));
  }
  Object.assign(window, {
    Content
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/back-office/Content.jsx", error: String((e && e.message) || e) }); }

// ui_kits/back-office/Dashboard.jsx
try { (() => {
(() => {
  const DS = window.AldaronDesignSystem_1daf3c;
  const L = window.LucideReact || {};
  const Ic = (n, s = 18) => {
    const C = L[n];
    return C ? /*#__PURE__*/React.createElement(C, {
      size: s,
      strokeWidth: 1.75
    }) : null;
  };
  function Stat({
    label,
    value,
    delta,
    icon
  }) {
    const {
      Card
    } = DS;
    return /*#__PURE__*/React.createElement(Card, {
      padding: 20
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--muted-foreground)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 12px/1 var(--font-mono)',
        letterSpacing: '.06em',
        textTransform: 'uppercase'
      }
    }, label), Ic(icon, 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 32px/1 var(--font-display)',
        letterSpacing: '-0.025em'
      }
    }, value), delta && /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 13px var(--font-mono)',
        color: 'var(--success)'
      }
    }, delta)));
  }
  const WEEKS = [42, 58, 51, 66, 72, 61, 84, 79, 95, 88, 102, 118];
  function Dashboard({
    go
  }) {
    const {
      Card,
      Table,
      Badge,
      Button,
      Tabs,
      Alert
    } = DS;
    const max = Math.max(...WEEKS);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 24
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      variant: "warning",
      title: "La double authentification n'est pas activ\xE9e pour 2 administrateurs",
      action: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline",
        onClick: () => go('users')
      }, "Voir")
    }, "Elle sera obligatoire pour ce r\xF4le \xE0 partir du 1er d\xE9cembre."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Contacts re\xE7us",
      value: "38",
      delta: "+12 %",
      icon: "Inbox"
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Abonn\xE9s newsletter",
      value: "1 204",
      delta: "+86",
      icon: "Mail"
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Articles publi\xE9s",
      value: "24",
      icon: "FileText"
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Utilisateurs actifs",
      value: "9",
      icon: "Users"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      title: "Visites du site",
      description: "12 derni\xE8res semaines",
      action: /*#__PURE__*/React.createElement(Tabs, {
        variant: "pill",
        items: [{
          value: 'v',
          label: 'Visites'
        }, {
          value: 'c',
          label: 'Contacts'
        }]
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        height: 180,
        paddingTop: 8
      }
    }, WEEKS.map((v, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      title: v + ' visites',
      style: {
        flex: 1,
        height: v / max * 100 + '%',
        background: i === WEEKS.length - 1 ? 'var(--chart-1)' : 'var(--chart-5)',
        opacity: i === WEEKS.length - 1 ? 1 : .35,
        borderRadius: '3px 3px 0 0'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        font: '400 12px var(--font-mono)',
        color: 'var(--muted-foreground)',
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("span", null, "S34"), /*#__PURE__*/React.createElement("span", null, "S45"))), /*#__PURE__*/React.createElement(Card, {
      title: "Journal d'audit",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "link",
        onClick: () => go('audit')
      }, "Tout voir")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 14
      }
    }, [['Marie Rakoto', 'a publié « Lancement de la bêta »', '09:42'], ['Thomas Weber', "a accepté l'invitation", '08:15'], ['Système', 'a envoyé 1 204 newsletters', 'hier'], ['Marie Rakoto', 'a modifié le rôle Éditeur', 'hier']].map(([w, a, t], i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'grid',
        gridTemplateColumns: '8px 1fr auto',
        gap: 12,
        alignItems: 'baseline',
        fontSize: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        background: i === 0 ? 'var(--brand)' : 'var(--input)',
        borderRadius: 1
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
      style: {
        fontWeight: 600
      }
    }, w), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted-foreground)'
      }
    }, a)), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '400 12px var(--font-mono)',
        color: 'var(--muted-foreground)'
      }
    }, t)))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        font: '700 20px/1.3 var(--font-display)'
      }
    }, "Derniers contacts"), /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      iconRight: Ic('ArrowRight', 16)
    }, "Tous les contacts")), /*#__PURE__*/React.createElement(Table, {
      columns: [{
        key: 'name',
        header: 'Expéditeur',
        render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontWeight: 500
          }
        }, r.name), /*#__PURE__*/React.createElement("div", {
          style: {
            color: 'var(--muted-foreground)',
            fontSize: 13
          }
        }, r.email))
      }, {
        key: 'subject',
        header: 'Objet'
      }, {
        key: 'status',
        header: 'Statut',
        render: r => r.new ? /*#__PURE__*/React.createElement(Badge, {
          variant: "brand",
          dot: true
        }, "Nouveau") : /*#__PURE__*/React.createElement(Badge, {
          dot: true
        }, "Trait\xE9")
      }, {
        key: 'date',
        header: 'Reçu le',
        numeric: true
      }],
      rows: [{
        id: 1,
        name: 'Paul Lefèvre',
        email: 'paul@finly.io',
        subject: 'Demande de démo',
        new: true,
        date: '05/11 10:12'
      }, {
        id: 2,
        name: 'Sofia Martins',
        email: 'sofia@kaza.pt',
        subject: 'Partenariat',
        new: true,
        date: '04/11 16:40'
      }, {
        id: 3,
        name: 'Jonas Becker',
        email: 'jonas@hof.de',
        subject: 'Question tarif',
        new: false,
        date: '03/11 09:05'
      }]
    })));
  }
  Object.assign(window, {
    Dashboard
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/back-office/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/back-office/Login.jsx
try { (() => {
(() => {
  const DS = window.AldaronDesignSystem_1daf3c;
  const L = window.LucideReact || {};
  const Ic = (n, s = 18) => {
    const C = L[n];
    return C ? /*#__PURE__*/React.createElement(C, {
      size: s,
      strokeWidth: 1.75
    }) : null;
  };
  function Login({
    onDone,
    dark
  }) {
    const {
      Card,
      Button,
      Input,
      FormField,
      Checkbox,
      Alert
    } = DS;
    const [step, setStep] = React.useState('login');
    const [email, setEmail] = React.useState('marie@startup.eu');
    const [pw, setPw] = React.useState('');
    const [err, setErr] = React.useState('');
    const [code, setCode] = React.useState('');
    const submit = e => {
      e.preventDefault();
      if (pw.length < 4) {
        setErr('Mot de passe incorrect. Il vous reste 4 tentatives.');
        return;
      }
      setErr('');
      setStep('mfa');
    };
    const verify = e => {
      e.preventDefault();
      onDone();
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'var(--background)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        maxWidth: 420,
        display: 'grid',
        gap: 24
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: dark ? '../../assets/logo/aldaron-horizontal-dark.svg' : '../../assets/logo/aldaron-horizontal.svg',
      alt: "Aldaron",
      style: {
        height: 32,
        justifySelf: 'center'
      }
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 32
    }, step === 'login' ? /*#__PURE__*/React.createElement("form", {
      onSubmit: submit,
      style: {
        display: 'grid',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        font: '700 24px/1.2 var(--font-display)',
        letterSpacing: '-0.015em'
      }
    }, "Connexion au back-office"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '6px 0 0',
        color: 'var(--muted-foreground)',
        fontSize: 15
      }
    }, "Utilisez l'adresse de votre invitation.")), err && /*#__PURE__*/React.createElement(Alert, {
      variant: "destructive"
    }, err), /*#__PURE__*/React.createElement(FormField, {
      label: "Email",
      htmlFor: "em"
    }, /*#__PURE__*/React.createElement(Input, {
      id: "em",
      type: "email",
      value: email,
      onChange: e => setEmail(e.target.value)
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "Mot de passe",
      htmlFor: "pw",
      description: "Saisissez au moins 4 caract\xE8res pour la d\xE9mo."
    }, /*#__PURE__*/React.createElement(Input, {
      id: "pw",
      type: "password",
      value: pw,
      invalid: !!err,
      onChange: e => setPw(e.target.value),
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: -8
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      defaultChecked: true,
      label: "Rester connect\xE9"
    }), /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        fontSize: 14
      }
    }, "Mot de passe oubli\xE9 ?")), /*#__PURE__*/React.createElement(Button, {
      type: "submit",
      block: true,
      size: "lg"
    }, "Se connecter")) : /*#__PURE__*/React.createElement("form", {
      onSubmit: verify,
      style: {
        display: 'grid',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--accent)',
        color: 'var(--accent-foreground)',
        display: 'grid',
        placeItems: 'center'
      }
    }, Ic('ShieldCheck', 22)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        font: '700 24px/1.2 var(--font-display)',
        letterSpacing: '-0.015em'
      }
    }, "Double authentification"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '6px 0 0',
        color: 'var(--muted-foreground)',
        fontSize: 15
      }
    }, "Saisissez le code \xE0 6 chiffres de votre application d'authentification.")), /*#__PURE__*/React.createElement(FormField, {
      label: "Code",
      htmlFor: "code"
    }, /*#__PURE__*/React.createElement(Input, {
      id: "code",
      autoFocus: true,
      inputMode: "numeric",
      maxLength: 6,
      value: code,
      onChange: e => setCode(e.target.value.replace(/\D/g, '')),
      placeholder: "000 000",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 22,
        letterSpacing: '.3em',
        height: 52
      }
    })), /*#__PURE__*/React.createElement(Button, {
      type: "submit",
      block: true,
      size: "lg",
      disabled: code.length < 6
    }, "V\xE9rifier"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setStep('login')
    }, "Retour"))), /*#__PURE__*/React.createElement("p", {
      style: {
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--muted-foreground)',
        margin: 0
      }
    }, "Propuls\xE9 par le socle Aldaron \xB7 ", /*#__PURE__*/React.createElement("a", {
      href: "#"
    }, "Aide"))));
  }
  Object.assign(window, {
    Login
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/back-office/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/back-office/Settings.jsx
try { (() => {
(() => {
  const DS = window.AldaronDesignSystem_1daf3c;
  const L = window.LucideReact || {};
  const Ic = (n, s = 18) => {
    const C = L[n];
    return C ? /*#__PURE__*/React.createElement(C, {
      size: s,
      strokeWidth: 1.75
    }) : null;
  };
  function Settings() {
    const {
      Card,
      Tabs,
      FormField,
      Input,
      Select,
      Switch,
      Button,
      Alert,
      Toaster
    } = DS;
    const row = {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 18
    };
    return /*#__PURE__*/React.createElement(Tabs, {
      items: [{
        value: 'p',
        label: 'Profil',
        content: /*#__PURE__*/React.createElement(Card, {
          footer: /*#__PURE__*/React.createElement(Button, {
            onClick: () => Toaster.show({
              variant: 'inverted',
              title: 'Modifications enregistrées'
            })
          }, "Enregistrer")
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gap: 18,
            maxWidth: 640
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: row
        }, /*#__PURE__*/React.createElement(FormField, {
          label: "Pr\xE9nom",
          htmlFor: "fn"
        }, /*#__PURE__*/React.createElement(Input, {
          id: "fn",
          defaultValue: "Marie"
        })), /*#__PURE__*/React.createElement(FormField, {
          label: "Nom",
          htmlFor: "ln"
        }, /*#__PURE__*/React.createElement(Input, {
          id: "ln",
          defaultValue: "Rakoto"
        }))), /*#__PURE__*/React.createElement(FormField, {
          label: "Email",
          htmlFor: "pe",
          description: "Utilis\xE9e pour la connexion et les notifications."
        }, /*#__PURE__*/React.createElement(Input, {
          id: "pe",
          defaultValue: "marie@startup.eu"
        })), /*#__PURE__*/React.createElement("div", {
          style: row
        }, /*#__PURE__*/React.createElement(FormField, {
          label: "Langue du back-office",
          htmlFor: "lg"
        }, /*#__PURE__*/React.createElement(Select, {
          id: "lg",
          defaultValue: "fr",
          options: [{
            value: 'fr',
            label: 'Français'
          }, {
            value: 'en',
            label: 'English'
          }]
        })), /*#__PURE__*/React.createElement(FormField, {
          label: "Fuseau horaire",
          htmlFor: "tz"
        }, /*#__PURE__*/React.createElement(Select, {
          id: "tz",
          defaultValue: "paris",
          options: [{
            value: 'paris',
            label: 'Europe/Paris'
          }, {
            value: 'tana',
            label: 'Indian/Antananarivo'
          }]
        })))))
      }, {
        value: 's',
        label: 'Sécurité',
        content: /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid',
            gap: 16
          }
        }, /*#__PURE__*/React.createElement(Alert, {
          variant: "success",
          title: "Double authentification activ\xE9e"
        }, "Application d'authentification configur\xE9e le 12/09/2026."), /*#__PURE__*/React.createElement(Card, {
          title: "Mot de passe",
          description: "Derni\xE8re modification il y a 3 mois.",
          action: /*#__PURE__*/React.createElement(Button, {
            variant: "outline",
            size: "sm"
          }, "Modifier")
        }), /*#__PURE__*/React.createElement(Card, {
          title: "Sessions actives",
          description: "2 appareils connect\xE9s.",
          action: /*#__PURE__*/React.createElement(Button, {
            variant: "outline",
            size: "sm"
          }, "Tout d\xE9connecter")
        }))
      }, {
        value: 'n',
        label: 'Notifications',
        content: /*#__PURE__*/React.createElement(Card, {
          title: "Par email",
          description: "Les notifications du back-office restent toujours visibles dans la cloche."
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'grid'
          }
        }, /*#__PURE__*/React.createElement(Switch, {
          defaultChecked: true,
          label: "Nouveau contact re\xE7u",
          description: "Un email par message re\xE7u via le formulaire."
        }), /*#__PURE__*/React.createElement(Switch, {
          defaultChecked: true,
          label: "Invitation accept\xE9e"
        }), /*#__PURE__*/React.createElement(Switch, {
          label: "R\xE9sum\xE9 hebdomadaire",
          description: "Chaque lundi \xE0 9 h."
        }), /*#__PURE__*/React.createElement(Switch, {
          disabled: true,
          defaultChecked: true,
          label: "Alertes de s\xE9curit\xE9",
          description: "Toujours actives."
        })))
      }]
    });
  }
  Object.assign(window, {
    Settings
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/back-office/Settings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/back-office/Shell.jsx
try { (() => {
(() => {
  const DS = window.AldaronDesignSystem_1daf3c;
  const L = window.LucideReact || {};
  const Ic = (n, s = 18) => {
    const C = L[n];
    return C ? /*#__PURE__*/React.createElement(C, {
      size: s,
      strokeWidth: 1.75
    }) : null;
  };
  const shellStyles = {
    wrap: {
      display: 'grid',
      gridTemplateColumns: '248px minmax(0,1fr)',
      minHeight: '100vh',
      background: 'var(--background)'
    },
    side: {
      position: 'sticky',
      top: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      padding: '20px 12px',
      background: 'var(--sidebar)',
      borderRight: '1px solid var(--sidebar-border)'
    },
    logo: {
      padding: '0 10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    group: {
      font: '500 11px/1 var(--font-mono)',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--muted-foreground)',
      padding: '18px 10px 8px'
    },
    top: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 32px',
      background: 'color-mix(in oklab, var(--background) 92%, transparent)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)'
    }
  };
  const NAV = [{
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: 'LayoutDashboard'
  }, {
    id: 'content',
    label: 'Contenus',
    icon: 'FileText'
  }, {
    id: 'contacts',
    label: 'Contacts reçus',
    icon: 'Inbox',
    count: 4
  }, {
    group: 'Administration'
  }, {
    id: 'users',
    label: 'Utilisateurs',
    icon: 'Users'
  }, {
    id: 'roles',
    label: 'Rôles et droits',
    icon: 'KeyRound'
  }, {
    id: 'audit',
    label: "Journal d'audit",
    icon: 'ScrollText'
  }, {
    id: 'settings',
    label: 'Paramètres',
    icon: 'Settings'
  }];
  function NavItem({
    item,
    active,
    onClick
  }) {
    const [h, setH] = React.useState(false);
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      onMouseEnter: () => setH(true),
      onMouseLeave: () => setH(false),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 40,
        padding: '0 10px',
        border: 0,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        font: '500 15px/1 var(--font-sans)',
        textAlign: 'left',
        background: active ? 'var(--sidebar-accent)' : h ? 'color-mix(in oklab, var(--sidebar-accent) 60%, transparent)' : 'transparent',
        color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
        position: 'relative'
      }
    }, active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: -12,
        top: 10,
        bottom: 10,
        width: 3,
        background: 'var(--brand)',
        borderRadius: '0 2px 2px 0'
      }
    }), Ic(item.icon, 18), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        color: active ? 'var(--foreground)' : undefined
      }
    }, item.label), item.count && /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 12px/1 var(--font-mono)',
        padding: '3px 6px',
        borderRadius: 99,
        background: 'var(--accent)',
        color: 'var(--accent-foreground)'
      }
    }, item.count));
  }
  function Shell({
    page,
    setPage,
    title,
    actions,
    children,
    onLogout,
    dark,
    setDark
  }) {
    const {
      Button,
      DropdownMenu,
      Input
    } = DS;
    return /*#__PURE__*/React.createElement("div", {
      style: shellStyles.wrap
    }, /*#__PURE__*/React.createElement("aside", {
      style: shellStyles.side
    }, /*#__PURE__*/React.createElement("div", {
      style: shellStyles.logo
    }, /*#__PURE__*/React.createElement("img", {
      src: dark ? '../../assets/logo/aldaron-horizontal-dark.svg' : '../../assets/logo/aldaron-horizontal.svg',
      alt: "Aldaron",
      style: {
        height: 26
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 11px var(--font-mono)',
        color: 'var(--muted-foreground)'
      }
    }, "admin")), NAV.map((n, i) => n.group ? /*#__PURE__*/React.createElement("div", {
      key: i,
      style: shellStyles.group
    }, n.group) : /*#__PURE__*/React.createElement(NavItem, {
      key: n.id,
      item: n,
      active: page === n.id,
      onClick: () => setPage(n.id)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'auto'
      }
    }, /*#__PURE__*/React.createElement(DropdownMenu, {
      trigger: /*#__PURE__*/React.createElement("button", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: 224,
          padding: 8,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--card)',
          color: 'var(--foreground)',
          cursor: 'pointer',
          textAlign: 'left'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: '600 13px var(--font-sans)'
        }
      }, "MR"), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontSize: 14,
          fontWeight: 500
        }
      }, "Marie Rakoto"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontSize: 12,
          color: 'var(--muted-foreground)'
        }
      }, "Administrateur")), Ic('ChevronsUpDown', 16)),
      items: [{
        label: 'Mon profil',
        icon: Ic('User', 16),
        onSelect: () => setPage('settings')
      }, {
        label: dark ? 'Thème clair' : 'Thème sombre',
        icon: Ic(dark ? 'Sun' : 'Moon', 16),
        onSelect: () => setDark(!dark)
      }, {
        type: 'separator'
      }, {
        label: 'Se déconnecter',
        icon: Ic('LogOut', 16),
        onSelect: onLogout,
        destructive: true
      }]
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("header", {
      style: shellStyles.top
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 320
      }
    }, /*#__PURE__*/React.createElement(Input, {
      size: "sm",
      placeholder: "Rechercher un contenu, un utilisateur\u2026",
      leading: Ic('Search', 16)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon",
      "aria-label": dark ? 'Thème clair' : 'Thème sombre',
      onClick: () => setDark(!dark)
    }, Ic(dark ? 'Sun' : 'Moon')), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon",
      "aria-label": "Notifications"
    }, Ic('Bell')), /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm",
      iconLeft: Ic('ExternalLink', 16),
      href: "#"
    }, "Voir le site")), /*#__PURE__*/React.createElement("main", {
      style: {
        padding: '32px 32px 64px',
        maxWidth: 1200
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        font: '700 32px/1.12 var(--font-display)',
        letterSpacing: '-0.02em'
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, actions)), children)));
  }
  Object.assign(window, {
    Shell,
    Ic
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/back-office/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/back-office/Users.jsx
try { (() => {
(() => {
  const DS = window.AldaronDesignSystem_1daf3c;
  const L = window.LucideReact || {};
  const Ic = (n, s = 18) => {
    const C = L[n];
    return C ? /*#__PURE__*/React.createElement(C, {
      size: s,
      strokeWidth: 1.75
    }) : null;
  };
  const USERS0 = [{
    id: 1,
    name: 'Marie Rakoto',
    email: 'marie@startup.eu',
    role: 'Administrateur',
    status: 'active',
    mfa: true,
    last: '05/11 09:42'
  }, {
    id: 2,
    name: 'Thomas Weber',
    email: 'thomas@startup.eu',
    role: 'Éditeur',
    status: 'active',
    mfa: false,
    last: '05/11 08:15'
  }, {
    id: 3,
    name: 'Lina Haddad',
    email: 'lina@startup.eu',
    role: 'Lecteur',
    status: 'suspended',
    mfa: true,
    last: '28/10 17:05'
  }, {
    id: 4,
    name: 'Karim Benali',
    email: 'karim@startup.eu',
    role: 'Administrateur',
    status: 'active',
    mfa: false,
    last: '02/11 11:30'
  }, {
    id: 5,
    name: 'julie@startup.eu',
    email: 'Invitation envoyée le 03/11',
    role: 'Éditeur',
    status: 'invited',
    mfa: false,
    last: '—'
  }];
  const ST = {
    active: ['success', 'Actif'],
    invited: ['warning', 'Invité'],
    suspended: ['destructive', 'Suspendu']
  };
  const ROLES = [{
    value: 'Administrateur',
    label: 'Administrateur'
  }, {
    value: 'Éditeur',
    label: 'Éditeur'
  }, {
    value: 'Lecteur',
    label: 'Lecteur'
  }];
  function InviteDialog({
    open,
    onClose,
    onInvite
  }) {
    const {
      Dialog,
      Button,
      Input,
      FormField,
      Select,
      Checkbox
    } = DS;
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState('Éditeur');
    const [err, setErr] = React.useState('');
    const send = () => {
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
        setErr('Saisissez une adresse email valide, par exemple nom@startup.eu.');
        return;
      }
      onInvite(email, role);
      setEmail('');
      setErr('');
    };
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      title: "Inviter un utilisateur",
      description: "Il recevra un email pour cr\xE9er son mot de passe. L'invitation expire apr\xE8s 7 jours.",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "outline",
        onClick: onClose
      }, "Annuler"), /*#__PURE__*/React.createElement(Button, {
        onClick: send,
        iconLeft: Ic('Send', 16)
      }, "Envoyer l'invitation"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(FormField, {
      label: "Email",
      htmlFor: "inv-em",
      error: err
    }, /*#__PURE__*/React.createElement(Input, {
      id: "inv-em",
      type: "email",
      value: email,
      invalid: !!err,
      placeholder: "nom@startup.eu",
      onChange: e => setEmail(e.target.value)
    })), /*#__PURE__*/React.createElement(FormField, {
      label: "R\xF4le",
      htmlFor: "inv-role",
      description: "Les droits de chaque r\xF4le se r\xE8glent dans R\xF4les et droits."
    }, /*#__PURE__*/React.createElement(Select, {
      id: "inv-role",
      options: ROLES,
      value: role,
      onChange: setRole
    })), /*#__PURE__*/React.createElement(Checkbox, {
      defaultChecked: true,
      label: "Exiger la double authentification",
      description: "Recommand\xE9 pour les administrateurs."
    })));
  }
  function Users() {
    const {
      Table,
      Badge,
      Button,
      DropdownMenu,
      Tabs,
      Toaster
    } = DS;
    const [users, setUsers] = React.useState(USERS0);
    const [tab, setTab] = React.useState('all');
    const [open, setOpen] = React.useState(false);
    const rows = users.filter(u => tab === 'all' ? u.status !== 'invited' : u.status === 'invited');
    const invite = (email, role) => {
      setUsers(u => [...u, {
        id: Date.now(),
        name: email,
        email: 'Invitation envoyée aujourd\'hui',
        role,
        status: 'invited',
        mfa: false,
        last: '—'
      }]);
      setOpen(false);
      setTab('inv');
      Toaster.show({
        variant: 'success',
        title: 'Invitation envoyée',
        description: email + ' recevra un email.'
      });
    };
    const remove = u => {
      setUsers(l => l.filter(x => x.id !== u.id));
      Toaster.show({
        variant: 'inverted',
        title: 'Utilisateur supprimé',
        description: u.name,
        action: /*#__PURE__*/React.createElement(Button, {
          size: "sm",
          variant: "secondary",
          onClick: () => setUsers(l => [...l, u])
        }, "Annuler")
      });
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      variant: "pill",
      value: tab,
      onChange: setTab,
      items: [{
        value: 'all',
        label: 'Utilisateurs',
        count: users.filter(u => u.status !== 'invited').length
      }, {
        value: 'inv',
        label: 'Invitations',
        count: users.filter(u => u.status === 'invited').length
      }]
    }), /*#__PURE__*/React.createElement(Button, {
      onClick: () => setOpen(true),
      iconLeft: Ic('UserPlus', 16)
    }, "Inviter")), /*#__PURE__*/React.createElement(Table, {
      columns: [{
        key: 'name',
        header: 'Utilisateur',
        render: r => /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            width: 32,
            height: 32,
            flex: 'none',
            borderRadius: 'var(--radius-md)',
            background: 'var(--muted)',
            display: 'grid',
            placeItems: 'center',
            font: '600 12px var(--font-sans)',
            color: 'var(--muted-foreground)'
          }
        }, r.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontWeight: 500
          }
        }, r.name), /*#__PURE__*/React.createElement("div", {
          style: {
            color: 'var(--muted-foreground)',
            fontSize: 13
          }
        }, r.email)))
      }, {
        key: 'role',
        header: 'Rôle',
        render: r => /*#__PURE__*/React.createElement(Badge, {
          variant: "outline"
        }, r.role)
      }, {
        key: 'status',
        header: 'Statut',
        render: r => /*#__PURE__*/React.createElement(Badge, {
          variant: ST[r.status][0],
          dot: true
        }, ST[r.status][1])
      }, {
        key: 'mfa',
        header: 'MFA',
        render: r => r.mfa ? /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--success)',
            display: 'flex'
          },
          title: "Activ\xE9e"
        }, Ic('ShieldCheck', 18)) : /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--muted-foreground)',
            fontSize: 13
          }
        }, "Non")
      }, {
        key: 'last',
        header: 'Connexion',
        numeric: true
      }, {
        key: 'x',
        header: '',
        width: 56,
        render: r => /*#__PURE__*/React.createElement(DropdownMenu, {
          align: "end",
          trigger: /*#__PURE__*/React.createElement(Button, {
            variant: "ghost",
            size: "icon",
            "aria-label": 'Actions pour ' + r.name
          }, Ic('Ellipsis')),
          items: [{
            label: 'Modifier',
            icon: Ic('Pencil', 16)
          }, {
            label: 'Changer de rôle',
            icon: Ic('KeyRound', 16)
          }, r.status === 'invited' ? {
            label: "Renvoyer l'invitation",
            icon: Ic('Mail', 16),
            onSelect: () => Toaster.show({
              title: 'Invitation renvoyée',
              variant: 'success'
            })
          } : {
            label: r.status === 'suspended' ? 'Réactiver' : 'Suspendre',
            icon: Ic('Ban', 16)
          }, {
            type: 'separator'
          }, {
            label: 'Supprimer',
            icon: Ic('Trash2', 16),
            destructive: true,
            onSelect: () => remove(r)
          }]
        })
      }],
      rows: rows,
      empty: "Aucune invitation en attente.",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, rows.length, " sur ", rows.length), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline",
        disabled: true
      }, "Pr\xE9c\xE9dent"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline",
        disabled: true
      }, "Suivant")))
    }), /*#__PURE__*/React.createElement(InviteDialog, {
      open: open,
      onClose: () => setOpen(false),
      onInvite: invite
    }));
  }
  Object.assign(window, {
    Users
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/back-office/Users.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Toaster = __ds_scope.Toaster;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Label = __ds_scope.Label;

__ds_ns.FormField = __ds_scope.FormField;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.DropdownMenu = __ds_scope.DropdownMenu;

})();
