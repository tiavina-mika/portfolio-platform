# Review — Add quote revisions and amendments

- **Branch**: `feat/quote-revisions-and-amendments`
- **Type**: New feature
- **Author**: tiavina-mika *(local git identity; the e-mail could not be read in this session)*
- **Created**: 2026-11-23 at 18:25
- **Apps touched**: Server, Back-office (and the shared library `shared-domain-utils`)

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

In the Aldaron workspace, a sent quote can now be **revised**: "Revise" creates a draft copy under the
same number with the next version (v2, v3…), and the version that was sent becomes expired. An accepted
quote can be completed by an **amendment**: "Create an amendment" opens the quote form prefilled with the
client (locked), currency, VAT rate and terms, and the amendment gets a number of its own. In the list,
a revised quote shows its version after the number, and each revision or amendment names the quote it
comes from. An accepted quote is never revised.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `Quote` | no | `parentQuote` *(added: pointer `Quote`, optional)*; `version` *(now above 1 for a revision)* | the quote a revision revises or an amendment completes |

No new index: `parentQuote` is only read with the quote (through `include`), never filtered or sorted. The
unique `number` + `version` index already existed and now does real work: it refuses two revisions of the
same version written at the same moment. Quotes created before the branch are first versions with no
parent.

## Server

- New Cloud Function `reviseQuote` (`id`): only a sent quote; an accepted one gets "create an amendment
  instead". It writes a draft copy (content, client, VAT, terms; the validity only if still ahead) pointing
  to the sent quote, then expires the sent one. It needs the `create` and `update` rights on `Quote`.
- `createQuote` takes an optional `parentQuote`: only an accepted quote may be amended.
- The `beforeSave` trigger of `Quote` decides from the status of the quote pointed to, whatever saved it:
  sent → revision (its number, its version + 1, no new number taken from the counter); accepted →
  amendment (a number of its own); anything else is refused. The client must be the parent's, at creation
  and on every later edit. `parentQuote` is now server-owned: an edit cannot change it.
- The list and the single read return the parent's number and version. Seven new translated errors
  (`fr`, `en`, `mg`).
- Inventory updated: [Cloud Functions](../../../inventory/code/en/CLOUD_FUNCTIONS.md) (`reviseQuote`).
  No new variable or service.

## Back-office

- **Pages touched**: **Quotes**, `http://localhost:5174/devis` (French; `/quotes` in English), Aldaron
  workspace only.
- Row menu of a sent quote: **Revise**, after a confirmation that says the sent version expires at once.
  The new draft appears at the top of the list.
- Row menu of an accepted quote: **Create an amendment**, opening the quote form titled "New amendment to
  quote AL-…", with the client locked and explained under the field.
- The "Quote" column shows `AL-2026-001 · v2` for a revision, and a line "Revises AL-2026-001 v1" or
  "Amendment to AL-2026-003". Editing a revision or an amendment draft keeps its client locked.
- Feature doc updated: [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md).

## See the result locally

```bash
pnpm nx run server:dev   # needs a database in apps/server/.env.*
pnpm nx run bo:dev       # back-office on http://localhost:5174
```

Sign in with a role opening Aldaron, switch to the Aldaron workspace, open **Quotes**
(`http://localhost:5174/devis`), revise a sent quote, then create an amendment of an accepted one. No
story: the back-office has no Storybook.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟡 Low | Bug | A revision is born with a validity date already passed | the sent quote's validity is over | ✅ fixed on the branch: the date is copied only while it is ahead, test added |
| 🟡 Low | Hole | A revision or an amendment written for another client | a forged `createQuote`, or a client changed on the draft | ✅ handled: the trigger refuses a client other than the parent's |
| 🟡 Low | Bug | Two people revise the same quote at once and get two v2 | a double click or two tabs | ✅ handled: the unique index refuses the second, with a readable message |
| 🟡 Low | Bug | The new draft exists while the sent version stays sent | the database fails between the two saves | ⏳ deferred — [debt #1](debt/261123-feat-debt-quote-revisions-and-amendments.md#1-a-revision-is-two-saves-not-one) |
| 🟡 Low | Bug | A revision of an amendment points to the amendment, not to the accepted quote | an amendment is sent, then revised | ⏳ deferred — [debt #2](debt/261123-feat-debt-quote-revisions-and-amendments.md#2-the-revision-of-an-amendment-points-to-the-amendment) |

Regressions checked: `saveQuoteService` (server) now takes `{ quote, parentQuoteId }` as its last
argument; its two callers (`createQuote`, `updateQuote`) are updated. `QuoteClientField`,
`QuoteFormDialog`, `QuoteForm` and `createOrUpdateQuote` (bo) gained optional props or arguments: the
existing "New quote" and "Edit" paths pass none and behave as before. Server tests pass (87).

Deferred points: [debt file](debt/261123-feat-debt-quote-revisions-and-amendments.md).

## Result per acceptance criterion

| Criterion | Result | Proof |
|---|---|---|
| Revising a sent quote creates a draft with the same number and the next version | partial: built and rule tested, not run live | `reviseQuoteService`, trigger `applyParentRelation`; `quote.utils.test.ts`, `quote.validations.test.ts` |
| The revised version becomes `expired` | partial: built, not run live | `reviseQuoteService` → `changeQuoteStatusService` |
| An accepted quote cannot be revised | partial: rule tested, not run live | `canReviseQuote` in `quote.utils.test.ts`; `reviseQuote` refusal; no menu entry |
| An amendment has its own number and points to the accepted quote it completes | partial: rule tested, not run live | `getQuoteParentRelation`, `createQuote`, `quote.validations.test.ts` |
| The detail of a quote shows the quote it revises or amends | partial: built, not run live | `QuoteTitleCell.tsx` (the list row is the quote's detail: there is no detail page) |

Gaps with the plan: the validity date of a revision is copied only while it is ahead (review fix). Not
verified: every live case (no local database).

## Checks run

- `pnpm nx run-many -t typecheck lint test -p server bo shared-domain-utils`: ok (bo: warnings only,
  none on a changed line).
- `pnpm nx run server:test`: ok, 6 files, 87 tests.
- `pnpm nx run-many -t build -p server bo`: ok.
- `pnpm check-i18n`, `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`: ok.

## What is left to do

The live cases of `tickets/work/add-quote-revisions-and-amendments/tc-manual.md`, on pre-production; the
two deferred points above; the payments of an amendment come with
`060-add-quote-payments-with-the-30-40-30-schedule`.
