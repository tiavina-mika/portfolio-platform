# Review — Attach an acceptance proof file to a quote

- **Branch**: `feat/attach-quote-acceptance-proof`
- **Type**: New feature
- **Author**: tiavina-mika — `tiavinamika@gmail.com` *(local git identity)*
- **Created**: 2026-11-23 at 17:42
- **Apps touched**: Server, Back-office (and the shared library `shared-domain-constants`)

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [Back-office](#back-office)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [Result per acceptance criterion](#result-per-acceptance-criterion)
- [Checks run](#checks-run)
- [What is left to do](#what-is-left-to-do)

## In short

When a back-office user of the Aldaron workspace marks a quote as accepted, they can now join one proof
file: the signed quote or the client's e-mail, as a PDF or an image (JPG, PNG, WEBP), 5 MB at most. The
file is stored with the other back-office files, under a generated name. In the quote list, an accepted
quote with a proof shows an "Acceptance proof" link under its status, which opens the file in a new tab.
The server takes a proof only with the acceptance itself, and only a file of the platform's own proofs
folder. Accepting without a file works as before.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `Quote` | no | `acceptanceProof` *(added: `{ publicId, url }`, optional)* | the file the acceptance rests on |

No index: the field is only read with the quote, never filtered or sorted. Quotes accepted before the
branch simply have no proof.

## Server

- `changeQuoteStatus` takes an optional `acceptanceProof` (`{ publicId, url }`, nothing else), only with
  `status: accepted`.
- The `beforeSave` trigger of `Quote` refuses a proof on any other move (and on a quote already accepted),
  and refuses a file that is not an `https` address of the platform's Cloudinary account, under
  `quotes/acceptance-proofs/`, with an accepted extension: so no foreign link can be stored and later
  opened by a teammate. A new quote never carries one.
- The list and the single read now return the proof. Two new translated errors (`fr`, `en`, `mg`).
- No new Cloud Function, trigger file, variable or service: the inventory is unchanged.

## Back-office

- **Pages touched**: **Quotes**, `http://localhost:5174/devis` (French; `/quotes` in English), Aldaron
  workspace only.
- The "Accept quote" dialog has an optional drop zone "Acceptance proof" under "How the client accepted".
  On confirm, the file is uploaded first, then the quote is accepted; if the upload fails, the quote stays
  sent and a message says so.
- The status cell of an accepted quote with a proof shows the "Acceptance proof" link (opens in a new tab,
  named "Acceptance proof of quote AL-… (opens in a new tab)" for screen readers).
- Feature doc updated: [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md).

## See the result locally

```bash
pnpm nx run server:dev   # needs a database and a Cloudinary account in apps/server/.env.*
pnpm nx run bo:dev       # back-office on http://localhost:5174
```

Sign in with a role opening Aldaron, switch to the Aldaron workspace, open **Quotes**
(`http://localhost:5174/devis`), mark a sent quote as accepted with a PDF. No story: the back-office has
no Storybook.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟠 Medium | Hole | A proof (personal data, a signature) is reachable by anyone who gets its address | the link is forwarded outside the team | ⏳ deferred — [debt #1](debt/261123-feat-debt-attach-quote-acceptance-proof.md#1-the-proof-is-delivered-by-a-public-address) |
| 🟠 Medium | Bug | The proof link answers "not allowed", or every proof is refused | the Cloudinary account blocks PDF delivery, or numbers files without their folder | ⏳ deferred — [debt #2](debt/261123-feat-debt-attach-quote-acceptance-proof.md#2-cloudinary-account-settings-may-break-the-proof) |
| 🟡 Low | Bug | An uploaded proof stays unused in storage | the acceptance is refused after the upload | ⏳ deferred — [debt #3](debt/261123-feat-debt-attach-quote-acceptance-proof.md#3-an-unused-file-after-a-refused-acceptance) |
| 🟡 Low | Hole | Two quotes point at the same proof file | a forged call reuses another quote's proof | ⏳ deferred — [debt #4](debt/261123-feat-debt-attach-quote-acceptance-proof.md#4-one-proof-on-two-quotes) |
| 🟡 Low | Bug | An extension in capitals (`.PDF`) refused | always, before the fix | ✅ fixed on the branch: the extension is compared in lowercase, test added |

Regressions checked: `setQuoteStatus` (bo) and `changeQuoteStatusService` (server) changed signature; their
only callers (`Quotes.tsx`, `changeQuoteStatus`) are updated. Server tests pass (78).

Deferred points: [debt file](debt/261123-feat-debt-attach-quote-acceptance-proof.md).

## Result per acceptance criterion

| Criterion | Result | Proof |
|---|---|---|
| Attach one file (PDF or image) when accepting | partial: built, not run live | `QuoteAcceptDialog.tsx`, `quote.action.ts`; server check tested in `quote.utils.test.ts` |
| Open the proof from the quote list | partial: built, not run live | `QuoteStatusCell.tsx` |
| No proof on a quote that is not being accepted | treated | `quote.validations.test.ts`, `quote.utils.test.ts` (`canAttachQuoteAcceptanceProof`) + trigger |
| Labels and errors in `fr`, `en`, `mg` | treated | `pnpm check-i18n` |

Gaps with the plan: none. Not verified: every live case (no local database nor Cloudinary account).

## Checks run

- `pnpm nx run-many -t lint typecheck -p server bo`: ok (warnings only, pre-existing).
- `pnpm nx run server:test`: ok, 6 files, 78 tests.
- `pnpm nx run-many -t build -p server bo`: ok.
- `pnpm check-i18n`, `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`: ok.

## What is left to do

The live cases of `tickets/work/attach-an-acceptance-proof-file-to-a-quote/tc-manual.md`, on
pre-production; the four deferred points above.
