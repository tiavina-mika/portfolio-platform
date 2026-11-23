# Debt — Add the quote collection to the Aldaron workspace

> Review: [261123-feat-aldaron-quote-collection.md](../261123-feat-aldaron-quote-collection.md)
> Branch: `feat/aldaron-quote-collection` · Created 2026-11-23 at 15:46 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. A gap in the numbering after a failed write](#1-a-gap-in-the-numbering-after-a-failed-write)
- [2. Two editors on the same draft](#2-two-editors-on-the-same-draft)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Low | Bug | A number is taken but no quote is written: a gap in the year | ⏳ to do |
| 2 | 🟡 Low | Bug | The last of two concurrent saves of a draft wins silently | ⏳ to do |

## 1. A gap in the numbering after a failed write

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/triggers/_domain/quote.triggers.ts`,
  `apps/server/src/cloud/services/_core/counter.service.cloud.ts`

**What can happen** — a user creates a quote; the `beforeSave` trigger increments `quote-2026` to 7, then
the write of the quote itself fails (database down, a unique index refusal). `AL-2026-007` is never used:
the next quote is `AL-2026-008`.

**Why** — the counter and the quote are two writes; Parse Server has no transaction across them. Every
refusal of the trigger runs before the increment, so only a failure of the database write itself is left.

**How to check** — make the quote write fail after the trigger (stop MongoDB between the two writes, or
force a duplicate on `quoteNumberVersion_unique`), then create the next quote.

**How to fix**

1. **(recommended)** Keep the counter as it is and, if a gap ever matters for an accountant, check the
   numbers taken: a daily job compares the counter with the highest number of the year and logs a missing
   one.
   *Why*: a quote is not a legal invoice (the design note keeps invoices out), the case needs a database
   failure in the middle of a save, and a transaction would mean a MongoDB replica set and raw driver code
   around Parse.
2. Write the quote and the counter in one MongoDB transaction (raw driver, replica set required) — exact,
   but heavy and outside the Parse layer.

## 2. Two editors on the same draft

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/functions/_domain/quote.functions.ts` (`updateQuote`),
  `apps/bo/src/redux/actions/_domain/quote.action.ts`

**What can happen** — two users open the same draft, both change a line and save: the second save
replaces the first one's lines without a warning.

**Why** — `updateQuote` writes every typed field and checks no version; the same is true of the clients.

**How to check** — open the same draft in two browsers, save a different line in each, reload the list.

**How to fix**

1. **(recommended)** Send the `updatedAt` the form was opened with and refuse the save when the stored one
   differs, with a translated "edited meanwhile, reload" message — the optimistic guard the CMS already
   uses (`apps/bo/src/utils/_core/parse.utils.ts`).
   *Why*: small, local, reuses an existing pattern; the user sees the conflict instead of losing work.
2. Lock a draft while it is open — needs a lock collection and an expiry, far more than the risk.
