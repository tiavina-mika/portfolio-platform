# CLAUDE.md — server/

Node.js + Express + Parse Server backend (REST API + BaaS, Cloud Code) for the portfolio platform.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (>=24) |
| Framework | Express 5 + Parse Server 9 (BaaS on top of MongoDB) |
| Language | TypeScript, ESM modules (`"type": "module"`) |
| Build | SWC (`@swc/cli`) → `dist/` |
| Dev server | `tsx watch` |
| Key services | Brevo (email), Cloudinary (file storage), node-cron (scheduled tasks) |
| i18n | i18next with `fr`, `en`, `mg` locales (`src/locales/<locale>/common.json`, set up in `src/config/i18next.ts`) |
| Validation | Zod (`src/validations/`) |
| Package mgr | pnpm (single workspace root) |

There is no test runner in this app today.

---

## Commands

```bash
pnpm nx run server:dev   # tsx watch, NODE_ENV=development (or: pnpm dev in apps/server)
pnpm build               # clean + typecheck + swc → dist/
pnpm typecheck           # tsc --noEmit -p tsconfig.build.json
pnpm start               # run dist/ build, NODE_ENV=production
pnpm start:preprod       # run dist/ build, NODE_ENV=preProduction
pnpm lint                # eslint --fix
pnpm build:bo            # build bo (prod) then copy it into the server (pnpm copy)
```

---

## Source Layout

```
src/
├── cloud/          # Parse Cloud Code
│   ├── functions/  # Cloud Functions — orchestration only, one file per domain
│   ├── triggers/   # beforeSave / afterSave / beforeDelete triggers — orchestration only
│   ├── jobs/       # Parse Jobs
│   ├── services/   # ALL Parse.Query calls live here (see parse-patterns.md)
│   └── utils/      # Cloud helpers (parseFunction, runJob, db, email, files…)
├── config/         # App config (i18next, emails)
├── controllers/    # Express route controllers
├── locales/        # Server translations (en, fr, mg)
├── middlewares/    # Express middlewares
├── routes/         # Express routers
├── services/       # Server-level services (email, files)
├── types/          # TypeScript types and ambient declarations
├── utils/          # General utilities (constants.ts holds USE_MASTER_KEY…)
└── validations/    # Zod schemas
```

Cloud Code internal call rules (queries confined to `cloud/services/`, jobs preferred for background
work) and naming per folder: `.claude/rules/parse-patterns.md` and
`.claude/rules/naming-conventions.md` in this app. What may live in `cloud/`:
`.claude/rules/cloud-scope.md`. Translating errors sent to the client:
`.claude/rules/error-messages.md`.

---

## Environments

- Local dev: `NODE_ENV=development`
- Pre-production: `NODE_ENV=preProduction`
- Production: `NODE_ENV=production`

Variables are listed in `.env.example` and in `docs/inventory/README.md`.

---

## BO Build Integration

The `apps/bo` build output is copied into the server (`pnpm copy`, run from `apps/server`, which also
scans the client build for leaked secrets) and served directly by the Express server — the BO admin
panel is deployed as part of the server, not as a standalone static host.

---

## Adding a New Domain Feature

Checklist when adding a new domain (e.g. `testimonial`):

1. Add the collection name to `libs/shared-constants` (`COLLECTIONS`) and the shared types to `libs/shared-domain-types` if several apps use them
2. `src/types/testimonial.type.ts` — types/enums
3. `src/validations/testimonial.validation.ts` — Zod schemas
4. `src/cloud/services/testimonial.service.cloud.ts` — Parse.Query calls
5. `src/cloud/functions/testimonial.functions.ts` — Cloud Functions, wrapped in `parseFunction()`, exported from `cloud/functions/index.ts`
6. `src/cloud/triggers/testimonial.triggers.ts` — beforeSave/afterSave if needed
7. `src/cloud/jobs/testimonial.jobs.ts` — background work via `runJob()`, if applicable
8. Add translation keys in `src/locales/{fr,en,mg}/common.json` (`pnpm check-i18n` must pass)
9. Update `docs/inventory/README.md` (Cloud Code) — see `.claude/rules/inventory.md` at the root
10. Wire everything (see `implementation-completeness.md` — no orphaned Cloud Functions/Jobs), and
    implement the `bo` / `web` side when the feature is visible there
