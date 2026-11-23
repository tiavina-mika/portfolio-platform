---
type: feat
apps: [libs, server, bo]
branch: feat/aldaron-client-collection
pr: https://github.com/tiavina-mika/portfolio-platform/pull/39
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
- [x] Labels and errors exist in `fr`, `en` and `mg` (`pnpm check-i18n` passes)

## Comments

### 2026-11-22 · Claude · backlog
Written from the design note, first of the Aldaron collections.

### 2026-11-22 · Claude · in-progress
Taken by `/dev --auto`. Branch `feat/aldaron-client-collection` from `develop`.

### 2026-11-23 · Claude · to-test
**What changed**: a `Client` collection for the Aldaron workspace. Server: five Cloud Functions (`getClients`,
`getClient`, `createClient`, `updateClient`, `archiveClient`), each checking the Aldaron workspace then the
right; a `beforeSave` trigger (lowercase e-mail, one e-mail = one client); a unique partial index on `email`
and an index on `status` + `name`; class-level permissions that never mirror the role rights; role
validation accepting the domain classes. Back-office: the Clients list (tabs, search, kind filter,
pagination), a create / edit dialog, archive and put back, a sidebar entry hidden in the portfolio
workspace through the workspace registry, rights in the Roles page, locales `fr` / `en` / `mg`. Docs:
feature page, BO index, inventory, design note.

**Branch / PR**: `feat/aldaron-client-collection`, https://github.com/tiavina-mika/portfolio-platform/pull/39.

**What Claude ran**: Nx hung on the machine (no output, a lock on `.nx/workspace-data`), so the app
scripts ran directly: server and bo typecheck ok; server tests ok (4 files, 30 tests); ESLint on every
touched file, 0 errors; `pnpm check-i18n`, `check-doc-links`, `check-doc-twins --worktree`, `lint:docs` ok.
Build: proved by the CI. Review: `docs/code/reviews/en/261123-feat-aldaron-client-collection.md` (three
risks found and fixed on the branch, no debt).

**How to test**: follow `tickets/work/add-the-client-collection-to-the-aldaron-workspace/tc-manual.md`,
in pre-production or locally with `/rd` on a database: create a client in Aldaron, retry the same e-mail
in other capitals (refused), edit / archive / filter / put back, sign in with a portfolio-only role (no
entry, `/clients` goes back to the dashboard), switch the workspace as Owner (entry only in Aldaron), save
a role with rights on Clients.

**Not verified**: every live case (criteria 1 to 5 unticked), no local database on the machine.

**What is left** (`tickets/work/add-the-client-collection-to-the-aldaron-workspace/remaining.md`): the
live cases; the delete guard, `TODO(link:020-add-the-quote-collection-to-the-aldaron-workspace)`;
anonymization (`120-anonymize-an-aldaron-client`); the decisions of `recommendation.md` to validate
(tabs, putting back, dialog, Cloud Functions only, role rights on domain classes, delete guard deferred);
the local build left to the CI. Delivered: `implemented.md`.
