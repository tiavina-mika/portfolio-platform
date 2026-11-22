---
type: feat
apps: [libs, server, bo]
branch:
pr:
---

## Context

First collection of the Aldaron workspace: the clients Aldaron works for. Design note:
`docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md` (sections "Décisions", "Client", "Serveur",
"Back-office"). Step 1 and 2 of its work order. Client comes first so that a quote has a real `client`
pointer (the note recommends this order).

The code lives under `_domain/` (server and bo). Every Cloud Function starts with
`resolveWorkspace(user, TargetEnum.ALDARON, locale)` and is wrapped in `fromBO`. No `target` field.
Not public: nothing in `apps/web` or `apps/aldaron-web`.

## To do

- Shared: `Client` in `DOMAIN_COLLECTIONS`, `ClientKindEnum`, `ClientStatusEnum` (`active`, `archived`,
  `anonymized`).
- Server: type, Zod validation, constants, service (`select()` + named `limit()`), functions (list, get,
  create, update, archive; no hard delete), trigger refusing the deletion of a client that has quotes or
  missions (once those exist), indexes declared in code (`email`, `status` + `name`), i18n `fr` / `en` /
  `mg`. Email stored lowercase.
- Bo: types, validation, service, redux action + reducer, list (filters, pagination), form, route, sidebar
  entry shown only in the Aldaron workspace through the `WORKSPACES` registry, rights registered through
  `registerRightsEntities`, locales.
- Docs: French feature page and its entry in `docs/features/bo/README.md`; Cloud Code table of
  `docs/inventory/README.md`.

## Out of scope

- Anonymisation (see `120-anonymize-an-aldaron-client`).
- Quotes, missions, payments.

## Acceptance criteria

- [ ] A user with the `aldaron` workspace and the `create` right can create a client from the back-office
- [ ] Two emails that differ only by case give a single client
- [ ] A client can be edited and archived, and an archived client is filterable out of the list
- [ ] A user limited to the portfolio workspace sees no client entry and cannot call the client functions
- [ ] The sidebar entry shows only when the active workspace is Aldaron
- [ ] Labels and errors exist in `fr`, `en` and `mg` (`pnpm check-i18n` passes)

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note, first of the Aldaron collections.
