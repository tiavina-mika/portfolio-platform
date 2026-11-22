---
type: feat
apps: [server, bo]
branch:
pr:
---

## Context

The global search registry may not filter by workspace yet. Registering clients and quotes there would
show them to a user limited to the portfolio. Depends on `010-…` and `020-…`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, "Recherche et tableau de bord".

⚠️ First check whether the registry can limit a result to a workspace. If it cannot, make it able to
(generic, in `_core`) before registering anything.

## To do

- Server: register clients and quotes in the global search, restricted to the Aldaron workspace.
- Bo: nothing to add if the search already renders registry entries; locales for the new result labels.
- Docs: search feature page and inventory if needed.

## Out of scope

- Searching missions or payments.

## Acceptance criteria

- [ ] A user with the Aldaron workspace finds clients and quotes in the global search
- [ ] A user limited to the portfolio workspace never sees them

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
