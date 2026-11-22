# Review — Add a test runner to the server

- **Branch**: `chore/add-server-test-runner`
- **Type**: Maintenance
- **Author**: tiavina-mika — `tiavinamika@gmail.com` *(local git identity; `gh api user` was not available)*
- **Created**: 2026-11-22 at 13:37
- **Apps touched**: Server

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [Result per acceptance criterion](#result-per-acceptance-criterion)
- [Checks run](#checks-run)
- [What is left to do](#what-is-left-to-do)

## In short

The server can now run unit tests: `pnpm nx run server:test` runs Vitest (the runner the website already
uses) on the `*.test.ts` files placed next to the code. A first test covers the masking of emails, phone
numbers and usernames shown to admins. The CI job "Unit tests of affected projects" no longer skips the
server, so a PR touching it runs its tests. Nobody has to do anything: `pnpm install` brings Vitest, no new
env variable. No visible change for users.

## Database

No database change.

## Server

- New `test` target (Vitest, Node environment, `vitest.config.ts` maps the `@/` alias like the TypeScript
  and SWC configs).
- The build leaves `*.test.ts` out of `dist/` (checked after a build: no test file in it).
- `vitest.config.ts` is ignored by ESLint like the other tooling files: the ESM-extension autofix would
  otherwise rewrite `vitest/config` to `vitest/config.js`, which Vitest does not export.
- Docs: the server `CLAUDE.md` (new "Tests" section), the CI inventory
  ([CI_WORKFLOWS.md](../../../inventory/code/en/CI_WORKFLOWS.md)) and
  [GETTING_STARTED.md](../../../getting-started/en/GETTING_STARTED.md) (`pnpm nx run-many -t test`).

## See the result locally

```bash
pnpm install
pnpm nx run server:test
```

Expected: `Test Files 1 passed`, `Tests 10 passed`.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟡 Low | Regression | The build typecheck now also reads the test files, which import `vitest`: a build run without the dev dependencies would fail | A deploy that installs production dependencies only | ✅ no action: the build already needs dev dependencies (`typescript`, `@swc/cli`); the Render build installs with `--prod=false` |
| 🟡 Low | Bug | A test helper not named `*.test.ts` (fixtures, factories) is compiled into `dist/` | Someone adds such a file | ✅ convention written in the server `CLAUDE.md` (tests next to the code, `*.test.ts`); the file would be dead, nothing imports it at runtime |

## Result per acceptance criterion

| Criterion | Result | Proof |
|---|---|---|
| `pnpm nx run server:test` runs and passes with an example test | Treated | `pnpm nx run server:test`: 1 file, 10 tests passed |
| The CI "unit tests of affected projects" job runs the server tests | Treated locally, confirmed by the PR's CI run | `.github/workflows/ci.yml` no longer excludes `server`; `pnpm nx show projects --with-target test` → `["server"]` |
| The docs no longer say the server has no test runner | Partial | Server `CLAUDE.md`, CI comment, CI inventory updated; `.claude/rules/engineering-principles.md` and `.claude/skills/dev/SKILL.md` still say it: edits under `.claude/` were refused in the unattended session |

Gap with the plan: the plan added `vitest.config.ts` to `tsconfig.json`; it is ESLint-ignored instead (see
"Server").

## Checks run

- `pnpm nx run-many -t test lint typecheck build -p server`: all four green, no lint warning.
- `dist/` after the build: no `*.test.*` file.
- A temporary test importing through `@/` and `@shared/utils` passed, then was deleted.
- `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`: green.

## What is left to do

- Update the wording of `.claude/rules/engineering-principles.md` and `.claude/skills/dev/SKILL.md`:
  ticket `006-update-the-test-runner-wording-of-the-claude-rules` (needs a human's approval).
- No runner in the back-office (out of scope).
