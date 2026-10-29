# Render

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Forme du déploiement](#forme-du-déploiement)
- [Pièges](#pièges)

## À quoi il sert

Render est l'hébergeur pour lequel le code est écrit : le serveur contient un contournement de maintien en éveil pour son plan gratuit, et l'URL publique du site dans `apps/web/config/site.ts` est en `onrender.com`. Aucun fichier de déploiement (`render.yaml`) ni workflow GitHub de déploiement n'est commité : les réglages du service ne vivent que dans le tableau de bord Render.

## Où est le code

- `apps/server/src/index.ts` : la route `/ping` et la tâche `node-cron` qui l'appelle toutes les 10 minutes hors développement local (voir les [tâches planifiées](../../../inventory/code/fr/SCHEDULED_JOBS.FR.md)).
- `apps/web/config/site.ts` : l'URL publique du site.

## Forme du déploiement

- Le serveur sert l'API Parse (`/parse`), les routes d'envoi et de téléchargement et le back-office construit (`clientBuild/bo/preprod` ou `clientBuild/bo/prod`) depuis un seul processus Express : le back-office est donc copié dans le serveur avant le déploiement (`pnpm copy` dans `apps/server`).
- Les variables applicatives se posent dans les réglages du service Render : le serveur ne lit pas de fichier `.env` hors développement local (voir les [environnements](../../../inventory/code/fr/ENVIRONMENTS.FR.md)).
- L'app web est une app Next.js avec son propre script `start` (`server.js`) ; son hébergement n'est pas consigné dans le dépôt.

## Pièges

- Les services web gratuits s'endorment après environ 15 minutes sans trafic ; le cron ne garde le serveur éveillé que tant qu'il tourne : un démarrage à froid après un déploiement ou un redémarrage est lent.
- Le bundle du back-office commité doit être reconstruit (`pnpm build:bo` dans `apps/server`) avant de déployer un changement du back-office.
- Le déploiement étant réglé dans le tableau de bord, un changement de commande de build ou de démarrage n'est pas relu dans une pull request : le consigner ici quand il change.
