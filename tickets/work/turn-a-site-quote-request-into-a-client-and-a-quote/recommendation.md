# Recommendations — turn a site quote request into a client and a quote

Decisions taken alone during `/dev --auto`. Each one is a 🔎 Deduction to validate, not a fact.

## 1. What "prefilled with the estimate" means

- **Question**: the estimate the site sends is a readable summary (supports, screens, options, a few amounts
  in euros), not unit prices. What does the draft take from it?
- **Chosen**: the product line as the title (else "Quote for <name>"), and each line of the estimate as one
  quote line, quantity 1, price 0. The team types the prices before saving; nothing is guessed.
- **Discarded**: reading the euro amounts back into prices (the summary has no unit prices and its amounts are
  partial); putting the whole estimate in the terms (they are shown to the client); a structured estimate stored
  on the contact (changes what the site sends and what it keeps, against "the public form does not change").
- **If wrong**: change `parseQuoteRequestMessage` (server); the dialog takes whatever lines it returns.

## 2. When the client is created

- **Chosen**: when the button is clicked (first server step), before the form opens; the quote and the link
  are written when the form is saved.
- **Reason**: the existing quote form and its client picker are reused unchanged; the user can still switch to
  another client.
- **Cost**: closing the form without saving leaves the new client in the list (harmless: the next click reuses
  it by its e-mail). Written in the contacts feature page.
- **Alternative**: create the client only on save (a server function writing both); needs a client field that
  shows a client not yet created.

## 3. A new client is an individual

- **Chosen**: kind `individual`, with the name, e-mail and phone of the request; the team edits it if it is a
  company.
- **Reason**: the form asks for a person's name, not a company.

## 4. An existing client that is archived

- **Chosen**: refused with the existing "archived or anonymized" message; the user puts the client back first.
- **Discarded**: reactivating it silently.

## 5. Rights

- **Chosen**: the button shows with the `create` right on quotes (as the ticket says). Creating a new client
  also needs `create` on clients, checked by the server; reusing an existing client does not.

## 6. A request with no e-mail

- **Chosen**: refused with a clear message (the client is found and stored by e-mail). The Aldaron form always
  asks for one, so this only concerns a request edited by hand.
