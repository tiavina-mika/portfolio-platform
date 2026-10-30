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

Access control rests on Parse `_Role` objects. A role carries custom fields:

- `rights`: a list of `{ className, rights: { create, find, get, update, delete, destroy } }`, one entry per collection (booleans);
- `ui`: back-office areas the role opens (`UIRoleEnum` in `apps/bo/src/types/_core/role.type.ts`: `migrations`, `cron`, `tests`, `impersonation`, `statistics`, `finance`, `broadcast`, `staff`);
- `countries`: countries the role is limited to, and an optional inactivity timeout (15 to 480 minutes).

The roles page of the back-office (`apps/bo/src/containers/_core/roles/RoleForm.tsx`) edits them. The collections offered are `ENTITIES_WITH_RIGHTS_OPTIONS` (`_User`, `_Role`, `Article`, `Page`, `Category`, `Contact`, `Payment`, `Notification`, `Report`, `UserAuditLog`) plus the entities the domain registers with `registerRightsEntities` (`Project`, in `apps/bo/src/utils/_domain/project-role.utils.ts`), see [CORE_DOMAIN.md](CORE_DOMAIN.md).

## Default roles

Names in `libs/shared-constants/src/role.constants.ts`, labels and default rights in `apps/server/src/constants/_core/role.constants.ts`. Names are in capitals.

| Role | Level | Meaning |
|---|---|---|
| `OWNER` | highest (`HIGHEST_LEVEL_ROLES[0]`) | does the owner-only actions (reset an administrator's MFA, revoke a super administrator) |
| `SUPER_ADMIN` | highest (`HIGHEST_LEVEL_ROLES[1]`) | every right on every collection |
| `MANAGER` | default (`DEFAULT_ROLES[0]`) | rights set per entity in the back-office |
| `SUPPORT_VIEWER` | default | read only, sees the statistics |
| `TEAM_LEAD` | default | reads like `SUPPORT_VIEWER`, can invite a colleague, sees the staff management |

The two highest roles pass every check without a `rights` entry, on the server (`hasRight`) and in the back-office. Default roles are created at boot by `ensureDefaultRolesExist`, once `SUPER_ADMIN` exists.

Older databases hold `Owner`, `Administrator` and `Manager`. No job renames them: see the review debt file of the branch.

How the first owners appear: at boot `ensureOwnerInvitationsExist` sends a back-office invitation with the `OWNER` role (valid 90 days) to every `OWNERS_EMAILS` address that has no account and no pending invitation. In `preProduction` and `production`, `validateEnv` refuses to start with fewer than two distinct addresses.

## Rights model

| Concept | Where |
|---|---|
| `rights` entry per collection | `_Role.rights` |
| `ui`, `countries`, timeout | `_Role.ui`, `_Role.countries` |
| Role hierarchy | `_Role.roles`: the highest roles are children of every other role |
| Roles of a user | `_Role.users` relation |
| Class-level permissions | rebuilt from the roles at every boot (`rebuildAllCLP`); classes in `ALWAYS_LOCKED_CLASSES` are never granted |

## Assigning roles

Cloud Functions in `apps/server/src/cloud/functions/_core/role.functions.ts`: `hasRole`, `addRolesToUser`, `removeRolesForUser`, `createRole`, `updateRole`, `getRolesDelegation`, `getRoleAuditLogs`, `getHighestRoleAccounts`. A role can also be given by an invitation (`sendBOInvitation`): the roles land once the invited address is verified. Changes to roles are written to a roles journal.

## Checks on the server

In `apps/server/src/cloud/utils/_core/`:

- `parseFunction(fn)`: logs the call and normalizes errors, no authorization.
- `fromBO(fn, rights?, className?)`: requires a logged-in user; with `rights`, also `hasRight(user, className, rights)`.
- `hasRight(user, className, operations)`: highest roles pass; otherwise each requested operation must be granted by at least one role of the user.
- `hasBoRight(user, uiRight)`: checks a `ui` right.
- The `country-scope` trigger narrows queries to the countries of the role.

Queries then run with the master key, so these checks are the guard of a back-office function.

## Checks in the back-office

`canAccessTo` and `getRights` (`apps/bo/src/utils/_core/role.utils.ts`) give `canCreate`, `canFind`, `canPreview`, `canEdit`, `canDelete`, `canDestroy`; `useProtect(className)` returns them to a component. The sidebar (`useNavigationMenus.tsx`) shows an entry when the user can `find` the class or has the `ui` right. Route loaders and thunks apply the same options. These checks only shape the interface; the server enforces.

## Public website

No roles. The website reads through Cloud Functions that filter on `deleted: false` and `active: true` (`getProjectForClient`, `getArticleForClient`, ...) and sends the contact form and the newsletter subscription through public Cloud Functions (`createPublicContact`, `subscribeToNewsletter`).

## Known gaps

- Roles `Owner`, `Administrator`, `Manager` of an existing database are not renamed (see above).
- The `Diffusion` (broadcast) menu entry has no `hasRightName`, so it is hidden for everyone; `Settings` is visible only to the highest roles.
- Content-version restore is not wired for `Project`.
