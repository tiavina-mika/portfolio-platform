# Review — Add the quote collection to the Aldaron workspace

- **Branch**: `feat/aldaron-quote-collection`
- **Type**: New feature
- **Author**: tiavina-mika — `tiavinamika@gmail.com` *(local git identity)*
- **Created**: 2026-11-23 at 15:46
- **Apps touched**: Server, Back-office (and the shared libraries `shared-domain-constants`,
  `shared-domain-types`, `shared-domain-utils`)

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

The Aldaron workspace gets its quotes. A back-office user working in Aldaron, with the matching rights,
writes a draft quote for an active client (or creates the client from the quote form), with priced lines,
a currency (euro or ariary), an optional VAT rate and a total computed while typing. Each quote gets a
readable number `AL-<year>-<NNN>` with no gap inside a year. A draft is then marked sent, and accepted
(with how the client accepted), refused or expired; any other move is refused and a quote that left draft
can no longer be edited. A default currency, in the settings, only prefills a new quote. A client that has
quotes can no longer be deleted. Nothing is public: the website is not touched.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `Quote` | yes | `number`, `client` (pointer), `title`, `status`, `lines` (`label`, `quantity`, `unitAmount`), `currency`, `taxRate`, `totalAmount`, `paidAmount`, `issuedAt`, `validUntil`, `notes`, `version`, `acceptedAt`, `acceptanceMethod`, `createdBy`, `updatedBy` | the quotes of the Aldaron workspace; amounts are integers in the smallest unit of the quote's currency |
| `Counter` | yes | `name`, `value` | named sequences incremented by the database itself; `quote-<year>` numbers the quotes of a year |

Indexes added:

- `Quote` `{ number, version }` unique: one number, one version (a revision will keep the number).
- `Quote` `{ _p_client, status }`: the quotes of a client, and the refusal to delete a client that has some.
- `Quote` `{ status, issuedAt }`: the list, one status per tab.
- `Counter` `{ name }` unique: one row per sequence, which settles two first quotes of a year created at once.

`Quote` and `Counter` are locked to the highest roles at the class level; `Quote` is reached through its
Cloud Functions only, like `Client`.

## Server

- Five Cloud Functions, each checking the Aldaron workspace first, then the role right (`getQuotes`,
  `getQuote`, `createQuote`, `updateQuote`, `changeQuoteStatus`). No delete function.
- A `beforeSave` trigger on `Quote`: a new quote is born draft, version 1, nothing paid; the total is
  recomputed on every save; the number is taken last, once every refusal is behind, in the business time
  zone; the status only moves `draft → sent → accepted | refused | expired`; a quote that left draft keeps
  its content; sending dates it, accepting dates the acceptance and requires the method. The number, the
  version, the dates and the authors are put back if anything else writes them.
- A `beforeDelete` trigger on `Client` refuses the deletion of a client that has quotes (the link the
  client branch left open).
- Errors in `fr`, `en` and `mg`. Inventory updated (`docs/inventory/README.md`, Cloud Code, collections
  and indexes, roles). No env variable, no external service.

## Back-office

- **Pages touched**: **Quotes** (new), `http://localhost:5173/devis` (French; `/quotes` in English), in
  the Aldaron workspace only; **Settings → Languages**, `http://localhost:5173/parametres` (new row in
  Aldaron).
- The list: one tab per status, search on number or title, columns quote (number and title), client
  (read live through the pointer), total in the quote's currency, dates, status, actions.
- The dialog "New quote" / "Edit" (draft only): client picker over the active clients with a "New
  client" shortcut, title, lines (at least one, 50 at most), currency, VAT rate, validity, terms, and the
  subtotal / VAT / total updated while typing.
- Row actions offer only the allowed moves; "Mark as accepted" asks how the client accepted.
- Settings → Languages, in Aldaron: "Default currency of the quotes" (a local preference), prefilling
  only new quotes. The generic settings page renders it through a registry, so `_core` does not import
  the quote code.
- Rights: "Quotes" in the role rights table. Feature docs:
  [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md), [Clients](../../../features/bo/clients/fr/CLIENTS.FR.md),
  [Paramètres](../../../features/bo/settings/fr/SETTINGS.FR.md).

## See the result locally

```bash
pnpm nx run server:dev   # needs a database
pnpm nx run bo:dev       # back-office on the Vite URL (http://localhost:5173 by default)
```

Sign in with a role opening Aldaron, switch the workspace to Aldaron in Settings, then open **Quotes**
(`http://localhost:5173/devis`). No story: the back-office has no Storybook.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟠 Medium | Bug | A quote created just after midnight on 1 January in Madagascar takes the previous year's number | the year was read in UTC | ✅ fixed on the branch: the year is read in the business time zone (`getQuoteNumberYear`, tested) |
| 🟡 Low | Bug | An empty VAT box handed `null` to a text input, which then stops being controlled by the form | opening the form | ✅ fixed on the branch: the box starts empty (`''`), the validation turns it into `null` |
| 🟡 Low | Bug | A number is lost (a gap in the year) if the database fails between the counter increment and the write of the quote | rare database failure | ⏳ deferred — [debt #1](debt/261123-feat-debt-aldaron-quote-collection.md#1-a-gap-in-the-numbering-after-a-failed-write) |
| 🟡 Low | Bug | Two people editing the same draft at once: the last save wins silently | concurrent edits | ⏳ deferred — [debt #2](debt/261123-feat-debt-aldaron-quote-collection.md#2-two-editors-on-the-same-draft) |

Checked and not a risk: two status changes at the same moment (the trigger reads the stored status, so
the second move is refused); dates sent by the back-office (Parse turns them back into dates before the
validation); the changed `createOrUpdateClient` (one new optional argument, the Clients page is
unchanged); the languages settings panel (nothing new outside Aldaron).

Debt file: [261123-feat-debt-aldaron-quote-collection.md](debt/261123-feat-debt-aldaron-quote-collection.md).

## Result per acceptance criterion

| Criterion | Result | Proof |
|---|---|---|
| Create a draft for an existing client and see its total | treated, live run not done | total: `quote.utils.test.ts`; form and trigger: code; no local database |
| Own currency and optional VAT rate, total in the currency decimals | treated | `quote.utils.test.ts`, `quote.validations.test.ts` |
| Changing the default currency does not change an existing quote | treated, live run not done | the setting only fills `defaultValues` of a new quote; a quote stores `currency` |
| A unique readable number with no gap inside a year | treated, live run not done | `quote.utils.test.ts` (format, counter per year, year turn); atomic `$inc` + unique indexes; deferred gap on a database failure |
| `draft → sent → accepted / refused / expired`, nothing else | treated | `quote.utils.test.ts` (transitions), `quote.validations.test.ts` (never back to draft); trigger |
| Lines of a quote out of draft cannot change | treated, live run not done | trigger `QUOTE_FROZEN_FIELDS`, `updateQuote` refuses a non-draft |
| Number, total or paid amount in the request change nothing | treated | `quote.validations.test.ts` (refused input); trigger recomputes the total and restores the number |
| Accepting records the date and the method (and an optional proof file) | partial | date and method: trigger + validation test; the proof file is split into `025-attach-an-acceptance-proof-file-to-a-quote` |
| The list filters by status and shows the client name without a copy | treated, live run not done | `include('client')` + `select`, tabs per status |
| Labels and errors in `fr`, `en` and `mg` | treated | `pnpm check-i18n` |

## Checks run

- `pnpm nx run-many -t lint typecheck -p server bo shared-domain-utils shared-domain-constants shared-domain-types`: ok (0 errors).
- `pnpm nx run-many -t test build -p server bo`: ok; server tests 6 files, 68 tests.
- `pnpm check-i18n`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`, `pnpm lint:docs`: ok.
- Not verified: every live case (no local database on the machine that did the work).

## What is left to do

- The live cases of `tickets/work/add-the-quote-collection-to-the-aldaron-workspace/tc-manual.md`.
- The acceptance proof file: `025-attach-an-acceptance-proof-file-to-a-quote`.
- Revisions, site requests, PDF and sending, payments, automatic expiry: their own tickets (`030`, `040`,
  `110`, `060`, `130`).
