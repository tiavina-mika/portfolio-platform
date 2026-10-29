---
paths:
  - "apps/server/src/**/*.ts"
---

# `_core` / `_domain` Boundary

Most folders under `apps/server/src` split into a `_core/` and a `_domain/` subfolder so `_core/` stays deployable
as a generic boilerplate: delete `_domain/` and the app should still build, minus the portfolio's own domain.

> **`_core/`** — code that has to keep working if `_domain/` is deleted: auth, user accounts, CMS
> (article/page/category/contact/newsletter), notification/payment/ticket CRUD, admin/roles/security,
> dashboards and statistics *as a registry*.
>
> **`_domain/`** — code specific to this app: `Project`, plus anything that cannot run without knowing about it.

## Decision test

Does the file import the `Project` class or collection, or would it break if `_domain/` were deleted?

- **No** → `_core/`
- **Yes** → `_domain/`

## Allowed dependency direction

```
_domain/  →  _core/     ✅ allowed (the domain reuses generic building blocks)
_core/    →  _domain/   ❌ never (would make _core undeletable)
```

When a `_core/` feature (a dashboard, a global search bar, the statistics) needs to surface domain data,
`_core/` exposes a **registry** (`registerXxxProvider(fn)`) that `_domain/` calls at module load time — `_core/`
never imports `_domain/`.

```ts
// _domain/ registers itself — cloud/services/_domain/project-dashboard.service.cloud.ts
import { registerDashboardKpiProvider } from '../_core/dashboard.service.cloud';

registerDashboardKpiProvider(DOMAIN_COLLECTIONS.project, getProjectDashboardKpis);
```

The registering `_domain/` file is imported once for its side effect, from `cloud/services/index.ts` (services) or
the matching `cloud/*/index.ts` (functions, triggers, jobs). Those `index.ts` files and `src/index.ts` are the
composition points.

`pnpm nx run server:lint` fails on every `_core` file that imports a `_domain` path (`no-restricted-imports`,
`coreDomainBoundaryConfig` of `@shared/eslint-config`). A reviewed exception carries a `@boilerplate-scope`
marker with a one-line justification.

## Documented exceptions

- `types/` stays flat, not split.
- A few `_core` files name the domain classes through the shared `DOMAIN_COLLECTIONS` map (the public-read class
  list, for instance): the map lives in `@shared/domain-constants`, not in `_domain/`, so the direction rule holds.
