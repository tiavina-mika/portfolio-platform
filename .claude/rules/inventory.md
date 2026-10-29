# Inventory — keep `docs/inventory/` and `docs/services/` in sync

`docs/inventory/README.md` is the census of what portfolio-platform runs on, and
`docs/services/README.md` lists its external services. They are only useful if they are true:
whoever adds one of the things below updates the matching page **in the same task**, like a test or
a translation — never "later".

## What triggers an update

| You added, renamed or removed… | Update | How |
|---|---|---|
| An env variable (any app) | `docs/inventory/README.md` → "Environment variables", under the right app | add it to the app's `.env.example` (and to the env validation — `apps/web/env.ts` for the web — if required) |
| An external service (SaaS, API, hosting) | `docs/services/README.md` (row: service, used by, what for, variables) **and** its variables in the inventory | by hand |
| A Cloud Function, trigger or job | `docs/inventory/README.md` → "Cloud Code" (the file lists per kind) | by hand, when a new `<domain>.functions.ts` / `.triggers.ts` / `.jobs.ts` file appears or one is removed |
| A role or a right, a scheduled task (`node-cron`), a GitHub workflow, a GitHub secret | the matching section of the inventory (create it if the page has none yet) | by hand |

## Rules

- Names only: never the value of a variable, key, token, webhook URL or phone number.
- A variable exposed to the browser (`VITE_*` in `apps/bo`, `NEXT_PUBLIC_*` in `apps/web`) is never a
  secret — say so in the table if it could be mistaken for one.
- `docs/inventory/README.md` and `docs/services/README.md` are READMEs: **English only, no
  translated twin** (`markdown-docs.md`). Keep their table of contents in sync with their headings.
- If the update cannot be made in the same task, say which page is now out of date and why, as for
  any other unfinished item (`implementation-completeness.md`).

```
// ❌ new Cloud Function file `newsletter.functions.ts` shipped, the "Cloud Code" table still lists the old set
// ✅ same change: function + the inventory row
```
