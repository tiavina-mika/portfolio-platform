# Implementation — add quote revisions and amendments

## Goal

In the Aldaron workspace, a back-office user can revise a sent quote (a new draft version with the same
number, the sent version becoming expired) and create an amendment to an accepted quote (a new quote with
its own number pointing to it); the list shows which quote each one revises or amends.

## Read

- Ticket, design note `docs/code/design/en/ALDARON_QUOTES_CLIENTS_MISSIONS.md` (Quote: `version`,
  `parentQuote`, "Revision and amendment"), work folders of `020-…` and `025-…`.
- Server: `quote.functions.ts`, `quote.service.cloud.ts`, `quote.triggers.ts`, `quote.validations.ts`
  (+ test), `quote.constants.ts`, `quote.utils.ts` (+ test), `db-indexes.ts` (the unique
  `number` + `version` index already exists), i18n `quote.json`.
- Bo: `Quotes.tsx`, `QuoteFormDialog.tsx`, `QuoteForm.tsx`, `QuoteClientField.tsx`, `QuoteTitleCell.tsx`,
  `quote.action.ts`, `quote.service.ts`, `quote.type.ts`, `quote.constants.ts`, `Dialog`, locales.
- Shared: `libs/shared-domain-utils/src/quote.utils.ts`.

## Apps touched

| App | Change? | Why |
|---|---|---|
| `libs/shared-domain-utils` | yes | `canReviseQuote` / `canAmendQuote`: the server refuses, the bo offers the actions from the same rule |
| `apps/server` | yes | function `reviseQuote`, `parentQuote` on `createQuote`, trigger rules, list fields, i18n, tests |
| `apps/bo` | yes | "Revise" and "Create an amendment" actions, confirm dialog, form in amendment mode, parent link in the list, locales |
| `apps/web`, `apps/aldaron-web` | no | quotes are never public |

## Approach

- **Revision** — new Cloud Function `reviseQuote({ id })`: only a `sent` quote (an accepted one gets a
  dedicated "create an amendment instead" refusal). The service copies the typed content (client, title,
  lines, currency, VAT rate, validity, terms) into a new quote with `parentQuote` set, saves it, then moves
  the revised quote to `expired` through the normal status change. It returns both quotes so the list
  updates both rows.
- **Amendment** — `createQuote` takes an optional `parentQuote` id. The function refuses a parent that is
  not `accepted`. The bo opens the usual quote form prefilled with the parent's client (locked), currency,
  VAT rate and terms; title and lines are typed.
- **The trigger decides from the data**, for any save: a new quote with a parent takes the parent's
  number and `version + 1` when the parent is `sent` (revision), its own number and version 1 when the
  parent is `accepted` (amendment), and is refused otherwise. The client must be the parent's, on
  creation and on every later edit. `parentQuote` joins the server-owned fields (restored on update).
- **Race**: two revisions of the same quote at once both get `version + 1`; the existing unique index on
  `number` + `version` refuses the second, translated as "already revised".
- **Order of the two saves**: the draft first, then the expiry. If the expiry fails, the sent quote stays
  sent and a second revision is refused by the index: nothing is lost (🔎 noted as a risk).
- **List**: the parent is read through `include('parentQuote')` with `select` on its number and version.
  The title cell shows `v2` after the number when the version is above 1, and a line "Revises
  AL-2026-001 v1" or "Amends AL-2026-003". A revision is told from an amendment by the same number.
  There is no separate detail page: the list row is the quote's detail.

Discarded: a stored `kind` field (the number already tells them apart); expiring the old version in an
`afterSave` (no rollback either, less explicit); copying lines into an amendment (an amendment is extra
work, its lines are new).

## Files

Shared
- `libs/shared-domain-utils/src/quote.utils.ts`

Server
- `src/cloud/functions/_domain/quote.functions.ts`, `src/cloud/services/_domain/quote.service.cloud.ts`
- `src/cloud/triggers/_domain/quote.triggers.ts`
- `src/validations/_domain/quote.validations.ts` + `.test.ts`
- `src/utils/_domain/quote.utils.ts` + `.test.ts`, `src/constants/_domain/quote.constants.ts`
- `src/types/quote.type.ts`, i18n `src/config/i18n/locales/{fr,en,mg}/_domain/quote.json`

Back-office
- `src/types/_domain/quote.type.ts`, `src/services/_domain/quote.service.ts`,
  `src/redux/actions/_domain/quote.action.ts`, `src/redux/reducers/_domain/quote.reducer.ts` (if needed)
- `src/pages/_domain/quote/Quotes.tsx`
- `src/containers/_domain/quote/QuoteFormDialog.tsx`, `QuoteForm.tsx`, `QuoteClientField.tsx`,
  `QuoteTitleCell.tsx`, `QuoteReviseDialog.tsx` (to create)
- `src/constants/_domain/quote.constants.ts`, locales `{fr,en,mg}/_domain/quote-entity.json`

Docs
- `docs/features/bo/quotes/fr/QUOTES.FR.md`
- design note (both twins): "Improvements" revision item
- `docs/inventory/code/{en,fr}/*` functions list (`reviseQuote`)

## Data and security

- `Quote.parentQuote` (pointer), `version` (already there). Read through the pointer, never filtered: no
  new index. The unique `{ number, version }` index already exists.
- Writes stay function-only (`FUNCTION_ONLY_CLASSES`); `parentQuote` cannot be changed after creation.

## Changes during the work

- `saveQuoteService` takes `{ quote, parentQuoteId }` as its last argument (the lint caps a function at
  four parameters).
- Review fix: a revision copies the validity date only while it is still ahead (`isQuoteValidityAhead`,
  tested).
- No reducer change was needed: the existing add and update slices cover the two rows of a revision.

## Risks and ⚠️ points

- Two saves, not one transaction: see "Order of the two saves".
- No database on this machine: live cases cannot be run here (same as `020` and `025`).
