# Review — Add the client collection to the Aldaron workspace

- **Branch**: `feat/aldaron-client-collection`
- **Type**: New feature
- **Author**: tiavina-mika — `tiavinamika@gmail.com` *(local git identity)*
- **Created**: 2026-11-23 at 12:14
- **Apps touched**: Server, Back-office (and the shared libraries `shared-domain-constants`,
  `shared-domain-types`)

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

The Aldaron workspace gets its first business list: the clients Aldaron works for. A back-office user
working in Aldaron, with the matching rights, can list, search, create, edit and archive clients, and put
an archived client back in the list. One e-mail address, whatever its case, names one client. The entry
is hidden in the portfolio workspace, and the server refuses every client call to an account whose roles
do not open Aldaron. Nothing is public: the website is not touched. A role can now also be saved with
rights on a domain class (`Project`, `Client`), which the server used to refuse.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `Client` | yes | `name`, `kind` (`company` / `person`), `email` (stored trimmed and lowercase), `phone`, `address` (`line1`, `line2`, `postalCode`, `city`, `country`), `taxId`, `notes`, `status` (`active` / `archived` / `anonymized`), `createdBy`, `updatedBy` | the clients of the Aldaron workspace |

Indexes added:

- `{ email: 1 }`, unique, partial on a non-empty address (`clientEmail_unique`): one e-mail, one client,
  even when two saves run at the same moment; an anonymized client with an erased address never collides.
- `{ status: 1, name: 1 }`: the list, one tab (status) ordered or searched by name.

The class has no public access: its class-level permissions never mirror the role rights, only the
highest roles keep raw access; everything goes through the Cloud Functions.

## Server

- Five new Cloud Functions, each checking first that the account's roles open the Aldaron workspace, then
  the right on `Client`: list (`getClients`, search on name or e-mail, filter on kind and status, capped
  page size), read (`getClient`), create (`createClient`), edit (`updateClient`), archive or put back
  (`archiveClient`). There is no delete function.
- A `beforeSave` trigger on `Client` sets the status on creation, records who created and changed it,
  stores the e-mail in lowercase and refuses an address already used by another client, with a translated
  message naming that client.
- The input is validated strictly: the status, the authors or any unknown field are refused.
- The role validation now accepts the domain classes, so a role with a right on `Client` can be saved.
- Messages in `fr`, `en`, `mg`. Inventory updated: Cloud Code table of
  [docs/inventory/README.md](../../../inventory/README.md),
  [Cloud Functions](../../../inventory/code/en/CLOUD_FUNCTIONS.md),
  [collections and indexes](../../../inventory/code/en/COLLECTIONS_AND_INDEXES.md),
  [roles and permissions](../../../inventory/code/en/ROLES_AND_PERMISSIONS.md). No new env variable, no new
  service.

## Back-office

- **Pages touched**: **Clients** (new), `http://localhost:5173/clients` (French: `/clients`), in the
  sidebar group **Operations**, only while the active workspace is Aldaron; **Roles** (the Clients line
  now appears in the rights).
- The list has the tabs "All", "Active" and "Archived", a search box (name or e-mail), a filter on the
  kind, sorting and pagination. Each row shows the client, its kind, phone, dates and status.
- **New client** and **Edit** open a dialog over the list. A refusal (an address already used) keeps the
  dialog open with what was typed.
- The row menu archives a client, or puts an archived one back.
- From the portfolio workspace, the entry is absent and the address typed by hand goes back to the
  dashboard.
- Feature doc: [Clients](../../../features/bo/clients/fr/CLIENTS.FR.md), listed in the
  [BO features index](../../../features/bo/README.md).

## See the result locally

```bash
pnpm nx run server:dev
pnpm nx run bo:dev       # back-office on the Vite URL (http://localhost:5173 by default)
```

Sign in with an Owner account, Settings → Workspace → Aldaron, then sidebar → **Clients**
(`http://localhost:5173/clients`).

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟠 Medium | Hole | A raw SDK query on `Client` by a portfolio-only role holding every right on clients would skip the workspace check | a role opening Portfolio only, with rights on clients | ✅ fixed on the branch: `Client` takes no role grant in its class-level permissions (unit test `security.service.cloud.test.ts`) |
| 🟡 Low | Bug | Two saves of the same new address at the same moment: the second was refused by the unique index with Parse's raw English "duplicate value" message | two users create the same client in the same second | ✅ fixed on the branch: the index refusal is turned into the translated "already the one of the client …" |
| 🟡 Low | Bug | Switching to the portfolio workspace while the client list is open left the list on screen (the server refuses every new call) | workspace switch from the Clients page | ✅ fixed on the branch: the page goes back to the dashboard when the workspace is no longer Aldaron |
| 🟢 Low | Regression | The sidebar hook now filters entries by workspace for every group | portfolio sidebar | ✅ checked: the registry hides only `clients`, the portfolio sidebar is otherwise unchanged |

No deferred risk, no debt file. The live cases are not run (see [Checks run](#checks-run)).

## Result per acceptance criterion

| Criterion | Result | Proof |
|---|---|---|
| A user with the `aldaron` workspace and the `create` right can create a client | partial — code done, not run live | functions + dialog; validation test `client.validations.test.ts`; no local database to run it |
| Two emails that differ only by case give a single client | partial — code done, normalization tested | `client.utils.test.ts`; trigger + unique index not run live |
| A client can be edited and archived, and an archived client is filterable out of the list | partial — code done, not run live | `updateClient`, `archiveClient`, "Active" / "Archived" tabs |
| A portfolio-only user sees no client entry and cannot call the client functions | partial — CLP part tested | `security.service.cloud.test.ts`; menu registry; `resolveWorkspace` in every function, not run live |
| The sidebar entry shows only when the active workspace is Aldaron | partial — code done, not run live | `hiddenMenuIds` in the workspace registry |
| Labels and errors exist in `fr`, `en` and `mg` | treated | `pnpm check-i18n` |

Gaps with the plan: the delete guard (`beforeDelete`) is left as a `TODO(link:...)`, quotes and missions do
not exist yet; the class-level permissions were locked (`FUNCTION_ONLY_CLASSES`), which the plan had left
for later.

## Checks run

Nx hung on the machine (no output, a lock on `.nx/workspace-data`), so the app scripts were run directly:

| Command | Result |
|---|---|
| `pnpm --filter portfolio-server run typecheck` | ok |
| `pnpm --filter portfolio-bo run typecheck` | ok |
| `pnpm --filter portfolio-server run test` | ok, 4 files, 30 tests |
| ESLint on every touched server and bo file | 0 errors (one fast-refresh warning on the route file, the same as the existing project routes) |
| `pnpm check-i18n`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree`, `pnpm lint:docs` | ok |
| Build | left to the CI of the PR |

Not verified: every live case (a back-office session on a database). No local database is configured on
the machine that ran the work; the cases are listed in the ticket's `tc-manual.md`.

## What is left to do

- The live cases of `tc-manual.md` (create, duplicate e-mail, edit / archive / put back, portfolio-only
  account, sidebar per workspace, role saved with rights on clients).
- The delete guard, once quotes exist (`020-add-the-quote-collection-to-the-aldaron-workspace`).
- Anonymization (`120-anonymize-an-aldaron-client`).
