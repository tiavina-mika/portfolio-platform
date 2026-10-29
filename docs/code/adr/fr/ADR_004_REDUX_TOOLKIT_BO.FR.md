# ADR 004 - Redux Toolkit pour l'état du back-office

## Table des matières

- [Contexte](#contexte)
- [Décision](#décision)
- [Conséquences](#conséquences)

**Statut** : Accepté (consigné à partir du code)

## Contexte

Le back-office est un panneau d'administration riche en données : listes avec filtres et pagination, formulaires, utilisateur courant et ses rôles, compteurs de notification, états de chargement et d'erreur partagés par de nombreux écrans, et loaders de routes qui doivent charger les données avant l'affichage d'une page.

## Décision

L'état est tenu par [Redux Toolkit](https://redux-toolkit.js.org) avec un fichier de reducer et un fichier d'actions par domaine (`redux/reducers/<domain>.reducer.ts`, `redux/actions/<domain>.action.ts`). Le flux est appel Parse, thunk, reducer, composant, via des sélecteurs typés. Les thunks sont créés avec `actionWithLoader` (indicateur de chargement, contrôle des droits, gestion des erreurs) et les loaders de routes avec `onEnterActionWithLoader`, qui convertit les erreurs en `notFound()` et `redirect()` de TanStack Router. Seul le slice `settings` (locale, thème, barre latérale) est persisté avec redux-persist.

`apps/web` n'utilise pas Redux : ses données viennent des composants serveur et des requêtes, et ses mutations des server actions.

## Conséquences

- La gestion du chargement, des erreurs et des messages est écrite une fois dans les enveloppes, voir [ERROR_HANDLING.FR.md](../../architecture/fr/ERROR_HANDLING.FR.md).
- Un nouveau domaine demande un fichier d'actions, un reducer et des sélecteurs : plus de code qu'un état local, mais une navigation prévisible.
- Les contrôles de droits se font dans les mêmes enveloppes, ce qui garde les écrans fins, voir [RIGHTS_ROLES.FR.md](../../architecture/fr/RIGHTS_ROLES.FR.md).
- Le comportement d'attrapage et de stockage des enveloppes fait qu'une erreur de thunk s'affiche dans un snackbar au lieu d'être levée : un import manquant peut donc faire silencieusement échouer une action.
