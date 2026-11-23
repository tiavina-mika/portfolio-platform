# Manual test guide — add the quote collection to the Aldaron workspace

## Before starting

- **Where**: pre-production, or locally with `/rd` (server + bo) on a database.
- **Account**: an Owner account (it opens every workspace), and a role opening Aldaron with `find`,
  `create`, `update` on Clients and Quotes.
- **Data**: at least one active client in Aldaron (Clients → New client: "Studio North",
  `contact@north.example`).
- **Language**: French (`fr`). Settings → Espace de travail → **Aldaron**.

## Case 1 — Create a draft and see its total

1. Menu → **Devis** → **Nouveau devis**.
2. Client: type `North`, pick **Studio North**.
3. Titre: `Application mobile`.
4. Line 1: Description `Design`, Quantité `2`, Prix unitaire HT `500`.
5. Taux de TVA: `20`. Expected: under the form, Total HT 1 000,00 €, TVA (20 %) 200,00 €, Total TTC
   1 200,00 €, updated while typing.
6. **Enregistrer**. Expected: the dialog closes, a message "Le devis AL-<année>-001 a été créé." (or the
   next number), the quote leads the list with status **Brouillon** and total 1 200,00 €.

Failure: the total does not move while typing, or the stored total differs from the one shown.

## Case 3 — The default currency changes no existing quote

1. Paramètres → **Langues** → **Devise par défaut des devis** → **Ariary (Ar)**.
2. Devis → **Modifier** the draft of case 1. Expected: Devise still **Euro (€)**.
3. Close, **Nouveau devis**. Expected: Devise **Ariary (Ar)**; a price of `40000` shows `40 000 Ar`, no
   decimals.

Failure: the existing draft switched to Ariary.

## Case 4 — Numbers with no gap

1. Create two more quotes. Expected: numbers follow each other (`…-002`, `…-003`).
2. Try to save a quote with no title (refused by the form), then a valid one. Expected: still the next
   number, no skipped one.

## Case 5 — Only the allowed moves

1. Row menu of a **Brouillon**: only **Modifier** and **Marquer comme envoyé**.
2. **Marquer comme envoyé**. Expected: status **Envoyé**; the menu now offers accepted / refused / expired,
   and no **Modifier**.
3. On an **Accepté** or **Refusé** quote: no status action at all.

## Case 6 — A sent quote cannot be edited

Covered by case 5, step 2 (no **Modifier**). Optional, with the browser console: calling
`updateQuote` on a sent quote answers "Un devis envoyé ne peut plus être modifié : seul un brouillon peut
l'être."

## Case 8 — Accepting records the date and the method

1. On an **Envoyé** quote: **Marquer comme accepté**.
2. A dialog asks **Comment le client a accepté**: pick **Par e-mail**, confirm.
3. Expected: status **Accepté**, message "Le devis … est marqué comme accepté."

Not testable for now: attaching a proof file (ticket `025-attach-an-acceptance-proof-file-to-a-quote`).

## Case 9 — Tabs and the client name

1. Open each tab (Brouillon, Envoyé, Accepté, Refusé, Expiré). Expected: only quotes of that status.
2. Clients → rename **Studio North** to **Studio Nord**. Back to Devis. Expected: the quotes show
   **Studio Nord**.

## Case 11 — A client with quotes cannot be deleted

With the master key (Parse dashboard or a script), delete **Studio Nord**. Expected: refused with "Le
client « Studio Nord » a des devis : archivez-le au lieu de le supprimer."

## Case 12 — Create a client from the quote form

1. **Nouveau devis**, type a title first.
2. **Nouveau client** under the client field; fill name `Atelier Sud`, e-mail `hello@sud.example`;
   **Enregistrer**.
3. Expected: the client dialog closes, **Atelier Sud** is picked, the title typed is still there.

## Portfolio workspace

Settings → Espace de travail → **Portfolio**. Expected: no **Devis** entry; typing `/devis` goes back to
the dashboard.

## Buttons with no intended effect

None.

## Result to send back

| # | ok / ko | remark |
|---|---|---|
| 1 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 6 | | |
| 8 | | |
| 9 | | |
| 11 | | |
| 12 | | |
