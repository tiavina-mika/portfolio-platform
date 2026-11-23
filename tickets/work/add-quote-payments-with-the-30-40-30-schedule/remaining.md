# Remaining — add-quote-payments-with-the-30-40-30-schedule

| # | What | Type | What it blocks or makes fake | Who or what unblocks it | Where |
|---|---|---|---|---|---|
| 1 | The live cases (payments on acceptance, never twice, mark as paid, cancel and re-enter, due date, old accepted quote) were not run on a database | to verify | Nothing is known broken; the rules are unit-tested, the screens are not seen running | A tester in pre-production | `tc-manual.md`, `tc.md` cases 1b, 2b, 3b, 4b, 5b, 10 |
| 2 | A dated payment is `due`, an undated one `planned` | to validate | — | The product owner | `recommendation.md` §1 |
| 3 | "Cancel and re-enter" writes the replacement itself, same amount | to validate | No payment of another amount can be typed | The product owner | `recommendation.md` §2 |
| 4 | Quotes accepted before the change get their schedule from a button, not a migration | to validate | Their payments do not exist until someone clicks | The product owner | `recommendation.md` §3 |
| 5 | Existing roles have no right on Payments | to verify | The "Payments" action is hidden for the sales role until an admin gives it the rights | An admin, after deployment | Roles page of the back-office |
| 6 | Overdue payments, dashboard money cards, deposit warning on a mission | not implemented | No "overdue" label, no money summary | `070-show-the-aldaron-money-cards-on-the-dashboard` | — |
| 7 | CSV export of the payments; audit trail of who changed what | not implemented | Payments are read on screen only; `updatedBy` is the only trace | `140-export-aldaron-payments-as-csv`, `080-add-an-audit-trail-to-aldaron-money-records` | — |
| 8 | A schedule written in part cannot be completed | deferred risk | Rare: a database failure during the acceptance | — | `docs/code/reviews/en/debt/261123-feat-debt-quote-payments-schedule.md` #1 |
| 9 | Two replacements for one payment cancelled twice at once | deferred risk | Rare: two tabs at the same moment | — | same debt file, #2 |
| 10 | A failed sum leaves the quote's paid amount behind | deferred risk | Until the next payment is recorded | — | same debt file, #3 |
