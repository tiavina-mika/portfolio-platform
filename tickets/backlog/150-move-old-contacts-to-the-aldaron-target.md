---
type: chore
apps: [server]
branch:
pr:
---

## Context

A `Contact` created before the `target` field reads as `portfolio`. If Aldaron quote requests already
exist among them, a one-off job must move them. Depends on `040-turn-a-site-quote-request-into-a-client-and-a-quote`.
Design note: `docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, "Anciens contacts".

⚠️ Conditional: first check whether any such rows exist (read-only count). If none, close the ticket in
`done/` with a comment saying so, and write no job.

## To do

- Identify old quote requests (the form answers are written in `message`), set `target: aldaron` on them
  with a one-off job, tracked in `docs/code/todo/` per `implementation-completeness.md`.

## Out of scope

- Newsletter targets.

## Acceptance criteria

- [ ] The number of old Aldaron requests is known and written in the ticket
- [ ] Each of them is under `aldaron`, and no portfolio contact is moved by mistake

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
