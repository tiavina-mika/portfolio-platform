---
type: docs
apps: [server]
branch:
pr:
---

## Context

`005-add-a-test-runner-to-the-server` gave the server a Vitest runner (`pnpm nx run server:test`), but two
files under `.claude/` still say the server has none. The autonomous session could not change them: edits
under `.claude/` need a human's approval. Needs an interactive session (or a human edit).

- `.claude/rules/engineering-principles.md`, "BDD / TDD": "`apps/server` and `apps/bo` have no test runner
  today" and "(`apps/web` runs Vitest + Storybook tests)".
- `.claude/skills/dev/SKILL.md`, `tc.md` section: "only `apps/web` has a runner … `apps/server` and
  `apps/bo` have none".

## To do

- Say that `apps/server` runs Vitest unit tests (`pnpm nx run server:test`), and that only `apps/bo` has
  no runner, in both files.

## Out of scope

- A runner for `apps/bo`.

## Acceptance criteria

- [ ] Neither file says the server has no test runner
- [ ] Both name `pnpm nx run server:test`

## Comments

### 2026-11-22 · Claude · backlog
Written by `/dev --auto` on `005-add-a-test-runner-to-the-server`: the `.claude/` edits were refused in the
unattended session.
