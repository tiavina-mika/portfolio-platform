---
type: docs
apps: []
branch: docs/ticket-workflow-in-claude-md
pr: https://github.com/tiavina-mika/portfolio-platform/pull/35
---

## Context

The ticket workflow (`tickets/`, skills `/ticket`, `/dev`, `/auto`, rule `.claude/rules/tickets.md`) exists
but `CLAUDE.md` does not mention it, so a new session does not know it. Also serves as the first
end-to-end test of the `/dev` flow.

## To do

- Add `tickets/` to the monorepo structure tree of `CLAUDE.md`.
- Add `tickets` to the list of topic rules in "Detailed rules", with one line on the three skills.

## Out of scope

- Changing the ticket format or the skills themselves.
- Any translated copy: `CLAUDE.md` is English only.

## Acceptance criteria

- [x] `CLAUDE.md` shows the `tickets/` folder in the monorepo structure
- [x] `CLAUDE.md` points to the tickets rule and names `/ticket`, `/dev` and `/auto`
- [x] `pnpm lint:docs` passes

## Comments

### 2026-11-22 · Claude · backlog
Written with `/ticket` as a small test of the workflow.

### 2026-11-22 · Claude · in-progress
Work started on branch `docs/ticket-workflow-in-claude-md`.

### 2026-11-22 · Claude · to-test
- Changed: `CLAUDE.md` shows `tickets/` in the structure tree and points to the tickets rule and the `/ticket`, `/dev`, `/auto` skills.
- Branch: `docs/ticket-workflow-in-claude-md`. PR: #35.
- Ran: `pnpm lint:docs` (0 issues), `pnpm check-doc-links` (no broken link). All three criteria ticked.
- How to test: read the "Monorepo Structure" tree and "Detailed rules" of `CLAUDE.md`; nothing else needs a human.
- Not verified: nothing.
- Left to do: nothing (`tickets/work/document-the-ticket-workflow-in-claude-md/remaining.md`).

### 2026-11-22 · Claude · done
Validated by the human. Merged with PR #35 (https://github.com/tiavina-mika/portfolio-platform/pull/35): `CLAUDE.md` now shows the tickets folder and names `/ticket`, `/dev` and `/auto`.
