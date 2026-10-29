---
paths:
  - "apps/bo/src/**/*.{ts,tsx}"
---

# BO Responsive Design

All BO pages and components must be usable at any viewport width, from 360 px (mobile) to 1920 px+ (wide desktop).

## Breakpoints (MUI defaults)

| Breakpoint | Min width |
|---|---|
| `xs` | 0 px |
| `sm` | 600 px |
| `md` | 900 px |
| `lg` | 1200 px |
| `xl` | 1536 px |

## Multi-column layouts

- Use CSS Grid via `sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(N, 1fr)' } }}` — never `flex: 1` on children for column layout
- Card grids: 1 col on xs, 2 cols on sm, N cols on md+
- `maxWidth` on page containers is fine; always pair with `width: '100%'`
- Never hard-code pixel widths for layout columns

## Padding / spacing

- Page-level padding: `sx={{ p: { xs: 2, md: 3 } }}` — reduce on small screens
- Never use a fixed padding that wastes screen space on mobile

## Tables

- Wrap `<Table>` in `<Box sx={{ overflowX: 'auto' }}>` — never let a table overflow without scroll
- Hide non-essential columns on mobile: `sx={{ display: { xs: 'none', md: 'table-cell' } }}`

## Flex rows

- Any `display="flex"` row that could overflow must have `flexWrap="wrap"` or a breakpoint-driven `flexDirection`
- Rows that must stack on mobile: `sx={{ flexDirection: { xs: 'column', sm: 'row' } }}`
- Never use `minWidth` on a flex child without a matching `flexWrap="wrap"` on the parent
