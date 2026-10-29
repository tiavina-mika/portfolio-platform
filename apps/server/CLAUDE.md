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
| i18n | i18next with `fr`, `en`, `mg` locales (`src/config/i18n/locales/<locale>/_core/*.json`, set up in `src/config/i18n/index.ts`) |
| Validation | Zod (`src/validations/_core/`, `src/validations/_domain/`) |
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
├── api/            # External API integrations (Cloudinary, payment)
├── cloud/          # Parse Cloud Code
│   ├── emails/     # E-mail builders sent from Cloud Code
│   ├── functions/  # Cloud Functions — orchestration only, one file per domain
│   ├── triggers/   # beforeSave / afterSave / beforeDelete triggers — orchestration only
│   ├── jobs/       # Parse Jobs
│   ├── services/   # ALL Parse.Query calls live here (see parse-patterns.md)
│   ├── sms/        # SMS builders
│   ├── transactions/
│   └── utils/      # Cloud helpers (parseFunction, runJob, db, email, files…)
├── config/         # App config (i18next + locales, helmet/CORS, db indexes, scheduled jobs, OpenAPI)
├── constants/      # App-wide constants (collections, enums, env flags)
├── controllers/    # Express route controllers
├── emails/         # HTML e-mail frame and templates
├── middlewares/    # Express middlewares
├── routes/         # Express routers
├── services/       # Server-level services (email, SMS, Slack)
├── types/          # TypeScript types and ambient declarations (flat, not split)
├── utils/          # General utilities
└── validations/    # Zod schemas
```

Every folder except `types/`, `emails/`, `middlewares/`, `services/` and `config/`'s composition files is split into
`_core/` (generic, kept when the repo is cloned as a boilerplate) and `_domain/` (the portfolio's own domain:
`project`). `_core` never imports `_domain`; the composition lives in `cloud/*/index.ts`, `config/` and
`index.ts`. See `.claude/rules/core-domain-boundary.md`.

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

Checklist when adding a new domain entity (e.g. `testimonial`) next to `project`:

1. Add the class name to `DOMAIN_COLLECTIONS` in `libs/shared-domain-constants` and the shared types to `libs/shared-domain-types` if several apps use them
2. `src/types/testimonial.type.ts` — types/enums (flat)
3. `src/validations/_domain/testimonial.validations.ts` — Zod schemas
4. `src/constants/_domain/testimonial.constants.ts` — field lists, limits
5. `src/cloud/services/_domain/testimonial.service.cloud.ts` — Parse.Query calls
6. `src/cloud/functions/_domain/testimonial.functions.ts` — Cloud Functions, wrapped in `fromBO()` / `parseFunction()`, imported in `cloud/functions/index.ts`
7. `src/cloud/triggers/_domain/testimonial.triggers.ts` — beforeSave/afterSave if needed, imported in `cloud/triggers/index.ts`
8. `src/cloud/jobs/_domain/testimonial.jobs.ts` — background work via `runJob()`, if applicable, imported in `cloud/jobs/index.ts`
9. Register it in the core registries it should appear in (dashboard, global search, statistics) from a `cloud/services/_domain/*` file imported in `cloud/services/index.ts`
10. Add translation keys in `src/config/i18n/locales/{fr,en,mg}/_domain/` and merge them in `src/config/i18n/index.ts` (`pnpm check-i18n` must pass)
11. Update `docs/inventory/README.md` (Cloud Code) — see `.claude/rules/inventory.md` at the root
12. Wire everything (see `implementation-completeness.md` — no orphaned Cloud Functions/Jobs), and
    implement the `bo` / `web` side when the feature is visible there
