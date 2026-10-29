# Rights and Roles

## Table of Contents

- [Overview](#overview)
- [Default roles](#default-roles)
- [Rights model](#rights-model)
- [Assigning roles](#assigning-roles)
- [Checks on the server](#checks-on-the-server)
- [Checks in the back-office](#checks-in-the-back-office)
- [Public website](#public-website)
- [Known gaps](#known-gaps)

## Overview

Access control rests on Parse `_Role` objects. A role carries two custom fields:

- `rights`: a list of `{ className, rights: { create, find, get, update, delete, destroy } }`, one entry per collection (booleans);
- `ui`: a list of back-office areas the role opens (`miscellaneous`, `tests`, from `UIRoleEnum` in `apps/bo/src/types/role.type.ts`).

The back-office exposes them in the roles page (form `apps/bo/src/containers/roles/RoleForm.tsx`): a table of collections (`_User`, `_Role`, `Article`, `Page`, `Project`, `Category`, `Contact`, from `ENTITIES_WITH_RIGHTS_OPTIONS`) with the six rights, and the `ui` list.

## Default roles

Defined in `libs/shared-constants/src/role.constants.ts`:

| Role | Constant | Meaning |
|---|---|---|
| `Owner` | `HIGHEST_LEVEL_ROLES[0]` | highest level, the first account |
| `Administrator` | `HIGHEST_LEVEL_ROLES[1]` | highest level |
| `Manager` | `DEFAULT_ROLES` | default role, with the rights that an administrator gives it |

`Owner` and `Administrator` are the "highest level" roles: they are treated as having every right on every collection, both on the server (`hasRight`) and in the back-office (`canAccessTo`, `getRights`), without any `rights` entry.

How the roles come to exist:

1. A user signing up with an email listed in `OWNERS_EMAILS` is given `Owner` (`afterSave` of `_User`); `createRole` creates the role if it does not exist yet.
2. `createRole` gives every new role a public read ACL and write access limited to the highest-level roles, and adds the existing `Owner` and `Administrator` roles to its `roles` relation so they inherit it.
3. Other roles (`Manager` or custom names) are created the same way: either when an administrator creates one in the back-office (`createRole` Cloud Function), or on the fly when `addOrUpdateRolesToUser` names a role that does not exist.

## Rights model

| Concept | Where |
|---|---|
| `rights` entry per collection | `_Role.rights`, edited in the roles page |
| `ui` entries | `_Role.ui` |
| Role hierarchy | `_Role.roles` (parent roles), filled by `createRole` / `updateRole` from `parentRoleNames` |
| Roles of a user | `_Role.users` relation, changed by `updateRoleForUser` / `removeRolesForUser` |

`updateRoleForUser(roleNames, user)` makes the roles of a user equal to the given list: it adds the missing ones and removes the others.

## Assigning roles

Cloud Functions in `apps/server/src/cloud/functions/role.functions.ts`:

| Function | Guard | Purpose |
|---|---|---|
| `getUserRoles` | `parseFunction` | roles of the caller, or of `userId` |
| `hasRole` | `parseFunction` | whether the caller has one of `roleNames` |
| `addOrUpdateRolesToUser` | `fromBO` | set the roles of a user |
| `removeRolesForUser` | `fromBO` | remove every role of a user |
| `createRole`, `updateRole` | `fromBO` | create or update a role with its parents, `rights` and `ui` |

The back-office thunks are in `apps/bo/src/redux/actions/role.action.ts`.

## Checks on the server

Building blocks in `apps/server/src/cloud/utils/utils.cloud.ts` and `role.utils.cloud.ts`:

- `parseFunction(fn)`: logs the call and normalizes errors. It does not check who is calling.
- `fromBO(fn, rights?, className?)`: rejects the call when there is no `request.user`; when a `rights` list is given, also requires `hasRight(user, className, rights)`.
- `hasRight(user, className, operations)`: true for the highest-level roles; otherwise finds the roles of the user that have a `rights` entry for the class and returns true when every such role grants every requested operation.
- `isAdministrator(user)`: true when the user has `Owner` or `Administrator`.
- `cloudValidationRules`: a validator for `Parse.Cloud` definitions that requires a logged-in administrator (and lets calls from `isExpressApi` or a deleted-user context through).
- `protectionMiddleware`: for Express routes, see [AUTH.md](AUTH.md).

Almost every back-office Cloud Function is wrapped with `fromBO`, so it needs a logged-in user. Only `getProjects` and the test functions (`createBatchTest`) pass a `rights` list. Server code usually runs with the master key (`USE_MASTER_KEY`) after that check, so class-level permissions are not what stops a logged-in user from calling a function.

## Checks in the back-office

- The roles of the current user are loaded when a dashboard page is entered (`onDashboardEnter`), together with `isAdmin` (the `hasRole` Cloud Function with the highest-level roles).
- `canAccessTo(roles, className, action, uiRight)` and `getRights(roles, className, uiRight)` (`apps/bo/src/utils/role.utils.ts`): the highest-level roles pass; otherwise the first role with a `rights` entry for the class decides `canCreate`, `canFind`, `canPreview`, `canEdit`, `canDelete`, `canDestroy`; a `uiRight` is granted when a role lists it in `ui`.
- `useProtect(className)` returns those flags to a component to show or hide buttons.
- The sidebar (`SideBar.tsx`) shows an entry when the user can `find` the class, or has the `ui` right for the Miscellaneous and Tests entries.
- Route loaders use `onEnterActionWithLoader` with `collection` / `action` / `uiRight` options: a user without the right who has at least one role is sent to the not-found page; thunks wrapped by `actionWithLoader` with the same options throw the translated `common:errors.unauthorizedAction` message.

These checks only shape the interface. The enforcement is on the server.

## Public website

The website has no roles. It reads and writes through Parse Server as an anonymous client: server queries in `apps/web/server/queries` and Cloud Functions such as `getArticleForClient`, which filter on `deleted: false` and `active: true`, and it creates `Contact` and `Newsletter` objects directly (their `beforeSave` triggers validate and complete them).

## Known gaps

Observed in the code, not decided here:

- `role.triggers.ts` (creation of the other default roles after `Owner`, protection of role deletion) is not imported in `triggers/index.ts`, so those triggers are not registered. `createDefaultRoles` is not called anywhere.
- `setCLPFromRights` (class-level permissions derived from a role's rights) is defined but never called, and no class-level permission is declared in this repository: they depend on what is configured in the database. The server also allows client class creation (`allowClientClassCreation: true`).
- Many read functions are wrapped by `parseFunction` only (for example `getUser`, `getUserByEmail`, `sendEmailToUser`, `getObjectsCount`, `saveUserLanguage`), so they do not require a logged-in user.
