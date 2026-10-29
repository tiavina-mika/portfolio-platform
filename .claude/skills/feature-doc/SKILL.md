---
name: feature-doc
description: Create, refresh, or audit non-technical feature documentation under docs/features/<app>/... for a back-office sidebar entry or a public website page — describes what a page does, who can use it, and typical use cases, in French, for non-technical readers.
allowed-tools: Read Write Edit Glob Grep Bash
---

Generates or maintains `docs/features/**/*.FR.md` — plain-language documentation of what a real,
currently-shipped page does, aimed at non-technical readers (the portfolio owner, content editors,
support). This is not API/code documentation; see the `CLAUDE.md` files and `docs/code/` for that.

This skill is for **explicit, on-demand** runs: writing a doc for a feature you just built, refreshing
one that drifted, or auditing an app's coverage. The root `CLAUDE.md` already requires user-facing
changes in `apps/bo` or `apps/web` to update `docs/features/` as part of the change.

## Usage

```
/feature-doc bo articles         → create/refresh every doc under docs/features/bo/articles/fr/
/feature-doc web contact         → create/refresh docs/features/web/contact/fr/
/feature-doc audit bo            → reconcile docs/features/bo/README.md against the real BO sidebar
/feature-doc audit web           → reconcile docs/features/web/README.md against the real site routes
```

If invoked with no argument, ask which app + area to target rather than guessing.

## Scope — which apps get docs

| App | Organize by | Notes |
|---|---|---|
| `apps/bo/` | sidebar **group → item**, in real menu order | folders are named after what the reader sees in the menu |
| `apps/web/` | public **route** (e.g. `projects/`, `articles/`, `contact/`, `newsletter/`) | no sidebar — the route itself is the visible entry point |
| `apps/server/` | — not documented here — | no UI of its own; a server change that affects what a user sees is documented under the client feature it surfaces in |

Name folders after what a non-technical reader recognizes (the menu label, the route), never an arbitrary
code grouping. Don't regroup by perceived business domain — this keeps the doc tree re-derivable from the
code.

## Language subfolder

Where the `.md` files live, add a language folder: `fr/` today (a future `en/` would sit alongside it).
The entry-point folders stay language-neutral so a translation only adds a sibling folder. E.g.
`docs/features/bo/articles/fr/ARTICLES_LIST.FR.md`. The `.FR.md` suffix stays even inside `fr/`.
Features are French only: there is no English twin (see `scripts/check-doc-twins.mjs`).

## Step 1 — Establish ground truth

Before writing a line, confirm the *actual current* behavior:

- Read the route/page component and its permission checks — never describe a behavior from memory.
- For the BO: check which role/right gates each visible action (roles are managed in the BO and
  enforced by the server in `apps/server/src/cloud/`) so the "Qui peut l'utiliser" section is accurate.
- For a refresh/audit: diff what the existing doc claims against what the code does now.
- If something is ambiguous from code alone (e.g. exact UI wording), say so rather than inventing it.
  UI wording lives in the locale files (`apps/bo/src/config/i18n/locales`, `apps/web/translations`).

## Step 2 — File template

One file per real page/action, `UPPER_SNAKE_CASE.FR.md` with an **English** name (`ARTICLES_LIST.FR.md`;
only the content is French), starting with a clickable table of contents. Use this section order — omit a
section only if truly not applicable, don't invent content to fill it:

```markdown
# Cas d'utilisation — <Domain> (<Page/Action>)

## Table des matières
...

## Où trouver cette page
<menu path or route, in the app's real visible wording>

## À quoi sert cette page
<2-4 sentences, business purpose, no implementation detail>

## Qui peut l'utiliser
<role/permission table for the BO; public or not for the website>

## Ce que l'on voit à l'écran
<columns, sections, tabs — described as a reader sees them>

## Rechercher / filtrer <if applicable>

## Actions possibles
<one subsection per distinct action, described in terms of outcome>

## Cas d'utilisation typiques
<3-6 numbered real-world scenarios>

## Points d'attention / limites actuelles
<known gaps, things that look like bugs but are current, intentional limits>
```

Match the tone and depth of the existing pages under `docs/features/`.

**Language rule**: French, plain business language only. Never mention a file name, function name,
component name, database field, or any other implementation detail — a reader with zero coding background
must follow every sentence.

## Step 3 — Per-app tracking index (`README.md`)

`docs/features/bo/README.md` and `docs/features/web/README.md` are the single index of coverage:

- Grouped and ordered to match the **real, current** navigation (sidebar order for the BO, site nav
  order for the website) — not alphabetical, not creation order.
- One ✅/❌ line per menu entry or route, linking to its doc file(s) in the `fr/` subfolder.
- When the tracked navigation doesn't match reality (a renamed group, an unexpected page), fix the index
  and leave a short italic note explaining the correction.
- When a previously-noted limitation gets fixed, remove it from the page doc: the doc describes what the
  app does today, git keeps the history.

## Step 4 — Audit mode

When invoked as `/feature-doc audit <app>`:

1. Enumerate the app's real navigation (BO sidebar config, web route folders).
2. Compare against the app's `README.md` index.
3. Report and fix mismatches: missing entries (page exists, no doc), stale entries (doc exists, page
   removed), and menu-order drift.
4. Do not rewrite doc content that's still accurate just because the audit touched the file.

## Step 5 — Verify and report back

Run `pnpm lint:docs` and `pnpm check-doc-links` on the touched files. Summarize which files were created
vs. updated vs. left untouched, and flag anything you couldn't verify from code alone (needs product
confirmation) instead of guessing.
