# Implementation — add the quote collection to the Aldaron workspace

## Goal

A back-office user working in the Aldaron workspace can write a draft quote for a client, see its total,
send it, and record it accepted (date and method), refused or expired; nobody else can see or call any of it.

## Read

- Ticket, design note `docs/code/design/en/ALDARON_QUOTES_CLIENTS_MISSIONS.md` (Quote, Server,
  Back-office, Improvements), the client ticket's work folder (same pattern, one step earlier).
- Code of the client collection on both sides (functions, service, trigger, validations, indexes,
  security constants, list page, dialog, redux, routes, menu, registry, rights), `resolveWorkspace`,
  `fromBO`, the settings page and its reducer, the form fields (`AutocompleteField`, `SelectField`,
  `DatePickerField`).
- Rules: parse-patterns (root + server), core-domain-boundary (bo + server), naming (no proper names in
  identifiers: the second workspace is `TargetEnum.AGENCY`), forms-and-state, theming, accessibility,
  inventory, feature-docs, implementation-completeness.

## Apps touched

| App | Change? | Why |
|---|---|---|
| `libs/shared-domain-types` | yes | `QuoteStatusEnum`, `QuoteAcceptanceMethodEnum`, `IQuoteLine` (server and bo) |
| `libs/shared-domain-constants` | yes | `quote` in `DOMAIN_COLLECTIONS`, the supported currencies and their decimals, the lengths and caps |
| `libs/shared-domain-utils` | yes | the total and the allowed transitions: the server computes them, the bo shows the same total live and offers only the allowed actions |
| `apps/server` | yes | types, validations, constants, utils + tests, counter, service, functions, trigger, client delete guard, indexes, CLP lists, i18n |
| `apps/bo` | yes | types, validation, service, redux, page, containers, route, menu, registry, rights, default currency setting, locales |
| `apps/web`, `apps/aldaron-web` | no | quotes are never public (design note "Website") |

## Approach

- **Same frame as the clients**: writes through Cloud Functions only (`fromBO` + `resolveWorkspace` on
  `TargetEnum.AGENCY`), `Quote` in `FUNCTION_ONLY_CLASSES` and `ALWAYS_LOCKED_CLASSES`, strict Zod
  schemas that refuse `number`, `totalAmount`, `paidAmount`, `status`, `version` and the dates.
- **Functions**: `getQuotes`, `getQuote`, `createQuote`, `updateQuote` (a draft only), `changeQuoteStatus`
  (`status` + `acceptanceMethod` when accepting). No delete function: a quote is refused or expired.
- **Number** `AL-<year>-<NNN>`: a `Counter` row per year (`quote-2026`), incremented with Parse's atomic
  `increment` in the `beforeSave` of the quote, **as its last step** (after every refusal), so a refused
  quote burns no number. A unique index on `Counter.name`; the first save of a year that loses the race
  to create the row reads it again. The year is the server's (UTC) year of the creation. 🔎 Deduction:
  a database failure between the increment and the quote write would still leave a gap; noted as a risk.
- **Money**: integers in the smallest unit of the quote's currency. A line total is
  `round(quantity × unitAmount)`, the tax `round(subtotal × taxRate / 100)`, the total their sum: one pure
  function in `libs/shared-domain-utils`, used by the trigger (source of truth) and the form (live).
  Quantities may hold 2 decimals (half days); the tax rate 2 decimals, 0 to 100, empty = no VAT.
- **Transitions**: one constant map `draft → sent → accepted | refused | expired` and a pure
  `canChangeQuoteStatus`. The trigger refuses any other move and any change of the content (client,
  title, lines, currency, tax rate, validity, notes) once the quote left `draft`. `issuedAt` is set the
  first time it becomes `sent`, `acceptedAt` + a required `acceptanceMethod` when it becomes `accepted`.
- **Client of a quote**: must exist and be `active` when the quote is created or its client changed.
  The `beforeDelete` of `Client` now refuses the deletion of a client that has quotes (the link left
  open by the client ticket).
- **List**: one tab per status after "All"; search on the number or the title; the client's name read
  through `include('client')` with a `select` on `client.name` / `client.email`, never copied.
- **Form**: a dialog (client picker with a "New client" shortcut reusing the client dialog, title, lines,
  currency, VAT rate, validity, notes, total computed live). Amounts are typed in the main unit
  (`12.50`) and converted to the smallest unit with the currency's decimals before the call.
- **Default currency**: a local preference of the back-office (`defaultCurrency` in the settings state,
  like the language), shown as a row of the "Languages" settings panel in the Aldaron workspace only.
  The panel is `_core`: it renders rows registered by the domain (`registerSettingsRows`, same pattern as
  `registerRightsEntities`), so `_core` never imports the quote code. It only prefills a new quote.
- **Acceptance proof file**: split into `025-attach-an-acceptance-proof-file-to-a-quote` (the file storage
  of the back-office is its own piece of work).

Discarded: storing the client's name on the quote (goes stale); computing the number in the browser
(gaps, duplicates); a default currency stored on the server (no Aldaron settings record exists; a
preference is enough to prefill, the decided rule is that the quote stores its own currency anyway).

## Files

Shared
- `libs/shared-domain-types/src/quote.type.ts` (to create) + `index.ts`
- `libs/shared-domain-constants/src/quote.constants.ts` (to create), `collections.constants.ts`, `index.ts`
- `libs/shared-domain-utils/src/quote.utils.ts` (to create) + `index.ts`, `package.json` (deps)

Server
- `src/types/quote.type.ts`, `src/constants/_domain/quote.constants.ts`
- `src/utils/_domain/quote.utils.ts` + `quote.utils.test.ts`
- `src/validations/_domain/quote.validations.ts` + `.test.ts`
- `src/cloud/services/_core/counter.service.cloud.ts`, `src/cloud/services/_domain/quote.service.cloud.ts`
- `src/cloud/functions/_domain/quote.functions.ts` + `functions/index.ts`
- `src/cloud/triggers/_domain/quote.triggers.ts` + `triggers/index.ts`; `client.triggers.ts` (delete guard)
- `src/config/db-indexes.ts`, `src/constants/_core/security.constants.ts`, `src/constants/_core/constants.ts`
- `src/config/i18n/locales/{fr,en,mg}/_domain/quote.json`, `src/config/i18n/index.ts`

Back-office
- `src/types/_domain/quote.type.ts`, `src/constants/_domain/quote.constants.ts`,
  `src/validations/_domain/quote.validation.ts`, `src/services/_domain/quote.service.ts`
- `src/redux/actions/_domain/quote.action.ts`, `src/redux/reducers/_domain/quote.reducer.ts`, `store.ts`
- `src/pages/_domain/quote/Quotes.tsx`, `src/containers/_domain/quote/*`
- `src/routes/protected/_domain/quote.routes.tsx`, `private.routes.tsx`, `utils/_core/pathnames.ts`
- `src/hooks/useNavigationMenus.tsx`, `src/constants/_core/workspace.constants.ts`
- `src/utils/_domain/quote-role.utils.ts`, `src/utils/_domain/quote-settings.utils.ts`,
  `src/config/domain-registrations.ts`
- settings: `types/_core/setting.type.ts`, `redux/reducers/_core/settings.reducer.ts`,
  `utils/_core/settings.utils.ts`, `containers/_core/settings/SettingsLanguagePanel.tsx`
- locales `src/config/i18n/locales/{fr,en,mg}/_domain/quote-*.json` + `index.ts`

Docs
- `docs/features/bo/quotes/fr/QUOTES.FR.md` (to create) + `docs/features/bo/README.md`
- `docs/inventory/README.md`, `docs/inventory/code/{en,fr}/*` (functions, collections and indexes, roles)
- design note "Order of work" step 3 and "Improvements" (both twins)

## Steps

1. Shared types, constants, utils.
2. Server: types, constants, utils + tests, validations + tests, counter, service, trigger, functions,
   client delete guard, indexes, CLP lists, i18n.
3. Bo: types, constants, validation, service, reducer, action, store, containers, page, route, menu,
   registry, rights, default currency, locales.
4. Docs, inventory, changeset.
5. Checks: lint, typecheck, server tests, build, check-i18n, docs checks.

## Data and security

- Class `Quote`: `number`, `client` (pointer), `title`, `status`, `lines` (≤ `QUOTE_LINES_MAX` = 50, fixed
  keys `label`, `quantity`, `unitAmount`), `currency`, `taxRate`, `totalAmount`, `paidAmount` (0 until the
  payments ticket), `issuedAt`, `validUntil`, `notes`, `version` (1), `acceptedAt`, `acceptanceMethod`,
  `createdBy`, `updatedBy`.
- Indexes: `{ number: 1, version: 1 }` unique; `{ _p_client: 1, status: 1 }` (client delete guard, later
  the client's quotes); `{ status: 1, issuedAt: -1 }` (list). `Counter`: `{ name: 1 }` unique.
- `Counter` is generic (`_core`), master key only (`ALWAYS_LOCKED_CLASSES`).

## Docs and inventory

- New feature page + README entry; settings feature doc if it lists the language panel's rows.
- Inventory: Cloud Code table (new functions and triggers files), functions, collections and indexes,
  roles. No env variable, no external service.

## Changes during the work

- The numbering year is read in the business time zone (`DEFAULT_COUNTRY.timeZone`, Antananarivo), not in
  UTC: found by the review, fixed with `getQuoteNumberYear` and a test.
- `@shared/domain-utils` now declares `@shared/domain-constants` and `@shared/domain-types` as
  dependencies (lockfile: two workspace links).
- The client picker reuses `fetchClients` through a new `searchActiveClients` action; `createOrUpdateClient`
  takes an optional `onCreated` callback so the quote form picks the client it just created.
- The settings registry is `registerSettingsRows` / `getSettingsExtraRows` in `utils/_core/settings.utils.ts`.

## Risks

- ⚠️ A gap is still possible if the database fails between the counter increment and the quote write.
- The live cases need a database: none on this machine (same as the client ticket).
