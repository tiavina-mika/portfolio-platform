# Review — Turn a site quote request into a client and a quote

- **Branch**: `feat/site-quote-request-conversion`
- **Type**: New feature
- **Author**: tiavina-mika *(local git identity; the e-mail could not be read in this session)*
- **Created**: 2026-11-23 at 19:34
- **Apps touched**: Server, Back-office, Aldaron website (and the shared library `shared-constants`)

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [Back-office](#back-office)
- [Aldaron website](#aldaron-website)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [Result per acceptance criterion](#result-per-acceptance-criterion)
- [Checks run](#checks-run)
- [What is left to do](#what-is-left-to-do)

## In short

A quote request sent from the Aldaron site is now filed in the Aldaron workspace: the **Contacts** page lists
the messages of the workspace the person works in, and a message of a workspace their roles do not open
reads as not found. Under an Aldaron request, **Create the client and the quote** opens the quote form
prefilled: the client holding the same e-mail (or a new one made from the request), the product as the
title, and one line at 0 per line of the visitor's estimate, for the team to price. Once saved, the request
shows its quote number and cannot become a second quote. Nothing changes for the visitor.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `Contact` | no | `target` *(added: `portfolio` or `agency`)* | the workspace the message is read in; a message saved before has none and reads as the portfolio's |
| `Contact` | no | `quote` *(added: pointer `Quote`, optional)* | the quote an Aldaron request became; a request that has one is never converted again |

Index added on `Contact`: `{ target: 1, deleted: 1, createdAt: -1 }`, for the inbox of one workspace, newest
first (the portfolio's also reads the rows with no target). `target` is also pre-created in the schema of
`Contact`. No migration: old Aldaron requests stay in the portfolio until `150-move-old-contacts-to-the-aldaron-target`.

## Server

- `createPublicContact` takes an optional `target` and stores `portfolio` when there is none.
- `getContacts` takes the `workspace` and checks it with `resolveWorkspace`, like the articles; `getContact`
  answers "not found" for a message of a workspace the account cannot open.
- New Cloud Function `prepareQuoteFromContact` (`id`, needs `create` on `Quote`, Aldaron workspace only): the
  request must be an Aldaron one, not in the bin, with an e-mail, not converted yet. It returns the client
  holding that e-mail (whatever its case; refused if archived) or creates one (an individual with the name,
  e-mail and phone; this needs `create` on `Client`), and the prefill read from the message.
- `createQuote` takes an optional `contact`: it checks the request again, writes the quote, then points the
  request to it. A request cannot be given with `parentQuote`.
- The labels of the request message (`Product`, `Estimate`…) are now shared constants used by the site that
  writes them and the server that reads them. Five new translated messages (`fr`, `en`, `mg`).
- Inventory updated: [Cloud Functions](../../../inventory/code/en/CLOUD_FUNCTIONS.md),
  [collections and indexes](../../../inventory/code/en/COLLECTIONS_AND_INDEXES.md). No new variable or service.

## Back-office

- **Pages touched**: **Contacts**, `http://localhost:5174/contacts` (both workspaces); the quote form of
  **Quotes**.
- The list follows the workspace; switching workspace from the page closes the open message and reloads the
  list. The export follows it too.
- Aldaron workspace, under a request, for an account that may create quotes: **Create the client and the
  quote** → the dialog "New quote for <name>", prefilled. After saving: "This request became quote AL-…"
  with **See the quotes**.
- The generic inbox gets a registry of actions a domain adds under a message (`registerContactDetailActions`):
  the quotes plug theirs in from the domain registrations, so the contacts code never imports quotes.
- Feature docs updated: [Contacts](../../../features/bo/contacts/fr/CONTACTS_LIST.FR.md),
  [Devis](../../../features/bo/quotes/fr/QUOTES.FR.md).

## Aldaron website

- **Pages touched**: none visibly. The contact page form (`/fr/contact`) sends `target: agency` with the
  request; the message text is the same, the estimate is still erased from the browser once sent.

## See the result locally

```bash
pnpm nx run server:dev        # needs a database in apps/server/.env.*
pnpm nx run bo:dev            # back-office on http://localhost:5174
pnpm nx run aldaron-web:dev   # the Aldaron site
```

Send the contact form of the Aldaron site, then in the back-office switch to the Aldaron workspace and open
**Contacts** (`http://localhost:5174/contacts`). No story: the touched site code has no story change, and the
back-office has no Storybook.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟡 Low | Hole | The unread badge and the global search still count and show the messages of both workspaces: a portfolio-only account sees an Aldaron request in the search (its detail then reads "not found") | always | ⏳ planned — ticket `190-scope-the-contact-badge-and-search-to-the-workspace` |
| 🟡 Low | Bug | Two saves of a quote from the same request at the same second both pass the check: two quotes, the request pointing to the last | two tabs, or a double click on Save | ⏳ deferred — [debt #1](debt/261123-feat-debt-site-quote-request-conversion.md#1-two-quotes-from-one-request-saved-at-the-same-moment) |
| 🟡 Low | Bug | A client created by the button stays when the quote form is closed without saving | the user cancels | ✅ accepted: the next click reuses it by e-mail; said in the feature page and in `recommendation.md` |
| 🟡 Low | Bug | A request sent before the branch has no target: it stays in the portfolio, with no button | old Aldaron requests | ⏳ planned — ticket `150-move-old-contacts-to-the-aldaron-target` |
| 🟢 Info | Hole | A forged public call can file a message in the Aldaron inbox | anyone with a valid reCAPTCHA token | ✅ accepted: the target is where a message is read, not a right; the reCAPTCHA and the rate limit still apply |

Regressions checked: `getContactsService` gained a `workspace` (default portfolio) and `getContacts` now
calls `resolveWorkspace`; its only back-office callers (list, first page, export) send the workspace.
`QuoteForm`, `QuoteFormDialog` and `createQuote` (bo service) gained optional arguments: "New quote", "Edit"
and "Create an amendment" pass none and behave as before. `composeQuoteMessage` writes the same text (the
constants hold the same labels). Server tests pass (97).

Deferred points: [debt file](debt/261123-feat-debt-site-quote-request-conversion.md).

## Result per acceptance criterion

| Criterion | Result | Proof |
|---|---|---|
| A quote request sent from the Aldaron site appears only in the Aldaron workspace contacts | partial: built, not run live | `app.mutation.ts` sends `target`; `contact.functions.ts` (`resolveWorkspace`, `isInWorkspaces`); `contentTargetQuery` |
| A user can create a client and a prefilled draft quote from that contact in one action | partial: built and prefill tested, not run live | `prepareQuoteFromContact`, `ContactQuoteAction.tsx`; `quote-request.utils.test.ts` (7 cases) |
| If a client with the same email exists it is reused, not duplicated | partial: built, not run live | `findOrCreateClientFromContactService` (normalized e-mail; the unique index still holds) |
| A contact already converted shows its quote and cannot be converted again | partial: built and validation tested, not run live | `getConvertibleContactService`, `linkContactToQuoteService`, the banner of `ContactQuoteAction.tsx` |
| The public form behaves exactly as before for the visitor | treated: diff read | only the label constants and the extra `target` param changed in `aldaron-web` |

Gaps with the plan: none. Not verified: every live case (no local database), listed in
`tickets/work/turn-a-site-quote-request-into-a-client-and-a-quote/tc-manual.md`.

## Checks run

- `pnpm nx run-many -t lint typecheck -p bo server aldaron-web shared-constants`: ok (warnings only, none on a
  changed file).
- `pnpm nx run server:test`: ok, 7 files, 97 tests.
- `pnpm nx run-many -t build -p server bo`: ok. `pnpm nx run aldaron-web:build`: Next compiled and generated
  the pages, then Nx failed on a Windows symlink privilege (os error 1314), a local environment issue.
- `pnpm check-i18n`, `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`: ok.

## What is left to do

The live cases of `tc-manual.md`, on pre-production; the badge and search scope
(`190-scope-the-contact-badge-and-search-to-the-workspace`); moving old contacts
(`150-move-old-contacts-to-the-aldaron-target`); the deferred point above.
