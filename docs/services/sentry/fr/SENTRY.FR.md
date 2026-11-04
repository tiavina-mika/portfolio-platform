# Sentry

## Table des matières

- [À quoi il sert](#à-quoi-il-sert)
- [Où est le code](#où-est-le-code)
- [Variables](#variables)
- [Mise en place](#mise-en-place)
- [Pièges](#pièges)

## À quoi il sert

Sentry remonte les erreurs JavaScript du back-office (`apps/bo`) et du site (`apps/web`, navigateur et serveur Next.js). Les deux envoient vers le même projet Sentry : l'étiquette `app` (`bo` ou `web`) les distingue. Le serveur d'API ne remonte rien à Sentry.

## Où est le code

- `apps/bo/src/config/sentry.ts` : `initializeSentry` et `syncSentryUser`. La remontée est coupée sauf si le bundle est un build (jamais `pnpm dev`) avec un DSN et un environnement de remontée (`preProduction` ou `production`). L'utilisateur n'est identifié que par son `objectId` Parse, et les événements sont purgés des données personnelles.
- `apps/bo/vite.config.ts` : envoie les source maps au build (`sentryVitePlugin`) et avertit quand les réglages Sentry manquent.
- `apps/web/config/sentry.ts` : `getSentryOptions`, les options partagées par le navigateur, Node.js et l'edge. Sans DSN ni environnement de remontée, la fonction ne renvoie rien et rien n'est envoyé. `apps/web/instrumentation.ts` (serveur) et `apps/web/instrumentation-client.ts` (navigateur) démarrent le SDK ; `apps/web/app/global-error.tsx` et `apps/web/components/ErrorBoundary.tsx` remontent les erreurs attrapées par les pages d'erreur. Les événements sont purgés des données personnelles et quelques erreurs de bruit du navigateur sont ignorées.
- `apps/web/next.config.mjs` : envoie les source maps au build (`withSentryConfig`) quand `SENTRY_AUTH_TOKEN` est défini, puis les supprime pour qu'elles ne soient jamais servies.
- La Content Security Policy du serveur autorise le domaine d'ingestion de Sentry (`apps/server/src/config/config.ts`).

## Variables

| Variable | App | Rôle |
|---|---|---|
| `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` | bo | DSN et nom d'environnement ; exposés au navigateur, pas des secrets |
| `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | web | Même DSN que le bo, noms en `NEXT_PUBLIC_*` ; exposés au navigateur, pas des secrets |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | bo, web (au build) | Envoi des source maps ; le jeton est un secret et n'est pas une variable `VITE_*` |

## Mise en place

1. Créer un projet Sentry et copier son DSN.
2. Mettre les valeurs `VITE_SENTRY_*` dans `apps/bo/.env.preprod` / `.env.prod`, les `NEXT_PUBLIC_SENTRY_*` dans l'environnement du site, et celles du build dans l'environnement de build de chaque app.

## Pièges

- Les étiquettes `app: bo` et `app: web` distinguent les applications dans le projet Sentry partagé ; le trafic public du site partage le quota avec le back-office, d'où les erreurs de bruit du navigateur ignorées.
- La CSP n'autorise que les domaines `*.ingest.de.sentry.io` (UE).
