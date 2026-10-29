# Déploiement et CI

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Environnements](#environnements)
- [Construire et démarrer chaque app](#construire-et-démarrer-chaque-app)
- [Variables d'environnement à l'exécution](#variables-denvironnement-à-lexécution)
- [Garder l'hébergeur éveillé](#garder-lhébergeur-éveillé)
- [Workflows GitHub](#workflows-github)
- [Hooks locaux](#hooks-locaux)
- [Versions](#versions)
- [Ce que le dépôt ne définit pas](#ce-que-le-dépôt-ne-définit-pas)

## Vue d'ensemble

Le dépôt définit comment le code est contrôlé, construit et versionné. Il ne contient pas le déploiement des hébergeurs eux-mêmes (ni Dockerfile, ni manifeste d'hébergeur, ni workflow de déploiement) : les apps sont construites ici et démarrées avec les scripts ci-dessous sur des hébergeurs configurés en dehors du dépôt.

## Environnements

| `NODE_ENV` | Nom | Branche du flux de version |
|---|---|---|
| `development` | local | branches de fonctionnalité |
| `preProduction` | préprod | `develop` |
| `production` | production | `main` |

Le workflow de version documente le flux : `develop` est déployée en préproduction, puis `develop` est fusionnée dans `main` pour la production. Le serveur lit `NODE_ENV` (`IS_LOCAL`, `IS_PREPROD`, `IS_PROD` dans `apps/server/src/utils/constants.ts`) ; le site utilise `APP_ENV` (`development`, `preProduction`, `production`).

## Construire et démarrer chaque app

| App | Construction | Démarrage |
|---|---|---|
| `server` | `pnpm build` (`apps/server`) : vérification des types, puis SWC compile `src` vers `dist` | `pnpm start` (production), `pnpm start:preprod`, `pnpm start:dev` : `node --import tsx dist/index.js` avec le `NODE_ENV` correspondant |
| `bo` | `pnpm build:preprod` ou `pnpm build:prod` : `vite build` avec le fichier `.env.preprod` / `.env.prod` de l'app | servi par le serveur, voir ci-dessous |
| `web` | `pnpm build:preprod`, `pnpm build:prod` (`next build` avec `APP_ENV`) | `pnpm start`, `start:preprod`, `start:dev` : `node server.js` avec `APP_ENV` |

Le back-office n'est pas déployé seul : `pnpm build:bo:preprod` et `pnpm build:bo` dans `apps/server` construisent `apps/bo` puis lancent `pnpm copy`, qui copie `apps/bo/dist` dans `apps/server/clientBuild/bo/preprod` ou `.../prod` (le dossier est choisi selon `NODE_ENV` ; les deux mêmes noms sont écrits dans `config/copyBuilds.cjs` et dans `src/utils/constants.ts` et doivent rester égaux). Un second script, `config/checkClientBuildSecrets.cjs`, scanne ce bundle versionné à la recherche de la valeur littérale de toute variable `VITE_*` dont le nom se termine par `KEY`, `SECRET`, `TOKEN` ou `PASSWORD`, car Vite incorpore chaque valeur `VITE_*` dans le code du navigateur. Express sert le dossier en statique, et un attrape-tout enregistré après les routes `/parse`, `/files`, `/download`, `/migration` et `/ping` répond à tout autre chemin avec son `index.html` (l'application monopage).

Le `next build` du site prérend les pages publiques avec des données lues dans l'API Parse en ligne : il a donc besoin d'un serveur joignable.

## Variables d'environnement à l'exécution

- En développement local (et quand `FORCE_PROD` / `FORCE_PREPROD` sont activés dans les constantes), le serveur charge `.env.preprod` ou `.env.prod` avec dotenv. Sur un vrai hébergeur, rien n'est chargé depuis un fichier : les variables doivent être définies sur l'hébergeur.
- `validateEnv` arrête le démarrage quand une variable obligatoire manque. La liste complète des variables est dans `docs/inventory/README.md`.

## Garder l'hébergeur éveillé

Hors développement local, le serveur planifie une tâche `node-cron` toutes les 10 minutes (`*/10 * * * *`) qui appelle son propre `GET /ping`. Un commentaire du code en explique la raison : une offre gratuite de l'hébergeur (Render est nommé) s'endort après 15 minutes d'inactivité.

## Workflows GitHub

| Workflow | Déclencheur | Ce qu'il fait |
|---|---|---|
| `ci.yml` (CI) | pull requests et pushs sur `develop` et `main`, manuel | sous Node 24 avec pnpm : `nx affected` lint, typecheck, build (sauf `web`, dont le build a besoin du CMS en ligne), tests (sauf `server` et `web`), builds Storybook, `pnpm check-i18n` ; messages de commit contrôlés par commitlint sur les pull requests ; lint Markdown, liens et ancres des docs, jumeaux de docs, contrôle des liens |
| `security.yml` | pull requests et pushs sur `develop` et `main`, chaque lundi, manuel | `pnpm audit --prod` au niveau high (informatif pour l'instant) et un scan gitleaks |
| `release.yml` | push sur `develop`, manuel | ouvre ou met à jour la pull request « chore(release): version packages » avec les changesets ; demande le secret `RELEASE_TOKEN` |
| `release-notify.yml`, `changeset-notify.yml` | push quand un changelog ou un changeset change | publient les notes de version et les nouveaux changesets dans un canal Slack |
| `storybook-tests.yml` | chaque nuit, manuel | exécute chaque story comme test dans Chromium, par tranches |
| `chromatic.yml` | planifié, manuel | publie les Storybooks sur Chromatic et capture les tests visuels |
| `lighthouse.yml` | chaque lundi, manuel | audite les URL listées dans la variable de dépôt `LIGHTHOUSE_URLS` selon les budgets de `lighthouserc.json` |

`.github/dependabot.yml` ouvre chaque semaine des pull requests de dépendances (npm, groupées par Nx, Storybook et mineures-et-correctifs, et GitHub Actions) vers `develop`.

## Hooks locaux

Husky exécute `commit-msg` (commitlint, commits conventionnels) et `pre-push` : `nx affected -t lint typecheck`, `pnpm check-i18n`, un scan gitleaks quand le binaire est installé, `pnpm lint:docs`, `pnpm check-doc-links` et `pnpm check-doc-twins`. La CI les répète car un hook local peut être contourné.

## Versions

Les versions sont gérées avec les changesets (`.changeset/`). Un changement que les utilisateurs remarqueront porte un changeset (`pnpm changeset`) ; le workflow de version les rassemble dans une pull request, et la fusionner incrémente la version de chaque app et écrit son `CHANGELOG.md`. Les apps sont des paquets privés et rien n'est publié sur un registre.

## Ce que le dépôt ne définit pas

L'hébergeur et l'offre de chaque app, les noms de domaine, l'instance MongoDB, les comptes Cloudinary et Brevo, et la façon dont une fusion vers `develop` ou `main` atteint un hébergeur (une intégration côté hébergeur, pas un workflow de ce dépôt) ne sont pas dans le dépôt. Seuls les services avec lesquels le code communique sont listés, dans `docs/services/README.md`.
