# Implementation — attach an acceptance proof file to a quote

## Goal

A back-office user accepting a quote in the Aldaron workspace can attach one file (PDF or image) as the
proof of the acceptance, and open it later from the quote list; the server refuses a proof on any other
move.

## Read

- Ticket, design note `docs/code/design/en/ALDARON_QUOTES_CLIENTS_MISSIONS.md` (field `acceptanceProof`,
  "Improvements"), the work folder of `020-add-the-quote-collection-to-the-aldaron-workspace`.
- Server: `quote.functions.ts`, `quote.service.cloud.ts`, `quote.triggers.ts`, `quote.validations.ts`,
  `quote.constants.ts`, `quote.utils.ts`, the upload route (`routes/_core/files.route.ts`,
  `controllers/_core/files.controller.ts`, `api/_core/cloudinary.api.ts`), the purge job `cms.jobs.ts`.
- Bo: `Quotes.tsx`, `QuoteAcceptDialog.tsx`, `QuoteStatusCell.tsx`, `quote.action.ts`, `quote.service.ts`,
  `quote.validation.ts`, the CV upload (`AppCvForm.tsx`, `createOrUpdateApp`), `DropzoneField`,
  `generateFileSchema`, `uploadFilesAPI`.
- Rules: parse-patterns, core-domain-boundary, accessibility, theming, forms-and-state, inventory,
  feature-docs, implementation-completeness.

## Apps touched

| App | Change? | Why |
|---|---|---|
| `libs/shared-domain-constants` | yes | the storage folder, the accepted extensions and the size cap: the bo uploads with them, the server checks them |
| `apps/server` | yes | type, validation (+ tests), util (+ tests), service, function, trigger, list fields, i18n |
| `apps/bo` | yes | type, validation, service, action (upload then status change), dialog, status cell, constants, locales |
| `apps/web`, `apps/aldaron-web` | no | quotes are never public |

## Approach

- **Storage "like the other files of the back-office"**: the bo uploads the file through the existing
  `/files` endpoint (Cloudinary), into the folder `quotes/acceptance-proofs`, with `use_filename: false`
  so the stored name never repeats the client's file name. It gets `{ publicId, url }` back and sends it
  to `changeQuoteStatus` as `acceptanceProof`. No new endpoint, no new variable.
- **Server checks** (the call can be forged):
  - validation: `acceptanceProof` is a strict `{ publicId, url }` object, allowed only with
    `status: accepted` (refine);
  - trigger: a change of `acceptanceProof` is refused unless the quote is moving to `accepted` now
    (`canAttachQuoteAcceptanceProof(from, to)`), and the file must be one of ours: an `https` URL of the
    platform's Cloudinary account, under the proofs folder, ending in an accepted extension
    (`isQuoteAcceptanceProofFile`). So no other link (phishing, foreign host) can be stored and later
    opened by a teammate. A new quote never carries one.
- **Bo**: the "Accept the quote" dialog gets an optional file drop (PDF, JPG, PNG, WEBP, 5 MB max). On
  submit the action uploads the file first, then changes the status. The status cell of an accepted quote
  shows an "Acceptance proof" link that opens the file in a new tab.

Discarded: a private (`authenticated`) Cloudinary delivery with a signed link made on demand — stronger,
but no other back-office file works that way and it needs a new function; kept as a 🔎 decision.

## Files

Shared
- `libs/shared-domain-constants/src/quote.constants.ts`

Server
- `src/types/quote.type.ts`, `src/constants/_domain/quote.constants.ts`
- `src/utils/_domain/quote.utils.ts` + `quote.utils.test.ts`
- `src/validations/_domain/quote.validations.ts` + `.test.ts`
- `src/cloud/services/_domain/quote.service.cloud.ts`, `src/cloud/functions/_domain/quote.functions.ts`
- `src/cloud/triggers/_domain/quote.triggers.ts`
- `src/config/i18n/locales/{fr,en,mg}/_domain/quote.json`

Back-office
- `src/types/_domain/quote.type.ts`, `src/constants/_domain/quote.constants.ts`,
  `src/validations/_domain/quote.validation.ts`, `src/services/_domain/quote.service.ts`
- `src/redux/actions/_domain/quote.action.ts`, `src/pages/_domain/quote/Quotes.tsx`
- `src/containers/_domain/quote/QuoteAcceptDialog.tsx`, `QuoteStatusCell.tsx`
- `src/config/i18n/locales/{fr,en,mg}/_domain/quote-entity.json`

Docs
- `docs/features/bo/quotes/fr/QUOTES.FR.md`
- design note (both twins): "Improvements" proof item
- inventory: no new function, trigger file, variable or service

## Steps

1. Shared constants.
2. Server: type, constants, utils + tests, validations + tests, service, function, trigger, i18n.
3. Bo: type, constants, validation, service, action, dialog, status cell, page, locales.
4. Docs, changeset.
5. Checks: lint, typecheck, server tests, build, check-i18n, docs checks.

## Data and security

- `Quote.acceptanceProof`: `{ publicId, url }` (fixed keys), optional, written once with the acceptance.
  Read by id / in the list only, never filtered or sorted: no index.
- Old rows have no proof: every read treats it as possibly missing.

## Risks and ⚠️ points

- The file is delivered by a public (unguessable) URL, like every other back-office file.
- If the status change is refused after the upload, the uploaded file stays unused in Cloudinary.
- Cloudinary accounts may block PDF delivery by default (a setting of the account): to verify live.
- No Cloudinary key nor database on this machine: the live cases cannot be run here.
