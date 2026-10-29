# Environnements

## Table des matières

- [Les trois environnements](#les-trois-environnements)
- [Serveur](#serveur)
- [Web](#web)
- [Back-office](#back-office)
- [Pièges](#pièges)

## Les trois environnements

| Environnement | Valeur | Usage |
|---|---|---|
| Développement local | `development` | Travail quotidien sur la machine d'un développeur |
| Préproduction | `preProduction` | Copie de test de la production |
| Production | `production` | Le site en ligne |

Les variables de chaque app sont listées dans l'[inventaire](../../README.md#environment-variables) ; les vraies valeurs ne sont jamais commitées (chaque app fournit un `.env.example`).

## Serveur

- `NODE_ENV` choisit l'environnement. `IS_LOCAL`, `IS_PREPROD` et `IS_PROD` en sont dérivés dans `apps/server/src/utils/constants.ts`.
- Chargement du fichier en local : `.env.prod` quand la production est forcée, sinon `.env.preprod`. Dans un environnement déployé aucun fichier n'est lu : les variables sont posées sur l'hébergeur.
- Au démarrage, `validateEnv()` (`envalid`) refuse de démarrer sans `NODE_ENV`, `PORT`, `MONGO_URL`, `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY`, `SERVER_URL`, `WEBSITE_URL`, les trois variables `CRYPTO_*`, `BREVO_API_KEY` et les trois variables `CLOUDINARY_*`.
- Le build du back-office est servi par Express depuis `clientBuild/bo/preprod` ou `clientBuild/bo/prod` selon l'environnement (`pnpm copy` les remplit, puis vérifie qu'aucune valeur `VITE_*` à allure de secret n'a fini dans le bundle).
- Le cron de maintien en éveil tourne partout sauf en développement local.

## Web

`APP_ENV` (`development`, `preProduction` ou `production`) est posée par les scripts (`dev`, `start:preprod`, `build:prod`…) et validée par `apps/web/env.ts` avec zod.

## Back-office

Vite lit `.env.preprod` (`pnpm dev`, `build:preprod`) ou `.env.prod` (`build:prod`) via `env-cmd` ; `VITE_ENVIRONMENT` nomme l'environnement. Toute valeur `VITE_*` est incluse dans le bundle du navigateur.

## Pièges

- `FORCE_PROD` et `FORCE_PREPROD` dans `apps/server/src/utils/constants.ts` doivent rester à `false` au commit : ils servent à tester un environnement en local.
- `OWNERS_EMAILS` et `ADMIN_EMAIL_SENDER` ne sont pas dans `validateEnv()` : le serveur démarre sans eux, mais aucun Owner n'est créé et les e-mails n'ont pas d'expéditeur.
