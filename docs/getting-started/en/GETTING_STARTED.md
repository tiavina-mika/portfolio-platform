# Getting Started

## Table of Contents

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Environment files](#environment-files)
- [Run](#run)
- [Check your change](#check-your-change)

## Prerequisites

- Node.js: the version in [`.nvmrc`](../../../.nvmrc).
- pnpm: the version pinned in the root `package.json` (`packageManager`). Never use npm or yarn.
- A MongoDB instance reachable from the server (local or Atlas).

## Install

From the workspace root, never from an app:

```bash
pnpm install          # or: pnpm install:light on a limited machine
```

## Environment files

Each app ships a `.env.example`. Copy it, fill it, never commit the real file. The variables are listed in the [inventory](../../inventory/README.md).

| App | Copy `.env.example` to |
|---|---|
| `apps/server` | `.env.development` (see the server config for the other environments) |
| `apps/bo` | `.env.preprod` (`pnpm dev`, `build:preprod`) or `.env.prod` (`build:prod`) |
| `apps/web` | `.env.local` |

## Run

```bash
pnpm nx run server:dev
pnpm nx run bo:dev
pnpm nx run web:dev
```

## Check your change

```bash
pnpm nx run-many -t lint
pnpm nx run-many -t build
pnpm check-i18n        # translations: parity between locales and keys used in the code
pnpm check-doc-links   # relative links of the docs
```

The architecture of the workspace is described in [MONOREPO.md](../../code/architecture/en/MONOREPO.md).
