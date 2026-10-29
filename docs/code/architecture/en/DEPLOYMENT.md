# Deployment and CI

## Table of Contents

- [Overview](#overview)
- [Environments](#environments)
- [Building and starting each app](#building-and-starting-each-app)
- [Environment variables at runtime](#environment-variables-at-runtime)
- [Keeping the host awake](#keeping-the-host-awake)
- [GitHub workflows](#github-workflows)
- [Local hooks](#local-hooks)
- [Releases](#releases)
- [What the repository does not define](#what-the-repository-does-not-define)

## Overview

The repository defines how the code is checked, built and versioned. It does not contain the deployment of the hosts themselves (no Dockerfile, no host manifest, no deploy workflow): the apps are built here and started with the scripts below on hosts configured outside the repository.

## Environments

| `NODE_ENV` | Name | Branch of the release flow |
|---|---|---|
| `development` | local | feature branches |
| `preProduction` | preprod | `develop` |
| `production` | production | `main` |

The release workflow documents the flow: `develop` is deployed to preproduction, then `develop` is merged into `main` for production. The server reads `NODE_ENV` (`IS_LOCAL`, `IS_PREPROD`, `IS_PROD` in `apps/server/src/utils/constants.ts`); the website uses `APP_ENV` (`development`, `preProduction`, `production`).

## Building and starting each app

| App | Build | Start |
|---|---|---|
| `server` | `pnpm build` (`apps/server`): type check, then SWC compiles `src` to `dist` | `pnpm start` (production), `pnpm start:preprod`, `pnpm start:dev`: `node --import tsx dist/index.js` with the matching `NODE_ENV` |
| `bo` | `pnpm build:preprod` or `pnpm build:prod`: `vite build` with the `.env.preprod` / `.env.prod` file of the app | served by the server, see below |
| `web` | `pnpm build:preprod`, `pnpm build:prod` (`next build` with `APP_ENV`) | `pnpm start`, `start:preprod`, `start:dev`: `node server.js` with `APP_ENV` |

The back-office is not deployed on its own: `pnpm build:bo:preprod` and `pnpm build:bo` in `apps/server` build `apps/bo` and then run `pnpm copy`, which copies `apps/bo/dist` into `apps/server/clientBuild/bo/preprod` or `.../prod` (the folder is chosen from `NODE_ENV`; the same two names are written in `config/copyBuilds.cjs` and in `src/utils/constants.ts` and must stay equal). A second script, `config/checkClientBuildSecrets.cjs`, scans that committed bundle for the literal value of any `VITE_*` variable whose name ends with `KEY`, `SECRET`, `TOKEN` or `PASSWORD`, because Vite inlines every `VITE_*` value in the browser code. Express serves the folder statically, and a catch-all registered after the `/parse`, `/files`, `/download`, `/migration` and `/ping` routes answers every other path with its `index.html` (the single-page app).

`next build` of the website prerenders public pages with data read from the live Parse API, so it needs a reachable server.

## Environment variables at runtime

- In local development (and when `FORCE_PROD` / `FORCE_PREPROD` are switched on in the constants), the server loads `.env.preprod` or `.env.prod` with dotenv. On a real host nothing is loaded from a file: the variables must be set on the host.
- `validateEnv` stops the start when a required variable is missing. The full list of variables is in `docs/inventory/README.md`.

## Keeping the host awake

Outside local development, the server schedules a `node-cron` task every 10 minutes (`*/10 * * * *`) that calls its own `GET /ping`. A code comment explains why: a free plan of the host (Render is named) sleeps after 15 minutes of inactivity.

## GitHub workflows

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` (CI) | pull requests and pushes on `develop` and `main`, manual | on Node 24 with pnpm: `nx affected` lint, typecheck, build (except `web`, whose build needs the live CMS), tests (except `server` and `web`), Storybook builds, `pnpm check-i18n`; commit messages checked by commitlint on pull requests; Markdown lint, doc links and anchors, doc twins, link check |
| `security.yml` | pull requests and pushes on `develop` and `main`, every Monday, manual | `pnpm audit --prod` at the high level (informational for now) and a gitleaks scan |
| `release.yml` | push on `develop`, manual | opens or updates the "chore(release): version packages" pull request with changesets; needs the `RELEASE_TOKEN` secret |
| `release-notify.yml`, `changeset-notify.yml` | push when a changelog or a changeset changes | post the release notes and the new changesets to a Slack channel |
| `storybook-tests.yml` | nightly, manual | runs every story as a test in Chromium, in shards |
| `chromatic.yml` | scheduled, manual | publishes the Storybooks to Chromatic and captures the visual tests |
| `lighthouse.yml` | every Monday, manual | audits the URLs listed in the `LIGHTHOUSE_URLS` repository variable against the budgets of `lighthouserc.json` |

`.github/dependabot.yml` opens weekly dependency pull requests (npm, grouped by Nx, Storybook and minor-and-patch, and GitHub Actions) against `develop`.

## Local hooks

Husky runs `commit-msg` (commitlint, conventional commits) and `pre-push`: `nx affected -t lint typecheck`, `pnpm check-i18n`, a gitleaks scan when the binary is installed, `pnpm lint:docs`, `pnpm check-doc-links` and `pnpm check-doc-twins`. CI repeats them because a local hook can be skipped.

## Releases

Versions are managed with changesets (`.changeset/`). A change users will notice carries a changeset (`pnpm changeset`); the release workflow gathers them in a pull request, and merging it bumps each app's version and writes its `CHANGELOG.md`. The apps are private packages and nothing is published to a registry.

## What the repository does not define

The hosting provider and plan of each app, the domain names, the MongoDB instance, the Cloudinary and Brevo accounts, and the way a merge to `develop` or `main` reaches a host (a host-side integration, not a workflow of this repository) are not in the repository. Only the services the code talks to are listed, in `docs/services/README.md`.
