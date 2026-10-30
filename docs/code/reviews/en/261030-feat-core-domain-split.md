# Review — Adopt the 1lalana back-office with a `_core` / `_domain` split

- **Branch**: `feat/core-domain-split`
- **Type**: New feature (large refactor of the structure)
- **Author**: tiavina-mika — `tiavinamika@gmail.com` (GitHub: `tiavina-mika`)
- **Created**: 2026-10-30 at 08:17
- **Apps touched**: Server, Back-office, Website, shared libraries

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [Back-office](#back-office)
- [Website](#website)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [What is left to do](#what-is-left-to-do)

## In short

The portfolio now runs on the generic back-office of the 1lalana platform. The code of the server and of the back-office is split in a generic part (`_core`: accounts, roles, content, tickets, notifications, reports, dashboards) and the portfolio's own part (`_domain`: the projects), described in [CORE_DOMAIN.md](../../architecture/en/CORE_DOMAIN.md). The administrator gets many new screens (notifications, reports, audit log, user invitations with two-factor authentication). The website keeps the portfolio design on 1lalana's structure: the blog replaces the articles address, the contact page moves to `/contact`, a newsletter subscription must now be confirmed by e-mail, and pages can be nested by category. The old addresses redirect permanently. Roles are renamed (`OWNER`, `SUPER_ADMIN`, ...), and a deployed server now refuses to start without two owner addresses and the SMS and cache keys.

## Database

| Class | New? | Fields added / changed | What it is for |
|---|---|---|---|
| `_Role` | no | names in capitals; `countries`, inactivity timeout | roles `OWNER`, `SUPER_ADMIN`, `MANAGER`, `SUPPORT_VIEWER`, `TEAM_LEAD` |
| `_User` | no | `emailVerified`, `phoneVerified`, `phone`, MFA and session fields | verified contacts, two-factor authentication |
| `Contact` | no | `reference`, `priority`, `subject`, `phone`, `source`, `lastMessageAt`, `seen` | the contact form becomes a support ticket |
| `Newsletter` | no | `confirmed`, `confirmationTokenHash`, `seen` | double opt-in |
| `Invitation`, `TicketMessage`, `Notification`, `NotificationResend`, `Payment`, `Report`, `UserAuditLog`, `RoleAuditLog`, `SessionAuditLog`, `MfaAuditLog`, `UserSession`, `ContentVersion`, `ImpersonationSession`, `PushReceipt`, `UserModerationLog`, `PenaltyLog` | yes | all | generic back-office (full list in [the inventory](../../../inventory/code/en/COLLECTIONS_AND_INDEXES.md)) |

Indexes: declared in code by the core (see the inventory page above). Existing rows created before the branch have none of the new fields: read paths treat them as missing.

## Server

- Folders split in `_core` / `_domain`; `Project` functions are `getProjects`, `getProject`, `getProjectForClient`, with their triggers, dashboard figures and global-search entry.
- About 150 Cloud Functions, 13 scheduled tasks, e-mail and SMS builders, Redis-backed rate limiting, Slack alerts (see [the inventory](../../../inventory/README.md)).
- New environment variables and services: Upstash Redis, MMSDuck (SMS), Expo push, Slack alerts webhook, Sentry, `WEBSITE_REVALIDATE_SECRET`. The request header is now `X-portfolio-key`.
- `validateEnv`: in `preProduction` and `production`, `OWNERS_EMAILS` needs two distinct addresses, and `MMSDUCK_API_KEY` and `WEBSITE_REVALIDATE_SECRET` are required.

## Back-office

- **Pages touched**: the whole back-office (local URL: the Vite dev server of `pnpm nx run bo:dev`, or the server URL once built and copied).
- The sidebar now has Dashboard, Content (articles, pages, categories, projects), Operations (contacts as tickets, reports, notifications, payments, finance, statistics), Users, Roles, Settings, Miscellaneous. Sign-up is by invitation only; two-factor authentication, sessions, impersonation and a roles journal exist. Feature pages are in [docs/features/bo](../../../features/bo/README.md).
- The project screens (list, preview, add / edit) live in `_domain`.

## Website

- **Pages touched** (default locale `fr`, `http://localhost:9012/fr/...`): home, `/projects`, `/projects/<slug>`, `/blog`, `/blog/<slug>`, `/contact`, `/newsletter/confirmer/<token>`, `/newsletter/<encrypted>/se-desabonner`, nested pages `/<slug>/<subcategory>/...`, `/sitemap`.
- `/articles` redirects to `/blog` and `/contact-me` to `/contact` (permanent). New: `/pages/sitemap.xml`, `/api/revalidate` (the server asks the website to refresh its cache). Removed: `/api/recaptcha-verification` (the check moved to the server).
- The visitor gets an acknowledgement e-mail after the contact form, and must confirm a newsletter subscription. Feature pages are in [docs/features/web](../../../features/web/README.md).

## See the result locally

```bash
pnpm nx run server:dev
pnpm nx run bo:dev
pnpm nx run web:dev
```

Ports come from each app's env file (website: `http://localhost:9012`). The website has Storybook (`pnpm nx run web:sb`, `http://localhost:6016`), unchanged by this branch.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🟠 Medium | Regression | Accounts of an existing database keep the roles `Owner` / `Administrator` / `Manager`, which the code no longer recognises: nobody is highest-level and the BO shows nothing | first deploy on an existing database | ⏳ deferred — [debt #1](debt/261030-feat-debt-core-domain-split.md#1-existing-roles-are-not-renamed) |
| 🟠 Medium | Bug | A single-owner portfolio cannot boot when deployed (2 owner addresses, SMS key, cache secret required) | deploy to pre-production / production | ⏳ deferred — [debt #2](debt/261030-feat-debt-core-domain-split.md#2-a-deployed-server-needs-two-owners-and-an-sms-key) |
| 🟡 Low | Bug | Empty locked classes (`Ride`, `Request`, ...) can be created at boot by the class-permission rebuild | boot | ⏳ deferred — [debt #3](debt/261030-feat-debt-core-domain-split.md#3-carpooling-class-names-remain-in-the-core) |
| 🟡 Low | Bug | Dashboard "recent projects" column and project search by author do not work; content-version restore is not wired for projects | dashboard, projects list | ⏳ deferred — [debt #4](debt/261030-feat-debt-core-domain-split.md#4-project-gaps-in-the-dashboard-search-and-versions) |
| 🟡 Low | Bug | The back-office calls 17 Cloud Functions the server does not define (finance, 4 of 5 statistics views, suspensions, bookings); the `Diffusion` menu entry is hidden for all | opening these screens | ⏳ deferred — [debt #5](debt/261030-feat-debt-core-domain-split.md#5-back-office-screens-without-a-server-or-data-source) |
| 🟡 Low | Bug | `next build` of the website needs a reachable Parse server | local / CI build | ⏳ deferred — [debt #6](debt/261030-feat-debt-core-domain-split.md#6-the-website-build-needs-a-parse-server) |
| 🟡 Low | Hole | `resubscribeNewsletter` re-activates an address that never confirmed, from any valid unsubscribe link | newsletter | ⏳ deferred — [debt #7](debt/261030-feat-debt-core-domain-split.md#7-resubscribing-skips-the-double-opt-in) |
| 🟡 Low | Bug | Website leftovers: zod error messages locale, unused files, stale keys, FAQ not ported, no `mg` locale | website | ⏳ deferred — [debt #8](debt/261030-feat-debt-core-domain-split.md#8-website-leftovers) |
| 🟡 Low | Bug | Carpooling wording in finance, statistics and ticket texts; FAQ content is the old ride FAQ with the old brand | back-office, shared-faq | ⏳ deferred — [debt #9](debt/261030-feat-debt-core-domain-split.md#9-carpooling-wording-and-content) |
| 🟡 Low | Debt | Tests, back-office Storybook, e2e, mobile, docs app and rating not ported; two unused back-office dependencies | — | ⏳ deferred — [debt #10](debt/261030-feat-debt-core-domain-split.md#10-not-ported-and-unused-dependencies) |

Nothing found blocks the merge; the first two points need action at deploy time. See the [debt file](debt/261030-feat-debt-core-domain-split.md).

## What is left to do

The ten debt points above. Not tested in a browser during this review: the fixes and screens were checked in the code only.
