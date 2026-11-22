---
type: chore
apps: [server]
branch:
pr:
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

- [ ] `pnpm nx run server:test` runs and passes with an example test
- [ ] The CI "unit tests of affected projects" job runs the server tests
- [ ] The docs no longer say the server has no test runner

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
