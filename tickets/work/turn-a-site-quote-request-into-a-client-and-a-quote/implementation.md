# Implementation — turn a site quote request into a client and a quote

## Goal

A quote request sent from the Aldaron site is filed in the Aldaron workspace only, and a back-office user
turns it into a client and a prefilled draft quote from the contact detail, once.

## Read

- Ticket, design note (fr) "Demandes de devis du site", the quote and client tickets' work folders.
- Code: `contact.functions.ts`, `contact.service.cloud.ts`, `contact.triggers.ts`, contact validations,
  `contentTargetQuery`, `isInWorkspaces`, `resolveWorkspace`, the quote and client functions and services;
  aldaron-web `createQuoteRequest`, `composeQuoteMessage`, `buildRecap`; bo contact action, page, detail,
  quote form, dialog, client field, the settings registry (`registerSettingsRows`) as the pattern.
- Rules: core-domain boundary (Contact is `_core`, Client / Quote are `_domain`), parse-patterns,
  implementation-completeness, feature-docs, inventory, i18n.

## Apps touched

| App | Change? | Why |
|---|---|---|
| `libs/shared-constants` | yes | the line labels of the quote request message: a contract between aldaron-web (writes) and the server (reads) |
| `apps/server` | yes | `target` on `Contact`, workspace on the contact list and detail, `quote` pointer, `prepareQuoteFromContact`, `createQuote` with `contact`, index, i18n |
| `apps/aldaron-web` | yes | `createQuoteRequest` sends `target: agency`; the message uses the shared labels. No visible change |
| `apps/bo` | yes | contact list follows the workspace; a registry of contact detail actions in `_core`; the domain action, the prefilled quote dialog, locales |
| `apps/web` | no | the portfolio contact form sends no target: its rows read as `portfolio` |

## Approach

- **`target` on Contact** (core: `TargetEnum` is generic): `createPublicContact` takes an optional
  `target`, and stores `portfolio` when absent. Old rows carry none and read as `portfolio`
  (`contentTargetQuery(query, workspace, 'target')`, `isInWorkspaces`).
- **List and detail**: `getContacts` resolves the workspace with `resolveWorkspace` (same as articles);
  `getContact` answers `false` for a contact outside the account's workspaces.
- **Conversion, two server steps** (domain, `quote.functions.ts`):
  1. `prepareQuoteFromContact({ id })` (`create` on Quote): the contact must exist, be in the bin no, be an
     Aldaron one and not converted yet. It reuses the client holding the same e-mail (normalized), or creates
     one (`individual`, name, e-mail, phone) — this needs `create` on Client too, checked inside. It returns
     the client and the prefill of the quote (title = the product line, one line per estimate line, at 0).
  2. The bo opens the usual quote dialog prefilled; saving calls `createQuote` with `contact`, which checks
     the contact again and sets `Contact.quote` after the quote is written.
  Why two steps: the existing dialog and its client picker are reused as they are, and the user can still
  change the lines before anything is written. A cancelled dialog leaves a client with no quote: harmless,
  the next click reuses it.
- **Prefill parsing** on the server (it has the test runner), from the message aldaron-web writes; the
  labels (`Product`, `Estimate`…) become shared constants used by both sides.
- **Bo registry**: `registerContactDetailActions` in `utils/_core/contact.utils.ts`, same pattern as
  `registerSettingsRows`; the domain registers `ContactQuoteAction` from `config/domain-registrations.ts`.
- **Converted contact**: the action shows the quote number (read with `getQuote`) instead of the button.

## Files

Shared: `libs/shared-constants/src/contact.constants.ts`.

Server: `validations/_core/contact.validations.ts`, `cloud/functions/_core/contact.functions.ts`,
`cloud/services/_core/contact.service.cloud.ts`, `cloud/services/_domain/contact-quote.service.cloud.ts`
(to create), `utils/_domain/quote-request.utils.ts` + test (to create), `validations/_domain/quote.validations.ts`
+ test, `cloud/functions/_domain/quote.functions.ts`, `config/db-indexes.ts`, locales `quote.json`.

Aldaron-web: `server/mutations/app.mutation.ts`, `utils/contact.utils.ts`.

Bo: `types/_core/contact.type.ts`, `utils/_core/contact.utils.ts`, `containers/_core/contacts/ContactDetail.tsx`,
`redux/actions/_core/contact.action.ts`, `pages/_core/contacts/Contacts.tsx`, `services/_domain/quote.service.ts`,
`redux/actions/_domain/quote.action.ts`, `types/_domain/quote.type.ts`, `containers/_domain/quote/QuoteForm.tsx`,
`QuoteFormDialog.tsx`, `ContactQuoteAction.tsx` (to create), `utils/_domain/quote-contact.utils.ts` (to create),
`config/domain-registrations.ts`, locales.

Docs: `docs/features/bo/…/CONTACTS*.FR.md`, `QUOTES.FR.md`, `docs/inventory/` (new function), design note
order of work (both twins).

## Data and security

- `Contact.target` (string, `TargetEnum`), `Contact.quote` (pointer `Quote`). Index `{ target: 1, deleted: 1,
  createdAt: -1 }` for the list of one workspace (the portfolio branch also reads rows with no target).
- Both fields are written by Cloud Code with the master key only; `Contact` is already function-only.

## Risks

- Two saves of a quote from the same contact at the same second both pass the check: the second would
  overwrite the pointer. Rare (one person clicks); noted in the review.
