# Review — Payments of the Aldaron quotes (30 / 40 / 30)

- **Branch**: `feat/quote-payments-schedule`
- **Type**: New feature
- **Author**: `tiavinamika@gmail.com` (local git identity; written by `/dev --auto`)
- **Created**: 2026-11-23 at 22:13
- **Apps touched**: Server, Back-office (and the shared libs they use)

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [Back-office](#back-office)
- [See the result locally](#see-the-result-locally)
- [Result per acceptance criterion](#result-per-acceptance-criterion)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [What is left to do](#what-is-left-to-do)

## In short

Accepting an Aldaron quote now writes its three payments, on one schedule for every quote: a 30 % deposit
due the same day, a 40 % milestone and a 30 % balance; the balance takes the rounding, so the three always
add up to the total. From the quote list, "Payments" on an accepted quote shows the total, what is paid and
what is left, and lets a user mark a payment as paid (method, reference, day), date the milestone and the
balance, and correct a mistake by cancelling a payment, a new one taking its place. A paid payment is never
edited and nothing is deleted. The quote's paid amount follows the paid payments. A quote accepted before
this change gets its schedule from a "Create the payment schedule" button.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `Payment` | yes | `quote`, `client` (pointers), `kind`, `percent`, `amount`, `status`, `dueDate`, `paidAt`, `method`, `reference`, `createdBy`, `updatedBy` | one part of an accepted quote's schedule, and its history |
| `Quote` | no | `paidAmount` *(now kept up to date)* | the sum of the paid payments, written only by the payment trigger |

Indexes added on `Payment`: `_p_quote` + `status` (the payments of a quote, the check that it has some, the
sum of the paid ones) and `status` + `dueDate` (what is to be paid, for the overdue list of `070`). The class
is locked to the master key (`ALWAYS_LOCKED_CLASSES`, `FUNCTION_ONLY_CLASSES`). No migration: the class and
its indexes are created at startup; old accepted quotes have no payment until the button is used.

## Server

- The quote's save that accepts it writes the three payments, once (`afterSave` `Quote`); no later save of
  the accepted quote writes any, and a quote that is not accepted gets none.
- A payment trigger (`beforeSave` `Payment`) keeps its part fixed (quote, client, kind, percent, amount),
  lets a paid payment only become cancelled and a cancelled one never change, requires the method when it
  is paid and fills the day with today (never a day ahead). `afterSave` `Payment` sums the paid payments
  into the quote's `paidAmount`; the quote trigger puts `paidAmount` back on every other save.
- Five functions, each in the Aldaron workspace only and checking the right on `Payment`
  (`getQuotePayments`, `createQuotePayments`, `markPaymentAsPaid`, `setPaymentDueDate`, `cancelPayment`).
  No delete function. Their input refuses the amount, the percent, the kind and the status.
- Messages in `fr`, `en`, `mg`. Inventory updated ([Cloud Code](../../../inventory/README.md#cloud-code),
  [collections](../../../inventory/code/en/COLLECTIONS_AND_INDEXES.md)). No new env variable or service.

## Back-office

- **Pages touched**: Quotes (`http://localhost:5174/devis`), new row action "Payments" on accepted quotes,
  for a role with the right List on **Payments**.
- The payments dialog: summary (quote total, already paid, left to pay), one row per payment (part and
  percent, amount in the quote's currency, due date, status, paid day with method and reference), and the
  actions "Mark as paid", "Set the due date" (milestone and balance), "Cancel and re-enter".
- **Payments** is a new entry of the role rights table (Operations group).
- Feature doc updated: [Quotes](../../../features/bo/quotes/fr/QUOTES.FR.md#les-paiements-dun-devis-accepté).

## See the result locally

```bash
pnpm nx run server:dev
pnpm nx run bo:dev
```

Then, in the Aldaron workspace: `http://localhost:5174/devis` → an accepted quote → row menu → "Payments".

## Result per acceptance criterion

| Criterion | Result | Proof |
|---|---|---|
| Accepting a quote creates exactly three payments of 30 / 40 / 30 adding up to its total | Treated; live save not run | `apps/server/src/utils/_domain/payment.utils.test.ts` (split, rounding, ten totals) |
| Saving the accepted quote again creates no more payments | Treated; live save not run | `isQuoteJustAccepted` tests + existence check in `afterSave` |
| Marking as paid records method and date and updates the paid amount | Treated; live save not run | `payment.validations.test.ts`, `sumPaidPayments` / `changesPaidAmount` tests |
| A paid payment cannot be edited or deleted; fixed by cancelling and re-entering | Treated; live save not run | transition tests, CLP test, no delete function |
| Remaining = total minus paid | Treated | `computeQuoteRemainingAmount` tests; dialog summary |
| A quote not accepted has no payment | Treated; live save not run | `isQuoteJustAccepted` tests; `getQuotePayments` returns none |

Gaps with `implementation.md`: added `createQuotePayments` and its button (quotes accepted before the
change); the three payments are saved one after the other instead of in a batch (each save keeps its
context). Checks run on 2026-11-23: `pnpm nx run-many -t lint typecheck test -p server bo` (164 server
tests), lint + typecheck of the three shared libs, `pnpm nx run-many -t build -p server bo`,
`pnpm check-i18n`, `check-doc-links`, `check-doc-twins --worktree`, `lint:docs`: all ok.
Not verified: every live case (no local database), listed in the ticket's `tc-manual.md`.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟡 Low | Bug | A quote keeps one or two payments of three, and "Create the payment schedule" is refused because it has some | The acceptance's `afterSave` fails between two saves (database error) | ⏳ deferred — [debt #1](debt/261123-feat-debt-quote-payments-schedule.md#1-a-schedule-written-in-part-cannot-be-completed) |
| 🟡 Low | Bug | Two replacements for one cancelled payment | The same payment cancelled at the same moment from two tabs | ⏳ deferred — [debt #2](debt/261123-feat-debt-quote-payments-schedule.md#2-two-replacements-for-one-cancelled-payment) |
| 🟡 Low | Bug | The quote's paid amount lags behind until the next payment is recorded | The sum after a payment fails (logged) | ⏳ deferred — [debt #3](debt/261123-feat-debt-quote-payments-schedule.md#3-a-failed-sum-leaves-the-paid-amount-behind) |
| 🟡 Low | Regression | `paidAmount` written by any other code is now put back | Only the payment trigger writes it today; checked by search | ✅ no other writer on the branch |

Details and fixes: [debt file](debt/261123-feat-debt-quote-payments-schedule.md).

## What is left to do

- The live cases, in pre-production: the ticket's `tc-manual.md`.
- Existing roles get no right on **Payments**: give List / Edit / Create to the sales role after deployment.
- Overdue payments, dashboard cards and the deposit warning on a mission: `070-show-the-aldaron-money-cards-on-the-dashboard`;
  CSV export: `140-export-aldaron-payments-as-csv`; audit trail: `080-add-an-audit-trail-to-aldaron-money-records`.
