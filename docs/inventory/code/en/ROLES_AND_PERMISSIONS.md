# Roles and Permissions

## Table of Contents

- [Default roles](#default-roles)
- [Rights model](#rights-model)
- [How a check works](#how-a-check-works)
- [How the first Owner appears](#how-the-first-owner-appears)
- [Gotchas](#gotchas)

## Default roles

Defined in `libs/shared-constants/src/role.constants.ts` (shared by the server and the back-office).

| Role | Level | Notes |
|---|---|---|
| `Owner` | Highest | First of `HIGHEST_LEVEL_ROLES`, parent of every other role |
| `Administrator` | Highest | Second of `HIGHEST_LEVEL_ROLES` |
| `Manager` | Default | `DEFAULT_ROLES`; rights are set per entity |

Other roles can be created from the back-office (`createRole`, `updateRole`). Roles are stored in the Parse `_Role` collection.

## Rights model

A role carries two custom fields:

- `rights`: a list of `{ className, rights }` where `rights` is a map of booleans for the operations `create`, `update`, `get`, `find`, `delete`, `destroy`.
- `ui`: the back-office tabs or menus the role can see.

Entities that can receive rights in the back-office form (`apps/bo/src/constants/user.constants.ts`, `ENTITIES_WITH_RIGHTS_OPTIONS`): `_User`, `_Role`, `Article`, `Page`, `Project`, `Category`, `Contact`.

## How a check works

`hasRight(user, className, operations)` in `apps/server/src/cloud/utils/role.utils.cloud.ts`:

1. `Owner` and `Administrator` users always pass.
2. Otherwise every role of the user for the entity must grant every requested operation.

`fromBO(action, rights, className)` applies this check to a Cloud Function; with no `rights` argument it only requires a logged-in user. Server-side queries use the master key (`USE_MASTER_KEY`), so the check is the only guard of a back-office function.

## How the first Owner appears

The `OWNERS_EMAILS` variable (comma-separated emails) is read by `user.triggers.ts`: a user created with one of these emails gets the `Owner` role in `beforeSave`. The owner should be the first account created.

## Gotchas

- `hasRight` reads `roleForClassName.rights` without a guard: a role that has no entry for the entity makes the check throw instead of returning false.
- `role.triggers.ts` is not imported (see [Cloud Code](CLOUD_FUNCTIONS.md#gotchas)).
- `createDefaultRoles` is not called anywhere, so roles other than `Owner` are created by hand.
