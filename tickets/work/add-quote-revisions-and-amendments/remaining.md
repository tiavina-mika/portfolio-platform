# Remaining — add quote revisions and amendments

| # | What | Type | What it blocks or makes fake | Who or what unblocks it | Where |
|---|---|---|---|---|---|
| 1 | The live cases 1, 2, 3, 4 and 5 of `tc.md` were not run: no local database on the machine that did the work | to verify | every acceptance criterion stays unticked until someone runs them | a human, or a session with a database, following `tc-manual.md` | `tc-manual.md` |
| 2 | Decisions 1 to 6 of `recommendation.md` (list row as the detail, what a revision copies, what an amendment prefills, confirmation, rights, locked client) | to validate | a different product choice changes the form, the menu or the trigger | the human | `recommendation.md` |
| 3 | The payments of an amendment | not implemented | an accepted amendment has no payments, like any accepted quote today | `060-add-quote-payments-with-the-30-40-30-schedule` | — |
| 4 | A revision is two saves: a failure between them leaves the new draft and the sent version still sent | deferred risk | rarely, a version the client could still answer | the human, see the debt file | [debt #1](../../../docs/code/reviews/en/debt/261123-feat-debt-quote-revisions-and-amendments.md) |
| 5 | The revision of an amendment points to the amendment, not straight to the accepted quote | deferred risk | nothing today; a later "amendments of a quote" view would walk the chain | the human, see the debt file | [debt #2](../../../docs/code/reviews/en/debt/261123-feat-debt-quote-revisions-and-amendments.md) |
