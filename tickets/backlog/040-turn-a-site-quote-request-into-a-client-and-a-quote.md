---
type: feat
apps: [server, bo, aldaron-web]
branch:
pr:
---

## Context

The Aldaron site sends quote requests as `Contact` rows. Option B of the design note, confirmed by the human
on 2026-11-22: a back-office user turns a request into a client and a draft quote by hand; the public form
does not change. Depends on `010-…` and `020-…`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, section "Demandes de devis du site".

## To do

- Server: `target` on `Contact`, set by `createPublicContact` (`aldaron` from aldaron-web, else
  `portfolio`; a row with no field reads as `portfolio`); contact list and detail functions follow the
  workspace with `resolveWorkspace`; a `quote` pointer on `Contact` set when a quote is created from it.
- Aldaron-web: `createQuoteRequest` sends its target with the call. No visible change; the estimate is
  still erased from the browser on submit.
- Bo: contact list follows the active workspace; "Create the client and the quote" action on the contact
  detail, shown only with the `create` right of quotes, reusing a client with the same email, opening the
  quote form prefilled with the estimate; an already converted request cannot become a second quote.
- Docs: update the contacts and quotes feature pages; web feature page only if what a visitor sees changes
  (it should not).

## Out of scope

- Creating clients or quotes automatically from the public form.
- Moving old contacts (`150-…`).
- Newsletter targets (open question of the workspace note).

## Acceptance criteria

- [ ] A quote request sent from the Aldaron site appears only in the Aldaron workspace contacts
- [ ] A user can create a client and a prefilled draft quote from that contact in one action
- [ ] If a client with the same email exists it is reused, not duplicated
- [ ] A contact already converted shows its quote and cannot be converted again
- [ ] The public form behaves exactly as before for the visitor

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note; option B is a recommendation not yet confirmed by the human.
