# ADR 002 - One Nx and pnpm monorepo

## Table of Contents

- [Context](#context)
- [Decision](#decision)
- [Consequences](#consequences)

**Status**: Accepted (recorded from the code)

## Context

The platform is made of three apps (`server`, `web`, `bo`) that share domain vocabulary: collection names, locales, role names, types such as the translated fields. Separate repositories would duplicate those and make a cross-app change (a new field on a project, for example) a multi-repository change.

## Decision

A single Git repository and a single pnpm workspace root with one lockfile and one pinned `packageManager`, orchestrated by [Nx](https://nx.dev). Each app keeps its own `package.json` and a `project.json` wiring the Nx targets. Shared code lives in `libs/`: `shared-constants`, `shared-domain-constants`, `shared-domain-types`, `shared-types`, `shared-utils`, and the shared lint and format configs under `libs/config`. Libraries are imported by alias (`@shared/constants`, `@shared/types`, ...). The layout is described in [MONOREPO.md](../../architecture/en/MONOREPO.md).

CI relies on `nx affected` so a change only lints, type checks and builds the projects it touches, see [DEPLOYMENT.md](../../architecture/en/DEPLOYMENT.md).

## Consequences

- A feature spanning several apps is one branch and one pull request.
- A value shared by apps is defined once in a `libs/shared-*` library, for example the locales and the role names.
- The apps must stay compatible with one set of tool versions and one lockfile.
- Every command goes through `pnpm nx ...` and `pnpm` only, never npm or yarn.
