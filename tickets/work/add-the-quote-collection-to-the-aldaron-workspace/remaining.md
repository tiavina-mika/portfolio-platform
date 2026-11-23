# Remaining — add the quote collection to the Aldaron workspace

| # | What | Type | What it blocks or makes fake | Who or what unblocks it | Where |
|---|---|---|---|---|---|
| 1 | Attaching a proof file (signed quote, client e-mail) to an acceptance | not implemented | an acceptance records the date and the method only | `025-attach-an-acceptance-proof-file-to-a-quote` | — |
| 2 | The live cases 1, 3, 4, 5, 6, 8, 9, 11 and 12 of `tc.md` were not run: no local database on the machine that did the work | to verify | criteria 1, 3, 4, 5, 6, 8 and 9 stay unticked until someone runs them | a human, or a session with a database, following `tc-manual.md` | `tc-manual.md` |
| 3 | Keeping `paidAmount` up to date from the payments | link to wire | `paidAmount` stays 0 on every quote | `060-add-quote-payments-with-the-30-40-30-schedule` | `apps/server/src/cloud/triggers/_domain/quote.triggers.ts`, `TODO(link:060-add-quote-payments-with-the-30-40-30-schedule)` |
| 4 | Refusing to delete a client that has missions | link to wire | nothing today: missions do not exist | `050-add-the-mission-collection-to-the-aldaron-workspace` | `apps/server/src/cloud/triggers/_domain/client.triggers.ts`, `TODO(link:050-add-the-mission-collection-to-the-aldaron-workspace)` |
| 5 | Decisions 1 to 7 of `recommendation.md` (proof split, default currency as a local preference, content frozen, active client only, numbering year and prefix, line rules, no delete) | to validate | a different product choice changes the form or the trigger | the human | `recommendation.md` |
| 6 | A gap in the numbering if the database fails between the counter and the quote write | deferred risk | a skipped number, rarely | the human, see the debt file | [debt #1](../../../docs/code/reviews/en/debt/261123-feat-debt-aldaron-quote-collection.md) |
| 7 | Two people saving the same draft at once: the last one wins silently | deferred risk | lost edits on a draft | the human, see the debt file | [debt #2](../../../docs/code/reviews/en/debt/261123-feat-debt-aldaron-quote-collection.md) |
