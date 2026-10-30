# Sentry

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

Sentry reports the JavaScript errors of the back-office (`apps/bo`) and of the website (`apps/web`, browser and Next.js server). Both send to the same Sentry project: the `app` tag (`bo` or `web`) tells them apart. The API server does not report to Sentry.

## Where the code is

- `apps/bo/src/config/sentry.ts`: `initializeSentry` and `syncSentryUser`. Reporting is off unless the bundle is a build (never `pnpm dev`) with a DSN and a reporting environment (`preProduction` or `production`). The user is identified by Parse `objectId` only, and events are scrubbed of personal data.
- `apps/bo/vite.config.ts`: uploads the source maps at build time (`sentryVitePlugin`) and warns when the Sentry settings are missing.
- `apps/web/config/sentry.ts`: `getSentryOptions`, the options shared by the browser, Node.js and edge runtimes. It returns nothing, so nothing is sent, without a DSN and a reporting environment. `apps/web/instrumentation.ts` (server) and `apps/web/instrumentation-client.ts` (browser) start the SDK; `apps/web/app/global-error.tsx` and `apps/web/components/ErrorBoundary.tsx` report the errors caught by the error pages. Events are scrubbed of personal data and a few browser-noise errors are ignored.
- `apps/web/next.config.mjs`: uploads the source maps at build time (`withSentryConfig`) when `SENTRY_AUTH_TOKEN` is set, then deletes them so they are never served.
- The server Content Security Policy allows the Sentry ingest domain (`apps/server/src/config/config.ts`).

## Variables

| Variable | App | Purpose |
|---|---|---|
| `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` | bo | DSN and environment name; browser-exposed, not secrets |
| `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | web | Same DSN as the bo, `NEXT_PUBLIC_*` names; browser-exposed, not secrets |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | bo, web (build time) | Source map upload; the token is a secret and is not a `VITE_*` variable |

## Setup

1. Create a Sentry project and copy its DSN.
2. Put the `VITE_SENTRY_*` values in `apps/bo/.env.preprod` / `.env.prod`, the `NEXT_PUBLIC_SENTRY_*` ones in the website environment, and the build-time ones in the build environment of each app.

## Gotchas

- The `app: bo` and `app: web` tags tell the apps apart in the shared Sentry project; the public traffic of the website shares the quota with the back-office, hence the ignored browser-noise errors.
- The CSP only allows the `*.ingest.de.sentry.io` (EU) domains.
