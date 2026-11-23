# Remaining — add the mission collection to the Aldaron workspace

| # | What | Type | What it blocks or makes fake | Who or what unblocks it | Where |
|---|---|---|---|---|---|
| 1 | The live cases (create from a quote, wrong quote refused, status moves, phase cleared, dates filled, client delete refused, my missions, quote form's client picker) were not run on a database | to verify | Nothing is known broken; the rules are unit-tested, the screens are not seen running | A tester in pre-production | `tc-manual.md`, `tc.md` cases 1, 2b, 3b, 4b, 5b, 6, 10, 12 |
| 2 | Phase "cancelled by Aldaron" stored as `byAgency` | to validate | Only the stored name; the label says "Cancelled by us" | The product owner | `recommendation.md` §1 |
| 3 | Who can be assigned: members of the roles that open the Aldaron workspace | to validate | A user outside those roles cannot be given a mission | The product owner | `recommendation.md` §2 |
| 4 | "My missions" as an advanced-search toggle; a done or cancelled mission still editable (phase, dates, assignee) | to validate | — | The product owner | `recommendation.md` §3, §4 |
| 5 | The ⚠️ open points of the design note: an `onHold` status, reopening a done mission, warning someone when a mission is cancelled | to validate | No pause, no reopening, no notification | ⚠️ unknown — a product decision, no ticket yet | `docs/code/design/en/ALDARON_QUOTES_CLIENTS_MISSIONS.md`, "Open questions" |
| 6 | Payments of a quote and the warning when a mission starts before the deposit is paid | not implemented | No deposit reminder on a mission | `060-add-quote-payments-with-the-30-40-30-schedule` | — |
| 7 | A teammate holding Aldaron only through a parent role is not assignable | deferred risk | Rare: no screen builds child roles | — | `docs/code/reviews/en/debt/261123-feat-debt-aldaron-mission-collection.md` #1 |
| 8 | Form and server may read a different day near midnight for an admin abroad | deferred risk | A readable refusal from the server | — | same debt file, #2 |
