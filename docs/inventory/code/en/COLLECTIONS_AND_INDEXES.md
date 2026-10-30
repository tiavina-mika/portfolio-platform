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
| `Article` | Blog articles (translated content, `active`, `deleted` flags) | server, bo, web |
| `Page` | Editorial pages | server, bo, web |
| `PageSection` | Sections grouping the pages | server, bo, web |
| `Category` | Categories of articles and pages | server, bo, web |
| `Contact` | Messages of the website contact form, also the support tickets | server, bo, web |
| `TicketMessage` | Replies of a ticket (read and written through Cloud Functions only) | server, bo |
| `Newsletter` | Newsletter subscriptions (double opt-in, confirmed through a hashed token) | server, web |
| `App` | Site-wide settings, including the `image`, `imageForDarkMode` and `cv` files (old files are deleted from Cloudinary on change) | server, bo, web |
| `Notification`, `NotificationResend` | Notifications sent from the back-office and their re-sends | server, bo |
| `Payment` | Payments (simulated gateway) | server, bo |
| `Report` | Reports raised on a user or a content | server, bo |
| `UserAuditLog`, `RoleAuditLog`, `SessionAuditLog`, `MfaAuditLog`, `UserModerationLog`, `PenaltyLog` | Audit trails (locked, written by the server only) | server, bo |
| `UserSession`, `PushReceipt` | Devices, sessions and Expo push tickets | server |
| `Invitation` | Back-office invitations (token, role, expiry) | server, bo |
| `ImpersonationSession` | "Login as" sessions | server, bo |
| `ContentVersion` | History of the CMS content (Page, Article…) | server, bo |
| `Counter` | Named sequences | server |
| `_User` | Back-office users | server, bo |
| `_Role` | Roles and their `rights`, `ui` and `countries` fields | server, bo |
| `_Session` | Parse sessions | server |

## Indexes

Indexes are declared in code, in `apps/server/src/config/db-indexes.ts` (`INDEXES_BY_COLLECTION`), and created at startup so that every environment ends up with the same ones. Old indexes that must disappear are listed in `LEGACY_INDEXES_BY_COLLECTION`. Highlights:

- `Project` and `Article`: `translated.fr.slug`, `translated.en.slug` and `translated.mg.slug`, for the public read by slug.
- `Newsletter`: `email`, and `confirmationTokenHash` (sparse) for the confirmation link.
- `Notification`: recipient list, read-state and send-type filters, `idempotencyKey` (unique, sparse).
- `Invitation`: `token` (unique, sparse) and `email`.
- `Payment`, `User`, `Report`, `Contact`, `Category`, `Page` (`code`, unique when set), `ContentVersion`, `Counter` (`name`, unique), `UserSession` and the audit logs have their own indexes.
- `_Join:users:_Role`: `relatedId` and `owningId`.

`allowClientClassCreation` is `false`, and the class-level permissions are rebuilt at every boot from the roles (see [roles and permissions](ROLES_AND_PERMISSIONS.md)). A new index goes in `db-indexes.ts`, never by hand in Atlas or Compass (`.claude/rules/parse-patterns.md`), and Pointer fields use their Mongo column name (`_p_<field>`).

## Schema rules

- Translated content is stored under fixed locale keys (`translated.fr`, `translated.en`, `translated.mg`).
- Soft deletion uses a `deleted` flag (and `deletedAt`, `deletedBy`); the recycle bin is emptied by `clearRecycleBinInCloud`.
- A new field never backfills old rows: read paths treat it as possibly `undefined`.

## Gotchas

- The `collections` constant still lists carpooling class names (`Ride`, `Request`, `Vehicle`, `Rating`, `RideShare`, `SosAlert`) that the portfolio does not use. Because the class-level permission rebuild walks that list and the locked-class lists, it may create these classes empty (and locked) in the database.
- The `Project` class name is not in `collections`: it comes from `DOMAIN_COLLECTIONS`, so a core file that needs it must import it from the shared lib.
