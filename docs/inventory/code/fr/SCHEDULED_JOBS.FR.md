# Tâches planifiées

## Table des matières

- [Serveur (node-cron)](#serveur-node-cron)
- [Planifications GitHub Actions](#planifications-github-actions)
- [Jobs lancés à la demande](#jobs-lancés-à-la-demande)

## Serveur (node-cron)

Un seul `cron.schedule(...)` existe, dans `apps/server/src/index.ts`.

| Planification | Quoi | Condition |
|---|---|---|
| `*/10 * * * *` (toutes les 10 minutes) | Appelle la route `/ping` du serveur lui-même pour garder l'hébergement gratuit éveillé | Pas en développement local (`IS_LOCAL` faux) |

Le commentaire au-dessus de la route `/ping` parle de 14 minutes : le code s'exécute toutes les 10 minutes.

## Planifications GitHub Actions

Heures en UTC. Détails dans les [workflows CI](CI_WORKFLOWS.FR.md).

| Workflow | Cron | Quand |
|---|---|---|
| `storybook-tests.yml` | `0 2 * * *` | Tous les jours, 02:00 |
| `chromatic.yml` | `0 3 */4 * *` | Tous les quatre jours, 03:00 |
| `security.yml` | `0 5 * * 1` | Le lundi, 05:00 |
| `lighthouse.yml` | `0 6 * * 1` | Le lundi, 06:00 |

## Jobs lancés à la demande

Aucun Cloud Job n'est planifié : ils sont lancés par un trigger, un service ou une fonction (voir [Cloud Code](CLOUD_FUNCTIONS.FR.md#cloud-jobs)). En particulier la corbeille n'est vidée que lorsque `clearRecycleBinInCloud` est appelée, il n'y a pas de purge automatique.
