---
type: feat
apps: [server, bo]
branch:
pr:
---

## Context

Dashboard and list signals for the Aldaron activity. Depends on `020-…` and `060-…`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, sections "Dans les listes et le tableau de
bord" and "Ordre de travail" step 6.

## To do

- Server: dashboard registry entries (quotes by status, accepted amount, collected, left to collect,
  overdue).
- Bo: dashboard cards shown only in the Aldaron workspace; "overdue" shown in the payments list for a
  `due` payment whose date has passed (no new status); a warning (not a block) when a mission goes
  `inProgress` while the deposit is not paid; locales.
- Docs: dashboard feature page; inventory if a registry file is added; mark step 4 as ✅ in
  `docs/code/design/en/WORKSPACE_SWITCH.md` and its French twin once all four collections are done.

## Out of scope

- Global search registration (`180-…`).

## Acceptance criteria

- [ ] The Aldaron dashboard shows the number of quotes per status
- [ ] It shows the accepted, collected and remaining amounts and the number of overdue payments
- [ ] A due payment past its date is shown as overdue in the list
- [ ] Moving a mission to in progress with an unpaid deposit shows a warning and still works
- [ ] The portfolio dashboard shows none of these cards

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
