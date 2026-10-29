# Monorepo

## Table of Contents

- [Layout](#layout)
- [Apps](#apps)
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
| `server` | Node.js, Express, Parse Server, TypeScript (SWC build) | Cloud Code (functions, triggers, jobs), emails, file storage; serves the back-office build |
| `bo` | Vite, React, Material UI, TanStack Router, Redux Toolkit | Admin panel: articles, pages, projects, categories, contacts, users, roles |
| `web` | Next.js, Tailwind CSS, shadcn/ui, next-intl | Public portfolio: projects, articles, contact, newsletter |

The build of `bo` is copied into the server (`pnpm copy` in `apps/server`) and served by Express.

## Shared libraries

`libs/` holds the shared code (`shared-constants`, `shared-domain-constants`, `shared-domain-types`, `shared-types`, `shared-utils`) and the shared configs (`@shared/eslint-config`, `@shared/prettier-config` under `libs/config/`) consumed by the apps.

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
