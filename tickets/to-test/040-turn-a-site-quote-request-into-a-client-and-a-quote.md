---
type: feat
apps: [server, bo, aldaron-web]
branch: feat/site-quote-request-conversion
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
- [x] The public form behaves exactly as before for the visitor

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note; option B is a recommendation not yet confirmed by the human.

### 2026-11-23 · Claude · in-progress
Taken by `/dev --auto` (first `backlog/` ticket, `todo/` empty). Branch `feat/site-quote-request-conversion`.

### 2026-11-23 · Claude · to-test
**What changed**: `Contact` gets a `target` (set by `createPublicContact`, `agency` from the Aldaron site,
`portfolio` otherwise, none = portfolio) and a `quote` pointer. `getContacts` follows the workspace
(`resolveWorkspace`), `getContact` hides a message of a workspace the account cannot open. New
`prepareQuoteFromContact` (finds the client by e-mail or creates it, reads the request into a prefill);
`createQuote` takes `contact` and points the request to the quote. Bo: the contacts list follows the
workspace; under an Aldaron request, "Create the client and the quote" opens the quote form prefilled; a
converted request shows its quote number. Aldaron site: sends `target`, no visible change.

**Branch / PR**: `feat/site-quote-request-conversion`, PR in the `pr:` field.

**What Claude ran**: lint + typecheck (bo, server, aldaron-web, shared-constants) ok; `pnpm nx run server:test`
ok (97 tests, 10 new); build server + bo ok; aldaron-web: Next compiled and generated every page, then Nx
failed on a Windows symlink privilege (os error 1314, local environment); `check-i18n`, `lint:docs`,
`check-doc-links`, `check-doc-twins` ok.

**How to test** (pre-production, details in
`tickets/work/turn-a-site-quote-request-into-a-client-and-a-quote/tc-manual.md`): send the Aldaron contact
form; check it shows in Contacts of the Aldaron workspace only; click "Créer le client et le devis", price the
lines, save; check the banner and the client; send a second request with the same e-mail in capitals and check
no second client; reopen the converted request and check there is no button.

**Not verified**: every live case (no database on the machine): criteria 1 to 4 stay unticked.

**Decisions to validate**: `tickets/work/turn-a-site-quote-request-into-a-client-and-a-quote/recommendation.md`
(what the prefill takes from the estimate, the client created on the click, new client = individual…).

**What is left** (`remaining.md`): the live cases; badge and global search still global
(`190-scope-the-contact-badge-and-search-to-the-workspace`, new in `backlog/`); old requests with no target
(`150-move-old-contacts-to-the-aldaron-target`); a rare double save (debt #1 of the review). No `TODO(link:...)`
left open. Review: `docs/code/reviews/en/261123-feat-site-quote-request-conversion.md`.
