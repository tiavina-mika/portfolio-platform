---
type: feat
apps: [server, bo]
branch:
pr:
---

## Context

Split from `020-add-the-quote-collection-to-the-aldaron-workspace`, which records the acceptance date and
method of a quote but no file. Design note: `docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`
(field `acceptanceProof`: "signed quote, e-mail of the client, stored like the other files of the
back-office").

## To do

- Server: an optional `acceptanceProof` file on `Quote`, accepted by `changeQuoteStatus` only when the quote
  becomes `accepted`, stored like the other back-office files; refused on any other transition.
- Bo: an optional file drop in the "Accept the quote" dialog, and a link to open the proof on an accepted
  quote.
- Docs: the quotes feature page; inventory if a new storage path or variable appears.

## Out of scope

- Several proofs per quote, a proof on a payment.

## Acceptance criteria

- [ ] A user accepting a quote can attach one file (PDF or image) as the proof of the acceptance
- [ ] The proof of an accepted quote can be opened from the quote list
- [ ] A proof cannot be attached to a quote that is not being accepted
- [ ] Labels and errors exist in `fr`, `en` and `mg`

## Comments

### 2026-11-23 · Claude · backlog
Split from `020-add-the-quote-collection-to-the-aldaron-workspace` by `/dev --auto`: the file storage of the
back-office is its own piece of work.
