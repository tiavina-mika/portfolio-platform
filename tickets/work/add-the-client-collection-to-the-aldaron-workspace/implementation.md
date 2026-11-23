# Implementation — add the client collection to the Aldaron workspace

## Goal

A back-office user working in the Aldaron workspace can list, create, edit and archive the clients
Aldaron works for; nobody else can see or call any of it.

## Read

- Ticket, design note `docs/code/design/en/ALDARON_QUOTES_CLIENTS_MISSIONS.md` (Decisions, Client,
  Server, Back-office, Order of work steps 1 and 2).
- `apps/server/CLAUDE.md` "Adding a New Domain Feature", `apps/bo/CLAUDE.md` same section.
- Rules: parse-patterns (root + server), error-messages, naming, typescript, core-domain-boundary,
  inventory, feature-docs, accessibility, theming, forms-and-state.
- Code: `project.*` on both sides (functions, service, validations, triggers, routes, reducer, action),
  `category` list page + form dialog, `resolveWorkspace` / `fromBO`, `db-indexes.ts`, `WORKSPACES`,
  `useNavigationMenus`, `registerRightsEntities`.

## Apps touched

| App | Change? | Why |
|---|---|---|
| `libs/shared-domain-constants` | yes | `client` in `DOMAIN_COLLECTIONS` |
| `libs/shared-domain-types` | yes | `ClientKindEnum`, `ClientStatusEnum`, `IClientAddress` (server and bo both use them) |
| `apps/server` | yes | type, validations, constants, service, functions, trigger, indexes, i18n, tests |
| `apps/bo` | yes | type, validation, service, redux, page, containers, route, menu, registry, rights, locales |
| `apps/web`, `apps/aldaron-web` | no | the collection is never public (design note "Website") |

## Approach

- **Writes go through Cloud Functions**, not the Parse SDK from the browser (unlike `Project`): every
  function must check `resolveWorkspace(user, ALDARON)` first, which a direct `object.save()` cannot do.
  Functions: `getClients`, `getClient`, `createClient`, `updateClient`, `archiveClient` (with
  `archived: boolean`, so a client archived by mistake can be put back). No delete function.
- **Computed/closed fields refused**: create/update schemas are `strictObject`s that do not accept
  `status`; status only moves through `archiveClient`. `anonymized` is never set here (ticket 120).
- **One e-mail = one client**: the `beforeSave` trigger trims and lowercases the e-mail, then refuses a
  second client holding it (translated error). A unique partial index on `email` (`$gt: ''`, so an
  anonymized client with an erased e-mail does not collide) holds under concurrent saves.
- **List**: active clients by default; the "Archived" tab flips the `status` filter. Search box on
  name / e-mail, advanced filter on kind. Pagination from the generic list.
- **Form**: a small dialog (create and edit), like the profile dialog, not a full-screen CMS form: a
  client has ~10 plain fields and no translations.
- **Sidebar**: `IWorkspaceConfig.hiddenMenuIds` (mirrors `hiddenSettingsSections`); the portfolio hides
  `PATH_NAMES.clients`. The hook filters generically: no `if` per workspace.
- **Route typed by hand** in the portfolio workspace: `onClientsEnter` throws `Errors.redirect` (back to
  the dashboard). The server would refuse anyway.
- **Rights**: `registerRightsEntities` from `utils/_domain/client-role.utils.ts`, imported in
  `config/domain-registrations.ts`.
- **i18n (bo)**: keys under the domain namespace `project` (`project:client.*`) through a new
  `_domain/client-entity.json` merged like `project-entity.json`, and `route:clients` through a new
  `_domain/client-route.json`.
- **Delete guard**: the ticket's "trigger refusing the deletion of a client that has quotes or missions
  (once those exist)". Neither collection exists yet, so the guard is a `TODO(link:...)` to wire with
  `020-add-the-quote-collection-to-the-aldaron-workspace` / `050-add-the-mission-collection-...`. No
  delete function exists and `delete` belongs to the owner, so nothing can delete a client from the bo.

Discarded: saving clients through the Parse SDK with CLPs (no workspace check possible); a full-screen
form (overkill); an `if (workspace === ALDARON)` in the menu hook (the design note asks for the registry).

## Files

Shared
- `libs/shared-domain-constants/src/collections.constants.ts` — `client: 'Client'`
- `libs/shared-domain-types/src/client.type.ts` (to create) + `index.ts`

Server
- `src/types/client.type.ts` (to create) — `IClientAttributes`
- `src/constants/_domain/client.constants.ts` (to create) — list fields, limits, searchable fields
- `src/validations/_domain/client.validations.ts` (to create) + `.test.ts`
- `src/utils/_domain/client.utils.ts` (to create) — `normalizeClientEmail` + `.test.ts`
- `src/cloud/services/_domain/client.service.cloud.ts` (to create)
- `src/cloud/functions/_domain/client.functions.ts` (to create) + `functions/index.ts`
- `src/cloud/triggers/_domain/client.triggers.ts` (to create) + `triggers/index.ts`
- `src/config/db-indexes.ts` — `email` unique partial, `status` + `name`
- `src/config/i18n/locales/{fr,en,mg}/_core/common.json` — error keys (server i18n has no `_domain`
  files yet; the existing `error` namespace is where every thrown error lives)

Back-office
- `src/types/_domain/client.type.ts`, `src/validations/_domain/client.validations.ts`
- `src/constants/_domain/client.constants.ts`
- `src/services/_domain/client.service.ts`
- `src/redux/actions/_domain/client.action.ts`, `src/redux/reducers/_domain/client.reducer.ts`, `store.ts`
- `src/pages/_domain/client/Clients.tsx`
- `src/containers/_domain/client/` — form dialog, search, cells
- `src/routes/protected/_domain/client.routes.tsx` + `private.routes.tsx`
- `src/hooks/useNavigationMenus.tsx`, `src/constants/_core/workspace.constants.ts`,
  `src/types/_core/setting.type.ts`, `src/utils/_core/pathnames.ts`
- `src/utils/_domain/client-role.utils.ts` + `src/config/domain-registrations.ts`
- locales `src/config/i18n/locales/{fr,en,mg}/_domain/client-*.json` + `index.ts`

Docs
- `docs/features/bo/clients/CLIENTS.FR.md` (to create) + `docs/features/bo/README.md`
- `docs/inventory/README.md` — Cloud Code table
- design note "Order of work" steps 1–2 ✅ (both twins)

## Steps

1. Shared constants and enums.
2. Server: types, constants, utils + tests, validations + tests, service, trigger, functions, indexes, i18n.
3. Bo: types, constants, validation, service, reducer, action, store, containers, page, route, menu,
   registry, rights, locales.
4. Docs and inventory.
5. Checks: lint, typecheck, server tests, build, check-i18n, docs checks.

## Data and security

- Class `Client`, fields of the design note. Indexes: `{ email: 1 }` unique partial on `email > ''`,
  `{ status: 1, name: 1 }` (list: status filter, ordered by name).
- Every function: `fromBO(handler, [right], 'Client')` + `resolveWorkspace(user, ALDARON, locale)`.
- The list caps `limit` with a named constant (`CLIENT_LIST_MAX_LIMIT`).
- No CLP change: classes are created on first save; the bo never queries `Client` directly.
  🔎 Deduction: master-key-only CLPs are not set per class anywhere in the repo today
  (`security.service.cloud.ts` is the only CLP touch); left as is, noted in `remaining.md`.

## Docs and inventory

- `docs/features/bo/` new page + README entry; `docs/inventory/README.md` Cloud Code rows.
- No env variable, no external service.

## Risks

- ⚠️ Index creation on a fresh DB: the class does not exist until the first save; `ensureDatabaseIndexes`
  already tolerates it.
- Switching workspace while the client list is open: the menu entry disappears; the page stays until
  the next navigation (the server keeps refusing new calls).
