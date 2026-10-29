# Workflows CI

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [CI](#ci)
- [Sécurité](#sécurité)
- [Release](#release)
- [Storybook et tests visuels](#storybook-et-tests-visuels)
- [Lighthouse](#lighthouse)
- [Notifications Slack](#notifications-slack)
- [Pièges](#pièges)

## Vue d'ensemble

Les workflows sont dans `.github/workflows/`. Les secrets et variables qu'ils lisent sont dans [variables et secrets GitHub](GITHUB_VARIABLES_AND_SECRETS.FR.md) ; leurs planifications sont résumées dans les [tâches planifiées](SCHEDULED_JOBS.FR.md).

| Fichier | Nom | Déclencheurs |
|---|---|---|
| `ci.yml` | CI | Pull request et push sur `develop` et `main`, manuel |
| `security.yml` | Security | Pull request et push sur `develop` et `main`, le lundi 05:00 UTC, manuel |
| `release.yml` | Release | Push sur `develop`, manuel |
| `storybook-tests.yml` | Storybook tests | Tous les jours 02:00 UTC, manuel |
| `chromatic.yml` | Chromatic : Storybooks | Tous les quatre jours 03:00 UTC, manuel |
| `lighthouse.yml` | Lighthouse | Le lundi 06:00 UTC, manuel |
| `changeset-notify.yml` | Changesets to Slack | Push sur `develop` touchant `.changeset/*.md` |
| `release-notify.yml` | Release notes to Slack | Push sur `develop` et `main` touchant `apps/*/CHANGELOG.md`, manuel |

## CI

| Job | Ce qu'il lance |
|---|---|
| Lint, typecheck and build affected projects | `nx affected -t lint`, `typecheck`, `build --exclude=web`, `build-docs`, puis `pnpm check-i18n` |
| Conventional commit messages | `commitlint` sur les commits ajoutés par une PR |
| Unit tests of affected projects | `nx affected -t test --exclude=server,web` |
| Build affected Storybooks | `nx affected -t build-sb` |
| Markdown lint and broken links | `pnpm lint:docs`, `pnpm check-doc-links` et `pnpm check-doc-twins` contre la branche de base, plus une vérification de liens `lychee` |

Un nouveau push sur la même PR annule l'exécution précédente.

## Sécurité

| Job | Ce qu'il lance |
|---|---|
| Dependency audit | `pnpm audit --prod --audit-level=high` |
| Secret scan | `gitleaks` sur tout l'historique avec `.gitleaks.toml` |

## Release

`release.yml` ouvre et tient à jour la pull request « chore(release): version packages » sur `develop` avec l'action Changesets. Rien n'est publié : les apps sont des paquets privés.

## Storybook et tests visuels

- `storybook-tests.yml` lance les tests Storybook du web de façon planifiée.
- `chromatic.yml` publie les Storybooks sur Chromatic ; l'exécution planifiée est ignorée si `develop` n'a aucun commit des quatre derniers jours.

## Lighthouse

`lighthouse.yml` audite un site déployé (les URL de la variable de dépôt `LIGHTHOUSE_URLS`) selon les budgets de `lighthouserc.json`.

## Notifications Slack

`changeset-notify.yml` et `release-notify.yml` lancent `scripts/post-changesets-to-slack.mjs` et `scripts/post-changelog-to-slack.mjs`, qui publient sur le webhook entrant Slack du secret `SLACK_CHANGELOG_WEBHOOK_URL`.

## Pièges

- `web` est exclu du build CI : `next build` lit le CMS depuis l'API Parse en ligne, qu'un runner CI ne peut pas joindre. Sa compilation est couverte par `web:typecheck`.
- La PR de release est ouverte avec `RELEASE_TOKEN` et non avec le `GITHUB_TOKEN` par défaut, sinon les vérifications requises ne s'exécuteraient jamais dessus.
- Les workflows planifiés s'exécutent sur la branche par défaut (`main`), qui ne bouge qu'à une release.
- `lighthouserc.json` est référencé par `lighthouse.yml` mais n'est pas à la racine du dépôt aujourd'hui.
