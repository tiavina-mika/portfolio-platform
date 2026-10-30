# Monorepo

## Table des matières

- [Arborescence](#arborescence)
- [Apps](#apps)
- [Core et domain](#core-et-domain)
- [Bibliothèques partagées](#bibliothèques-partagées)
- [Outillage](#outillage)
- [Commandes](#commandes)

## Arborescence

`portfolio-platform` est un workspace [Nx](https://nx.dev) avec une seule racine pnpm, un seul `pnpm-lock.yaml` et un seul `packageManager` épinglé.

```text
portfolio-platform/
├── apps/
│   ├── server/   # Express + Parse Server (API REST et BaaS sur MongoDB)
│   ├── bo/       # Back-office (Vite + React + MUI)
│   └── web/      # Site public (Next.js)
├── libs/         # Bibliothèques partagées et configs lint / format partagées
├── docs/         # Cette documentation
└── scripts/      # Vérifications du dépôt (i18n, jumeaux de docs, liens de docs)
```

Chaque app garde son propre `package.json` (dépendances, `engines`) et un `project.json` qui relie les targets Nx aux scripts de l'app.

## Apps

| App | Stack | Rôle |
|---|---|---|
| `server` | Node.js, Express, Parse Server, TypeScript (build SWC) | Cloud Code (fonctions, triggers, jobs), emails et SMS, stockage de fichiers ; sert le build du back-office. Séparé en `_core` / `_domain` |
| `bo` | Vite, React, Material UI, TanStack Router, Redux Toolkit | Panneau d'admin : contenu, projets, tickets, utilisateurs, rôles, notifications, signalements, tableaux de bord. Séparé en `_core` / `_domain` |
| `web` | Next.js, Tailwind CSS, shadcn/ui, next-intl | Portfolio public : projets, blog, pages, contact, newsletter (pas de séparation) |

Le build de `bo` est copié dans le serveur (`pnpm copy` dans `apps/server`) et servi par Express.

## Core et domain

`server` et `bo` séparent leur code en `_core` (back-office générique) et `_domain` (le `Project` du portfolio) ; `web` n'est pas séparé. Voir [CORE_DOMAIN.FR.md](CORE_DOMAIN.FR.md).

## Bibliothèques partagées

`libs/` contient le code partagé (`shared-constants`, `shared-domain-constants`, `shared-domain-types`, `shared-domain-utils`, `shared-faq`, `shared-types`, `shared-utils`, `shared-validations`) et les configs partagées (`@shared/eslint-config`, `@shared/prettier-config` sous `libs/config/`) utilisées par les apps.

## Outillage

- Hooks Git avec husky et commits conventionnels (commitlint).
- Versionnage avec changesets.
- Markdown avec markdownlint ; détection de secrets avec gitleaks.
- Traductions : `pnpm check-i18n` garde `fr`, `en` et `mg` alignés et vérifie chaque clé utilisée dans le code.

## Commandes

Préférer Nx aux outils sous-jacents :

```bash
pnpm nx run <app>:<target>
pnpm nx run-many -t lint
pnpm nx run-many -t build
pnpm nx affected -t lint
```
