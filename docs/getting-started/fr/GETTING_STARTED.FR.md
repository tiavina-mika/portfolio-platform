# Démarrage

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Fichiers d'environnement](#fichiers-denvironnement)
- [Lancer](#lancer)
- [Vérifier son changement](#vérifier-son-changement)

## Prérequis

- Node.js : la version de [`.nvmrc`](../../../.nvmrc).
- pnpm : la version épinglée dans le `package.json` racine (`packageManager`). Jamais npm ni yarn.
- Une instance MongoDB joignable depuis le serveur (locale ou Atlas).

## Installation

Depuis la racine du workspace, jamais depuis une app :

```bash
pnpm install          # ou : pnpm install:light sur une machine limitée
```

## Fichiers d'environnement

Chaque app fournit un `.env.example`. Copiez-le, remplissez-le, ne commitez jamais le vrai fichier. Les variables sont listées dans l'[inventaire](../../inventory/README.md).

| App | Copier `.env.example` vers |
|---|---|
| `apps/server` | `.env.development` (voir la config du serveur pour les autres environnements) |
| `apps/bo` | `.env.preprod` (`pnpm dev`, `build:preprod`) ou `.env.prod` (`build:prod`) |
| `apps/web` | `.env.local` |

## Lancer

```bash
pnpm nx run server:dev
pnpm nx run bo:dev
pnpm nx run web:dev
```

## Vérifier son changement

```bash
pnpm nx run-many -t lint
pnpm nx run-many -t build
pnpm check-i18n        # traductions : parité entre langues et clés utilisées dans le code
pnpm check-doc-links   # liens relatifs des docs
```

L'architecture du workspace est décrite dans [MONOREPO.FR.md](../../code/architecture/fr/MONOREPO.FR.md).
