# Theming — Dark / Light Mode Support

All UI code (web, bo) must use the design system's theme tokens for **every color value**.
Hard-coded colors break dark/light mode switching.

---

## Web — Tailwind + CSS variables (shadcn pattern)

The palette is defined as CSS variables in `apps/web/app/globals.css` (`--background`, `--foreground`,
`--primary`, … and a `.dark` override) and exposed as Tailwind utilities. Dark mode is driven by
`next-themes` (`ThemeProvider`, `ToggleTheme`) through the `dark` class.

```tsx
// ✅ semantic tokens — follow the theme automatically
<div className="bg-background text-foreground border-border" />
<p className="text-muted-foreground" />

// ✅ a variant only when a token cannot express it
<div className="bg-white dark:bg-slate-900" />   // acceptable only if no token fits

// ❌ hard-coded color — stays the same in dark mode
<div className="bg-[#ffffff] text-[#333333]" />
<div style={{ color: '#333' }} />
```

- Need a new color? Add a CSS variable (light **and** dark value) in `globals.css` and map it in the
  Tailwind theme — do not sprinkle an arbitrary value (`bg-[#…]`) in a component.
- Third-party components that take a `color` / `style` / `theme` prop get a token
  (`var(--foreground)`), never a literal.

---

## Back-office — MUI `useTheme`

Use MUI's theme (`MuiThemeProvider.tsx` in `apps/bo/src`) for all color values.

```tsx
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
const borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300];
```

Prefer `sx` prop tokens (`color: 'text.primary'`, `bgcolor: 'background.paper'`) over `useTheme`
when the value is a direct palette alias — `sx` is shorter and already theme-aware:

```tsx
// ✅ sx shorthand — no useTheme needed
<Box sx={{ color: 'text.primary', bgcolor: 'background.paper' }} />
```

---

## Anti-patterns — all apps

```tsx
// ❌ hard-coded hex or named color
style={{ color: '#333333' }}
style={{ borderColor: 'gray' }}
sx={{ color: '#333' }}

// ✅ always through the theme
sx={{ color: 'text.primary' }}
className="text-foreground"
```
