# Sentry

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

Sentry reports the JavaScript errors of the back-office. Only `apps/bo` is wired: the server and the website do not report to Sentry.

## Where the code is

- `apps/bo/src/config/sentry.ts`: `initializeSentry` and `syncSentryUser`. Reporting is off unless the bundle is a build (never `pnpm dev`) with a DSN and a reporting environment (`preProduction` or `production`). The user is identified by Parse `objectId` only, and events are scrubbed of personal data.
- `apps/bo/vite.config.ts`: uploads the source maps at build time (`sentryVitePlugin`) and warns when the Sentry settings are missing.
- The server Content Security Policy allows the Sentry ingest domain (`apps/server/src/config/config.ts`).

## Variables

| Variable | App | Purpose |
|---|---|---|
| `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` | bo | DSN and environment name; browser-exposed, not secrets |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | bo (build time) | Source map upload; the token is a secret and is not a `VITE_*` variable |

## Setup

1. Create a Sentry project and copy its DSN.
2. Put the `VITE_SENTRY_*` values in `apps/bo/.env.preprod` / `.env.prod`, and the build-time ones in the build environment.

## Gotchas

- The `app: bo` tag tells the back-office apart from other apps that may share the Sentry project.
- The CSP only allows the `*.ingest.de.sentry.io` (EU) domains.
