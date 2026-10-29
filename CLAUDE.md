# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (`pnpm nx ...`) — avoids using a globally installed CLI
- You have access to the Nx MCP server and its tools — use them to query projects, targets, and dependencies instead of guessing from `project.json` files by hand
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file — proceed without it if unavailable
- NEVER guess CLI flags — always check `nx_docs` or `--help` first when unsure

# CLAUDE.md — portfolio-platform

## What is 1lalana?

**1lalana** (meaning "same road/path" in Malagasy) is a carpooling / ride-sharing platform targeting French-speaking markets (Madagascar). It allows drivers to offer rides and passengers to search and book seats.

`portfolio-platform` is the Nx monorepo workspace that hosts all 4 sub-projects (`server`, `web`, `mobile`, `bo`) in a single Git repository with a single pnpm workspace root, replacing the previous setup of 4 independent Git repositories. See `docs/code/architecture/fr/MONOREPO.FR.md` for how the workspace is organised and run.

---

## Design Inspiration

When designing features, UX flows, or product decisions, **always draw inspiration from the world's leading carpooling and ride-sharing platforms**, including:

| Platform | Market |
|---|---|
| **BlaBlaCar** | Europe (France, Germany, Italy, Spain, Eastern Europe…) |
| **Amovens** | Spain |
| **Fahrgemeinschaft** | Germany |
| **OuiCar** | France |
| **Karos** | France (short-distance / commute) |
| **Waze Carpool** | Global |
| **Ola Share** | India |
| **QuickRide** | India |
| **DiDi Carpool** | China / Asia |
| **Grab** | Southeast Asia |

For any new feature, ask: **how do the top platforms handle this?** Study their UX patterns (search, booking flow, trust & safety, ratings, payments, notifications) and adapt best practices to the 1lalana context.

---

## Language Rule

**All code must be written in English**: variable names, function names, comments, file names, type names, constants, error messages in code, etc. The only exception is user-facing UI strings, which go through the i18n translation system.

---

## Monorepo Structure (Nx workspace)

```
portfolio-platform/
├── apps/
│   ├── server/     # Node.js + Express + Parse Server (REST API + BaaS)
│   ├── web/        # Next.js public website (blog, contact, newsletter)
│   ├── mobile/     # React Native (Expo) mobile app (main user product)
│   ├── bo/         # Back-office admin panel (Vite + React + MUI)
│   ├── docs/       # VitePress sites built from docs/features and docs/business (read by non-tech people, see apps/docs/CLAUDE.md)
│   └── e2e/        # Playwright E2E suite (mobile web + BO against a real server, Docker Mongo/Redis)
├── libs/           # Shared libraries — libs/config/eslint, libs/config/prettier (@shared/eslint-config, @shared/prettier-config, used by all 4 apps); see docs/code/architecture/fr/MONOREPO.FR.md
├── docs/           # Project-wide documentation (docs/inventory/ = census of env vars, secrets, workflows, functions, jobs…)
├── .claude/        # Claude Code config (rules, skills, settings) — cross-project
├── nx.json         # Nx workspace config (target defaults, cache)
├── pnpm-workspace.yaml  # pnpm workspace package globs (apps/*, libs/config/*, ...)
├── package.json    # Root package.json (packageManager pin, root devDependencies)
└── pnpm-lock.yaml  # Single lockfile for the whole workspace
```

Each app under `apps/` still has its **own** `package.json` (own dependencies, own `engines`), but there is a **single root `pnpm-lock.yaml`** and a **single pinned `packageManager`** (pnpm) for the whole workspace — no more per-app `packageManager`/lockfile. Run scripts either via `cd apps/<name> && pnpm <script>` or via Nx (`pnpm nx run <app>:<target>`), both work identically since each `apps/<name>/project.json` wires its `targets` to the app's own `package.json` scripts.

There is **no preserved Git history** from the previous 4 separate repositories (`1lalana/server`, `1lalana/web`, `1lalana/mobile`, `1lalana/bo`) — this workspace started with a clean history. Those 4 repositories are kept open (not archived) as a reference if old history needs to be consulted.

---

## Sub-project Details

### `apps/server/` — Backend API

Node.js + Express 5 + Parse Server 8 (BaaS on MongoDB), TypeScript/ESM, built with SWC.
See **`apps/server/CLAUDE.md`** for stack details, source layout, environment flags, and the
Cloud Code feature checklist.

---

### `apps/web/` — Next.js Public Website

Next.js 16 + React 19 public site (blog, contact, newsletter), Tailwind CSS 4, next-intl.
See **`apps/web/CLAUDE.md`** for stack details, source layout, and the page/route checklist.

---

### `apps/mobile/` — React Native (Expo) App

Expo ~54 + React Native 0.81 + Expo Router 6 — the main user-facing product. Redux Toolkit,
react-hook-form + Zod, Parse SDK.
See **`apps/mobile/CLAUDE.md`** for the full stack, source layout, routing, Redux architecture,
i18n, theming, and the domain feature checklist.

---

### `apps/bo/` — Back-Office Admin Panel

Vite + React 19 + Material UI v7, TanStack Router, Redux Toolkit.
See **`apps/bo/CLAUDE.md`** for stack details, source layout, and the domain feature checklist.
Its build is copied into `apps/server/clientBuild/bo/` via `pnpm copy-bo` and served by Express.

---

## Common Conventions

**Global rules** (`.claude/rules/` at the workspace root — apply to all sub-projects):
- `naming-conventions.md` — file and identifier naming
- `typescript.md` — TypeScript strict rules
- `code-style.md` — ESLint/Prettier, line length, imports
- `parse-patterns.md` — Parse SDK usage (server + client), schema/field design, indexes, query perf
- `forms-and-state.md` — react-hook-form + Zod + Redux patterns
- `theming.md` — dark/light mode: useTheme usage, token reference, anti-patterns (mobile + bo)
- `component-structure.md` — components/ vs containers/ distinction (all clients)
- `storybook.md` — Storybook rules (all clients); any task that touches a story ends by giving
  the direct link of every touched story variant in the chat
- `accessibility.md` — a11y: the blocking Storybook gate (never add a disabled rule), accessible names,
  image alternatives, react-native-web `aria-*` caveats, semantic structure (mobile + bo)
- `git-branches.md` — Git branch naming conventions (feat/, fix/, chore/, …)
- `engineering-principles.md` — DRY, SOLID, separation of concerns, composition over inheritance
- `implementation-completeness.md` — always wire up functions/routes/jobs before marking done; ✅/❌
  status markers in action-item docs, and deleting what is finished and carrying the unresolved ones over into `docs/code/todo/`
- `markdown-docs.md` — every generated `.md` file must start with a clickable table of contents; when a `.md` is modified, its translated twin (`en/NAME.md` ↔ `fr/NAME.FR.md`) is updated in the same task (checked on push and in CI by `pnpm check-doc-twins`); every relative link and anchor of the docs resolves (`pnpm check-doc-links`)
- `feature-docs.md` — keep `docs/features/**/*.FR.md` (non-technical feature docs) in sync whenever
  user-facing behavior changes in `apps/bo/`, `apps/mobile/`, or `apps/web/`
- `inventory.md` — a new env variable, GitHub secret, e-mail, SMS, push, Cloud Function, job, index,
  workflow or E2E scenario updates its list in `docs/inventory/` in the same task (`/inventory`)

**Mobile rules** (`apps/mobile/.claude/rules/` — React Native / Expo only):
- `mobile-architecture.md` — layer hierarchy: app/ → screens/ → containers/ → components/
- `mobile-optimization.md` — render perf, lists, Redux, network, images, animations
- `mobile-layout.md` — Layout component usage (theme, padding, scroll, fullWidth)
- `mobile-inputs.md` — input style centralisation: useInputStyle hook, INPUT_STYLE constants
- `navigation.md` — navigation utility functions, router.push rules, screen headers (always the
  navigation header with `ScreenHeader`, never a custom header component)

**BO rules** (`apps/bo/.claude/rules/` — back-office admin panel only):
- `bo-responsive.md` — responsive design rules (CSS Grid, breakpoints, tables, flex rows)

### Environments
- Local dev: `NODE_ENV=development`
- Pre-production: `NODE_ENV=preProduction`
- Production: `NODE_ENV=production`
- Test: `NODE_ENV=test`

---

## Package Manager

The whole workspace uses a **single pinned pnpm version** at the root (`package.json` → `packageManager`, `pnpm-workspace.yaml` → `nodeLinker: hoisted`, workspace package globs + `overrides`). Individual apps under `apps/*` no longer declare their own `packageManager` or lockfile — always run `pnpm install` from the workspace root. Always use `pnpm`, never `npm`, `pnpm`, or `bun`.

---

## Running the Project

Either `cd` into the app and use its own scripts, or run the equivalent Nx target from the root (both are equivalent — `apps/<name>/project.json` wires Nx targets to the app's own `package.json` scripts):

```bash
# Server
cd apps/server && pnpm dev        # or: pnpm nx run server:dev

# Web
cd apps/web && pnpm dev           # or: pnpm nx run web:dev

# Mobile
cd apps/mobile && pnpm start      # or: pnpm nx run mobile:start

# Back-office
cd apps/bo && pnpm dev            # or: pnpm nx run bo:dev
```

---

## Testing

```bash
# Server (Jest + jest-mongodb)
cd apps/server && pnpm test       # or: pnpm nx run server:test

# Mobile (Jest + jest-expo)
cd apps/mobile && pnpm test       # or: pnpm nx run mobile:test

# Run tests for every app that has a test target
pnpm nx run-many -t test

# E2E (Playwright, needs Docker): starts Mongo/Redis, the server, the BO and the mobile web app
pnpm nx run e2e:e2e              # stop the containers afterwards: pnpm nx run e2e:stack:down
```

---

## Key Domain Entities

| Entity | Description |
|---|---|
| `Ride` | A carpooling trip offered by a driver |
| `Request` | A passenger's booking request on a ride |
| `Vehicle` | A driver's vehicle |
| `User` | Platform user (driver and/or passenger) |
| `Payment` | Payment transaction for a ride |
| `Rating` | Post-ride rating between users |
| `Notification` | In-app notification |
| `Article` | Blog article (managed via BO) |
| `Newsletter` | Newsletter subscription |
| `Category` | Article category |
