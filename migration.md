# Migration

Migrer le portfolio vers exactement la stack de 1lalana-platform. Les features et le design restent identiques.

- original: E:\portfolio-v4
- source: E:\1lalana-platform

## Objectif

- Stack: identique à `source` (1lalana-platform)
- Features / design: identiques à `original` (portfolio-v4)
- Domaine (`_domaine`): un seul, `project` (à vérifier)
- Pas de `docs` ni de `e2e`

## Constat

| | original (portfolio-v4) | source (1lalana-platform) |
|---|---|---|
| Structure | 3 dossiers indépendants (`bo`, `server`, `web`), chacun avec son `.git` | Monorepo Nx, un seul `.git` |
| Gestionnaire | Yarn (`.yarnrc.yml`, `yarn.lock`) | pnpm (`pnpm-workspace.yaml`, `pnpm-lock.yaml`) |
| Apps | bo, server, web | bo, server, web, mobile, docs, e2e |
| Libs partagées | aucune | `libs/` (config eslint/prettier, shared-*) |
| TypeScript | 5.9 | 6.0 |
| Outillage | husky, lint-staged, cspell | husky, commitlint, changesets, markdownlint, gitleaks |

## Plan de migration

Règle: ne jamais modifier `E:\portfolio-v4` ni `E:\1lalana-platform` (lecture seule). Tout se fait dans `E:\portfolio-platform`.

### Étape 1 — Copier le squelette de la source (sans le métier)

- Copier la racine de `source`: `package.json`, `nx.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.npmrc`, `.nvmrc`, `.editorconfig`, `.gitignore`, `.gitattributes`, `.husky`, `.github`, `.vscode`, `commitlint.config.mjs`, `.gitleaks.toml`, `.markdownlint-cli2.jsonc`, `.changeset`, `patches`, `scripts`, `libs/config`.
- Exclure: `node_modules`, `.nx`, `.tmp-nx`, `.expo`, `dist`, `.next`, `storybook-static`, `logs`, `*.tsbuildinfo`, `.git`, fichiers `.env*` contenant des secrets.
- Exclure aussi tout ce qui est propre à 1lalana: `videos`, `design`, `assets`, `AUDIT_CV*`, `*.html` à la racine, `docs` métier, `apps/mobile`, `apps/e2e`, `apps/docs` (à reprendre plus tard si besoin).
- Renommer le workspace en `portfolio-platform` (`package.json`, `nx.json`, README, CLAUDE.md).

### Étape 2 — Copier le code de l'original, sans artefacts

- `portfolio-v4/{bo,server,web}` vers `apps/{bo,server,web}`.
- Exclure: `.git`, `node_modules`, `dist`, `.next`, `clientBuild`, `logs`, `.yarn`, `.yarnrc.yml`, `yarn.lock`, `debug-storybook.log`, `.env.*` (recréer à partir d'exemples sans secrets).
- Ne garder que `src`, `public`, la config applicative et les docs utiles.

### Étape 3 — Aligner chaque app sur la config de la source

- Comparer fichier par fichier avec `source/apps/{bo,server,web}`: `package.json`, `project.json`, `tsconfig*.json`, `eslint.config.mjs`, `vite.config.ts` / `next.config.mjs`, `vitest.config.ts`, prettier.
- Remplacer les configs de l'original par celles de la source (même stack exacte). Ajouter `project.json` Nx à chaque app.
- Utiliser `@shared/eslint-config` et `@shared/prettier-config`, supprimer `.lintstagedrc.json`, `.cspell.json` si non repris par la source.
- Aligner les versions des dépendances sur celles de la source (React, Next, MUI, Parse, Express, TypeScript 6...). Garder uniquement les dépendances spécifiques au portfolio.

### Étape 4 — Adapter le domaine

- Un seul domaine: `project` (à vérifier). Supprimer les domaines propres à 1lalana (rides, bookings, users carpooling, etc.) et ne garder que ce que le portfolio utilise.
- Renommer côté server (classes Parse, cloud functions, validations), côté bo (écrans, routes) et côté web (pages, composants).
- Extraire les types, constantes et validations communs vers `libs/shared-*` comme dans la source.

### Étape 5 — i18n, docs, outillage

- Passer les textes UI par le système i18n de la source (`check-i18n`).
- Reprendre la structure (arborescence) de `docs/` de la source, sans copier son contenu: créer les dossiers et écrire les docs du portfolio.
- Mettre à jour `CLAUDE.md` et `README.md` pour le portfolio (supprimer les références à 1lalana, au covoiturage, à Madagascar).

### Étape 6 — Installer et vérifier

1. `pnpm install` (utiliser `install:light` si la machine est limitée).
2. `pnpm nx run-many -t lint`
3. `pnpm nx run-many -t build`
4. `pnpm nx run-many -t test`
5. Lancer server, bo et web en local et comparer avec `portfolio-v4` (features et design identiques).

### Étape 7 — Git

- Un seul dépôt (le `.git` actuel de `portfolio-platform`).
- Commits par étape (squelette, apps, alignement, domaine, vérification), conventional commits.
- Vérifier avec gitleaks qu'aucun secret des `.env.*` de l'original n'est commité.

## Points à vérifier

- Le domaine unique `project` couvre-t-il toutes les entités du portfolio (compétences, expériences, contact...) ?
- Garde-t-on `mobile` ? Par défaut: non.
- Pas de `docs` ni de `e2e` (décidé).
- Le design de `web` repose sur Tailwind CSS et shadcn/ui (`components.json`), comme dans la source (confirmé).
