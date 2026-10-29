---
name: inventory
description: Check and refresh docs/inventory/README.md and docs/services/README.md against the code — environment variables per app, external services, Cloud Functions, triggers and jobs. Runs a script that reports what drifted, then updates the hand-written tables. Use when the user asks to "refresh the inventory", "update the env variables / Cloud Functions / jobs list", after adding one of those things, or invokes /inventory.
allowed-tools: Read Write Edit Glob Grep Bash PowerShell
---

Keeps the inventory true to the code. The inventory is two English-only pages (READMEs are never
translated):

| Page | Holds | Source of truth |
|---|---|---|
| `docs/inventory/README.md` | env variables by app (`server`, `bo`, `web`), Cloud Code files (functions, triggers, jobs) | `apps/*/.env.example`, `apps/server/src/cloud/{functions,triggers,jobs}/` |
| `docs/services/README.md` | external services (MongoDB, Brevo, Cloudinary, reCAPTCHA, Google Maps…), what they are used for and their variables | the code that calls them |

## Usage

```
/inventory          → run the check, then fix every drift it reports
/inventory --list   → also print every Cloud Function, trigger and job name
```

## The script

```bash
node .claude/skills/inventory/scripts/inventory.mjs [--list]
```

Run it from the repo root. It is read-only and never prints a value, only names. It exits 1 and lists:

- a variable in an app's `.env.example` that the inventory does not mention;
- a variable read in the code (`process.env.X`, `import.meta.env.X`) but absent from `.env.example`
  (runtime and tooling variables such as `NODE_ENV` or `ANALYZE` are ignored — extend `RUNTIME_VARS` in
  the script if a new one is legitimate);
- a variable documented but no longer declared anywhere;
- a `*.functions.ts`, `*.triggers.ts` or `*.jobs.ts` file missing from the "Cloud Code" table.

## Steps

1. Run the script (`--list` when you need the exact names).
2. For each reported item, read the code before writing: what the variable is for, which app reads it,
   which service it belongs to. Facts you cannot confirm are written "to verify", never guessed.
3. Update `docs/inventory/README.md` (rows of the matching app / Cloud Code kind) and, for a service or
   a variable that belongs to one, `docs/services/README.md` — in the same change.
4. Keep the conventions:
   - Names only — never the value of a variable, key, token or secret, in the docs or in the report.
   - The page keeps its clickable table of contents; add an entry when you add a heading.
   - `bo` variables are inlined in the browser bundle: none may be a secret.
   - A new service needs a row in `docs/services/README.md` (service, used by, what for, variables).
5. Re-run the script until it prints "Inventory matches the code.", then `pnpm lint:docs` and
   `pnpm check-doc-links`.
6. Report what changed and the items left "to verify". Do not commit.

## Extending

To track something new (a role list, a rate-limit table…), add a check to `scripts/inventory.mjs` that
compares the source with the documented names, and describe it in the list above.
