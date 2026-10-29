# Markdown Documents — Table of Contents

Applies whenever a new `.md` file is created anywhere in the workspace (`docs/`, audits, migration plans, etc.).

## Rule

Every generated Markdown file must start with a **table of contents** right after the main title (`# Title`), listing every section heading (`##`, and `###` when meaningful) as a clickable anchor link that jumps to the corresponding section.

- Use standard Markdown anchor syntax: `- [Section Title](#section-title)`
- Anchor slugs follow the standard GitHub-flavored rule: lowercase, spaces → `-`, punctuation stripped
- Keep the table of contents in sync with the headings — regenerate it whenever a section is added, renamed, or removed in the same task
- Nest sub-sections (`###`) as indented list items under their parent `##` entry

## Example

```markdown
# Newsletter Delivery Audit

## Table of Contents

- [Context](#context)
- [Scope](#scope)
- [Findings](#findings)
  - [Critical Issues](#critical-issues)
  - [Minor Issues](#minor-issues)
- [Recommendations](#recommendations)

## Context
...
```

## Anti-pattern

```markdown
<!-- ❌ no table of contents — reader has to scroll to find sections -->
# Newsletter Delivery Audit

## Context
...
```

Markdown style is also linted: `pnpm lint:docs` (rules in `.markdownlint-cli2.jsonc`), run by the pre-push hook.

---

## README files — English only, never translated

Every `README.md` (workspace root, apps, `docs/` folder indexes) is written in **English only** and
has **no translated twin**.

- The name is always `README.md` — never `README.FR.md` / `README.MG.md`.
- Never create a translation of a README, even if the other docs of its folder are French.
- A README that indexes French docs (e.g. `docs/features/<app>/README.md`) stays in English; links
  point to the real file names and may quote a French page title.
- The "translated twins" section below does not apply to README files.

---

## Translated twins — modify one, update the other

Applies whenever an existing `.md` file is **modified** (not only created).

Docs live in language pairs: `<folder>/en/NAME.md` ↔ `<folder>/fr/NAME.FR.md` (see
`naming-conventions.md`). When one side changes, its twin must be updated **in the same task** so
the two never drift apart.

- Before finishing, look for the twin: swap `en/NAME.md` ↔ `fr/NAME.FR.md` in the same parent folder.
- Translate the **change**, not the whole file: add, edit or remove the same sections, rows, items
  and table-of-contents entries on the other side. Keep structure, headings order and anchors
  parallel (the TOC of each file uses its own language's slugs).
- Applies to deletions and renames too: deleting or moving one side deletes or moves its twin, and
  links pointing at either are repaired.
- ✅/❌/⏳ status markers (see `implementation-completeness.md`) must match on both sides.
- README files are exempt (English only, see above).
- No twin exists (single-language doc, e.g. `docs/features/**` which is French only): nothing to
  do — never create a translation that was not asked for.
- Cannot translate in the same task (needs a native review, etc.): say explicitly which twin is
  now out of sync, per the escalation path of `implementation-completeness.md`.

### Enforced by a check, not only by this rule

`pnpm check-doc-twins` fails when a doc and its twin do not change together. It runs in the
`pre-push` hook.

- It checks that the twin was **touched**, not that the translation is right: that is still the
  author's job and a review matter.
- A change that really concerns one language only (a typo, a French-only wording) is pushed with
  `SKIP_DOC_TWINS=1 git push`.
- Run it before pushing, including uncommitted work: `pnpm check-doc-twins --worktree`.

```
// ❌ docs/code/architecture/en/MONOREPO.md edited, fr/MONOREPO.FR.md left with the old text
// ✅ both edited in the same task, same sections
```

---

## Links and anchors — checked, not only written

`pnpm check-doc-links` reads every `docs/**/*.md` and fails when a relative link points at a file that
does not exist, or an `#anchor` at a heading the target does not have. It runs in the `pre-push` hook.

- An `en/` doc links to the `en/` version of another doc (`NAME.md`), a `fr/` doc to the `fr/` one
  (`NAME.FR.md`) — never across languages. The anchor is the slug of the heading **in that language**.
- A link to a source file is written from the real path (`apps/server/src/...`) and repaired when the
  file moves; a file that no longer exists is quoted in backticks, not linked.
- Renaming a heading renames every anchor that points at it, the table of contents first.
- Run it before pushing, including uncommitted work: it reads the working tree.
