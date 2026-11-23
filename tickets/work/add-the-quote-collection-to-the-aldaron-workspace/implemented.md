# Implemented — add the quote collection to the Aldaron workspace

In the Aldaron workspace, the back-office now handles the quotes sent to clients.

- A user can write a draft quote for an active client, with priced lines, a currency (euro or ariary) and
  an optional VAT rate, and sees the total while typing.
- A user can create a new client from the quote form without losing what was typed.
- Every quote gets a readable number such as `AL-2026-001`, following on with no gap inside a year.
- A draft can be edited; a quote can be marked sent, then accepted (saying how the client accepted),
  refused or expired, and nothing else.
- A quote that was sent can no longer be edited, and its number and total cannot be imposed from outside.
- The quote list has one tab per status, a search on number or title, and shows the client's current name.
- The settings offer a default currency for new quotes, which never changes an existing quote.
- A client that has quotes can no longer be deleted.
- Labels and messages exist in French, English and Malagasy.
- The portfolio workspace shows none of it.
