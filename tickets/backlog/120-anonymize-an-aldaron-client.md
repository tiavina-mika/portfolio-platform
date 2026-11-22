---
type: feat
apps: [server, bo]
branch:
pr:
---

## Context

Archiving a client conflicts with a private person's right to erasure. Depends on
`010-add-the-client-collection-to-the-aldaron-workspace`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, "Anonymiser un client".

Decided (2026-11-22, human, on the recommendation): build the anonymisation now. It keeps ids, amounts and
dates and erases only the identity, so it does not depend on the retention period. The retention period
(accounting records are often kept around ten years, depending on the country and the status of Aldaron) is
a legal question for the accountant: do not guess it. Record it in `remaining.md` as `to validate`, and the
sentence about how long clients and quotes are kept in the privacy policy of `aldaron-web` as a follow-up
ticket once the accountant has answered.

## To do

- Server: an "anonymize" function, owner only, that erases name, email, phone, address, tax id and notes,
  keeps the id, amounts and dates, and sets the status `anonymized`; refused if already anonymized.
- Bo: the owner-only action with a confirmation, and a translated "anonymized client" label in lists.
- Docs: client feature page update.

## Out of scope

- Editing the privacy policy text of `aldaron-web`.

## Acceptance criteria

- [ ] Only the owner can anonymize a client
- [ ] After anonymizing, the personal fields are empty and the status is `anonymized`
- [ ] The quotes, amounts and dates of that client are kept
- [ ] Lists show a translated "anonymized client" instead of the name

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.
