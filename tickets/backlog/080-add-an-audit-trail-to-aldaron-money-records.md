---
type: feat
apps: [server, bo]
branch:
pr:
---

## Context

For money, `updatedAt` is not enough: who changed which status, and when. Depends on `020-…` and `060-…`
(and `050-…` for missions). The design note
(`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, "À construire avec la première collection")
asked to check first whether the project already has a journal. It does: the server has an audit log
(`apps/server/src/cloud/services/_core/auditLog.service.cloud.ts`, with role and MFA variants). Reuse it
and extend it; do not create a second journal. ⚠️ Check that `_core` stays free of `_domain` imports.

## To do

- Server: write an entry (entity class, id, action, previous and new value, user, date) from the triggers
  of quotes, payments and missions through the existing audit log service.
- Bo: show the history of a quote, a payment and a mission, in the existing audit view if there is one.
- Docs: feature page and inventory if a new collection or function appears.

## Out of scope

- Editing or deleting audit entries (append only).

## Acceptance criteria

- [ ] Every status change of a quote, a payment or a mission leaves an entry with who and when
- [ ] The entry shows the previous and the new value
- [ ] A user can see the history of one quote
- [ ] Entries cannot be edited or deleted from the back-office

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note; the existing audit log was found by a code search.
