---
type: feat
apps: [server, bo]
branch: feat/attach-quote-acceptance-proof
pr:
---

## Context

Split from `020-add-the-quote-collection-to-the-aldaron-workspace`, which records the acceptance date and
method of a quote but no file. Design note: `docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md`
(field `acceptanceProof`: "signed quote, e-mail of the client, stored like the other files of the
back-office").

## To do

- Server: an optional `acceptanceProof` file on `Quote`, accepted by `changeQuoteStatus` only when the quote
  becomes `accepted`, stored like the other back-office files; refused on any other transition.
- Bo: an optional file drop in the "Accept the quote" dialog, and a link to open the proof on an accepted
  quote.
- Docs: the quotes feature page; inventory if a new storage path or variable appears.

## Out of scope

- Several proofs per quote, a proof on a payment.

## Acceptance criteria

- [ ] A user accepting a quote can attach one file (PDF or image) as the proof of the acceptance
- [ ] The proof of an accepted quote can be opened from the quote list
- [x] A proof cannot be attached to a quote that is not being accepted
- [x] Labels and errors exist in `fr`, `en` and `mg`

## Comments

### 2026-11-23 · Claude · backlog
Split from `020-add-the-quote-collection-to-the-aldaron-workspace` by `/dev --auto`: the file storage of the
back-office is its own piece of work.

### 2026-11-23 · Claude · in-progress
Taken by `/dev --auto` (first usable `backlog/` ticket, `todo/` empty). Branch
`feat/attach-quote-acceptance-proof`; plan in `tickets/work/attach-an-acceptance-proof-file-to-a-quote/`.

### 2026-11-23 · Claude · to-test
**What changed**: the "Accept quote" dialog takes an optional proof file (PDF, JPG, PNG, WEBP, 5 MB),
uploaded with the other back-office files under a generated name; `changeQuoteStatus` stores it as
`acceptanceProof`; the trigger refuses it on any other move and refuses any file that is not in the
platform's Cloudinary proofs folder. The list shows an "Acceptance proof" link under an accepted quote.
Feature doc `docs/features/bo/quotes/fr/QUOTES.FR.md` and design note updated; changeset added.

**Branch / PR**: `feat/attach-quote-acceptance-proof`, PR in the `pr:` field.

**Ran by Claude**: `pnpm nx run-many -t lint typecheck -p server bo` ok; `pnpm nx run server:test` ok
(78 tests, new ones in `quote.utils.test.ts` and `quote.validations.test.ts`); `pnpm nx run-many -t build
-p server bo` ok; `pnpm check-i18n`, `lint:docs`, `check-doc-links`, `check-doc-twins` ok. Review:
`docs/code/reviews/en/261123-feat-attach-quote-acceptance-proof.md`.

**How to test** (pre-production, Aldaron workspace, two sent quotes, a small PDF): accept one with the PDF
→ the "Acceptance proof" link shows and opens the file; accept the other without a file; try a `.docx`
and a 6 MB PDF in the drop zone (refused). Detail: `tickets/work/attach-an-acceptance-proof-file-to-a-quote/tc-manual.md`.

**Not verified**: every live case (no local database nor Cloudinary account) — criteria 1 and 2 stay
unticked.

**Decisions to validate**: `tickets/work/attach-an-acceptance-proof-file-to-a-quote/recommendation.md`
(public delivery like the other files, proof final once accepted, types and size, link placement).

**What is left** (`tickets/work/attach-an-acceptance-proof-file-to-a-quote/remaining.md`): the live cases;
the decisions above; four deferred risks in the debt file (public address of the proof, Cloudinary account
settings for PDF delivery and folders, an unused file after a refused acceptance, one proof reused on two
quotes). No `TODO(link:...)` left open.
