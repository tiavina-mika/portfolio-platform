# Debt — Adopt the 1lalana back-office with a `_core` / `_domain` split

> Review: [261030-feat-core-domain-split.md](../261030-feat-core-domain-split.md)
> Branch: `feat/core-domain-split` · Created 2026-10-30 at 08:17 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. Existing roles are not renamed](#1-existing-roles-are-not-renamed)
- [2. A deployed server needs two owners and an SMS key](#2-a-deployed-server-needs-two-owners-and-an-sms-key)
- [3. Carpooling class names remain in the core](#3-carpooling-class-names-remain-in-the-core)
- [4. Project gaps in the dashboard, search and versions](#4-project-gaps-in-the-dashboard-search-and-versions)
- [5. Back-office screens without a server or data source](#5-back-office-screens-without-a-server-or-data-source)
- [6. The website build needs a Parse server](#6-the-website-build-needs-a-parse-server)
- [7. Resubscribing skips the double opt-in](#7-resubscribing-skips-the-double-opt-in)
- [8. Website leftovers](#8-website-leftovers)
- [9. Carpooling wording and content](#9-carpooling-wording-and-content)
- [10. Not ported and unused dependencies](#10-not-ported-and-unused-dependencies)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟠 Medium | Regression | Roles `Owner` / `Administrator` / `Manager` of an existing database are not recognised | ⏳ to do |
| 2 | 🟠 Medium | Bug | `validateEnv` blocks a single-owner portfolio and requires an SMS key | ⏳ product decision |
| 3 | 🟡 Low | Bug | Carpooling classes still listed in `collections` and security class lists | ⏳ to do |
| 4 | 🟡 Low | Bug | Project dashboard column, search by author, version restore | ⏳ to do |
| 5 | 🟡 Low | Bug | Screens calling Cloud Functions that do not exist, hidden menu entry | ⏳ to do |
| 6 | 🟡 Low | Bug | `next build` needs a reachable Parse server | ⏳ to do |
| 7 | 🟡 Low | Hole | `resubscribeNewsletter` ignores `confirmed` | ⏳ to do |
| 8 | 🟡 Low | Bug | Website leftovers (zod locale, orphans, keys, FAQ, `mg`) | ⏳ to do |
| 9 | 🟡 Low | Bug | Carpooling wording in locales and shared FAQ | ⏳ to do |
| 10 | 🟡 Low | Debt | Tests, Storybook (BO), e2e, mobile, docs app, rating; unused dependencies | ⏳ to do |

## 1. Existing roles are not renamed

- **Severity**: 🟠 Medium · **Type**: Regression · **Status**: ⏳ to do
- **Concerned**: `libs/shared-constants/src/role.constants.ts`, `apps/server/src/cloud/utils/_core/role.utils.cloud.ts`

**What can happen** — a database created before the branch holds the `_Role` rows `Owner`, `Administrator`, `Manager`. The code looks for `OWNER`, `SUPER_ADMIN`, `MANAGER`: no account is highest-level, `ensureDefaultRolesExist` does nothing while `SUPER_ADMIN` does not exist, and the back-office shows no sidebar entry.

**Why** — the role names changed, and there is no migration job.

**How to check** — start the server on a copy of an old database and open the back-office with the former owner.

**How to fix**

1. **(recommended)** One-off migration job `renameLegacyRolesJob` in `cloud/jobs/_core/`, run once from the miscellaneous page: rename the three roles in place (keeps the users relation and ACL), then rebuild the CLPs.
   *Why*: no data loss, reversible, uses the existing job tooling.
2. Rename by hand in the database (Compass / Atlas) before the first deploy — cheap, but easy to forget and not tracked.

## 2. A deployed server needs two owners and an SMS key

- **Severity**: 🟠 Medium · **Type**: Bug · **Status**: ⏳ product decision
- **Concerned**: `apps/server/src/utils/_core/validateEnv.ts`, `apps/server/src/constants/_core/role.constants.ts` (`MIN_OWNERS_COUNT`)

**What can happen** — in `preProduction` / `production` the server stops at boot unless `OWNERS_EMAILS` lists two distinct addresses and `MMSDUCK_API_KEY`, `WEBSITE_REVALIDATE_SECRET` are set. A portfolio with one owner and no SMS provider cannot deploy. `UPSTASH_REDIS_*` and `ADMIN_EMAIL_SENDER` are required even locally.

**Why** — the rules come from the 1lalana platform (a lone owner has no way back if they lose their authenticator).

**How to check** — run `validateEnv()` with a single address in `OWNERS_EMAILS`.

**How to fix**

1. **(recommended)** Make `MIN_OWNERS_COUNT` and the SMS key requirement configurable by the domain (1 owner, no SMS for the portfolio) and keep the strict values as the core default.
   *Why*: keeps the safe default for a generic back-office, unblocks the portfolio.
2. Keep the rule and ask the user to add a second address and an SMS account — safest, but costs a service the portfolio does not use.

## 3. Carpooling class names remain in the core

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/constants/_core/constants.ts` (`collections`), `security.constants.ts`, `country-scope.constants.ts`, `user.constants.ts`, `test.functions.ts` (`createRideMock`)

**What can happen** — `Ride`, `Request`, `Vehicle`, `Rating`, `RideShare`, `SosAlert` are still named in the class lists, so the class-permission rebuild at boot may create empty locked classes in MongoDB, and the test function `createRideMock` is still exposed.

**Why** — the core was copied without the ride domain and these names were not removed.

**How to check** — start the server on an empty database and list the Parse classes.

**How to fix**

1. **(recommended)** Remove the names from the lists and delete `createRideMock`; run lint and the typecheck.
   *Why*: smallest change, no data involved.
2. Keep them and filter the rebuild on classes that exist in the schema — hides the problem instead of removing it.

## 4. Project gaps in the dashboard, search and versions

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/containers/_domain/dashboard/ProjectDashboardRecentColumns.tsx`, `apps/server/src/cloud/services/_domain/project-dashboard.service.cloud.ts`, `project-search.service.cloud.ts`, `apps/bo/src/pages/_domain/`

**What can happen** — the "recent projects" column renders only if the server sends `recent.projects`, which it does not. The project list searches translated text but not by author. The shape of a project result in the global search is not verified. The restore of content versions is not wired for `Project` (`EditProject` passes no versions).

**Why** — the BO and the server domain were ported separately.

**How to check** — open the dashboard, search a project by author, edit a project and look for the versions tab.

**How to fix**

1. **(recommended)** Register a recent-activity provider for `Project` in `project-dashboard.service.cloud.ts`, align the list search fields and the global-search result with the BO, pass the versions in `EditProject`.
   *Why*: uses the registries made for it.

## 5. Back-office screens without a server or data source

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/redux/actions/_core/finance.action.ts`, `statistics.action.ts`, `useNavigationMenus.tsx`, `apps/server/src/cloud/functions/_core/payment.functions.ts`

**What can happen** — the BO calls 17 Cloud Functions the server does not define: `getFinanceOverview`, `getOverduePendingPayments`, `recheckPendingPayment`, `getDriverWalletBalance`, `getDriversWithPendingDebt`, `getUsersStatistics`, `getPaymentsStatistics`, `getReportsStatistics`, `getCancellationStatistics`, `getCancellationReasonBreakdown`, `getRidesStatistics`, `getRidesActivityHeatmap`, `getVehiclesStatistics`, `clearUserSuspension`, `getSuspendedUsers`, `getChargedPendingRequests`, `settleChargedPendingRequest`. Finance and four of five statistics views fail. Payments run on a simulated gateway and the production boot check was removed. The `Diffusion` entry has `uiRight` but no `hasRightName`, so it is hidden for everyone; `Settings` is visible only to the highest roles.

**Why** — screens ported from 1lalana for features the portfolio does not have.

**How to check** — open Finance and Statistics, and look at the network calls.

**How to fix**

1. **(recommended)** Remove the Finance, Payments and the failing Statistics views from the sidebar and routes (they have no data source), fix the `Diffusion` right.
   *Why*: a screen that always fails is worse than none; the code stays in git.
2. Implement the missing functions against the portfolio's data — large, with no concrete need.

## 6. The website build needs a Parse server

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/web/next.config.mjs`, `apps/web/server/queries`

**What can happen** — with `cacheComponents` the pages fetch at build time: `next build` fails without a reachable Parse server (red locally, and in CI without a server).

**Why** — the structure was aligned on 1lalana's website.

**How to check** — `pnpm nx run web:build` with the server stopped.

**How to fix**

1. **(recommended)** Build in CI/Render against the deployed server URL and document it; keep the fetches.
   *Why*: matches how the site is deployed.
2. Make the build tolerant (empty fallbacks, `generateStaticParams` returning nothing) — hides real failures.

## 7. Resubscribing skips the double opt-in

- **Severity**: 🟡 Low · **Type**: Hole · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/functions/_core/app.functions.ts` (`resubscribeNewsletter`)

**What can happen** — anyone holding a valid encrypted unsubscribe link can re-activate (`active: true`) an address that never confirmed.

**How to fix**

1. **(recommended)** Only set `active: true` when `confirmed` is not `false`; otherwise send a confirmation e-mail.
   *Why*: small local change, restores the opt-in guarantee.

## 8. Website leftovers

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/web/app/[locale]/layout.tsx`, `apps/web/components/Map.tsx`, `apps/web/components/Avatar.tsx`, `apps/web/utils/user.utils.ts`, `apps/web/global.d.ts`, `apps/web/translations`

**What can happen** — the zod error-message locale is no longer loaded in the layout (to verify that validation messages are localised); `Map.tsx` has no importer, and `Avatar.tsx` (the only user of `user.utils.ts`) has none either; the `Messages` type in `global.d.ts` lacks the `home` and `project` namespaces; some translation keys are stale; the FAQ is not ported; the locale `mg` is absent (`fr` and `en` only, 1lalana has `mg`).

**How to check** — submit the contact form with invalid data in `en`; grep for importers.

**How to fix**

1. **(recommended)** Load the zod locale in the layout, delete the orphan files, add the two namespaces to `global.d.ts`, remove stale keys with `pnpm check-i18n`.
   *Why*: mechanical and covered by `implementation-completeness.md`.
2. Add `mg` and a FAQ page — product decisions, tracked separately.

## 9. Carpooling wording and content

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/config/i18n/locales/*/_core/{finance,statistics}.json`, `user/` ticket keys, `libs/shared-faq`

**What can happen** — finance, statistics and ticket texts speak of rides and drivers (the ride keys were merged into `_core` json); `shared-faq` holds 1lalana's ride FAQ with the old brand name, unused by the website.

**How to fix**

1. **(recommended)** Rewrite the texts in the three locales (or drop them with item 5) and empty or rewrite `shared-faq`.
   *Why*: the displayed words must match the product.

## 10. Not ported and unused dependencies

- **Severity**: 🟡 Low · **Type**: Debt · **Status**: ⏳ to do
- **Concerned**: `apps/bo/package.json`, whole repository

**What can happen** — not ported from 1lalana: unit tests (jest / vitest), Storybook for the back-office, end-to-end tests, the mobile app, the documentation app (the server `/docs` route has nothing to serve; `DOCS_*_PASSWORD` are validated but absent from `.env.example`) and rating. `apps/bo/package.json` has the unused `i18next-browser-languagedetector` and `mui-password-checklist`.

**How to fix**

1. **(recommended)** Remove the two dependencies now; plan tests (server first) as a separate task, per `engineering-principles.md`.
   *Why*: tests need their own setup and should not be invented inside this branch.
