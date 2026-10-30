# Sentry

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

Sentry remonte les erreurs JavaScript du back-office. Seul `apps/bo` est branché : le serveur et le site ne remontent rien à Sentry.

## Où est le code

- `apps/bo/src/config/sentry.ts` : `initializeSentry` et `syncSentryUser`. La remontée est coupée sauf si le bundle est un build (jamais `pnpm dev`) avec un DSN et un environnement de remontée (`preProduction` ou `production`). L'utilisateur n'est identifié que par son `objectId` Parse, et les événements sont purgés des données personnelles.
- `apps/bo/vite.config.ts` : envoie les source maps au build (`sentryVitePlugin`) et avertit quand les réglages Sentry manquent.
- La Content Security Policy du serveur autorise le domaine d'ingestion de Sentry (`apps/server/src/config/config.ts`).

## Variables

| Variable | App | Rôle |
|---|---|---|
| `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` | bo | DSN et nom d'environnement ; exposés au navigateur, pas des secrets |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | bo (au build) | Envoi des source maps ; le jeton est un secret et n'est pas une variable `VITE_*` |

## Mise en place

1. Créer un projet Sentry et copier son DSN.
2. Mettre les valeurs `VITE_SENTRY_*` dans `apps/bo/.env.preprod` / `.env.prod`, et celles du build dans l'environnement de build.

## Pièges

- L'étiquette `app: bo` distingue le back-office des autres applications qui partageraient le projet Sentry.
- La CSP n'autorise que les domaines `*.ingest.de.sentry.io` (UE).
