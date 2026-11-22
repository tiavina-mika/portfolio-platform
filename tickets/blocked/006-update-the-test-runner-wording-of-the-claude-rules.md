---
type: docs
apps: [server]
branch: chore/block-test-runner-wording
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

### 2026-11-22 · Claude · blocked
Taken by `/dev --auto`: the edit of `.claude/rules/engineering-principles.md` was refused again
("sensitive file"), so the unattended loop cannot do this ticket. Moved to `blocked/` so the loop stops
retrying it; this branch only carries the move (`chore/block-test-runner-wording`).

**Question / action for a human**: apply the two edits below in an interactive session (or by hand), then
move the ticket to `done/`. `pnpm nx run server:test` exists (`apps/server/project.json`, target `test`).

1. `.claude/rules/engineering-principles.md`, "BDD / TDD":
   - line 81, after "apps/web runs Vitest + Storybook tests" add "apps/server runs Vitest unit tests with
     pnpm nx run server:test" (inside the same parentheses);
   - line 91, "apps/server and apps/bo have no test runner today" becomes "apps/bo has no test runner
     today".
2. `.claude/skills/dev/SKILL.md`, `tc.md` section (lines 177–178), "only apps/web has a runner (…);
   apps/server and apps/bo have none" becomes "apps/web runs Vitest + Storybook (pnpm nx run
   web:test-storybook) and apps/server runs Vitest unit tests (pnpm nx run server:test); only apps/bo has
   none".

Also stale, same fix: `.claude/skills/audit/SKILL.md` line 65 says "Jest tests in `apps/server`" (it is
Vitest).
