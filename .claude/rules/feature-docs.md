# Non-Technical Feature Documentation (`docs/features/`)

Applies whenever a task changes **user-facing behavior** in `apps/bo/` or `apps/web/` — a new
page, a new field, a new visible action/button, a changed permission, or a behavior that an existing
`docs/features/**/*.FR.md` file describes and that no longer matches reality after the change.

`apps/server/` is excluded — it has no non-technical UI surface of its own. If a server change
alters what a BO or web user sees (a new email copy, a new validation message), the doc update
belongs to the client feature that surfaces it, not to a server-side doc.

This rule covers *when* a doc must be touched as part of a regular coding task.

## Decision table

| Change you just made | Required doc action |
|---|---|
| New page reachable from a real menu entry (BO sidebar item) or route (web) | Create the matching `docs/features/<app>/…/<PAGE>.FR.md` **and** add its entry to that app's `README.md` index (`docs/features/bo/README.md`, `docs/features/web/README.md`), in real menu order |
| Existing page's described behavior changed (new field, new action, changed permission, changed limitation) | Update the existing doc's relevant section |
| A previously documented limitation was fixed | Remove the limitation from the doc (the doc describes what the app does today, not its history) |
| Internal/technical-only change (refactor, perf, backend logic, no visible diff for the end user) | No doc change needed |
| Page/feature removed or made unreachable | Remove its `README.md` entry and delete its doc file in the same task |

## Rules

- Never leave a `docs/features` doc claiming a behavior that the code no longer has — an out-of-date
  non-technical doc is worse than none.
- `docs/features/**` is **French only** (no English twin), and the `README.md` indexes are **English
  only** (never translated); links point to the real file names and may quote a French page title.
- Content of the page docs is **business-language only** — no file names, function names, code, or
  internal field names. If you can't describe the change without naming a file or a variable, you
  are writing for the wrong audience; describe what the user sees and can do instead.
- Verify against the actual current behavior (read the route/page component and its permission
  checks) before writing — never guess or extrapolate from the doc that already exists.
- This still follows `markdown-docs.md` (table of contents) and `naming-conventions.md`
  (`UPPER_SNAKE_CASE.FR.md`, English folder names even though the file content is French).

## When updating in the same task isn't feasible

Same escalation path as `implementation-completeness.md`: don't silently skip it. Tell the user
explicitly which `docs/features` doc is now out of sync and why it wasn't updated in this task.

## Anti-patterns

```
// ❌ shipping a new BO sidebar page with no docs/features/bo doc and no README.md entry
// apps/bo/src/pages/... created and wired into the sidebar
// docs/features/bo/README.md still doesn't mention it

// ❌ fixing a limitation in code but leaving the old doc unmarked
// the doc still says "No restore button" after a Restore button was added to the trash tab
```
