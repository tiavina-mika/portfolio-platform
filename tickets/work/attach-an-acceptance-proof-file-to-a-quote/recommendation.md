# Recommendations — attach an acceptance proof file to a quote

Decisions taken alone during `/dev --auto`. Each one is a 🔎 Deduction to validate, not a fact.

## 1. Public delivery of the proof, like the other files

- **Question**: "stored like the other files of the back-office": with a public address, or a private one?
- **Chosen**: the existing upload (Cloudinary, public delivery), with a generated file name so the address
  is long, impossible to guess and never repeats the client's file name.
- **Reason**: it is literally how every other back-office file is stored; no new endpoint or function.
- **Discarded**: a private (`authenticated`) delivery opened through a short-lived signed link made by a
  new Cloud Function — stronger for a document with personal data, more work.
- **If wrong**: upload with `type: 'authenticated'` and add a function that signs a link on demand; the
  stored `{ publicId, url }` shape stays.

## 2. The proof is final, joined with the acceptance only

- **Chosen**: a proof is joined only by the move that accepts the quote; it is never added later,
  replaced or removed.
- **Reason**: the ticket says "refused on any other transition"; an accepted quote is never edited.
- **If wrong**: allow `acceptanceProof` on an accepted quote that has none (trigger + a list action).

## 3. Accepted types and size

- **Chosen**: PDF, JPG, JPEG, PNG, WEBP, 5 MB at most (the upload's existing cap).
- **If wrong**: change `QUOTE_ACCEPTANCE_PROOF_EXTENSIONS` / `QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB` (shared).

## 4. Where the link shows

- **Chosen**: an "Acceptance proof" link under the status of the accepted quote, in the list.
- **If wrong**: move it to the row menu; the data is already on the row.
