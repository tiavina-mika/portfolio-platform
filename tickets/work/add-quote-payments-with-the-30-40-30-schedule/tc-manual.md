# Manual test guide — add-quote-payments-with-the-30-40-30-schedule

These cases could be run by a script or a browser, but no database was reachable where the work was done.
Run them once in pre-production (or locally with a database).

## Before starting

- Where: pre-production back-office, after the merge (or locally: `/rd bo`, server on a database).
- Account: an Owner, or a role that opens the **Aldaron** workspace with, on **Devis** (Quotes), the rights
  List, Create and Edit, and on **Paiements** (Payments), List, Create and Edit.
- Workspace: **Aldaron** (Settings). Language: French or English.
- Data: an active fake client, and a **sent** quote for it with one line of 1 001,00 € (quantity 1), no VAT.

## Case 1b — three payments on acceptance

1. Quotes → the sent quote → row menu → "Mark as accepted".
2. Pick "By e-mail" → "Mark as accepted".
3. Row menu of the same quote → "Payments".

Expected: three rows. Deposit (30 %) 300,30 €, due date today, **Due**; Milestone (40 %) 400,40 €, not set,
**Planned**; Balance (30 %) 300,30 €, not set, **Planned**. Quote total 1 001,00 €, already paid 0,00 €,
left to pay 1 001,00 €.
Failure: not three rows, or amounts that do not add up to 1 001,00 €.

## Case 2b — never twice

1. Close the dialog, reload the page, open "Payments" again.

Expected: still three rows.
Failure: six rows.

## Case 3b and 5b — mark as paid

1. Deposit row → actions → "Mark as paid".
2. Payment method: "Bank transfer". Reference: `VIR-1`. Leave the day empty. → "Mark as paid".

Expected: the deposit is **Paid**, today, "Bank transfer · VIR-1"; already paid 300,30 €, left to pay
700,70 €. Close the dialog: the quote row is still there (nothing else changed).
Failure: the paid amount stays 0,00 €, or the row stays Due.

3. Try "Mark as paid" on the milestone with a day of tomorrow.

Expected: the form refuses it ("cannot be recorded as paid on a day still to come").

## Case 4b — a paid payment is not edited, it is cancelled and re-entered

1. Paid deposit row → actions: only "Cancel and re-enter" is offered (no "Mark as paid", no due date).
2. "Cancel and re-enter" → confirm.

Expected: the deposit row stays, **Cancelled**, with its date and method; a new deposit (30 %) 300,30 €,
**Due** with the same due date, appears under the others; already paid back to 0,00 €. The cancelled row
has no action left.
Failure: the cancelled row disappears, or no new deposit appears.

## Case 8 — due date of the milestone

1. Milestone row → "Set the due date" → pick a day next month → "Save the date".

Expected: due date shown, status **Due**.

2. Same action → empty the date → save.

Expected: "Not set", status **Planned**.

## Case 6 — no payment for a quote not accepted

1. Row menu of a draft or sent quote.

Expected: no "Payments" action.

## Case 10 — a quote accepted before this change

1. "Payments" on a quote that was accepted before this version.

Expected: "No payment yet" and the button "Create the payment schedule"; clicking it writes three payments
and the button disappears.

## Not testable for now

- "Overdue" payments and the dashboard cards: ticket `070-show-the-aldaron-money-cards-on-the-dashboard`.
- CSV export: ticket `140-export-aldaron-payments-as-csv`.

## Result to send back

| # | ok / ko | remark |
|---|---|---|
| 1b | | |
| 2b | | |
| 3b / 5b | | |
| 4b | | |
| 8 | | |
| 6 | | |
| 10 | | |
