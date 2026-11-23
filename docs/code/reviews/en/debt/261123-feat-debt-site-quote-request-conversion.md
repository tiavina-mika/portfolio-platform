# Debt — Turn a site quote request into a client and a quote

> Review: [261123-feat-site-quote-request-conversion.md](../261123-feat-site-quote-request-conversion.md)
> Branch: `feat/site-quote-request-conversion` · Created 2026-11-23 at 19:34 · Author: tiavina-mika
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. Two quotes from one request saved at the same moment](#1-two-quotes-from-one-request-saved-at-the-same-moment)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Low | Bug | Two quotes from one request saved at the same moment | ⏳ to do |

## 1. Two quotes from one request saved at the same moment

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/functions/_domain/quote.functions.ts` (`createQuote`),
  `apps/server/src/cloud/services/_domain/contact-quote.service.cloud.ts`

**What can happen** — The same request is open in two tabs; both forms are saved within the same second. Both
`createQuote` calls read the contact before either has written its `quote` pointer, both write a quote, and
the contact ends up pointing to the second one. The first quote is a draft nobody links to the request.

**Why** — `getConvertibleContactService` checks `quote` then `linkContactToQuoteService` writes it, with the
quote saved in between: a check-then-write with no lock. Parse has no transaction across the two classes.

**How to check** — Fire two `createQuote` calls with the same `contact` concurrently (a script with
`Promise.all`) on a test database; count the quotes created.

**How to fix**

1. **(recommended)** Reserve the request before writing the quote: an atomic `increment('quoteLock')` on the
   contact (or a unique index on a `quoteRequest` pointer stored on `Quote`), refuse when the counter comes
   back above 1, release it if the quote save fails.
   *Why*: it holds on the server whatever the client does, for a one-line write; a unique index on the quote
   side (`_p_quoteRequest`, partial on existence) is the sturdier variant if the pointer moves to `Quote`.
2. Disable the Save button while saving and close the second tab's form on success — only narrows the
   window, a forged call still passes.
