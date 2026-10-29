# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (`pnpm nx ...`) — avoids using a globally installed CLI
- You have access to the Nx MCP server and its tools — use them to query projects, targets, and dependencies instead of guessing from `project.json` files by hand
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file — proceed without it if unavailable
- NEVER guess CLI flags — always check `nx_docs` or `--help` first when unsure

# CLAUDE.md — portfolio-platform

## What is portfolio-platform?

A personal portfolio platform: a public website presenting projects and articles, and a back-office to manage them. It is an Nx monorepo hosting 3 apps (`server`, `web`, `bo`) with a single Git repository and a single pnpm workspace root. See `docs/code/architecture/en/MONOREPO.md` for how the workspace is organised.

---

## Language Rule

**All code must be written in English**: variable names, function names, comments, file names, type names, constants, error messages in code, etc. The only exception is user-facing UI strings, which go through the i18n translation system (`fr`, `en`, `mg`).

---

## Monorepo Structure (Nx workspace)

```
portfolio-platform/
├── apps/
│   ├── server/     # Node.js + Express + Parse Server (REST API + BaaS, Cloud Code)
│   ├── web/        # Next.js public website (projects, articles, contact, newsletter)
│   └── bo/         # Back-office admin panel (Vite + React + MUI)
├── libs/           # Shared libraries (shared-*) and shared configs (libs/config/eslint, libs/config/prettier)
├── docs/           # Project documentation (see docs/README.md)
├── scripts/        # Repository checks: check-i18n, check-doc-twins, check-doc-links
├── nx.json         # Nx workspace config
├── pnpm-workspace.yaml
├── package.json    # Root package.json (packageManager pin, root devDependencies)
└── pnpm-lock.yaml  # Single lockfile for the whole workspace
```

Each app has its **own** `package.json` but there is a **single** `pnpm-lock.yaml` and a **single** pinned `packageManager`. Always run `pnpm install` from the workspace root and use `pnpm` only (never npm, yarn or bun).

---

## Sub-projects

| App | Stack |
|---|---|
| `apps/server` | Node.js, Express, Parse Server on MongoDB, TypeScript, built with SWC. Cloud Code in `src/cloud/` (functions, triggers, jobs, services) |
| `apps/web` | Next.js, React, Tailwind CSS, shadcn/ui, next-intl |
| `apps/bo` | Vite, React, Material UI, TanStack Router, Redux Toolkit, react-hook-form + Zod. Its build is copied into the server (`pnpm copy`) and served by Express |

---

## Key Domain Entities

| Entity | Description |
|---|---|
| `Project` | A portfolio project |
| `Article` | Blog article |
| `Page` / `PageSection` | Editorial pages and the sections grouping them |
| `Category` | Category of articles and pages |
| `Contact` | Message sent from the website contact form |
| `Newsletter` | Newsletter subscription |
| `User` / `Role` | Back-office users and their rights |

---

## Common Conventions

- Conventional commits (commitlint); branch names `feat/`, `fix/`, `chore/`.
- Code style is enforced by the shared ESLint and Prettier configs (`@shared/eslint-config`, `@shared/prettier-config`).
- TypeScript strict; Parse objects are typed through the `*Attributes` interfaces of each domain.
- **Translations**: a new UI string is added to every locale of the app (`apps/bo/src/config/i18n/locales`, `apps/server/src/locales`, `apps/web/translations`) and `pnpm check-i18n` must pass.
- **Docs**: every `.md` starts with a clickable table of contents. A translated doc and its twin (`en/NAME.md` ↔ `fr/NAME.FR.md`) change together (`pnpm check-doc-twins`), and relative links resolve (`pnpm check-doc-links`). `docs/features/**` is French only; READMEs are English only.
- **Inventory**: a new env variable, external service, Cloud Function, trigger or job updates `docs/inventory/` (and `docs/services/`) in the same change.
- **Features**: user-facing changes in `apps/bo` or `apps/web` update `docs/features/`.

### Environments

- Local dev: `NODE_ENV=development`
- Pre-production: `NODE_ENV=preProduction`
- Production: `NODE_ENV=production`

---

## Running the Project

```bash
pnpm nx run server:dev
pnpm nx run web:dev
pnpm nx run bo:dev
```

Equivalent: `cd apps/<name> && pnpm dev`. Copy each app's `.env.example` first (see `docs/getting-started/en/GETTING_STARTED.md`).

## Checks

```bash
pnpm nx run-many -t lint
pnpm nx run-many -t build
pnpm check-i18n
pnpm check-doc-twins
pnpm check-doc-links
```
