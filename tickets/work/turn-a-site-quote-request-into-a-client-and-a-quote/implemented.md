# Implemented — turn a site quote request into a client and a quote

A quote request from the Aldaron site can now become a client and a draft quote in the back-office, once.
Built and checked by tests and builds; the live run on a real database is still to do (`tc-manual.md`).

- A quote request sent from the Aldaron site is filed in the Aldaron workspace of the back-office.
- The contacts page shows the messages of the workspace being worked in; switching workspace reloads it.
- A person who cannot open the Aldaron workspace never reads its requests, even with their address.
- Under an Aldaron request, "Create the client and the quote" opens the quote form already filled in: the
  client, the product as the title, and the lines of the visitor's estimate, to price.
- The client with the same e-mail is reused; otherwise a new client is created from the request.
- Once the quote is saved, the request shows its quote number and cannot become a second quote.
- The visitor's form on the Aldaron site works exactly as before.
