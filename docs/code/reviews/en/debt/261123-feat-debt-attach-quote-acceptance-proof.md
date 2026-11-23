# Debt — Attach an acceptance proof file to a quote

> Review: [261123-feat-attach-quote-acceptance-proof.md](../261123-feat-attach-quote-acceptance-proof.md)
> Branch: `feat/attach-quote-acceptance-proof` · Created 2026-11-23 at 17:42 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. The proof is delivered by a public address](#1-the-proof-is-delivered-by-a-public-address)
- [2. Cloudinary account settings may break the proof](#2-cloudinary-account-settings-may-break-the-proof)
- [3. An unused file after a refused acceptance](#3-an-unused-file-after-a-refused-acceptance)
- [4. One proof on two quotes](#4-one-proof-on-two-quotes)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟠 Medium | Hole | Anyone with the address opens the proof | ⏳ to do |
| 2 | 🟠 Medium | Bug | PDF delivery blocked, or proofs refused, by the account settings | ⏳ to do |
| 3 | 🟡 Low | Bug | An uploaded proof stays unused after a refused acceptance | ⏳ to do |
| 4 | 🟡 Low | Hole | A forged call reuses another quote's proof | ⏳ to do |

## 1. The proof is delivered by a public address

- **Severity**: 🟠 Medium · **Type**: Hole · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/services/_domain/quote.service.ts` (`uploadQuoteAcceptanceProof`),
  `apps/server/src/api/_core/cloudinary.api.ts`

**What can happen** — a teammate copies the "Acceptance proof" link into an e-mail or a chat; whoever
receives it opens the signed quote (names, address, signature), without any account.

**Why** — the proof is uploaded like every other back-office file (`type: 'upload'`, public delivery).
The generated name makes the address impossible to guess, not private. Decision 1 of
`tickets/work/attach-an-acceptance-proof-file-to-a-quote/recommendation.md`.

**How to check** — open the link in a private window: the file shows.

**How to fix**

1. **(recommended)** Upload the proof with `type: 'authenticated'`, store `{ publicId, format }`, and add a
   Cloud Function `getQuoteAcceptanceProofUrl` (Aldaron workspace + `get` right on `Quote`) that returns
   `generatePrivateDownloadUrl(publicId, format, { type: 'authenticated', expires_at: +1 min })`; the
   status cell calls it on click.
   *Why*: the right is checked on the server at every opening and a forwarded link expires in a minute;
   the helper already exists in `cloudinary.api.ts`.
2. Keep the public address and say it in the feature doc (done today) — no protection once leaked.

## 2. Cloudinary account settings may break the proof

- **Severity**: 🟠 Medium · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: the Cloudinary account (console), `apps/server/src/utils/_domain/quote.utils.ts`
  (`isQuoteAcceptanceProofFile`)

**What can happen** — (a) the account blocks the delivery of PDF files (a security setting, on by default
on some accounts): the link answers "401". (b) The account uses "dynamic folders" and names files without
their folder in the public id: the server refuses every proof ("This proof is not a file uploaded from
the back-office").

**Why** — both depend on the account, not on the code; no account was reachable from the machine that
built the branch.

**How to check** — case 2 of `tc-manual.md` on pre-production; for (b), the `publicId` the upload answers
must start with `quotes/acceptance-proofs/`.

**How to fix**

1. **(recommended)** Check the two settings during the manual test: Settings → Security → "Allow delivery
   of PDF and ZIP files" on; if (b) happens, pass `public_id_prefix` / keep `folder` in the upload config
   so the public id carries the folder.
   *Why*: a setting, no code change, in the console the owner already manages.
2. Relax the folder check to `asset_folder` — needs the upload answer to carry it, more code.

## 3. An unused file after a refused acceptance

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/redux/actions/_domain/quote.action.ts` (`setQuoteStatus`)

**What can happen** — the file is uploaded, then `changeQuoteStatus` is refused (the quote was changed by
someone else meanwhile, rights lost): the file stays in `quotes/acceptance-proofs/`, referenced by nothing.

**Why** — the upload and the status change are two calls; nothing cleans the folder.

**How to check** — accept a quote that another tab already refused, with a file; list the folder.

**How to fix**

1. **(recommended)** A purge job for the folder, like `purgeOrphanedEditorFilesJob`: files older than a day
   whose `publicId` no `Quote.acceptanceProof.publicId` names are deleted. The job lives in the domain
   (`cloud/jobs/_domain/quote.jobs.ts`), never in the core one.
   *Why*: one job covers every failure path, and reuses `listFilesByFolder` / `destroyFiles`.
2. Delete the file from the server when the save fails — needs a check that no other quote names it.

## 4. One proof on two quotes

- **Severity**: 🟡 Low · **Type**: Hole · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/triggers/_domain/quote.triggers.ts`

**What can happen** — a user with the right to accept quotes calls `changeQuoteStatus` by hand with the
proof of another quote: both quotes show the same file.

**Why** — the trigger checks the file is one of the platform's proofs, not that no other quote uses it.

**How to fix**

1. **(recommended)** In the trigger, refuse a proof whose `publicId` another quote already holds (a
   `first()` on `acceptanceProof.publicId` in `quote.service.cloud.ts`, `select([])`).
   *Why*: one query on an acceptance, which is rare; closes the case fully.
2. Leave it: the caller already has the right to accept quotes, the harm is a misleading proof.
