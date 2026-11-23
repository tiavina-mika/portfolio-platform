# Test cases — add quote revisions and amendments

Fake data only. "Live" cases need the server on a database; the machine that ran `/dev --auto` has none
(no MongoDB on `localhost:27017`, the env files point at remote environments, not used), so they were
**not run** and are detailed in `tc-manual.md` for pre-production after the merge. They are `auto` by
nature (a browser or a script could run them) and stay unverified until someone does.

| # | Acceptance criterion | Steps | Expected | Type | Status | Place | Test |
|---|---|---|---|---|---|---|---|
| 1 | Revising a sent quote creates a draft with the same number and the next version | Aldaron workspace; Quotes; a sent quote `AL-2026-001` → Revise → confirm | A new row `AL-2026-001 · v2`, Draft, same client, lines, total; "Revises AL-2026-001 v1" under it | auto (live) | to do — not run, no local database | pre-production | — |
| 1b | Same, the rule | `canReviseQuote`, `getQuoteParentRelation` on every status | Only `sent` is revised; a quote pointing to a sent quote is a revision | auto | ok | local | `apps/server/src/utils/_domain/quote.utils.test.ts` |
| 1c | Same, the call carries nothing typed | `reviseQuoteSchema` with an id; with a version or a title | Accepted; refused | auto | ok | local | `apps/server/src/validations/_domain/quote.validations.test.ts` |
| 2 | The revised version becomes `expired` | Same as 1, look at the v1 row | Status Expired | auto (live) | to do — not run | pre-production | — |
| 3 | An accepted quote cannot be revised | The menu of an accepted quote; `reviseQuote` called by hand on it | No "Revise" entry; the call is refused with "create an amendment instead" | auto (live) | to do — not run | pre-production | — |
| 3b | Same, the rule | `canReviseQuote(accepted)` | `false`, and `canAmendQuote(accepted)` is `true` | auto | ok | local | `quote.utils.test.ts` |
| 4 | An amendment has its own number and points to the accepted quote it completes | An accepted quote `AL-2026-003` → Create an amendment; type a title and a line; save | A new Draft with the next free number (e.g. `AL-2026-004`), client locked to the accepted quote's, "Amendment to AL-2026-003" under it | auto (live) | to do — not run | pre-production | — |
| 4b | Same, the rule and the call | `getQuoteParentRelation(accepted)`; `createQuoteSchema` with `parentQuote`; `updateQuoteSchema` with `parentQuote`; `quoteInputSchema` drops it | Amendment; accepted; refused; dropped | auto | ok | local | `quote.utils.test.ts`, `quote.validations.test.ts` |
| 4c | Same, nothing points to a draft, refused or expired quote | `getQuoteParentRelation` on those statuses | `null` | auto | ok | local | `quote.utils.test.ts` |
| 5 | The detail of a quote shows the quote it revises or amends | The rows of 1 and 4 in the list (the list row is the quote's detail: there is no detail page) | "Revises AL-2026-001 v1" / "Amendment to AL-2026-003" | auto (live) | to do — not run | pre-production | — |
| 6 | Labels and errors in `fr`, `en`, `mg` | `pnpm check-i18n` | Passes | auto | ok | local | `scripts/check-i18n.mjs` |

Static proof run on 2026-11-23: `pnpm nx run-many -t typecheck lint test -p server bo shared-domain-utils`
ok (bo: 47 warnings, none on a changed line; server: 6 files, 87 tests); `pnpm nx run-many -t build -p
server bo` ok; `pnpm check-i18n`, `pnpm lint:docs`, `pnpm check-doc-links`,
`pnpm check-doc-twins --worktree` ok.
