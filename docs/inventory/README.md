# Inventory

## Table of Contents

- [Environments](#environments)
- [Environment variables](#environment-variables)
  - [apps/server](#appsserver)
  - [apps/bo](#appsbo)
  - [apps/web](#appsweb)
- [Cloud Code](#cloud-code)
- [Scheduled tasks](#scheduled-tasks)
- [Roles and permissions](#roles-and-permissions)
- [Collections and indexes](#collections-and-indexes)
- [Emails](#emails)
- [GitHub workflows](#github-workflows)
- [GitHub secrets and variables](#github-secrets-and-variables)
- [Detailed pages](#detailed-pages)
- [Keeping it up to date](#keeping-it-up-to-date)

## Environments

Three environments: local development (`development`), pre-production (`preProduction`) and production (`production`). The server reads `NODE_ENV`, the web reads `APP_ENV`, the back-office reads `VITE_ENVIRONMENT`. Details: [environments](code/en/ENVIRONMENTS.md).

The server code is split in `_core` (generic, reusable) and `_domain` (the portfolio projects) folders, see [CORE_DOMAIN.md](../code/architecture/en/CORE_DOMAIN.md). The Cloud Code lists below follow that split.

## Environment variables

Real values are never committed: each app ships a `.env.example`.

### `apps/server`

Copy `.env.example` to `.env.preprod` (local) or `.env.prod`; in a deployed environment the variables are set on the host. `validateEnv()` (`apps/server/src/utils/_core/validateEnv.ts`, `envalid`) stops the boot when a required variable is missing.

Required everywhere: `PORT`, `MONGO_URL`, `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY`, `SERVER_URL`, `WEBSITE_URL`, `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `BREVO_API_KEY`, `ADMIN_EMAIL_SENDER`, the three `CLOUDINARY_*` variables and the three `UPSTASH_REDIS_*` variables.

Required only in the deployed environments (`preProduction` and `production`); optional in development and test:

- `OWNERS_EMAILS` must list at least two distinct addresses (`MIN_OWNERS_COUNT`). A single owner who loses their authenticator leaves the OWNER-only actions out of reach, so a deployed server with one owner does not start.
- `MMSDUCK_API_KEY` must not be empty: without it every SMS (sign-up codes, password resets, alerts) is refused. Elsewhere SMS are only logged.
- `WEBSITE_REVALIDATE_SECRET` must not be empty: without it the website cache is never invalidated. It must equal the web `REVALIDATE_SECRET`.

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port |
| `IS_PREPROD` | Marks the pre-production environment |
| `MONGO_URL` | MongoDB connection string |
| `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY` | Parse Server credentials (`REST_API_KEY` is also the value the clients send in the `X-portfolio-key` header) |
| `SERVER_URL`, `WEBSITE_URL` | Public URLs of the API and of the website |
| `LOCAL_NETWORK_HOSTNAME` | Optional, local only: LAN host used to print a server URL reachable from a phone |
| `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `CRYPTO_IV` | Encryption keys (`CRYPTO_IV` is in `.env.example` but not checked by `validateEnv()`) |
| `BREVO_API_KEY`, `ADMIN_EMAIL_SENDER` | Emails (API key and default sender) |
| `OWNERS_EMAILS` | Comma-separated emails that receive a back-office invitation with the `OWNER` role at boot (see above for the deployed minimum) |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | File storage |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `UPSTASH_REDIS_URL` | Upstash Redis: rate limits and the lock that lets only one server instance run a scheduled job tick |
| `WEBSITE_REVALIDATE_SECRET` | Shared secret to invalidate the website CMS cache (must equal the web `REVALIDATE_SECRET`) |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret: the server verifies the token of the contact and newsletter forms. Skipped in development and test, fails closed elsewhere |
| `MMSDUCK_API_KEY` | MMSDuck SMS provider key |
| `EXPO_ACCESS_TOKEN`, `ANDROID_SMS_RETRIEVER_HASH` | Optional: Expo push token (needed once "enhanced push security" is on) and Android SMS auto-read hash |
| `SLACK_ALERTS_WEBHOOK_URL` | Optional: Slack incoming webhook of the staff alert channel; empty means nothing is posted |
| `PAYMENT_MOCK_MODE`, `PAYMENT_MOCK_CONFIRM_SECONDS`, `ALLOW_MOCK_PAYMENT_GATEWAY` | Optional switches of the simulated payment gateway; `ALLOW_MOCK_PAYMENT_GATEWAY` must be set by hand to use it in production |
| `DOCS_FEATURES_PASSWORD`, `DOCS_BUSINESS_PASSWORD` | Optional, validated by `validateEnv()` but not in `.env.example`: passwords of the documentation sections served by the server; a section without one stays closed (404) |

Also read by the code and set by the host or by tests only: `K_SERVICE` (Cloud Run marker), `TZ`, `E2E`, `E2E_ALLOWED_ORIGINS`, `REAL_SIGN_UP_VERIFICATION`, `BOOKINGS_CLOSED`.

### `apps/bo`

Every `VITE_*` variable is inlined in the browser bundle and is **not a secret**. `SENTRY_AUTH_TOKEN` is the exception: it is read only at build time (source map upload), is not a `VITE_*` variable and must not be exposed.

| Variable | Purpose |
|---|---|
| `VITE_ENVIRONMENT` | Environment name |
| `VITE_SERVER_URL` | Parse Server URL |
| `VITE_PARSE_APP_ID` | Parse application id |
| `VITE_APP_ACCESS_TAG` | Value of the server `REST_API_KEY`, sent as the `X-portfolio-key` header (public by design, since it ships in the bundle) |
| `VITE_WEBSITE_URL` | Public website URL |
| `VITE_ADMIN_EMAIL_SENDER` | Sender address shown to admins |
| `VITE_LOCAL_SERVER_PORT` | Optional: local server port when it is not the default |
| `VITE_DISABLE_SESSION_TIMEOUT` | Optional: `true` disables the inactivity logout (development) |
| `VITE_SUPPORT_PHONE_YAS`, `VITE_SUPPORT_PHONE_AIRTEL`, `VITE_SUPPORT_PHONE_ORANGE` | Optional: support phone numbers shown on the About page (they win over the defaults in the code) |
| `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` | Sentry error reporting of the browser (public DSN) |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Build time only: source map upload to Sentry |

`VITE_APP_RELEASE` and `VITE_APP_BUILD_TIME` are computed by `vite.config.ts` at build time.

### `apps/web`

Validated by `apps/web/env.ts`. `NEXT_PUBLIC_*` variables are exposed to the browser and are **not secrets**.

| Variable | Purpose |
|---|---|
| `APP_ENV` | `development`, `preProduction` or `production` (set by the scripts) |
| `PARSE_APP_ID`, `REST_API_KEY`, `SERVER_URL` | Parse access from the Next.js server |
| `APP_URL` | Public URL of the website |
| `REVALIDATE_SECRET` | Optional locally: secret checked by `/api/revalidate`, which the server calls to invalidate the CMS cache. While unset the endpoint refuses every call |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional: per-visitor rate limit of the contact and newsletter forms; without them the website does not limit (the server still applies its own limit) |
| `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_APP_URL` | URLs exposed to the browser |
| `NEXT_PUBLIC_GOOGLE_MAP_KEY` | Google Maps public key |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA public site key (the token is sent to the server, which verifies it) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional: Google Analytics 4 measurement id; unset means analytics is off |

## Cloud Code

Source: `apps/server/src/cloud/`. Each kind has a `_core/` folder (generic) and a `_domain/` folder (the `project` domain). The full list of function, trigger and job names is in [Cloud Code](code/en/CLOUD_FUNCTIONS.md).

| Kind | Files |
|---|---|
| Functions | `_core/`: `accountHelp`, `admins`, `app`, `article`, `auditLog`, `auth`, `category`, `contact`, `contactChange`, `contentVersion`, `dashboard`, `faq`, `globalSearch`, `impersonation`, `invitation`, `mfa`, `misc`, `notification`, `page`, `pageSection`, `passwordResetDelay`, `payment`, `payoutPhone`, `receipt`, `report`, `role`, `statistics`, `stepUpVerification`, `ticket-message`, `user`, `userSession`, `utils` (and `test`, local and test only). `_domain/`: `project` |
| Triggers | `_core/`: `app`, `article`, `auth`, `category`, `contact`, `country-scope`, `newsletter`, `notification`, `page`, `pageSection`, `payment`, `report`, `role`, `ticket-message`, `user`. `_domain/`: `project` |
| Jobs | `_core/`: `category`, `cms`, `email`, `impersonation`, `misc`, `newsletter`, `notification`, `payment`, `push`, `retention`, `slack`, `user` (and `test`). `_domain/`: none |

## Scheduled tasks

Thirteen `node-cron` tasks registered by `apps/server/src/config/scheduled-jobs.ts`: a keep-awake ping outside local development and Cloud Run, and twelve business jobs that only run in production. A Redis lock makes only one server instance run each tick. GitHub workflows run on schedules too. Details: [scheduled tasks](code/en/SCHEDULED_JOBS.md).

## Roles and permissions

Roles `OWNER` and `SUPER_ADMIN` (highest level), and the default roles `MANAGER`, `SUPPORT_VIEWER` and `TEAM_LEAD`, with per-entity rights and back-office "ui" rights stored on the Parse `_Role`. Details: [roles and permissions](code/en/ROLES_AND_PERMISSIONS.md).

## Collections and indexes

Domain collection `Project`; core collections `Article`, `Page`, `PageSection`, `Category`, `Contact`, `Newsletter`, `App`, `Notification`, `Payment`, `Report`, the audit and session logs, and Parse's `_User`, `_Role` and `_Session`. Indexes are declared in code (`apps/server/src/config/db-indexes.ts`). Details: [collections and indexes](code/en/COLLECTIONS_AND_INDEXES.md).

## Emails

Verification and reset codes, invitations, step-up and contact-change codes, ticket replies, newsletter confirmation and new-article mailing, and account security notices, all sent through Brevo (SMS through MMSDuck). Details: [emails](communication/en/EMAILS.md).

## GitHub workflows

Eight workflows in `.github/workflows/`: CI, security, release, Storybook tests, Chromatic, Lighthouse and two Slack notifiers. Details: [CI workflows](code/en/CI_WORKFLOWS.md).

## GitHub secrets and variables

Secrets `RELEASE_TOKEN`, `SLACK_CHANGELOG_WEBHOOK_URL`, `CHROMATIC_PROJECT_TOKEN_WEB`; variable `LIGHTHOUSE_URLS`. Details: [GitHub variables and secrets](code/en/GITHUB_VARIABLES_AND_SECRETS.md).

## Detailed pages

Each page has an English and a French version (the French file name ends with `.FR`).

| Topic | English | French |
|---|---|---|
| Environments | [ENVIRONMENTS.md](code/en/ENVIRONMENTS.md) | [ENVIRONMENTS.FR.md](code/fr/ENVIRONMENTS.FR.md) |
| Cloud Code | [CLOUD_FUNCTIONS.md](code/en/CLOUD_FUNCTIONS.md) | [CLOUD_FUNCTIONS.FR.md](code/fr/CLOUD_FUNCTIONS.FR.md) |
| Scheduled tasks | [SCHEDULED_JOBS.md](code/en/SCHEDULED_JOBS.md) | [SCHEDULED_JOBS.FR.md](code/fr/SCHEDULED_JOBS.FR.md) |
| Roles and permissions | [ROLES_AND_PERMISSIONS.md](code/en/ROLES_AND_PERMISSIONS.md) | [ROLES_AND_PERMISSIONS.FR.md](code/fr/ROLES_AND_PERMISSIONS.FR.md) |
| Collections and indexes | [COLLECTIONS_AND_INDEXES.md](code/en/COLLECTIONS_AND_INDEXES.md) | [COLLECTIONS_AND_INDEXES.FR.md](code/fr/COLLECTIONS_AND_INDEXES.FR.md) |
| CI workflows | [CI_WORKFLOWS.md](code/en/CI_WORKFLOWS.md) | [CI_WORKFLOWS.FR.md](code/fr/CI_WORKFLOWS.FR.md) |
| GitHub variables and secrets | [GITHUB_VARIABLES_AND_SECRETS.md](code/en/GITHUB_VARIABLES_AND_SECRETS.md) | [GITHUB_VARIABLES_AND_SECRETS.FR.md](code/fr/GITHUB_VARIABLES_AND_SECRETS.FR.md) |
| Emails | [EMAILS.md](communication/en/EMAILS.md) | [EMAILS.FR.md](communication/fr/EMAILS.FR.md) |

External services have their own guides in [services](../services/README.md).

## Keeping it up to date

A new environment variable, external service, Cloud Function, trigger, job, role, collection, scheduled task, workflow or GitHub secret updates this page or the matching detailed page (and [services](../services/README.md) when it is a service) in the same change. The check is `node .claude/skills/inventory/scripts/inventory.mjs`.
