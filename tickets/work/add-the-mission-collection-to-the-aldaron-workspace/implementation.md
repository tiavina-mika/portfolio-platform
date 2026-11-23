# Implementation — add the mission collection to the Aldaron workspace

## Goal

A back-office user of the Aldaron workspace records the work that follows an accepted quote: a mission
for a client, optionally tied to the accepted quote, assigned to a teammate, moved forward through
`planned → inProgress → done` (or `cancelled`), with an optional phase inside each status.

## Read

- Ticket, design note `docs/code/design/en/ALDARON_QUOTES_CLIENTS_MISSIONS.md` ("Mission", "Mission
  lifecycle", "Server", "Back-office"), the quote ticket's work folder (same frame).
- Code of the quote and the client on both sides (functions, services, triggers, validations, indexes,
  security lists, list page, dialogs, client picker, redux, routes, menu, workspace registry, rights).
- `getUserWorkspaces` / `getRolesForUser` (assignee check), the role users relation.
- Rules: parse-patterns (root + server), core-domain-boundary, naming (no proper name in a stored value),
  forms-and-state, theming, accessibility, inventory, feature-docs, implementation-completeness.

## Apps touched

| App | Change? | Why |
|---|---|---|
| `libs/shared-domain-types` | yes | `MissionStatusEnum`, `MissionPhaseEnum` (server and bo) |
| `libs/shared-domain-constants` | yes | `mission` in `DOMAIN_COLLECTIONS`, title and description lengths |
| `libs/shared-domain-utils` | yes | transitions and phases per status: the server checks them, the bo offers only them |
| `apps/server` | yes | type, constants, utils + tests, validations + tests, service, functions, trigger, client delete guard, quote list filter by client, indexes, CLP lists, i18n |
| `apps/bo` | yes | type, constants, validation, service, redux, page, containers, route, menu, workspace registry, rights, locales, "Create the mission" on an accepted quote |
| `apps/web`, `apps/aldaron-web` | no | missions are never public (design note "Website") |

## Approach

- **Same frame as quotes**: writes through Cloud Functions only (`fromBO` + `resolveWorkspace` on
  `TargetEnum.AGENCY`), `Mission` in `FUNCTION_ONLY_CLASSES` and `ALWAYS_LOCKED_CLASSES`, strict Zod
  schemas (status refused in create / update input).
- **Functions**: `getMissions`, `getMission`, `createMission`, `updateMission`, `changeMissionStatus`,
  `getMissionAssignees`. No delete function.
- **Trigger `beforeSave`**: born `planned` whatever was sent; transitions from a shared map (no way back,
  `done` and `cancelled` final); a phase must belong to the status, and is cleared when the status
  changes; `startDate` / `endDate` filled with today on `inProgress` / `done` when empty; `endDate` not
  before `startDate`; client and quote frozen once the mission left `planned`; the client must be active
  on creation or change; the quote must be `accepted` and of the same client; the assignee must be a
  user whose roles open the Aldaron workspace.
- **Client delete guard**: the `beforeDelete` of `Client` also refuses a client with missions.
- **Assignee picker**: `getMissionAssignees` lists the users of the roles that open the Aldaron
  workspace (and the highest roles), name and e-mail only, capped. A user list read through `_User`
  rights would hide the teammates from a delivery role that has no right on users.
- **"My missions"**: an advanced-search toggle sending `search.mine`; the server compares `assignee` to
  the signed-in user, never to an id sent by the browser.
- **Quote picker**: accepted quotes of the chosen client; the quote list gets a `client` filter (index
  `_p_client + status` already covers it).
- **Client picker**: the quote form's picker is reused through a move to
  `containers/_domain/client/ClientPickerField.tsx` (DRY: two forms pick an active client).
- **"Create the mission"** on an accepted quote: a row action of the quote list, shown with the
  `create` right of missions, opening the mission dialog prefilled with client, title and quote.
- **Phase "cancelled by the agency"**: stored as `byAgency`, not the brand (naming rule).

## Files

Shared: `libs/shared-domain-types/src/mission.type.ts`, `libs/shared-domain-constants/src/mission.constants.ts`,
`collections.constants.ts`, `libs/shared-domain-utils/src/mission.utils.ts`, the three `index.ts`.

Server: `types/mission.type.ts`, `constants/_domain/mission.constants.ts`, `utils/_domain/mission.utils.ts`
(+ test), `validations/_domain/mission.validations.ts` (+ test), `cloud/services/_domain/mission.service.cloud.ts`,
`cloud/functions/_domain/mission.functions.ts`, `cloud/triggers/_domain/mission.triggers.ts`, both
`index.ts`, `client.triggers.ts`, quote validations + service (client filter), `config/db-indexes.ts`,
`constants/_core/security.constants.ts` (+ test), locales `{fr,en,mg}/_domain/mission.json` + client key,
`config/i18n/index.ts`.

Back-office: `types/_domain/mission.type.ts`, `constants/_domain/mission.constants.ts`,
`validations/_domain/mission.validation.ts`, `services/_domain/mission.service.ts`, redux action / reducer
+ `store.ts`, `pages/_domain/mission/Missions.tsx`, `containers/_domain/mission/*`,
`containers/_domain/client/ClientPickerField.tsx` (moved), `routes/protected/_domain/mission.routes.tsx`,
`private.routes.tsx`, `pathnames.ts`, `useNavigationMenus.tsx`, `workspace.constants.ts`,
`utils/_domain/mission-role.utils.ts`, `config/domain-registrations.ts`, quote page + quote service
(client filter), locales `{fr,en,mg}/_domain/mission-*.json` + `index.ts`.

Docs: `docs/features/bo/missions/fr/MISSIONS.FR.md` + README entry, quotes feature page (the new
action), inventory (README + code twins), design note step 4 (both twins), changeset.

## Data and security

- Class `Mission`: `title`, `client` (pointer), `quote` (pointer, optional), `status`, `assignee`
  (pointer `_User`, optional), `phase`, `startDate`, `endDate`, `description`, `createdBy`, `updatedBy`.
- Indexes: `{ _p_client: 1, status: 1 }` (client delete guard, client's missions), `{ status: 1,
  startDate: -1 }` (list), `{ _p_assignee: 1, status: 1 }` ("my missions").
- Read by id or listed by status / assignee; no unbounded array, no data-dependent key.

## Risks and ⚠️

- No database on this machine: the live cases (trigger on a real save) are proved by the unit tests of
  the pure rules and the typecheck, not by a real save.
