# CI Workflows

## Table of Contents

- [Overview](#overview)
- [CI](#ci)
- [Security](#security)
- [Release](#release)
- [Storybook and visual tests](#storybook-and-visual-tests)
- [Lighthouse](#lighthouse)
- [Slack notifications](#slack-notifications)
- [Gotchas](#gotchas)

## Overview

Workflows are in `.github/workflows/`. Secrets and variables they read are in [GitHub variables and secrets](GITHUB_VARIABLES_AND_SECRETS.md); their schedules are summarised in [scheduled tasks](SCHEDULED_JOBS.md).

| File | Name | Triggers |
|---|---|---|
| `ci.yml` | CI | Pull request and push on `develop` and `main`, manual |
| `security.yml` | Security | Pull request and push on `develop` and `main`, Mondays 05:00 UTC, manual |
| `release.yml` | Release | Push on `develop`, manual |
| `storybook-tests.yml` | Storybook tests | Every day 02:00 UTC, manual |
| `chromatic.yml` | Chromatic: Storybooks | Every four days 03:00 UTC, manual |
| `lighthouse.yml` | Lighthouse | Mondays 06:00 UTC, manual |
| `changeset-notify.yml` | Changesets to Slack | Push on `develop` touching `.changeset/*.md` |
| `release-notify.yml` | Release notes to Slack | Push on `develop` and `main` touching `apps/*/CHANGELOG.md`, manual |

## CI

| Job | What it runs |
|---|---|
| Lint, typecheck and build affected projects | `nx affected -t lint`, `typecheck`, `build --exclude=web`, `build-docs`, then `pnpm check-i18n` |
| Conventional commit messages | `commitlint` on the commits a PR adds |
| Unit tests of affected projects | `nx affected -t test --exclude=server,web` |
| Build affected Storybooks | `nx affected -t build-sb` |
| Markdown lint and broken links | `pnpm lint:docs`, `pnpm check-doc-links` and `pnpm check-doc-twins` against the base branch, plus a `lychee` link check |

A new push to the same PR cancels the previous run.

## Security

| Job | What it runs |
|---|---|
| Dependency audit | `pnpm audit --prod --audit-level=high` |
| Secret scan | `gitleaks` on the full history with `.gitleaks.toml` |

## Release

`release.yml` opens and keeps up to date the "chore(release): version packages" pull request on `develop` with the Changesets action. Nothing is published: the apps are private packages.

## Storybook and visual tests

- `storybook-tests.yml` runs the web Storybook tests on a schedule.
- `chromatic.yml` publishes the Storybooks to Chromatic; the scheduled run is skipped when `develop` has no commit from the last four days.

## Lighthouse

`lighthouse.yml` audits a deployed website (the URLs of the `LIGHTHOUSE_URLS` repository variable) against the budgets of `lighthouserc.json`.

## Slack notifications

`changeset-notify.yml` and `release-notify.yml` run `scripts/post-changesets-to-slack.mjs` and `scripts/post-changelog-to-slack.mjs`, which post to the Slack incoming webhook of the `SLACK_CHANGELOG_WEBHOOK_URL` secret.

## Gotchas

- `web` is excluded from the CI build: `next build` reads the CMS from the live Parse API, which a CI runner cannot reach. Its compilation is covered by `web:typecheck`.
- The release PR is opened with `RELEASE_TOKEN`, not the default `GITHUB_TOKEN`, otherwise the required checks would never run on it.
- Scheduled workflows run on the default branch (`main`), which only moves on a release.
- `lighthouserc.json` is referenced by `lighthouse.yml` but is not at the repository root today.
