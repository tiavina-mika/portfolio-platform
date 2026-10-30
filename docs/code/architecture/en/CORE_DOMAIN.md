# Core and Domain

## Table of Contents

- [Why the split](#why-the-split)
- [What is core, what is domain](#what-is-core-what-is-domain)
- [Decision test](#decision-test)
- [Dependency direction](#dependency-direction)
- [Registries and composition points](#registries-and-composition-points)
  - [Server](#server)
  - [Back-office](#back-office)
  - [Website](#website)
  - [Shared libraries](#shared-libraries)
- [Adding a domain entity](#adding-a-domain-entity)
- [What was not ported](#what-was-not-ported)
- [Known limits](#known-limits)

## Why the split

`apps/server` and `apps/bo` are the generic back-office of the 1lalana platform (accounts, roles, CMS, notifications, tickets, reports, audit log, dashboards) with the portfolio's own business added on top. Keeping the two apart means the generic part can be reused or upgraded without touching the portfolio, and the portfolio's business (`Project`) sits in one place.

## What is core, what is domain

| Side | Holds |
|---|---|
| `_core/` | Code that still works if `_domain/` is deleted: auth, MFA, users, roles and rights, CMS (article, page, page section, category, contact, newsletter), notifications, payments, tickets, reports, audit log, dashboards and statistics as registries |
| `_domain/` | What is specific to the portfolio: the `Project` entity and anything that cannot run without knowing it |

Today `_domain/` holds only `Project`: on the server `project.functions.ts` (`getProjects`, `getProject`, `getProjectForClient`), `project.triggers.ts`, services, utils, constants and validations; in the back-office the pages, containers, redux, service, types, validations and translations of projects.

`apps/web` is **not** split: it is the public website and has no generic back-office part. Its structure follows 1lalana's web app and its design stays the portfolio's.

## Decision test

Does the file import the `Project` class or collection, or would it break if `_domain/` were deleted?

- No: `_core/`.
- Yes: `_domain/`.

## Dependency direction

```text
_domain/  ->  _core/    allowed (the domain reuses generic building blocks)
_core/    ->  _domain/  never (it would make _core impossible to delete)
```

Lint enforces it: `no-restricted-imports` (`coreDomainBoundaryConfig` of `@shared/eslint-config`) fails on a `_core` file that imports a `_domain` path. The domain class names that `_core` needs (for instance the public-read class list) come from `DOMAIN_COLLECTIONS` in `libs/shared-domain-constants`, which belongs to neither side.

## Registries and composition points

When `_core` must show domain data, it exposes a registry (`registerXxx(...)`) and `_domain` calls it when its module loads. The only files that import both sides are the composition points.

### Server

| Registry (in `_core`) | Filled by the domain |
|---|---|
| `registerDashboardKpiProvider(className, fn)` | `project-dashboard.service.cloud.ts` |
| `registerGlobalSearchEntity(key, config)` | `project-search.service.cloud.ts` |

Other registries exist and are unused by the portfolio (statistics overview, report targets, notification channels, user list enrichers, account deletion hooks, data export targets, payment handlers).

Composition points: `cloud/services/index.ts`, `cloud/functions/index.ts`, `cloud/triggers/index.ts`, `cloud/jobs/index.ts` (each imports the `_core` files, then the `_domain` ones) and `src/index.ts`.

### Back-office

Registries fill dashboard cards and columns, and the entities that can receive role rights (`registerRightsEntities`). Composition points: `src/config/domain-registrations.ts` (side-effect imports, loaded first by `main.tsx`), `src/routes/protected/private.routes.tsx`, `src/redux/store.ts` and `src/hooks/useNavigationMenus.tsx`. Each of `pages`, `containers`, `hooks`, `services`, `types`, `utils`, `validations`, `constants`, `redux/actions`, `redux/reducers` and the locale folders has a `_core/` and a `_domain/` subfolder. `components/` stays flat.

### Website

No split, no registry. Domain pages (`projects`) and generic ones (`blog`, `contact`, `newsletter`, `pages`) sit side by side under `app/[locale]`.

### Shared libraries

`libs/shared-*` are neutral: `shared-domain-constants`, `shared-domain-types` and `shared-domain-utils` hold the domain's shared names, types and helpers; `shared-validations` and `shared-faq` are generic.

## Adding a domain entity

1. Shared names, types and constants first, in the matching `libs/shared-*`; add the class name to `DOMAIN_COLLECTIONS`.
2. Server, all under `_domain/`: validations and constants, service, utils, `<entity>.functions.ts`, `<entity>.triggers.ts`; import the files in the `cloud/*/index.ts` points; register the dashboard and search providers if the entity should appear there.
3. Back-office, all under `_domain/`: type, validation, service, redux action and reducer (registered in `store.ts`), page and container, route in `private.routes.tsx`, sidebar entry, translations in every locale, rights entity in the domain registrations.
4. Website: page, queries, translations (`fr`, `en`), sitemap entry.
5. Docs: `docs/features/`, `docs/inventory/`, and the review of the branch.

## What was not ported

From 1lalana, left out on purpose: the rating feature, unit and component tests, Storybook for the back-office, end-to-end tests, the mobile app and the documentation app. The traces that remain (class names, test functions) are listed in the debt file of the branch review.

## Known limits

- The server `collections` constant and some class lists still name carpooling classes (`Ride`, `Request`, `Vehicle`, `Rating`, `RideShare`, `SosAlert`).
- Payments, finance and some statistics screens exist in `_core` without a real data source in the portfolio.

See [the branch review](../../reviews/en/261030-feat-core-domain-split.md) for the full list.
