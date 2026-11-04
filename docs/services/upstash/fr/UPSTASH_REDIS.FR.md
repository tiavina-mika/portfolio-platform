# Upstash Redis

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

Upstash Redis est un Redis hébergé. Le serveur l'utilise pour les limites de débit de ses routes publiques, pour Parse Server (cache, limite de débit, pub/sub LiveQuery), et pour le verrou qui n'autorise qu'une seule instance du serveur à exécuter chaque tick d'un job planifié. Le site l'utilise pour la limite par visiteur des formulaires de contact et de newsletter.

## Où est le code

- `apps/server/src/config/redis.ts` : le client REST (`getRedis`), construit paresseusement car les variables sont chargées après les imports.
- `apps/server/src/config/scheduled-jobs.ts` : `acquireScheduledJobLock` (préfixe de clé `cron-lock`, expiration d'une heure).
- `apps/server/src/index.ts` : `UPSTASH_REDIS_URL` est donnée à Parse Server.
- `apps/web/server/formRateLimit.server.ts` et `visitorRateLimit.server.ts` : les limites du site.

## Variables

| Variable | App | Rôle |
|---|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | server (obligatoires au démarrage), web (facultatives) | Accès REST |
| `UPSTASH_REDIS_URL` | server (obligatoire au démarrage) | URL au protocole Redis utilisée par Parse Server |

## Mise en place

1. Créer une base Redis sur Upstash et copier son URL REST, son jeton REST et son URL Redis.
2. Poser les trois variables dans `apps/server/.env.preprod` ou sur l'hébergeur ; poser les deux variables REST sur l'hébergeur du web si la limite des formulaires est voulue.
3. Utiliser une base par environnement.

## Pièges

- Le serveur refuse de démarrer sans les trois variables, même en local.
- Quand Redis est injoignable, un tick de job planifié s'exécute quand même (un doublon est jugé moins grave qu'un oubli) et l'échec est journalisé.
- Sans les variables du web, le site ne limite pas les visiteurs ; le serveur applique toujours sa propre limite.
