---
type: chore
apps: [server]
branch: chore/add-server-test-runner
pr: https://github.com/tiavina-mika/portfolio-platform/pull/37
---

## Context

`apps/server` has no test runner (`engineering-principles.md`), and the Aldaron money logic (30 / 40 / 30
split with rounding, status transitions, quote total) deserves tests. Proposed as its own task, as the
Aldaron design note (`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`) says. Done first, before
`010-…`, so that `020-…` and `060-…` are written with tests.

Decided (2026-11-22, human): the runner is Vitest, as in `apps/web` (one syntax, known Nx integration,
works with the TypeScript and SWC setup of the server).

## To do

- Add the runner through Nx (a `test` target on the server project), config, one example test of a pure
  function, and the CI step if affected tests do not already run it.
- Document it in the server `CLAUDE.md` and the engineering rules wording about "no runner".

## Out of scope

- Writing the Aldaron tests themselves.

## Acceptance criteria

- [x] `pnpm nx run server:test` runs and passes with an example test
- [x] The CI "unit tests of affected projects" job runs the server tests
- [ ] The docs no longer say the server has no test runner

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.

### 2026-11-22 · Claude · in-progress
Taken by `/dev --auto`. Branch `chore/add-server-test-runner`.

### 2026-11-22 · Claude · to-test
**What changed**: Vitest in the server (`server:test` target, `vitest.config.ts` with the `@/` alias,
`*.test.ts` next to the code and left out of `dist/`), an example test of `pii.utils.ts` (10 cases), the CI
`test` job no longer excludes `server`. Docs: server `CLAUDE.md` ("Tests" section), CI inventory,
getting-started (EN + FR). Review: `docs/code/reviews/en/261122-chore-add-server-test-runner.md`.

**What Claude ran**: `pnpm nx run-many -t test lint typecheck build -p server` (green, 10 tests passed, no
lint warning); no test file in `dist/` after the build; `pnpm lint:docs`, `pnpm check-doc-links`,
`pnpm check-doc-twins --worktree` (green); the CI of PR #37, whose `test` job runs `server:test`.

**Untreated criterion**: "The docs no longer say the server has no test runner" is partial.
`.claude/rules/engineering-principles.md` and `.claude/skills/dev/SKILL.md` still say it: edits under
`.claude/` were refused in the unattended session. Follow-up ticket:
`006-update-the-test-runner-wording-of-the-claude-rules`.

**How to test** (human): no feature to try. Approve and merge ticket `006-…` (two sentences to change),
then tick the last criterion. Optionally run `pnpm nx run server:test` after `pnpm install`.

**What is left**: `tickets/work/add-a-test-runner-to-the-server/remaining.md`, one entry: the `.claude/`
wording (ticket `006-…`).
