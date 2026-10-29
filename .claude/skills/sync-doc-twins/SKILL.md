---
name: sync-doc-twins
description: Audit and repair the translated twins of the markdown docs (docs/**/en/NAME.md ↔ docs/**/fr/NAME.FR.md) — find docs with no twin, French copies misplaced in en/ folders, docs outside a language folder, and twins that drifted apart; then create the missing translations, harmonize the pairs (same sections and TOC anchors) and fix broken links. Use when the user asks to check docs without a translation, sync the twins, harmonize the en/fr docs, create the missing translations, or invokes /sync-doc-twins.
allowed-tools: Read Write Edit Glob Grep Bash PowerShell
---

Applies the translated-twins convention of the root `CLAUDE.md` to the whole `docs/` tree, on demand.

## Usage

```
/sync-doc-twins                  → audit only: report, change nothing
/sync-doc-twins fix              → audit, then clean up + create the missing twins
/sync-doc-twins fix <folder>     → same, limited to a folder (e.g. docs/code/architecture)
```

Without `fix`, stop after the report and ask which steps to run — translating long docs is expensive,
so never start it unprompted.

## Conventions (recap)

- Pair: `<folder>/en/NAME.md` ↔ `<folder>/fr/NAME.FR.md`, same parent folder, same sub-folders.
- `README.md` is English only, never translated, never paired — skip it.
- `docs/features/**` is French only on purpose: no twin to create.
- Code and identifiers inside a doc stay English; folder names are English; a `.FR.md` file never lives
  under `en/`.
- Every `.md` starts with a clickable table of contents, in the language of the file.
- What keeps new changes from drifting is `pnpm check-doc-twins` (pre-push hook and CI), which fails when
  a doc and its twin do not change together; run it with `--worktree` to include uncommitted work.
  `pnpm check-doc-links` checks that relative links resolve and `pnpm lint:docs` runs markdownlint.

## Step 1 — Audit

Run from the workspace root:

```
powershell -ExecutionPolicy Bypass -File .claude/skills/sync-doc-twins/scripts/find-orphans.ps1
```

(`pwsh` works too when installed.) It prints four lists: `FR_WITHOUT_EN`, `EN_WITHOUT_FR`,
`FRENCH_FILE_IN_EN_FOLDER` (tagged `identical-to-fr` / `diverged-from-fr` / `no-fr-copy`) and
`OUTSIDE_LANG_FOLDER`. Group the result by folder and give the counts to the user. Skip
`docs/features/**`.

Also look for pairs that exist but drifted: for each pair compare the number of `##` headings and of
table rows; list the pairs that differ.

## Step 2 — Clean up (fix mode)

Do these before translating, so no work is wasted on stale files:

1. **`FRENCH_FILE_IN_EN_FOLDER`** — the `fr/` copy is the source of truth. `git rm` the `en/…FR.md`
   file; if it is `diverged-from-fr`, diff it first (`git diff --no-index`) and merge into the `fr/`
   file anything it has that `fr/` lacks.
2. **`OUTSIDE_LANG_FOLDER`** — move into `fr/` (`git mv`) when the content is French. If a copy already
   exists in `fr/`, diff, merge what is missing, delete the stray one.
3. Repair every link that pointed at a removed/moved file: `Grep` the old file name across `docs/`,
   `.claude/`, `apps/*/CLAUDE.md`, `CLAUDE.md`, `README.md`.

## Step 3 — Create the missing twins

For each `FR_WITHOUT_EN` (and `EN_WITHOUT_FR`) file:

1. Read the source fully.
2. Write the twin at the mirrored path (`fr/NAME.FR.md` → `en/NAME.md`, and back), creating the `en/` or
   `fr/` folder only if it will hold a file.
3. Translate faithfully — same sections in the same order, same tables, same code blocks (code and
   identifiers unchanged), same numbers and dates.
4. The table of contents uses the **target language's** heading slugs; every TOC link must hit a real
   heading.
5. Relative links: re-point them at the twin of the target (`../fr/X.FR.md` → `../en/X.md`) when it
   exists, otherwise keep the link to the file that does exist.
6. Do not summarize, shorten or "improve" — a twin is a translation, not a rewrite.

Long docs (several hundred lines): do them one at a time and check each result in Step 4.

## Step 4 — Harmonize and verify

For every pair touched, and for the drifted pairs found in Step 1:

- Same `##`/`###` heading count and order; same table row counts.
- Every TOC entry resolves to a heading in its own file.
- When a pair drifted, decide the direction from `git log -1 --format=%cd -- <file>`: the most recently
  modified side is the reference; translate its change into the other side.
- Re-run `find-orphans.ps1`: the four lists must be empty (except deliberate cases you report).
- Run `pnpm check-doc-twins --worktree`, `pnpm check-doc-links` and `pnpm lint:docs`.

## Rules

- Never commit, never create a branch — leave the changes in the working tree.
- Never create a translation of a README or of `docs/features/**`.
- If a doc cannot be translated in this task (needs native review, too large), say which twin is out of
  sync and why — do not leave it silently missing.
- Final message: counts per step (removed, moved, created, harmonized), the files still without a twin,
  and any link repaired.
