# Debt — Add quote revisions and amendments

> Review: [261123-feat-quote-revisions-and-amendments.md](../261123-feat-quote-revisions-and-amendments.md)
> Branch: `feat/quote-revisions-and-amendments` · Created 2026-11-23 at 18:25 · Author: tiavina-mika
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. A revision is two saves, not one](#1-a-revision-is-two-saves-not-one)
- [2. The revision of an amendment points to the amendment](#2-the-revision-of-an-amendment-points-to-the-amendment)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Low | Bug | The new draft exists while the sent version stays sent | ⏳ to do |
| 2 | 🟡 Low | Bug | A revision of an amendment no longer points straight to the accepted quote | ⏳ to do |

## 1. A revision is two saves, not one

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/services/_domain/quote.service.cloud.ts` (`reviseQuoteService`)

**What can happen** — the user clicks "Revise"; the draft v2 is written, then the database or the server
fails before v1 is moved to `expired`. The list shows v2 as a draft and v1 still sent; the client could
answer v1.

**Why** — Parse Server has no transaction across two saves in Cloud Code here; the draft is written first
on purpose so that nothing is lost, and a second "Revise" on v1 is refused by the unique `number` +
`version` index ("already revised").

**How to check** — make `changeQuoteStatusService` throw after the first save (a test double), call
`reviseQuote`, read both rows.

**How to fix**

1. **(recommended)** Let the `afterSave` of a new revision expire its parent when it is still `sent`, and
   keep the explicit expiry in the service: the second attempt repairs the first.
   *Why*: small, stays in the trigger that already owns the rule, and heals a half-done revision on the
   next save without a job.
2. Use a MongoDB transaction through `Parse.Server` `transactions` (`apps/server/src/cloud/transactions/`)
   — atomic, but needs a replica set in every environment and a heavier code path for a rare failure.

## 2. The revision of an amendment points to the amendment

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/triggers/_domain/quote.triggers.ts`, the payments ticket
  `060-add-quote-payments-with-the-30-40-30-schedule`

**What can happen** — an amendment `AL-2026-004` (pointing to the accepted `AL-2026-003`) is sent, then
revised: `AL-2026-004 v2` points to `AL-2026-004 v1`, not to `AL-2026-003`. The list shows "Revises
AL-2026-004 v1", and the link to the accepted quote is one step away. A later feature that needs "the
amendments of a quote" would have to walk the chain.

**Why** — a quote has a single `parentQuote` pointer, which means "revises" when the numbers match and
"amends" otherwise; the design note defines it this way.

**How to check** — create an amendment, send it, revise it, read `parentQuote` of v2.

**How to fix**

1. **(recommended)** When the payments or the client's quote history need it, add a stored
   `amendedQuote` pointer copied to every revision of an amendment, with an index if it is filtered on.
   *Why*: stores the value that will be queried (`parse-patterns.md`), costs nothing until a reader needs
   it, and keeps `parentQuote` meaning what the design note says.
2. Walk the chain at read time — no schema change, but one extra read per version on every list.
