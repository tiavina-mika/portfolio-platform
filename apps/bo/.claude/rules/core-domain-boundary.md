---
paths:
  - "apps/bo/src/**/*.{ts,tsx}"
---

# `_core` / `_domain` Boundary — Back-office

Most folders under `apps/bo/src` (pages, containers, hooks, services, types, utils, validations, constants,
redux actions and reducers, locale folders) have a `_core/` and a `_domain/` subfolder. `components/` stays flat.

- `_core/`: the generic back-office; it must keep working if `_domain/` is deleted.
- `_domain/`: the portfolio's `Project` and anything that cannot run without it.

Decision test: does the file import the `Project` entity, or would it break if `_domain/` were deleted? Yes: `_domain/`.

Direction: `_domain/ -> _core/` is allowed, `_core/ -> _domain/` never (lint: `coreDomainBoundaryConfig`).
When a core screen must show domain data (dashboard cards and columns, role rights), the core exposes a
registry and the domain fills it from `src/config/domain-registrations.ts`. The two sides meet only in the
composition points: `config/domain-registrations.ts`, `routes/protected/private.routes.tsx`,
`redux/store.ts`, `hooks/useNavigationMenus.tsx`.

See `docs/code/architecture/en/CORE_DOMAIN.md` and the checklist in `apps/bo/CLAUDE.md`.
