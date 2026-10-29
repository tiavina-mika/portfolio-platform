---
paths:
  - "apps/server/src/**/*.ts"
---

# Naming Conventions — Server

## Files

| Folder | Pattern | Example |
|---|---|---|
| `cloud/functions/` | `domain.functions.ts` | `article.functions.ts`, `auth.functions.ts` |
| `cloud/triggers/` | `domain.triggers.ts` | `article.triggers.ts`, `user.triggers.ts` |
| `cloud/jobs/` | `domain.jobs.ts` | `newsletter.jobs.ts`, `category.jobs.ts` |
| `cloud/services/` | `domain.service.cloud.ts` | `category.service.cloud.ts`, `userRole.service.cloud.ts` |
| `cloud/utils/` | `domain.utils.cloud.ts` | `db.utils.cloud.ts`, `email.utils.cloud.ts` |
| `config/` | `kebab-case.ts` | `config.ts`, `i18next.ts` |
| `controllers/` | `domain.controller.ts` | `app.controller.ts`, `files.controller.ts` |
| `middlewares/` | `domain.middleware.ts` | `error.middleware.ts`, `validation.middleware.ts` |
| `routes/` | `domain.route.ts` | `files.route.ts`, `download.route.ts` |
| `services/` | `domain.service.ts` | `email.service.ts` |
| `types/` | `domain.type.ts` / `*.d.ts` | `auth.type.ts`, `global-parse.d.ts` |
| `utils/` | `domain.utils.ts` | `file.utils.ts` |
| `validations/` | `domain.validation.ts` | `article.validation.ts` |

Multi-word domain segments use camelCase or kebab-case matching the neighbours (`pageSection.functions.ts`,
`userRole.service.cloud.ts`): follow the folder's existing style.

Constants live in `src/utils/constants.ts` (`USE_MASTER_KEY`…), enums in `src/types/<domain>.type.ts`
(see the root `naming-conventions.md` and `typescript.md`).
