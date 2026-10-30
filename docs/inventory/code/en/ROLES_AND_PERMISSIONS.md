# Roles and Permissions

## Table of Contents

- [Default roles](#default-roles)
- [Rights model](#rights-model)
- [How a check works](#how-a-check-works)
- [How the first Owners appear](#how-the-first-owners-appear)
- [Gotchas](#gotchas)

## Default roles

Names are defined in `libs/shared-constants/src/role.constants.ts` (shared by the server and the back-office); their labels and default rights in `apps/server/src/constants/_core/role.constants.ts`. Role names are written in capitals.

| Role | Level | Notes |
|---|---|---|
| `OWNER` | Highest | First of `HIGHEST_LEVEL_ROLES`; the role that does the OWNER-only actions (reset an administrator's MFA, revoke a super administrator) |
| `SUPER_ADMIN` | Highest | Second of `HIGHEST_LEVEL_ROLES` |
| `MANAGER` | Default | `DEFAULT_ROLES[0]`; rights are set per entity in the back-office |
| `SUPPORT_VIEWER` | Default | Read-only (`find`, `get`) on every class except the always-locked ones; sees the statistics page |
| `TEAM_LEAD` | Default | What `SUPPORT_VIEWER` reads, plus creating an account (used to invite a colleague); sees statistics and the staff management |

The default roles are created at boot by `ensureDefaultRolesExist` once the `SUPER_ADMIN` role exists. Other roles can be created from the back-office (`createRole`, `updateRole`). Roles are stored in the Parse `_Role` collection; the highest roles are children of every other role.

## Rights model

A role carries custom fields:

- `rights`: a list of `{ className, rights }` where `rights` is a map of booleans for the operations `create`, `update`, `get`, `find`, `delete`, `destroy`.
- `ui`: the back-office "ui" rights (`UIRoleEnum` in `apps/bo/src/types/_core/role.type.ts`): `migrations`, `cron`, `tests` (the tabs of the miscellaneous page), `impersonation`, `statistics`, `finance`, `broadcast`, `staff`. The server mirrors the ones it must enforce (for example `IMPERSONATION_UI_RIGHT`).
- `countries`: the countries the role is limited to (the `country-scope` trigger narrows queries accordingly).
- a custom back-office inactivity timeout, bounded between 15 and 480 minutes.

Entities that can receive rights in the back-office form: `_User`, `_Role`, `Article`, `Page`, `Category`, `Contact`, `Payment`, `Notification`, `Report`, `UserAuditLog` (`ENTITIES_WITH_RIGHTS_OPTIONS` in `apps/bo/src/constants/_core/user.constants.ts`), plus the entities a domain registers with `registerRightsEntities` (the `Project` domain does it in `apps/bo/src/utils/_domain/project-role.utils.ts`).

## How a check works

`hasRight(user, className, operations)` in `apps/server/src/cloud/utils/_core/role.utils.cloud.ts`:

1. `OWNER` and `SUPER_ADMIN` users always pass.
2. Otherwise the rights of the user's roles for the entity add up: each requested operation must be granted by at least one role.

`fromBO(action, rights, className)` applies this check to a Cloud Function; with no `rights` argument it only requires a logged-in user. `hasBoRight(user, uiRight)` checks a "ui" right. Server-side queries use the master key, so these checks are the guard of a back-office function. The Parse class-level permissions (CLP) are rebuilt from the roles at every boot (`rebuildAllCLP`); the classes in `ALWAYS_LOCKED_CLASSES` are never granted to a role.

## How the first Owners appear

At boot, `ensureOwnerInvitationsExist` (`invitation.service.cloud.ts`) sends a back-office invitation with the `OWNER` role (valid 90 days) to every `OWNERS_EMAILS` address that has neither an account nor a pending invitation. In local development the invitation link is logged instead of mailed. In `preProduction` and `production`, `validateEnv()` refuses to start with fewer than two distinct addresses (`MIN_OWNERS_COUNT`), and `warnIfTooFewOwners` logs a warning at every start while fewer than two accounts hold the role.

## Gotchas

- Databases created before the `_core`/`_domain` split hold the roles `Owner`, `Administrator` and `Manager`. The code now looks for `OWNER`, `SUPER_ADMIN` and `MANAGER`, and no migration job renames them: until they are renamed by hand, the existing accounts are no longer recognised as highest-level.
- `ensureDefaultRolesExist` does nothing while the `SUPER_ADMIN` role does not exist.
