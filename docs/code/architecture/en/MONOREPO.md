# Monorepo

## Table of Contents

- [Layout](#layout)
- [Apps](#apps)
- [Core and domain](#core-and-domain)
- [Shared libraries](#shared-libraries)
- [Tooling](#tooling)
- [Commands](#commands)

## Layout

`portfolio-platform` is an [Nx](https://nx.dev) workspace with a single pnpm workspace root, a single `pnpm-lock.yaml` and a single pinned `packageManager`.

```text
portfolio-platform/
├── apps/
│   ├── server/   # Express + Parse Server (REST API and BaaS on MongoDB)
│   ├── bo/       # Back-office (Vite + React + MUI)
│   └── web/      # Public website (Next.js)
├── libs/         # Shared libraries and shared lint / format configs
├── docs/         # This documentation
└── scripts/      # Repository checks (i18n, doc twins, doc links)
```

Each app keeps its own `package.json` (dependencies, `engines`) and a `project.json` that wires the Nx targets to the app's scripts.

## Apps

| App | Stack | Role |
|---|---|---|
| `server` | Node.js, Express, Parse Server, TypeScript (SWC build) | Cloud Code (functions, triggers, jobs), emails and SMS, file storage; serves the back-office build. Split in `_core` / `_domain` |
| `bo` | Vite, React, Material UI, TanStack Router, Redux Toolkit | Admin panel: content, projects, tickets, users, roles, notifications, reports, dashboards. Split in `_core` / `_domain` |
| `web` | Next.js, Tailwind CSS, shadcn/ui, next-intl | Public portfolio: projects, blog, pages, contact, newsletter (no split) |

The build of `bo` is copied into the server (`pnpm copy` in `apps/server`) and served by Express.

## Core and domain

`server` and `bo` split their code in `_core` (generic back-office) and `_domain` (the portfolio's `Project`); `web` is not split. See [CORE_DOMAIN.md](CORE_DOMAIN.md).

## Shared libraries

`libs/` holds the shared code (`shared-constants`, `shared-domain-constants`, `shared-domain-types`, `shared-domain-utils`, `shared-faq`, `shared-types`, `shared-utils`, `shared-validations`) and the shared configs (`@shared/eslint-config`, `@shared/prettier-config` under `libs/config/`) consumed by the apps.

## Tooling

- Git hooks with husky and conventional commits (commitlint).
- Versioning with changesets.
- Markdown with markdownlint; secret scanning with gitleaks.
- Translations: `pnpm check-i18n` keeps `fr`, `en` and `mg` in step and verifies every key used in the code.

## Commands

Prefer Nx over the underlying tools:

```bash
pnpm nx run <app>:<target>
pnpm nx run-many -t lint
pnpm nx run-many -t build
pnpm nx affected -t lint
```
