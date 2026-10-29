# portfolio-platform

## Table of Contents

- [Overview](#overview)
- [Apps](#apps)
- [Quick start](#quick-start)
- [Documentation](#documentation)

## Overview

A personal portfolio platform: a public website presenting projects and articles, and a back-office to manage them. It is an [Nx](https://nx.dev) monorepo with a single pnpm workspace.

## Apps

| App | Description |
|---|---|
| [`apps/server`](apps/server) | Express + Parse Server API on MongoDB |
| [`apps/bo`](apps/bo) | Back-office (Vite, React, Material UI) |
| [`apps/web`](apps/web) | Public website (Next.js) |

## Quick start

```bash
pnpm install
pnpm nx run server:dev
pnpm nx run bo:dev
pnpm nx run web:dev
```

Copy each app's `.env.example` first. The details are in [Getting Started](docs/getting-started/en/GETTING_STARTED.md).

## Documentation

Start with the [documentation map](docs/README.md).
