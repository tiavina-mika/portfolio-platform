# Accessibility (a11y) — Client Apps

Applies to every client UI: `apps/web/` (checked by the Storybook a11y addon, axe, not blocking yet)
and `apps/bo/` (no Storybook — write it to the same rules anyway).

The checker is axe, run on every `apps/web` story through `pnpm nx run web:test-storybook`.

---

## Never loosen the a11y gate

`apps/web/.storybook/preview.tsx` configures the a11y addon with `test: 'todo'` today (violations are
shown in the Accessibility panel but do not fail the run). The goal is to move it to `'error'` once the
existing debt is cleared, so:

- A new component or story must be **clean**: read the Accessibility panel and fix what it reports. Fix
  the component — never add a `{ id: '…', enabled: false }` line to make a story go green.
- Never lower the addon's `test` level (`'todo'` → `'off'`), and never disable a rule for
  one story to dodge it.
- When you fix the last violation of a rule that was switched off, remove its line in the same task:
  a stale exception hides regressions.
- Never write a new hard-coded color — see `theming.md`. Contrast follows the theme tokens.

---

## Every control has an accessible name

An icon-only button, an icon link, a switch, a checkbox, a select, a loading indicator, a dialog: each
must be readable as something with a name.

- A visible label, `aria-label`, or the control's own text — translated through i18n, never a
  hard-coded string. Reuse the shared keys of the `common` namespace before adding a new one, and add
  any new key to every locale of the app.
- A tooltip alone does **not** name an element.
- A table column with no header text (actions, avatar) needs a name written for it.

---

## Images: name them, or silence them

| The image… | Do |
|---|---|
| carries information (a project screenshot, an article cover, a logo that is the only link text) | give it a translated name that says what it is |
| repeats text written right beside it (an avatar next to the user's name) | give it an **empty** name (`alt=""`) — a screen reader would otherwise say it twice |
| is pure decoration (an illustration, a glyph inside a labelled button) | empty `alt`, or `aria-hidden` |

A shared component that is sometimes next to the name and sometimes alone takes a prop for it
(`Avatar` has `isNameShown`) instead of guessing.

---

## Structure

- A list is a list: `li` only inside a `ul`/`ol`, and a `ul` holds only `li`s. A table cell that looks
  like a list item uses `component="div"` (MUI) or a `div`, never a bare `li`.
- A heading level means a heading. A subtitle that labels a field or a cell is not an `h6`: pick the
  element on purpose (`component="span"` / `"p"` in MUI) rather than taking the default. Keep heading
  levels in order on public pages (one `h1`, then `h2`…).
- A table row that holds a checkbox must not announce itself as a checkbox too.
- Decorative icons are hidden from screen readers (`aria-hidden`).
- Public pages (`apps/web`) are navigable by keyboard: visible focus, no `tabIndex > 0`, interactive
  elements are real `button` / `a`.

---

## Checking your change

1. For `apps/web`, run the story tests: `pnpm nx run web:test-storybook` (add `--` and a path to
   narrow it).
2. Open the story and read the **Accessibility** panel for violations the run reported.
3. A story that renders a new state (an error, an empty list, a loading indicator) is checked too —
   the loading indicator and the empty state are the ones usually left unnamed.
