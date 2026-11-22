---
type: feat
apps: [server, bo]
branch:
pr:
---

## Context

An accountant needs the payments as a file. Depends on `060-add-quote-payments-with-the-30-40-30-schedule`.
Design note: `docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, "Export CSV des paiements".

## To do

- Server: a function returning the payments matching the list filters as CSV rows, with a named limit,
  wrapped in `fromBO` + `resolveWorkspace`.
- Bo: an "Export CSV" button on the payments list, using the current filters; locales.
- Docs: payments feature page.

## Out of scope

- Invoices, accounting software integrations.

## Acceptance criteria

- [ ] The button downloads a CSV of the payments matching the current filters
- [ ] Each row has quote number, client, kind, amount, currency, status, due date, paid date and method
- [ ] A user without the Aldaron workspace cannot call the export

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
