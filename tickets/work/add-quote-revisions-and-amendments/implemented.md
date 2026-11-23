# Implemented — add quote revisions and amendments

Built and checked by the automatic checks; the screens were not yet tried on a real database.

- In the Aldaron workspace, a sent quote has a "Revise" action that asks for confirmation first.
- Revising creates a new draft version of the quote under the same number (v2, v3…), with the same
  client, lines and terms; the version that was sent becomes expired.
- An accepted quote can no longer be revised: it offers "Create an amendment" instead.
- An amendment opens the quote form already filled with the client, currency, VAT rate and terms of the
  accepted quote; it gets a number of its own.
- A revision or an amendment always stays with the client of the quote it comes from.
- The quote list shows the version of a revised quote and, under each revision or amendment, the quote it
  comes from.
- Messages and errors exist in French, English and Malagasy.
