# Design Rules — Studies and Final Versions

Applies whenever a design mockup is produced as HTML (a study comparing variants, or the final
interactive version of a component, container or page).

## General principle

**Follow the structure of the code faithfully**: folders, sub-folders, file names, component names, and
the `components/` / `containers/` / `pages/` split. Every mockup has an exact equivalent in the code, at
the same place and under the same name. If the code has no component for an element, do not create a
mockup that pretends to be one.

## Vocabulary

- **Study**: one HTML file comparing 3 or 4 variants of the same case.
- **Round**: one numbered design iteration (Round 1, Round 2…). A round holds several screens named
  `1a`, `1b`, `1c`… (the number is the round, the letter is the variant). **The most recent rounds are
  placed at the top**: Round 3, then Round 2, then Round 1.
- **Final version**: the final, interactive HTML built from the recommended variant.

## 1. Study (`*.study.dc.html`)

**File name**: identical to the component, with the `.study` suffix.
Example: component `Button` → `Button.study.dc.html`.

**Content**: a single HTML file grouping several "Round N" sections.

**Round order**: most recent to oldest, top to bottom. A new round is always added **above** the
previous ones, never below. Previous rounds stay in the file, unchanged.

```text
Round 3   ← the most recent, at the top
Round 2
Round 1   ← the oldest, at the bottom
```

**In each round**, 3 or 4 variants of the same case:

- **The current variant**: the one that exists in the code. Always present, marked **(current)**.
- **The other variants**: alternative proposals.
- **The recommended variant**: exactly one per round, marked **(recommended)**.
  Example title: `1c (recommended)`.

**Each variant contains**, under its title, a "Pros and cons" block:

- Pros: **green** text, each line starts with `+`.
- Cons: **red** text, each line starts with `-`.

The green and red come from the theme tokens (success / error), never from a hard-coded value. They
must stay readable in dark and light mode (see `theming.md`).

## 2. Final version (`*.dc.html`)

**Trigger**: when the user says "create the final version" ("créer la version définitive"), generate the
HTML from the variant marked **(recommended)** in the most recent round.
Example: `Button.study.dc.html` → `Button.dc.html`.

**It must be interactive** (real hover, focus, click, open / close states… not a frozen image).

**It contains a tweaks panel, inside the HTML itself** (not in an external tool or a separate
interface), so the file keeps its tweaks when opened alone or downloaded:

- **Tweaks specific to the component**: props, possible cases, states (disabled, loading, error, empty,
  full…).
- **Default tweaks, always present**:
  - Theme: dark / light.
  - Language: `fr`, `en`, `mg`.
  - Breakpoint: mobile, tablet, desktop, large desktop.

## 3. Download

**Trigger**: when the user says "download", provide **a single self-contained HTML file**:

- The CSS is in a `<style>` tag and the JS in a `<script>` tag, both in the same file.
- The CSS is **readable**: indented, not minified, organized in commented sections (variables / tokens,
  base, component, states, responsive).
- The tweaks panel works in the downloaded file.
- Never a zip, and never separate `.html`, `.js` and `.css` files.

## 4. File structure

**The structure must follow the code's exactly**, inside a design folder: same folders, same
sub-folders, same names.

```text
components/button/Button.study.dc.html
components/button/Button.dc.html
containers/project/ProjectCard.dc.html
pages/home/Home.dc.html
```

- `components/`: generic components, no business logic.
- `containers/`: components tied to a domain or a page, with the same separation as the code
  (see `component-structure.md`).
- `pages/<page>/`: the complete page, for example `pages/home/Home.dc.html`.

Rules:

- A mockup's path and name are those of the matching code file. Only the suffix changes
  (`.tsx` → `.dc.html`).
- A generic component goes in `components/`, a component tied to a domain or a page goes in
  `containers/`. Never mix the two.
- Domain folder names are singular (`containers/project/`), as in the code
  (see `naming-conventions.md`).
- If you do not know the exact location in the code, ask before creating the file. Do not invent it.

## 5. Reuse

- A page **assembles** existing components and containers. It never redefines their HTML or style.
- Any HTML that is not a page is a reusable component or container. It is created once, then reused in
  the pages.
- If a component changes, every page that uses it must be updated with it.
