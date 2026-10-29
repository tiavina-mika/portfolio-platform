# Variables et secrets GitHub

## Table des matières

- [Secrets](#secrets)
- [Variables](#variables)
- [Règles](#règles)

Noms uniquement : les valeurs ne sont jamais écrites ici. Elles se règlent dans les paramètres du dépôt (Settings, Secrets and variables, Actions).

## Secrets

| Secret | Lu par | À quoi il sert |
|---|---|---|
| `RELEASE_TOKEN` | `release.yml` | Jeton fine-grained d'un membre du dépôt, utilisé pour ouvrir la pull request de release afin que les vérifications requises s'y exécutent |
| `SLACK_CHANGELOG_WEBHOOK_URL` | `changeset-notify.yml`, `release-notify.yml` | Webhook entrant Slack pour les messages de changelog |
| `CHROMATIC_PROJECT_TOKEN_WEB` | `chromatic.yml` | Jeton du projet Chromatic du Storybook web |
| `GITHUB_TOKEN` | automatique | Fourni par GitHub à chaque exécution ; non configuré à la main |

## Variables

| Variable | Lue par | À quoi elle sert |
|---|---|---|
| `LIGHTHOUSE_URLS` | `lighthouse.yml` | Les URL à auditer, une par ligne (par exemple l'accueil, le blog et le contact de la préproduction) |

## Règles

- Un nouveau secret ou une nouvelle variable lus par un workflow s'ajoutent à ces tableaux dans le même changement.
- Aucune variable applicative (`MONGO_URL`, `BREVO_API_KEY`…) n'est un secret GitHub : aucun workflow ne déploie ni ne construit le serveur avec elles. Elles vivent chez l'hébergeur et dans les fichiers `.env` locaux (voir l'[inventaire](../../README.md#environment-variables)).
