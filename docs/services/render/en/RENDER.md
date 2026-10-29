# Render

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Deployment shape](#deployment-shape)
- [Gotchas](#gotchas)

## What it is used for

Render is the hosting provider the code is written for: the server contains a keep-awake workaround for its free plan, and the website's public URL in `apps/web/config/site.ts` is on `onrender.com`. No deployment file (`render.yaml`) or GitHub deployment workflow is committed, so the service settings live only in the Render dashboard.

## Where the code is

- `apps/server/src/index.ts`: the `/ping` route and the `node-cron` task that calls it every 10 minutes outside local development (see [scheduled tasks](../../../inventory/code/en/SCHEDULED_JOBS.md)).
- `apps/web/config/site.ts`: the public website URL.

## Deployment shape

- The server serves the Parse API (`/parse`), the upload and download routes and the built back-office (`clientBuild/bo/preprod` or `clientBuild/bo/prod`) from one Express process, so the back-office is copied into the server before deployment (`pnpm copy` in `apps/server`).
- Application variables are set in the Render service settings: the server does not read a `.env` file outside local development (see [environments](../../../inventory/code/en/ENVIRONMENTS.md)).
- The web app is a Next.js app with its own `start` script (`server.js`), deployed as a second Render web service.
- The full procedure, with the build and start commands and the variables of each service, is in the [deployment tutorial](RENDER_DEPLOYMENT.md).

## Gotchas

- Free web services sleep after about 15 minutes without traffic; the cron keeps the server awake only while it runs, so a cold start after a deploy or a restart is slow.
- The committed back-office bundle must be rebuilt (`pnpm build:bo` in `apps/server`) before deploying a back-office change.
- Because deployment is configured in the dashboard, a change of build or start command is not reviewed in a pull request: record it here when it changes.
