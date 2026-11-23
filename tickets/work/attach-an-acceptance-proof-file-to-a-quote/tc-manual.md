# Manual test guide — attach an acceptance proof file to a quote

## Before starting

- Where: pre-production, once the pull request is merged and deployed (or a local server with its own
  database and a Cloudinary account of test).
- Account: a back-office account that opens the **Aldaron** workspace and may edit quotes.
- Data: one client, and two quotes **marked as sent** (create them, then "Mark as sent"). Prepare a small
  PDF (under 5 MB), a JPG, a `.docx` file and a PDF over 5 MB.
- Language: any (`fr`, `en` or `mg`); the steps quote the English labels.

## Case 1 — accept with a proof

1. Open **Quotes** in the sidebar.
2. On the first sent quote, open the row menu, click **Mark as accepted**.
   - Expected: a dialog "Accept quote AL-…" with "How the client accepted" and "Acceptance proof".
3. Pick **Signed quote**.
4. Drop the PDF in the "Acceptance proof" zone (or click it and choose the file).
   - Expected: the file shows in the zone.
5. Click **Mark as accepted**.
   - Expected: the dialog closes, the message "Quote AL-… is marked as accepted." appears, the row shows
     **Accepted** with an **Acceptance proof** link under it.

Failure: an error message, or no link under the status.

## Case 1b — accept without a proof

1. On the second sent quote, **Mark as accepted**, pick **By e-mail**, drop nothing, confirm.
   - Expected: Accepted, no link under the status.

## Case 1c — wrong files

1. Open the accept dialog on any sent quote (create one if needed).
2. Drop the `.docx` file.
   - Expected: a message under the zone says the type is not allowed.
3. Drop the PDF over 5 MB.
   - Expected: a message says the file is too large.
4. Close the dialog without confirming.

## Case 2 — open the proof

1. On the quote of case 1, click **Acceptance proof**.
   - Expected: the PDF opens in a new tab.

Failure: an error page, a blank tab, or a "401"/"Not allowed" answer (then the Cloudinary account blocks
PDF delivery: Cloudinary console → Settings → Security → "Allow delivery of PDF and ZIP files").

## Case 3b — no proof on another move

Needs someone who can call a Cloud Function by hand (for example from the browser console of the
back-office, signed in): `Parse.Cloud.run('changeQuoteStatus', { id: '<a sent quote>', status: 'refused',
acceptanceProof: { publicId: 'quotes/acceptance-proofs/x', url: 'https://res.cloudinary.com/<account>/image/upload/x.pdf' }, workspace: 'agency' })`.

- Expected: refused; the quote stays sent.

## Not testable for now

Nothing else.

## Result to send back

| # | ok / ko | remark |
|---|---|---|
| 1 | | |
| 1b | | |
| 1c | | |
| 2 | | |
| 3b | | |
