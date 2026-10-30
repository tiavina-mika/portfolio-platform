# Tâches planifiées

## Table des matières

- [Serveur (node-cron)](#serveur-node-cron)
- [Planifications GitHub Actions](#planifications-github-actions)
- [Jobs lancés à la demande](#jobs-lancés-à-la-demande)

## Serveur (node-cron)

Tous les appels `schedule(...)` sont dans `apps/server/src/config/scheduled-jobs.ts` (`scheduleJobs`, appelée une fois au démarrage depuis `apps/server/src/index.ts`). Chaque exécution passe par `runScheduledJob`, qui :

- prend un verrou Redis nommé d'après le job et la minute (`acquireScheduledJobLock`), pour qu'une seule instance du serveur exécute un tick quand plusieurs instances tournent ; si Redis est injoignable, le tick s'exécute quand même et l'échec est journalisé ;
- exécute le Cloud Job et alerte l'équipe (Slack et e-mail) s'il échoue.

Le ping d'éveil tourne hors développement local et hors Cloud Run. Les jobs métier ne tournent **qu'en production** (`IS_PROD`, ou en local avec `FORCE_PROD` passé à true) : ils sont volontairement coupés en pré-production.

| Planification (heure du serveur sauf mention) | Job | Rôle |
|---|---|---|
| `*/14 * * * *` | aucun (appelle `/ping`) | Garde éveillé un hébergement gratuit. Pas en développement local, pas sur Cloud Run |
| `*/2 * * * *` | `reconcilePendingPaymentsJob` | Règle les paiements encore en attente de leur opérateur |
| `*/5 * * * *` | `revokeExpiredImpersonationSessionsJob` | Révoque les sessions « se connecter en tant que » expirées |
| `0 * * * *` | `processPushReceiptsJob` | Traite les reçus de push Expo et nettoie les jetons de push périmés |
| `25 * * * *` | `retryFailedPlatformPaymentsJob` | Relance les paiements dus et non envoyés |
| `0 2 * * *` | `expireOldNotificationsJob` | Supprime logiquement les notifications de plus de 365 jours |
| `30 2 * * *` | `purgeOrphanedEditorFilesJob` | Supprime les images Cloudinary de l'éditeur du CMS que plus aucune Page ni aucun Article ne référence (de plus de 24 heures seulement) |
| `30 3 * * *` | `purgeUnverifiedPhoneSignupsJob` | Détruit les inscriptions dont le téléphone n'a jamais été confirmé |
| `40 3 * * *` | `purgeOrphanUserSessionsJob` | Détruit les appareils sans jeton de push ni session |
| `30 4 * * 0` | `purgeOldNotificationsJob` | Purge hebdomadaire des anciennes notifications (dimanche) |
| `45 4 * * 0` | `purgeOldLogsJob` | Destruction hebdomadaire des lignes d'audit, de modération et de tickets au-delà de leur durée de conservation |
| `30 7 * * *` (fuseau du pays par défaut) | `postDailySlackSummaryJob` | Publie les chiffres de la veille sur le canal Slack de l'équipe |
| `15 8 * * *` (fuseau du pays par défaut) | `liftExpiredBansJob` | Lève les bannissements temporaires expirés |

## Planifications GitHub Actions

Les heures sont en UTC. Détails dans les [workflows CI](CI_WORKFLOWS.FR.md).

| Workflow | Cron | Quand |
|---|---|---|
| `storybook-tests.yml` | `0 2 * * *` | Tous les jours, 02:00 |
| `chromatic.yml` | `0 3 */4 * *` | Tous les quatre jours, 03:00 |
| `security.yml` | `0 5 * * 1` | Le lundi, 05:00 |
| `lighthouse.yml` | `0 6 * * 1` | Le lundi, 06:00 |

## Jobs lancés à la demande

Les autres Cloud Jobs sont lancés par un trigger, un service ou une fonction (voir [Cloud Code](CLOUD_FUNCTIONS.FR.md#cloud-jobs)). En particulier la corbeille n'est vidée que lorsque `clearRecycleBinInCloud` est appelée, il n'y a pas de purge automatique.
