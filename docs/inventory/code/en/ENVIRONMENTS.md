# Environments

## Table of Contents

- [The three environments](#the-three-environments)
- [Server](#server)
- [Web](#web)
- [Back-office](#back-office)
- [Gotchas](#gotchas)

## The three environments

| Environment | Value | Used for |
|---|---|---|
| Local development | `development` | Day-to-day work on a developer machine |
| Pre-production | `preProduction` | Staging copy of production |
| Production | `production` | The live site |

The variables of each app are listed in the [inventory](../../README.md#environment-variables); real values are never committed (each app ships a `.env.example`).

## Server

- `NODE_ENV` selects the environment. `IS_LOCAL`, `IS_PREPROD` and `IS_PROD` are derived from it in `apps/server/src/constants/_core/constants.ts`.
- Local file loading: `.env.prod` when production is forced, otherwise `.env.preprod`. In a deployed environment no file is read: the variables are set on the host.
- At boot, `validateEnv()` (`apps/server/src/utils/_core/validateEnv.ts`, `envalid`) refuses to start without the required variables listed in the [inventory](../../README.md#appsserver). In `preProduction` and `production` it also requires `OWNERS_EMAILS` (at least two distinct addresses), `MMSDUCK_API_KEY` and `WEBSITE_REVALIDATE_SECRET`; elsewhere they are optional.
- The back-office build is served by Express from `clientBuild/bo/preprod` or `clientBuild/bo/prod` depending on the environment (`pnpm copy` fills them, then checks that no secret-looking `VITE_*` value ended up in the bundle).
- The keep-awake ping runs everywhere except in local development and on Cloud Run; the business cron jobs run in production only (see [scheduled tasks](SCHEDULED_JOBS.md)).

## Web

`APP_ENV` (`development`, `preProduction` or `production`) is set by the scripts (`dev`, `start:preprod`, `build:prod`…) and validated by `apps/web/env.ts` with zod.

## Back-office

Vite reads `.env.preprod` (`pnpm dev`, `build:preprod`) or `.env.prod` (`build:prod`) through `env-cmd`; `VITE_ENVIRONMENT` names the environment. Every `VITE_*` value is inlined in the browser bundle.

## Gotchas

- `FORCE_PROD` and `FORCE_PREPROD` in `apps/server/src/constants/_core/constants.ts` must stay `false` when committing: they exist to test an environment locally.
- A deployed server with fewer than two `OWNERS_EMAILS` addresses, or without `MMSDUCK_API_KEY` or `WEBSITE_REVALIDATE_SECRET`, does not start: a single-owner portfolio must list a second address before deploying.
