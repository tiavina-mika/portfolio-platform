---
type: feat
apps: [server]
branch:
pr:
---

## Context

A quote sent but past its validity date should become `expired` without a person doing it. Depends on
`020-add-the-quote-collection-to-the-aldaron-workspace`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, "Faire expirer les devis automatiquement".

## To do

- A daily job (`node-cron`, scheduled in `index.ts`, imported in `cloud/jobs/index.ts`) that sets `expired`
  on every `sent` quote whose `validUntil` is past, through the same transition rules as a manual change.
- Add the job to `docs/inventory/README.md`.

## Out of scope

- Notifying the client or the team.

## Acceptance criteria

- [ ] A sent quote whose validity date is past becomes expired after the job runs
- [ ] A draft, accepted or refused quote is never touched
- [ ] A sent quote with no validity date is never touched
- [ ] The job is scheduled and listed in the inventory

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
