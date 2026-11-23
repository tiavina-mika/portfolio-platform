# Remaining — attach an acceptance proof file to a quote

| # | What | Type | What it blocks or makes fake | Who or what unblocks it | Where |
|---|---|---|---|---|---|
| 1 | The live cases 1, 1b, 1c, 2 and 3b of `tc.md` were not run: no local database nor Cloudinary account on the machine that did the work | to verify | criteria 1 and 2 stay unticked until someone runs them | a human on pre-production, following `tc-manual.md` | `tc-manual.md` |
| 2 | Decisions 1 to 4 of `recommendation.md` (public delivery like the other files, proof final once accepted, types and size, link under the status) | to validate | a different choice changes the upload or the list | the human | `recommendation.md` |
| 3 | The proof is reachable by anyone who gets its address | deferred risk | a forwarded link exposes a signed quote | the human, see the debt file | [debt #1](../../../docs/code/reviews/en/debt/261123-feat-debt-attach-quote-acceptance-proof.md) |
| 4 | Cloudinary account settings (PDF delivery, dynamic folders) may break the proof | deferred risk | the link fails, or every proof is refused | the human, during the manual test | [debt #2](../../../docs/code/reviews/en/debt/261123-feat-debt-attach-quote-acceptance-proof.md) |
| 5 | An uploaded proof stays unused after a refused acceptance | deferred risk | a stray file in storage, rarely | the human, see the debt file | [debt #3](../../../docs/code/reviews/en/debt/261123-feat-debt-attach-quote-acceptance-proof.md) |
| 6 | A forged call can reuse another quote's proof | deferred risk | a misleading proof on a quote | the human, see the debt file | [debt #4](../../../docs/code/reviews/en/debt/261123-feat-debt-attach-quote-acceptance-proof.md) |
