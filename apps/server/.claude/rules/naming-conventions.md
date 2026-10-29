---
paths:
  - "apps/server/src/**/*.ts"
---

# Naming Conventions — Server

## Files

| Folder | Pattern | Example |
|---|---|---|
| `api/` | `domain.api.ts` | `cloudinary.api.ts`, `payment.api.ts` |
| `cloud/functions/` | `domain.functions.ts` | `article.functions.ts`, `project.functions.ts` |
| `cloud/triggers/` | `domain.triggers.ts` | `article.triggers.ts`, `project.triggers.ts` |
| `cloud/jobs/` | `domain.jobs.ts` | `newsletter.jobs.ts`, `category.jobs.ts` |
| `cloud/services/` | `domain.service.cloud.ts` | `category.service.cloud.ts`, `project-search.service.cloud.ts` |
| `cloud/transactions/` | `domain.transactions.ts` | `utils.transactions.ts` |
| `cloud/utils/` | `domain.utils.cloud.ts` | `db.utils.cloud.ts`, `project.utils.cloud.ts` |
| `config/` | `kebab-case.ts` | `config.ts`, `db-indexes.ts` |
| `constants/` | `domain.constants.ts` | `cms.constants.ts`, `project.constants.ts` |
| `controllers/` | `domain.controller.ts` | `app.controller.ts`, `files.controller.ts` |
| `middlewares/` | `domain.middleware.ts` | `error.middleware.ts`, `validation.middleware.ts` |
| `routes/` | `domain.route.ts` | `files.route.ts`, `download.route.ts` |
| `services/` | `domain.service.ts` | `email.service.ts` |
| `types/` | `domain.type.ts` / `*.d.ts` | `auth.type.ts`, `global-parse.d.ts` |
| `utils/` | `domain.utils.ts` | `file.utils.ts` |
| `validations/` | `domain.validations.ts` (plural) | `article.validations.ts`, `project.validations.ts` |

Multi-word domain segments use camelCase or kebab-case matching the neighbours (`pageSection.functions.ts`,
`project-search.service.cloud.ts`): follow the folder's existing style.

## `_core` / `_domain` split

Every folder above except `types/`, `middlewares/` and `services/` is split into a `_core/` and a `_domain/`
subfolder (`cloud/functions/_domain/project.functions.ts`). `types/` stays flat — it is never deleted as a unit,
so a flat domain-named file there carries no dangling-import risk. The flat files of `config/` (`db-indexes.ts`,
`scheduled-jobs.ts`, `openapi.ts`…) and the `index.ts` of each `cloud/` folder are the composition points: the
only files allowed to list both sides. See `core-domain-boundary.md`.

Constants live in `src/constants/_core/constants.ts` (`USE_MASTER_KEY`…) and `src/constants/_domain/`, enums in
`src/types/<domain>.type.ts` (see the root `naming-conventions.md` and `typescript.md`).
