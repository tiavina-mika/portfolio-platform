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

## Environment variables

Real values are never committed: each app ships a `.env.example`.

### `apps/server`

Copy `.env.example` to `.env.preprod` (local) or `.env.prod`; in a deployed environment the variables are set on the host. `validateEnv()` requires everything below except `IS_PREPROD`, `ADMIN_EMAIL_SENDER` and `OWNERS_EMAILS`.

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port |
| `IS_PREPROD` | Marks the pre-production environment |
| `MONGO_URL` | MongoDB connection string |
| `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY` | Parse Server credentials |
| `SERVER_URL`, `WEBSITE_URL` | Public URLs of the API and of the website |
| `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `CRYPTO_IV` | Encryption keys |
| `BREVO_API_KEY`, `ADMIN_EMAIL_SENDER` | Emails (API key and default sender) |
| `OWNERS_EMAILS` | Comma-separated emails that get the Owner role when their account is created |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | File storage |

### `apps/bo`

All variables are inlined in the browser bundle: none may be a secret.

| Variable | Purpose |
|---|---|
| `VITE_ENVIRONMENT` | Environment name |
| `VITE_SERVER_URL` | Parse Server URL |
| `VITE_PARSE_APP_ID`, `VITE_REST_API_KEY` | Parse client credentials |
| `VITE_WEBSITE_URL` | Public website URL |
| `VITE_ADMIN_EMAIL_SENDER` | Sender address shown to admins |

### `apps/web`

Validated by `apps/web/env.ts`.

| Variable | Purpose |
|---|---|
| `APP_ENV` | `development`, `preProduction` or `production` (set by the scripts) |
| `PARSE_APP_ID`, `SERVER_URL` | Parse access from the Next.js server |
| `APP_URL` | Public URL of the website |
| `SENDER_EMAIL` | Declared in `.env.example` but not read by any code today |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA server key |
| `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_APP_URL` | URLs exposed to the browser |
| `NEXT_PUBLIC_GOOGLE_MAP_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public keys exposed to the browser |

## Cloud Code

Source: `apps/server/src/cloud/`. The full list of function, trigger and job names is in [Cloud Code](code/en/CLOUD_FUNCTIONS.md).

| Kind | Files |
|---|---|
| Functions | `app`, `article`, `auth`, `category`, `contact`, `misc`, `page`, `pageSection`, `project`, `role`, `user`, `utils` (and `test`) |
| Triggers | `app`, `article`, `auth`, `category`, `contact`, `newsletter`, `page`, `project`, `user` (`role` exists but is not imported) |
| Jobs | `category`, `email`, `misc`, `newsletter` (and `test`) |

## Scheduled tasks

One `node-cron` task: a ping of the server every 10 minutes outside local development, to keep a free hosting plan awake. No Cloud Job is scheduled. GitHub workflows run on schedules too. Details: [scheduled tasks](code/en/SCHEDULED_JOBS.md).

## Roles and permissions

Roles `Owner`, `Administrator` and `Manager`, with per-entity rights stored on the Parse `_Role`. Details: [roles and permissions](code/en/ROLES_AND_PERMISSIONS.md).

## Collections and indexes

`Article`, `Project`, `Page`, `PageSection`, `Category`, `Contact`, `Newsletter`, `App` plus Parse's `_User`, `_Role` and `_Session`. No index is declared in code. Details: [collections and indexes](code/en/COLLECTIONS_AND_INDEXES.md).

## Emails

Verification and reset-password codes, free messages to a user, and the new-article newsletter, all sent through Brevo. Details: [emails](communication/en/EMAILS.md).

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

A new environment variable, external service, Cloud Function, trigger, job, role, collection, scheduled task, workflow or GitHub secret updates this page or the matching detailed page (and [services](../services/README.md) when it is a service) in the same change.
