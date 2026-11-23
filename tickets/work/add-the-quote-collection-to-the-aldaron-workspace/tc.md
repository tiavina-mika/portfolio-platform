# Test cases — add the quote collection to the Aldaron workspace

Fake data only. "Live" cases need the server running on a database; no local database is configured on
the machine that ran `/dev --auto` (the server env files point at a remote one), so they were **not run**
there and are listed in `tc-manual.md` for pre-production after the merge. They are `auto` by nature (a
browser or a script could run them) and stay unverified until someone does.

| # | Acceptance criterion | Steps | Expected | Type | Status | Place | Test |
|---|---|---|---|---|---|---|---|
| 1 | Create a draft for an existing client and see its total | Aldaron workspace; Quotes → New quote; pick a client; title; line "Design" 2 × 500; VAT 20; Save | Total shows 1 200,00 € while typing; dialog closes; the quote leads the list as Draft with a number | auto (live) | to do — not run, no local database | pre-production | — |
| 1b | Same, the total rule | `computeQuoteAmounts` on lines and rates | Subtotal, VAT once on the subtotal, rounding to the smallest unit | auto | ok | local | `apps/server/src/utils/_domain/quote.utils.test.ts` |
| 2 | Own currency and optional VAT, decimals of the currency | `toMinorUnits` / `fromMinorUnits` for EUR and MGA; validation of `currency` and `taxRate` | Euro in cents, ariary whole; USD and 120 % refused | auto | ok | local | `quote.utils.test.ts`, `apps/server/src/validations/_domain/quote.validations.test.ts` |
| 3 | Changing the default currency does not change an existing quote | Create a quote in EUR; Settings → Languages → default currency Ariary; reopen the draft; create a new quote | The draft is still in EUR; the new quote starts in Ariary | auto (live) | to do — not run, no local database | pre-production | — |
| 4 | Unique readable number, no gap in a year | Create three quotes | `AL-<year>-001`, `-002`, `-003` | auto (live) | to do — not run, no local database | pre-production | — |
| 4b | Same, the format and the year | `formatQuoteNumber`, `buildQuoteCounterName`, `getQuoteNumberYear` | 3 digits, one counter per year, the year turns at midnight in Antananarivo | auto | ok | local | `quote.utils.test.ts` |
| 5 | `draft → sent → accepted / refused / expired`, nothing else | Row menu of a draft (only "Mark as sent"); of a sent quote (accept, refuse, expire); of an accepted one (none); call `changeQuoteStatus` with `accepted` on a draft | Only the allowed actions show; the call on a draft is refused with a translated message | auto (live) | to do — not run, no local database | pre-production | — |
| 5b | Same, the rule | `canChangeQuoteStatus`, `getNextQuoteStatuses`; `changeQuoteStatusSchema` with `draft` | Only the allowed moves; never back to draft | auto | ok | local | `quote.utils.test.ts`, `quote.validations.test.ts` |
| 6 | Lines of a quote out of draft cannot change | Send a quote; no "Edit" in its menu; call `updateQuote` on it | No edit action; the call is refused ("A quote that is sent can no longer be edited") | auto (live) | to do — not run, no local database | pre-production | — |
| 7 | Number, total or paid amount in the request change nothing | `createQuoteSchema` / `updateQuoteSchema` with `number`, `totalAmount`, `paidAmount`, `status`, `version`, dates | Refused by validation | auto | ok | local | `quote.validations.test.ts` |
| 8 | Accepting records the date and the method (and an optional proof file) | Sent quote → Mark as accepted → pick "By e-mail" → confirm | Status Accepted; `acceptedAt` today, `acceptanceMethod` email. The proof file is in ticket 025 | auto (live) | to do — not run, no local database; proof file not built | pre-production | — |
| 8b | Same, the method is required on acceptance only | `changeQuoteStatusSchema` | Accepted without a method refused; a method on a refusal refused | auto | ok | local | `quote.validations.test.ts` |
| 9 | The list filters by status and shows the client name without a copy | Open each tab; rename the client in Clients; back to Quotes | Each tab lists its status only; the new client name shows | auto (live) | to do — not run, no local database | pre-production | — |
| 10 | Labels and errors in `fr`, `en` and `mg` | `pnpm check-i18n` | Passes | auto | ok | local | `scripts/check-i18n.mjs` |
| 11 | (regression) A client with quotes cannot be deleted | Delete, with the master key, a client named on a quote | Refused with "The client … has quotes" | auto (live) | to do — not run, no local database | pre-production | — |
| 12 | (shortcut) Create a client from the quote form | New quote → "New client" → fill → Save | The client dialog closes, the new client is picked in the quote, nothing typed is lost | auto (live) | to do — not run, no local database | pre-production | — |
| 13 | (security) No raw SDK access to quotes | Class-level permissions built for `Quote` from a role granting every right | No role grant | auto | ok | local | `apps/server/src/cloud/services/_core/security.service.cloud.test.ts` |

Static proof run on 2026-11-23: `pnpm nx run-many -t lint typecheck -p server bo shared-domain-utils
shared-domain-constants shared-domain-types` ok; `pnpm nx run-many -t test build -p server bo` ok (server:
6 files, 68 tests); `pnpm check-i18n`, `check-doc-links`, `check-doc-twins --worktree`, `lint:docs` ok.

No case needs human judgement: nothing is a look-and-feel decision. The live cases are in `tc-manual.md`
only because nobody could run them where the work was done.
