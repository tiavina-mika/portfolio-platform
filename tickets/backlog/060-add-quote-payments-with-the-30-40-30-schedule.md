---
type: feat
apps: [libs, server, bo]
branch:
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
