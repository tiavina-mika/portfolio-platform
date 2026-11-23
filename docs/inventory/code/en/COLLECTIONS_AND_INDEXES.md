# Collections and Indexes

## Table of Contents

- [Collections](#collections)
- [Indexes](#indexes)
- [Schema rules](#schema-rules)
- [Gotchas](#gotchas)

## Collections

Domain class names are in `libs/shared-domain-constants` (`DOMAIN_COLLECTIONS`); core class names in the server constant `collections` (`apps/server/src/constants/_core/constants.ts`). Parse also keeps its own built-in collections.

| Collection | Holds | Used by |
|---|---|---|
| `Project` (domain) | Portfolio projects | server, bo, web |
| `Client` (domain) | Clients of the Aldaron workspace; reached through their Cloud Functions only, never public | server, bo |
| `Mission` (domain) | Missions of the Aldaron workspace: title, client and accepted quote pointers, assignee, status and phase, start and end dates; reached through their Cloud Functions only, never public | server, bo |
| `Quote` (domain) | Quotes of the Aldaron workspace: number, client pointer, lines, currency, VAT rate, total and status computed by the server; reached through their Cloud Functions only, never public | server, bo |
| `Article` | Blog articles (translated content, `active`, `deleted` flags) | server, bo, web |
| `Page` | Editorial pages | server, bo, web |
| `PageSection` | Sections grouping the pages | server, bo, web |
| `Category` | Categories of articles and pages | server, bo, web |
| `Contact` | Messages of the website contact forms; `target` names the workspace it is read in (none = portfolio), `quote` the quote an Aldaron request became | server, bo, web, aldaron-web |
| `Newsletter` | Newsletter subscriptions (double opt-in, confirmed through a hashed token) | server, web |
| `App` | Site-wide settings, including the `image`, `imageForDarkMode` and `cv` files (old files are deleted from Cloudinary on change) | server, bo, web |
| `Notification`, `NotificationResend` | Notifications sent from the back-office and their re-sends | server, bo |
| `UserAuditLog`, `RoleAuditLog`, `SessionAuditLog`, `MfaAuditLog`, `UserModerationLog` | Audit trails (locked, written by the server only) | server, bo |
| `UserSession` | Devices and sessions | server |
| `Invitation` | Back-office invitations (token, role, expiry) | server, bo |
| `ImpersonationSession` | "Login as" sessions | server, bo |
| `ContentVersion` | History of the CMS content (Page, Article…) | server, bo |
| `Counter` | Named sequences incremented atomically (`quote-<year>` numbers the quotes of a year); locked, written by the triggers only | server |
| `_User` | Back-office users | server, bo |
| `_Role` | Roles and their `rights`, `ui`, `countries` and `workspaces` fields | server, bo |
| `_Session` | Parse sessions | server |

## Indexes

Indexes are declared in code, in `apps/server/src/config/db-indexes.ts` (`INDEXES_BY_COLLECTION`), and created at startup so that every environment ends up with the same ones. Old indexes that must disappear are listed in `LEGACY_INDEXES_BY_COLLECTION`. Highlights:

- `Project` and `Article`: `translated.fr.slug`, `translated.en.slug` and `translated.mg.slug`, for the public read by slug.
- `Newsletter`: `email`, and `confirmationTokenHash` (sparse) for the confirmation link.
- `Client`: `email` (unique when not empty, so one address is one client) and `status` + `name` for the list.
- `Quote`: `number` + `version` (unique), `_p_client` + `status` (the quotes of a client, and the refusal to delete a client that has some), `status` + `issuedAt` for the list.
- `Mission`: `_p_client` + `status` (the missions of a client, and the refusal to delete a client that has some), `status` + `startDate` for the list, `_p_assignee` + `status` for "my missions".
- `Counter`: `name` (unique, one row per sequence).
- `Notification`: recipient list, read-state and send-type filters, `idempotencyKey` (unique, sparse).
- `Invitation`: `token` (unique, sparse) and `email`.
- `User`, `Contact`, `Category`, `Page` (`code`, unique when set), `ContentVersion`, `UserSession` and the audit logs have their own indexes.
- `_Join:users:_Role`: `relatedId` and `owningId`.

`allowClientClassCreation` is `false`, and the class-level permissions are rebuilt at every boot from the roles (see [roles and permissions](ROLES_AND_PERMISSIONS.md)). A new index goes in `db-indexes.ts`, never by hand in Atlas or Compass (`.claude/rules/parse-patterns.md`), and Pointer fields use their Mongo column name (`_p_<field>`).

## Schema rules

- Translated content is stored under fixed locale keys (`translated.fr`, `translated.en`, `translated.mg`).
- Soft deletion uses a `deleted` flag (and `deletedAt`, `deletedBy`); the recycle bin is emptied by `clearRecycleBinInCloud`.
- A new field never backfills old rows: read paths treat it as possibly `undefined`.

## Gotchas

- The `Project`, `Client`, `Quote` and `Mission` class names are not in `collections`: they come from `DOMAIN_COLLECTIONS`, so a core file that needs them must import them from the shared lib.
