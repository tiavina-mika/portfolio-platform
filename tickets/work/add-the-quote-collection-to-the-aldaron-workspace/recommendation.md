# Recommendations — add the quote collection to the Aldaron workspace

Decisions taken alone during `/dev --auto`. Each one is a 🔎 Deduction to validate, not a fact.

## 1. The acceptance proof file split out

- **Question**: build the optional proof file now?
- **Chosen**: no; split into `025-attach-an-acceptance-proof-file-to-a-quote` (backlog). This ticket records
  the date and the method.
- **Reason**: the back-office file storage (Cloudinary through the server) is its own piece of work, and
  the ticket did not fit one session with it.
- **If wrong**: nothing to undo; ticket 025 adds an optional field.

## 2. Where the default currency lives

- **Question**: "a default currency in the Aldaron settings": stored where?
- **Chosen**: a local preference of the person signed in (like the language), shown in Settings →
  Languages in the Aldaron workspace only.
- **Reason**: no Aldaron settings record exists on the server; the rule decided is that the quote stores
  its own currency, so the default only prefills a form.
- **Discarded**: a server-side Aldaron settings record shared by the team (a new collection and screen).
- **If wrong**: move the value to a server record; the quote form reads it through one selector.

## 3. Content frozen once sent, not only the lines

- **Chosen**: client, title, lines, currency, VAT rate, validity and terms all freeze when the quote leaves
  draft.
- **Reason**: the design note says "a quote that left draft is never edited"; the criterion names the lines.
- **If wrong**: shorten `QUOTE_FROZEN_FIELDS` (server constants).

## 4. A new quote needs an active client

- **Chosen**: an archived or anonymized client gets no new quote (refused by the trigger; the picker lists
  active clients only).
- **If wrong**: drop `assertActiveClient` in the quote trigger and the status filter of the picker.

## 5. The numbering year and prefix

- **Chosen**: the year is the one in Antananarivo (the business time zone of the platform), the prefix `AL`
  is a constant (`QUOTE_NUMBER_PREFIX`), the sequence padded to 3 digits and growing past 999.
- **If wrong**: change the constants; existing numbers stay as they are.

## 6. A quote needs at least one line; quantities take 2 decimals

- **Chosen**: at least one line; quantity > 0 with up to 2 decimals (half days); unit price ≥ 0.
- **If wrong**: change `quoteLineSchema` on both sides.

## 7. No delete, no "back to draft"

- **Chosen**: no delete function (delete is the owner's); a quote never goes back to draft (a revision is
  ticket 030).
