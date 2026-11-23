---
type: feat
apps: [libs, server, bo]
branch: feat/aldaron-quote-collection
pr:
---

## Context

Quotes sent to clients. Depends on `010-add-the-client-collection-to-the-aldaron-workspace`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md` (sections "Devis", "Améliorations et manques").
Step 3 of its work order, without the site request (see `040-…`) and without revisions (see `030-…`).

Decided (2026-11-22, human): the quote number is `AL-<year>-<three digits>` (for example `AL-2026-001`),
gap-free per year and restarting each year. A revision keeps the number and raises the version.
Test the split, the total and the transitions with the server runner of `005-add-a-test-runner-to-the-server`.

Decided (2026-11-22, human, on the recommendation): one `currency` (ISO 4217 code) and one optional `taxRate`
(a percentage, empty = no VAT) per quote, applied to every line. Payments take the currency of their quote.
A default currency in the Aldaron settings only prefills the form: the chosen currency is stored on the
quote, so changing the setting never alters an existing quote. Amounts are integers in the smallest unit
of the currency, so the number of decimals of each supported currency is a constant. A per-line tax rate is
not built; it can be added later as an optional field defaulting to the quote's rate. Invoice legal
mentions are out of scope (a later invoice note, with the accountant).

Decided (2026-11-22, human, on the recommendation): the supported currencies start as the euro (2 decimals,
the default of the settings) and the ariary (0 decimals in practice: the iraimbilanja sub-unit is no longer
used, although ISO 4217 declares 2). They live in one constant, so adding a currency or changing a number
of decimals is a one-place change.

This ticket may be large; if it does not fit one session, split it (server first is not allowed to stay
unwired: each part must be reachable from the back-office).

## To do

- Shared: `Quote` in `DOMAIN_COLLECTIONS`, `QuoteStatusEnum`, `QuoteAcceptanceMethodEnum`, the supported
  currencies with their number of decimals.
- Server: gap-free number from a `Counter` row incremented atomically in the same save (unique index on
  `name`); pure functions in `utils/` for the total and the allowed status transitions; `beforeSave` trigger
  (transitions `draft → sent → accepted | refused | expired`, lines frozen once out of `draft`, `number`,
  `totalAmount` and `paidAmount` computed server-side and refused as input); `issuedAt` and `acceptedAt`;
  `lines` capped by a named constant; indexes; functions wrapped in `fromBO` + `resolveWorkspace`; i18n.
- Bo: currency and VAT rate fields (currency prefilled from the Aldaron default), list, form with the total shown live (server stays the source of truth), a "Create client" shortcut
  inside the form, acceptance proof (method + optional file), status actions, route, sidebar entry, rights,
  locales.
- Docs: French feature page + `docs/features/bo/README.md`; inventory.

## Out of scope

- Revision and amendment (`030-…`), site request conversion (`040-…`), PDF and sending (`110-…`),
  payments (`060-…`), automatic expiry (`130-…`).

## Acceptance criteria

- [ ] A user can create a draft quote for an existing client and see its total computed
- [ ] A quote stores its own currency and optional VAT rate, and its total uses the currency decimals
- [ ] Changing the default currency setting does not change an existing quote
- [ ] Each new quote gets a unique readable number with no gap inside a year
- [ ] A quote can go `draft → sent → accepted`, `refused` or `expired`, and any other transition is refused
- [ ] The lines of a quote that left `draft` cannot be changed
- [x] Sending a number, a total or a paid amount in the request does not change the stored values
- [ ] Accepting a quote records the date and the acceptance method (and an optional proof file)
- [ ] The list filters by status and shows the client name without a copied name stored on the quote
- [x] Labels and errors exist in `fr`, `en` and `mg`

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note.

### 2026-11-23 · Claude · in-progress
Taken by `/dev --auto` (first usable ticket: `todo/` empty). Branch `feat/aldaron-quote-collection` from
`develop`. Too big for one session with the acceptance proof file: that part is split into
`025-attach-an-acceptance-proof-file-to-a-quote` (backlog); this ticket records the date and the method.

### 2026-11-23 · Claude · to-test
**What changed**: a `Quote` collection for the Aldaron workspace. Server: five Cloud Functions (`getQuotes`,
`getQuote`, `createQuote`, `updateQuote`, `changeQuoteStatus`), each checking the Aldaron workspace then the
right; a `beforeSave` trigger (born draft, total recomputed, number `AL-<year>-<NNN>` from an atomic yearly
`Counter` taken last, transitions `draft → sent → accepted | refused | expired`, content frozen out of
draft, `issuedAt`, `acceptedAt` + method); a `beforeDelete` on `Client` refusing a client with quotes;
indexes; locked class permissions. Shared: enums, currencies (EUR 2 decimals, MGA 0), the total and the
transitions in `@shared/domain-utils`. Back-office: the Quotes list (tabs per status, search), a dialog
with a client picker and a "New client" shortcut, lines, currency, VAT, live total, row actions limited to
the allowed moves, an "Accept" dialog asking the method, a default currency in Settings → Languages
(Aldaron only, through a settings registry), sidebar entry hidden in the portfolio, rights, locales. Docs:
feature page, BO index, clients and settings pages, inventory, design note.

**Branch / PR**: `feat/aldaron-quote-collection`, PR linked in `pr:`.

**What Claude ran**: `pnpm nx run-many -t lint typecheck -p server bo shared-domain-utils
shared-domain-constants shared-domain-types` ok (0 errors); `pnpm nx run-many -t test build -p server bo`
ok (server: 6 files, 68 tests); `pnpm check-i18n`, `check-doc-links`, `check-doc-twins --worktree`,
`lint:docs` ok. Review: `docs/code/reviews/en/261123-feat-aldaron-quote-collection.md` (two bugs fixed on
the branch: the numbering year read in UTC, an empty VAT box given `null`; two low risks deferred to
`docs/code/reviews/en/debt/261123-feat-debt-aldaron-quote-collection.md`).

**How to test**: follow `tickets/work/add-the-quote-collection-to-the-aldaron-workspace/tc-manual.md`, in
pre-production or locally with `/rd` on a database: create a draft and watch the total, change the default
currency (existing drafts keep theirs), create several quotes (numbers follow), send / accept (method) /
refuse, check that a sent quote has no "Edit", the tabs and the client name, the "New client" shortcut,
and that the portfolio workspace shows nothing.

**Not verified**: every live case (criteria 1, 3, 4, 5, 6, 8, 9 unticked), no local database on the
machine. Criterion 8 is partial: the proof file is ticket `025-attach-an-acceptance-proof-file-to-a-quote`.

**What is left** (`tickets/work/add-the-quote-collection-to-the-aldaron-workspace/remaining.md`): the proof
file (`025-…`); the live cases; `paidAmount` upkeep, `TODO(link:060-add-quote-payments-with-the-30-40-30-schedule)`;
the mission delete guard, `TODO(link:050-add-the-mission-collection-to-the-aldaron-workspace)`; the decisions
of `recommendation.md` to validate (proof split, default currency as a local preference, content frozen,
active client only, numbering year and prefix, line rules, no delete); two deferred low risks (debt file).
Delivered: `implemented.md`.
