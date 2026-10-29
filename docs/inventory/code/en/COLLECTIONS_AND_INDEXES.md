# Collections and Indexes

## Table of Contents

- [Collections](#collections)
- [Indexes](#indexes)
- [Schema rules](#schema-rules)

## Collections

Application collections are listed in `libs/shared-constants/src/collection.constants.ts` (`COLLECTIONS`). Parse also keeps its own built-in collections.

| Collection | Holds | Used by |
|---|---|---|
| `Article` | Blog articles (translated content, `active`, `deleted` flags) | server, bo, web |
| `Project` | Portfolio projects | server, bo, web |
| `Page` | Editorial pages (and their `PageSection` objects, handled by `page.triggers.ts`) | server, bo, web |
| `PageSection` | Sections grouping the pages | server, bo, web |
| `Category` | Categories of articles and pages | server, bo, web |
| `Contact` | Messages sent from the website contact form | server, bo, web |
| `Newsletter` | Newsletter subscriptions | server, web |
| `App` | Site-wide settings, including the `image`, `imageForDarkMode` and `cv` files (old files are deleted from Cloudinary on change) | server, bo, web |
| `_User` | Back-office users | server, bo |
| `_Role` | Roles and their `rights` and `ui` fields | server, bo |
| `_Session` | Parse sessions | server |

`PageSection` is not in the `COLLECTIONS` constant although it has its own triggers.

## Indexes

No index is declared in the code: there is no `createIndex`, `ensureIndex` or schema definition in `apps/server`, and `allowClientClassCreation` is `true`. Parse creates the default indexes (`_id`, the `_User` and `_Role` unique ones) and nothing else, so the filters and sorts of the back-office lists (`getArticles`, `getProjects`, `getContacts`…) and the text search on `translated.<locale>.*` run without a dedicated index.

If an index is added by hand in Atlas or Compass it is not tracked anywhere: declare it in code (server startup or migration) and list it here (`.claude/rules/parse-patterns.md`).

## Schema rules

- Translated content is stored under fixed locale keys (`translated.fr`, `translated.en`, `translated.mg`).
- Soft deletion uses a `deleted` flag (and `deletedAt`, `deletedBy`); the recycle bin is emptied by `clearRecycleBinInCloud`.
- A new field never backfills old rows: read paths treat it as possibly `undefined`.
