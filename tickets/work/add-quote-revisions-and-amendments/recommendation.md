# Recommendations — add quote revisions and amendments

🔎 Deduction: decisions taken by `/dev --auto` without a human. To validate.

## 1. What the "detail of a quote" is

- **Question**: the ticket asks that "the detail of a quote shows the quote it revises or amends", but the
  back-office has no quote detail page.
- **Chosen**: the list row is the detail: the "Quote" column shows the version and a line "Revises … v1" /
  "Amendment to …".
- **Why**: the quotes page is a list with dialogs; a detail page is its own piece of work.
- **Discarded**: a detail page only for this.
- **If wrong**: a detail page reuses `QuoteTitleCell`'s parent label.

## 2. What a revision copies

- **Question**: which fields does the draft copy keep?
- **Chosen**: client, title, lines, currency, VAT rate, terms; the validity date only if it is still ahead.
- **Why**: "a draft copy" (design note); a past date would make the new version out of date at birth.
- **Discarded**: always copy the validity; never copy it.
- **If wrong**: one line in `reviseQuoteService`.

## 3. What an amendment starts with

- **Question**: what does "Create an amendment" prefill?
- **Chosen**: the client (locked), currency, VAT rate and terms of the accepted quote; title and lines empty.
- **Why**: an amendment is extra work for the same client on the same terms; its lines are new.
- **Discarded**: copying the lines (they would have to be deleted every time).
- **If wrong**: `toAmendmentFormValues` in `QuoteForm.tsx`.

## 4. Confirmation before revising

- **Question**: revise at once, or ask first?
- **Chosen**: a confirmation dialog, since the sent version expires immediately and this cannot be undone.
- **Discarded**: no confirmation.
- **If wrong**: drop `QuoteReviseDialog`.

## 5. Rights

- **Chosen**: "Revise" needs `create` and `update` on quotes (it writes a quote and moves another);
  "Create an amendment" needs `create`.
- **If wrong**: the `fromBO` rights of `reviseQuote` and the `display` of the two menu entries.

## 6. The client stays the parent's

- **Chosen**: a revision or an amendment keeps the client of the quote it comes from, at creation and on
  every later edit (server-side refusal, locked field in the form).
- **Why**: a revision or an amendment carries on the dealings with that client.
- **If wrong**: `assertParentClient` in the quote trigger and `lockedHelperText` in the form.
