---
type: feat
apps: [libs, server, bo]
branch: feat/quote-payments-schedule
pr:
---

## Context

Payments of an accepted quote, one fixed schedule for every quote: 30 % deposit on acceptance, 40 %
milestone, 30 % balance. Depends on `020-…`. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`, section "Paiement". No invoices, nothing is
collected online.

## To do

- Shared: `Payment` in `DOMAIN_COLLECTIONS`, the schedule as a constant, `PaymentKindEnum`,
  `PaymentStatusEnum`, `PaymentMethodEnum`.
- Server: pure function for the 30 / 40 / 30 split where the last part absorbs the rounding; `afterSave` of
  the quote creates the three payments on acceptance (deposit `due` today, others `planned`) and never
  twice; `Payment` triggers (a `paid` payment is never edited, `paidAmount` recomputed on the quote);
  list and update functions, no delete; indexes; i18n. Amounts are integers in the smallest currency unit.
- Bo: payments of a quote, mark as paid with method and optional reference, set the due date of the
  milestone and the balance, a `cancelled` payment replaces a mistake with a new one, rights (`create` and
  `update` to the commercial role and the owner), locales.
- Docs: French feature page + README entry; inventory.

## Out of scope

- Overdue display and dashboard cards (`070-…`), CSV export (`140-…`), invoices.

## Acceptance criteria

- [ ] Accepting a quote creates exactly three payments of 30 %, 40 % and 30 % that add up to its total
- [ ] Saving the accepted quote again does not create more payments
- [ ] Marking a payment as paid records the method and the date and updates the paid amount of the quote
- [ ] A paid payment cannot be edited or deleted; an error is fixed by cancelling and re-entering
- [ ] The remaining amount of a quote equals its total minus what is paid
- [ ] A quote that is not accepted has no payment

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note. No unit test runner on the server (see `005-…`, to be done first): the split
and rounding are proved by tests of the pure function.

### 2026-11-23 · Claude · in-progress
Taken by `/dev --auto` (`todo/` empty, first `backlog/` ticket). Branch `feat/quote-payments-schedule`.

### 2026-11-23 · Claude · to-test
**What changed**: the `Payment` collection of the Aldaron workspace. Shared: `payment` in
`DOMAIN_COLLECTIONS`, `QUOTE_PAYMENT_SCHEDULE`, `PaymentKindEnum` / `PaymentStatusEnum` / `PaymentMethodEnum`,
pure split (the balance absorbs the rounding), transitions and sums. Server: the quote `afterSave` writes the
three payments on acceptance, once; a payment `beforeSave` (fixed part, paid → cancelled only, cancelled final,
method required, paid day today by default and never ahead) and `afterSave` (keeps the quote's `paidAmount`,
which the quote trigger now puts back on every other save — the `TODO(link:060-…)` is wired); five functions
(`getQuotePayments`, `createQuotePayments`, `markPaymentAsPaid`, `setPaymentDueDate`, `cancelPayment`, no
delete); indexes, locked CLP, i18n. Bo: "Payments" on accepted quotes (summary, rows, mark as paid, due date,
cancel and re-enter, create the schedule for old quotes), rights entry, locales. Docs: quotes feature page,
inventory, design note step 5 ✅, changeset.

**Branch / PR**: `feat/quote-payments-schedule`, PR linked in the front matter.

**Claude ran**: `pnpm nx run-many -t lint typecheck test -p server bo` (ok; server 11 files, 164 tests, new
`payment.utils.test.ts` and `payment.validations.test.ts`, CLP test extended); lint + typecheck of the three
shared libs (ok); `pnpm nx run-many -t build -p server bo` (ok); `check-i18n`, `check-doc-links`,
`check-doc-twins --worktree`, `lint:docs` (ok). Review: `docs/code/reviews/en/261123-feat-quote-payments-schedule.md`
(three low risks deferred to its debt file).

**How to test** (pre-production, Aldaron workspace, an Owner account): accept a sent quote of 1 001,00 € and
open "Payments" (300,30 / 400,40 / 300,30); mark the deposit paid; cancel and re-enter it; date the milestone;
check no "Payments" on a draft. Detail: `tickets/work/add-quote-payments-with-the-30-40-30-schedule/tc-manual.md`.

**Not verified**: every live case — no database is reachable on the machine (port 27017 refused). No
criterion is ticked for that reason; each rule is proved by a unit test.

**Decisions to validate**: `tickets/work/add-quote-payments-with-the-30-40-30-schedule/recommendation.md`
(due date ⇔ `due`, the replacement written by the cancel, a button for old accepted quotes, the paid day, rights).

**What is left** (`remaining.md`): live cases to run; the decisions above; give the sales role its rights on
Payments after deployment; overdue, dashboard cards and deposit warning (`070-…`); CSV export (`140-…`); audit
trail (`080-…`); three low deferred risks (partial schedule, double cancel, failed sum). No `TODO(link:...)`
left open by this ticket.
