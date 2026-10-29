# GitHub Variables and Secrets

## Table of Contents

- [Secrets](#secrets)
- [Variables](#variables)
- [Rules](#rules)

Names only: values are never written here. They are set in the repository settings (Settings, Secrets and variables, Actions).

## Secrets

| Secret | Read by | What for |
|---|---|---|
| `RELEASE_TOKEN` | `release.yml` | Fine-grained token of a repository member, used to open the release pull request so that required checks run on it |
| `SLACK_CHANGELOG_WEBHOOK_URL` | `changeset-notify.yml`, `release-notify.yml` | Slack incoming webhook for the changelog posts |
| `CHROMATIC_PROJECT_TOKEN_WEB` | `chromatic.yml` | Token of the Chromatic project of the web Storybook |
| `GITHUB_TOKEN` | automatic | Provided by GitHub to every run; not configured by hand |

## Variables

| Variable | Read by | What for |
|---|---|---|
| `LIGHTHOUSE_URLS` | `lighthouse.yml` | The URLs to audit, one per line (for example the pre-production home, blog and contact pages) |

## Rules

- A new secret or variable read by a workflow is added to these tables in the same change.
- None of the application variables (`MONGO_URL`, `BREVO_API_KEY`…) are GitHub secrets: no workflow deploys or builds the server with them. They live in the hosting provider and in local `.env` files (see the [inventory](../../README.md#environment-variables)).
