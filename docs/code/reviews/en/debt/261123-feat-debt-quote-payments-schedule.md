# Debt — Payments of the Aldaron quotes (30 / 40 / 30)

> Review: [261123-feat-quote-payments-schedule.md](../261123-feat-quote-payments-schedule.md)
> Branch: `feat/quote-payments-schedule` · Created 2026-11-23 at 22:13 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. A schedule written in part cannot be completed](#1-a-schedule-written-in-part-cannot-be-completed)
- [2. Two replacements for one cancelled payment](#2-two-replacements-for-one-cancelled-payment)
- [3. A failed sum leaves the paid amount behind](#3-a-failed-sum-leaves-the-paid-amount-behind)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Low | Bug | A schedule written in part cannot be completed | ⏳ to do |
| 2 | 🟡 Low | Bug | Two replacements for one cancelled payment | ⏳ to do |
| 3 | 🟡 Low | Bug | A failed sum leaves the paid amount behind | ⏳ to do |

## 1. A schedule written in part cannot be completed

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/services/_domain/payment.service.cloud.ts` (`createQuotePaymentsService`),
  `apps/server/src/cloud/functions/_domain/payment.functions.ts` (`createQuotePayments`)

**What can happen** — the quote is accepted; its `afterSave` saves the deposit, then the database fails on
the milestone. The quote keeps one payment; "Create the payment schedule" is not shown (the quote has
payments) and the function refuses it anyway.

**Why** — the three saves are not one transaction, and the repair path checks "has any payment", not "has
its full schedule".

**How to check** — make the second save throw (mock `Parse.Object.prototype.save`), then call
`createQuotePayments`.

**How to fix**

1. **(recommended)** Make the schedule complete itself: `createQuotePaymentsService` writes only the kinds
   with no non-cancelled payment yet, and `createQuotePayments` refuses only a quote whose three kinds all
   have one; the dialog shows the button while a kind is missing.
   *Why*: idempotent, no transaction needed, the same function repairs every case; a unit test on a pure
   "missing kinds" helper.
2. Write the three payments in a MongoDB transaction (`apps/server/src/cloud/transactions/`) — needs a replica
   set in every environment and leaves the old-quote case to the button.

## 2. Two replacements for one cancelled payment

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `cancelPaymentService` in `apps/server/src/cloud/services/_domain/payment.service.cloud.ts`

**What can happen** — two people (or two tabs) cancel the same payment at the same moment: both read it
unpaid, both write a replacement, both cancel it. The quote then has one payment too many.

**Why** — the replacement is written before the cancellation, and nothing ties a replacement to the payment
it replaces.

**How to check** — call `cancelPayment` twice in parallel on one payment against a database.

**How to fix**

1. **(recommended)** Store `replaces` (pointer to the cancelled payment) on the replacement, with a unique
   sparse index on `_p_replaces` in `db-indexes.ts`: the second replacement is refused by the database and
   the function answers "already corrected".
   *Why*: the database holds the rule against any race, and the pointer also documents the history.
2. Cancel first, then write the replacement only if the cancellation changed the status — still racy
   without a conditional update.

## 3. A failed sum leaves the paid amount behind

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `afterSave` `Payment` in `apps/server/src/cloud/triggers/_domain/payment.triggers.ts`,
  `syncQuotePaidAmountService`

**What can happen** — a payment is marked paid, then the save of the quote's `paidAmount` fails: the
quote list and the dialog summary show the old paid amount until another payment is paid or cancelled.

**Why** — the sum runs after the payment save and its failure is only logged.

**How to check** — make the quote save throw in the trigger and read the quote.

**How to fix**

1. **(recommended)** Sum the paid amount again when the payments of a quote are read
   (`getQuotePayments` compares the sum of its paid payments with `quote.paidAmount` and syncs when they
   differ).
   *Why*: self-healing on the screen where the amount matters, one call, no new job.
2. A nightly job that recomputes every accepted quote's `paidAmount` — one more inventory entry for a rare
   case.
