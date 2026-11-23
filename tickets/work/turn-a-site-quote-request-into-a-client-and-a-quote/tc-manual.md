# Manual tests — turn a site quote request into a client and a quote

These cases could not be run by Claude: there was no database on the machine. They need a few minutes on
pre-production (or a local stack with a database).

## Before starting

- Pre-production, after the merge: the back-office and the Aldaron site.
- Two back-office accounts: **A**, whose role opens the Aldaron workspace and may create quotes and clients;
  **B**, whose role opens the portfolio workspace only.
- Language of the back-office: French (the button texts below are in French).
- Fake data only: a fake name and an e-mail you own, such as `test+aldaron1@yourdomain`.

## Case 1 — the request goes to the Aldaron workspace only

1. On the Aldaron site, go to **Simulateur**, pick a few options, click the button that asks for a quote.
2. On the contact page, fill in the name `Jeanne Test`, the e-mail `test+aldaron1@…`, the product
   `Application de réservation`, tick the consent, send.
   - Expected: the same confirmation as before; going back to the contact page, the estimate is gone.
3. In the back-office with account **A**, workspace **Portfolio**, open **Contacts**.
   - Expected: the request of `Jeanne Test` is **not** in the list.
4. Switch to the **Aldaron** workspace (Settings) while on Contacts.
   - Expected: the list changes and shows the request of `Jeanne Test`.
5. Open it and copy its address. Sign in with account **B** and paste the address.
   - Expected: the message is not shown ("introuvable").
- Failure: the request shows in the portfolio list, or account B can read it.

## Case 2 — create the client and the quote in one action

1. Account **A**, workspace **Aldaron**, **Contacts**, open the request of case 1.
   - Expected: under the message, the button **Créer le client et le devis**.
2. Click it.
   - Expected: the quote form opens, titled "Nouveau devis pour Jeanne Test". The client is Jeanne Test,
     the title is `Application de réservation`, and each line of the estimate is a line at 0.
3. Type a price on each line, click **Enregistrer**.
   - Expected: "Le devis AL-… a été créé depuis la demande."; under the message, a green banner "Cette
     demande est devenue le devis AL-…" with **Voir les devis**; the button is gone.
4. Click **Voir les devis**.
   - Expected: the quote is in the list, as a draft, for Jeanne Test.
5. Open **Clients**.
   - Expected: Jeanne Test, individual, with the e-mail of the request.
- Failure: the form opens empty, or the button is still there after saving.

## Case 3 — an existing client is reused

1. Send a second request from the site with the **same e-mail written in capitals** (`TEST+ALDARON1@…`).
2. Account A, Aldaron, Contacts: open it, click **Créer le client et le devis**, price a line, save.
   - Expected: the dialog names the client Jeanne Test; the Clients list still holds **one** Jeanne Test.
- Failure: a second client with the same e-mail.

## Case 4 — a converted request cannot be converted again

1. Reopen the request of case 2 (reload the page).
   - Expected: the green banner with its quote number, no button.
2. Open the same request in two tabs before converting a new request; convert it in the first tab, then
   save the form again in the second tab.
   - Expected: the second save is refused with "Cette demande est déjà devenue le devis AL-… : elle ne peut
     pas en devenir un second."
- Failure: two quotes from one request.

## Case 5 — the portfolio contact form is unchanged

1. Send the contact form of the portfolio site.
2. Account A, workspace **Portfolio**, Contacts.
   - Expected: the message is there, with no "Créer le client et le devis" button.

## Not testable for now

- Nothing else. The unread badge and the global search still count the two workspaces: ticket
  `190-scope-the-contact-badge-and-search-to-the-workspace`.

## Result to send back

| # | ok / ko | remark |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
