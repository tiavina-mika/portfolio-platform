# ADR 002 - Un monorepo Nx et pnpm

## Table des matières

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

**Statut** : Accepté (consigné à partir du code)

## Contexte

La plateforme est faite de trois apps (`server`, `web`, `bo`) qui partagent un vocabulaire de domaine : noms de collections, locales, noms de rôles, types comme les champs traduits. Des dépôts séparés les dupliqueraient et feraient d'un changement transversal (un nouveau champ sur un projet, par exemple) un changement sur plusieurs dépôts.

## Décision

Un seul dépôt Git et une seule racine de workspace pnpm avec un seul fichier de verrouillage et un seul `packageManager` épinglé, orchestrés par [Nx](https://nx.dev). Chaque app garde son propre `package.json` et un `project.json` qui branche les cibles Nx. Le code partagé vit dans `libs/` : `shared-constants`, `shared-domain-constants`, `shared-domain-types`, `shared-types`, `shared-utils`, et les configurations partagées de lint et de format sous `libs/config`. Les bibliothèques sont importées par alias (`@shared/constants`, `@shared/types`, ...). L'organisation est décrite dans [MONOREPO.FR.md](../../architecture/fr/MONOREPO.FR.md).

La CI s'appuie sur `nx affected` : un changement ne lint, ne type-check et ne construit que les projets qu'il touche, voir [DEPLOYMENT.FR.md](../../architecture/fr/DEPLOYMENT.FR.md).

## Conséquences

- Une fonctionnalité qui touche plusieurs apps est une branche et une pull request.
- Une valeur partagée par les apps est définie une fois dans une bibliothèque `libs/shared-*`, par exemple les locales et les noms de rôles.
- Les apps doivent rester compatibles avec un seul jeu de versions d'outils et un seul fichier de verrouillage.
- Chaque commande passe par `pnpm nx ...` et `pnpm` uniquement, jamais npm ni yarn.
