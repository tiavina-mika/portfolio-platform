# Manual test guide — add quote revisions and amendments

These cases are not "human" by nature: a browser could run them. They are here because the machine that
did the work had no database. Run them once on pre-production after the merge.

## Before starting

- Where: pre-production back-office (or local with `pnpm nx run server:dev` on a database and
  `pnpm nx run bo:dev`, then `http://localhost:5174`).
- Account: a user whose role opens the **Aldaron** workspace, with the rights List, Create and Modify on
  **Quotes** (an Owner account works).
- Language: French. Switch to the **Aldaron** workspace, open **Devis** in the menu.
- Data: one active client (e.g. "Client Test"), one **sent** quote for it (call it `AL-2026-001`), one
  **accepted** quote for it (call it `AL-2026-003`). Create them with "Nouveau devis", "Marquer comme
  envoyé" and "Marquer comme accepté" if needed.

## Case 1 — Revising a sent quote creates a draft with the same number and the next version

1. On the row of `AL-2026-001` (status Envoyé), open the row menu.
2. Click **Réviser**.
   - Expected: a window "Réviser le devis AL-2026-001" says a draft copy is created as version 2 and the
     sent version expires.
3. Click **Réviser** in the window.
   - Expected: a message "La version 2 du devis AL-2026-001 a été créée en brouillon."; a new row at the
     top: `AL-2026-001 · v2`, status Brouillon, same client, same total, and under the title
     "Révise AL-2026-001 v1".
4. Open **Modifier** on the new row.
   - Expected: the lines, currency, VAT and terms of v1; the client field is greyed out with "Même client
     que le devis AL-2026-001…".
- Failure: no new row, another number, version 1, or a client that can be changed.

## Case 2 — The revised version becomes expired

1. After case 1, look at the row `AL-2026-001` (the old one).
   - Expected: status **Expiré**; its menu no longer offers "Réviser".
- Failure: it is still Envoyé.

## Case 3 — An accepted quote cannot be revised

1. Open the row menu of `AL-2026-003` (Accepté).
   - Expected: no **Réviser** entry; a **Créer un avenant** entry instead.
- Failure: "Réviser" is offered.

## Case 4 — An amendment has its own number and points to the accepted quote

1. On `AL-2026-003`, open the row menu, click **Créer un avenant**.
   - Expected: a window "Nouvel avenant au devis AL-2026-003"; client filled in and greyed out; currency,
     VAT rate and terms as on `AL-2026-003`; title empty; one empty line.
2. Type the title `Travail en plus`, a line `Page supplémentaire`, quantity `1`, price `500`.
3. Click **Enregistrer**.
   - Expected: message "L'avenant AL-2026-0xx au devis AL-2026-003 a été créé."; a new row with **a new
     number** (not `AL-2026-003`), status Brouillon, and under the title "Avenant au devis AL-2026-003".
- Failure: the amendment gets the number `AL-2026-003`, or no link to it.

## Case 5 — The detail of a quote shows the quote it revises or amends

1. Look at the rows created in cases 1 and 4.
   - Expected: "Révise AL-2026-001 v1" and "Avenant au devis AL-2026-003" under their titles.
2. Switch the language to English (Settings) and back.
   - Expected: "Revises AL-2026-001 v1" / "Amendment to AL-2026-003" in English.

## Buttons with no intended effect

None.

## Not testable for now

The payments of an amendment: they come with `060-add-quote-payments-with-the-30-40-30-schedule`.

## Result to send back

| # | ok / ko | remark |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
