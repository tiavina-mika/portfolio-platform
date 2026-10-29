# Droits et rôles

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Rôles par défaut](#rôles-par-défaut)
- [Modèle de droits](#modèle-de-droits)
- [Attribution des rôles](#attribution-des-rôles)
- [Contrôles côté serveur](#contrôles-côté-serveur)
- [Contrôles dans le back-office](#contrôles-dans-le-back-office)
- [Site public](#site-public)
- [Écarts connus](#écarts-connus)

## Vue d'ensemble

Le contrôle d'accès repose sur les objets Parse `_Role`. Un rôle porte deux champs personnalisés :

- `rights` : une liste de `{ className, rights: { create, find, get, update, delete, destroy } }`, une entrée par collection (booléens) ;
- `ui` : une liste de zones du back-office que le rôle ouvre (`miscellaneous`, `tests`, issues de `UIRoleEnum` dans `apps/bo/src/types/role.type.ts`).

Le back-office les expose dans la page des rôles (formulaire `apps/bo/src/containers/roles/RoleForm.tsx`) : un tableau de collections (`_User`, `_Role`, `Article`, `Page`, `Project`, `Category`, `Contact`, issues de `ENTITIES_WITH_RIGHTS_OPTIONS`) avec les six droits, et la liste `ui`.

## Rôles par défaut

Définis dans `libs/shared-constants/src/role.constants.ts` :

| Rôle | Constante | Signification |
|---|---|---|
| `Owner` | `HIGHEST_LEVEL_ROLES[0]` | plus haut niveau, le premier compte |
| `Administrator` | `HIGHEST_LEVEL_ROLES[1]` | plus haut niveau |
| `Manager` | `DEFAULT_ROLES` | rôle par défaut, avec les droits qu'un administrateur lui donne |

`Owner` et `Administrator` sont les rôles « de plus haut niveau » : ils sont traités comme ayant tous les droits sur toutes les collections, côté serveur (`hasRight`) comme dans le back-office (`canAccessTo`, `getRights`), sans entrée `rights`.

Comment les rôles apparaissent :

1. Un utilisateur qui s'inscrit avec un email listé dans `OWNERS_EMAILS` reçoit `Owner` (`afterSave` de `_User`) ; `createRole` crée le rôle s'il n'existe pas encore.
2. `createRole` donne à chaque nouveau rôle une ACL en lecture publique et un accès en écriture limité aux rôles de plus haut niveau, et ajoute les rôles `Owner` et `Administrator` existants à sa relation `roles` pour qu'ils en héritent.
3. Les autres rôles (`Manager` ou noms personnalisés) sont créés de la même façon : soit quand un administrateur en crée un dans le back-office (Cloud Function `createRole`), soit à la volée quand `addOrUpdateRolesToUser` nomme un rôle qui n'existe pas.

## Modèle de droits

| Concept | Où |
|---|---|
| entrée `rights` par collection | `_Role.rights`, modifiée dans la page des rôles |
| entrées `ui` | `_Role.ui` |
| hiérarchie des rôles | `_Role.roles` (rôles parents), remplie par `createRole` / `updateRole` à partir de `parentRoleNames` |
| rôles d'un utilisateur | relation `_Role.users`, modifiée par `updateRoleForUser` / `removeRolesForUser` |

`updateRoleForUser(roleNames, user)` rend les rôles d'un utilisateur égaux à la liste donnée : elle ajoute les manquants et retire les autres.

## Attribution des rôles

Cloud Functions de `apps/server/src/cloud/functions/role.functions.ts` :

| Fonction | Garde | Rôle |
|---|---|---|
| `getUserRoles` | `parseFunction` | rôles de l'appelant, ou de `userId` |
| `hasRole` | `parseFunction` | indique si l'appelant a l'un des `roleNames` |
| `addOrUpdateRolesToUser` | `fromBO` | définir les rôles d'un utilisateur |
| `removeRolesForUser` | `fromBO` | retirer tous les rôles d'un utilisateur |
| `createRole`, `updateRole` | `fromBO` | créer ou modifier un rôle avec ses parents, `rights` et `ui` |

Les thunks du back-office sont dans `apps/bo/src/redux/actions/role.action.ts`.

## Contrôles côté serveur

Briques de `apps/server/src/cloud/utils/utils.cloud.ts` et `role.utils.cloud.ts` :

- `parseFunction(fn)` : journalise l'appel et normalise les erreurs. Elle ne vérifie pas qui appelle.
- `fromBO(fn, rights?, className?)` : rejette l'appel s'il n'y a pas de `request.user` ; quand une liste `rights` est fournie, exige aussi `hasRight(user, className, rights)`.
- `hasRight(user, className, operations)` : vrai pour les rôles de plus haut niveau ; sinon trouve les rôles de l'utilisateur ayant une entrée `rights` pour la classe et renvoie vrai quand chacun de ces rôles accorde chaque opération demandée.
- `isAdministrator(user)` : vrai quand l'utilisateur a `Owner` ou `Administrator`.
- `cloudValidationRules` : un validateur pour les définitions `Parse.Cloud` qui exige un administrateur connecté (et laisse passer les appels `isExpressApi` ou d'un contexte d'utilisateur supprimé).
- `protectionMiddleware` : pour les routes Express, voir [AUTH.FR.md](AUTH.FR.md).

La plupart des Cloud Functions du back-office sont enveloppées par `fromBO`, donc exigent un utilisateur connecté. Seules `getProjects` et les fonctions de test (`createBatchTest`) passent une liste `rights`. Le code serveur s'exécute ensuite en général avec la master key (`USE_MASTER_KEY`) : ce ne sont donc pas les permissions au niveau des classes qui empêchent un utilisateur connecté d'appeler une fonction.

## Contrôles dans le back-office

- Les rôles de l'utilisateur courant sont chargés à l'entrée d'une page du tableau de bord (`onDashboardEnter`), avec `isAdmin` (la Cloud Function `hasRole` avec les rôles de plus haut niveau).
- `canAccessTo(roles, className, action, uiRight)` et `getRights(roles, className, uiRight)` (`apps/bo/src/utils/role.utils.ts`) : les rôles de plus haut niveau passent ; sinon le premier rôle ayant une entrée `rights` pour la classe décide de `canCreate`, `canFind`, `canPreview`, `canEdit`, `canDelete`, `canDestroy` ; un `uiRight` est accordé quand un rôle le liste dans `ui`.
- `useProtect(className)` renvoie ces indicateurs à un composant pour afficher ou masquer des boutons.
- La barre latérale (`SideBar.tsx`) affiche une entrée quand l'utilisateur peut faire `find` sur la classe, ou a le droit `ui` pour les entrées Divers et Tests.
- Les loaders de routes utilisent `onEnterActionWithLoader` avec les options `collection` / `action` / `uiRight` : un utilisateur sans le droit mais ayant au moins un rôle est envoyé vers la page introuvable ; les thunks enveloppés par `actionWithLoader` avec les mêmes options lèvent le message traduit `common:errors.unauthorizedAction`.

Ces contrôles ne font que façonner l'interface. L'application réelle des droits est côté serveur.

## Site public

Le site n'a pas de rôles. Il lit et écrit via Parse Server comme client anonyme : requêtes serveur dans `apps/web/server/queries` et Cloud Functions comme `getArticleForClient`, qui filtrent sur `deleted: false` et `active: true`, et il crée directement des objets `Contact` et `Newsletter` (leurs triggers `beforeSave` les valident et les complètent).

## Écarts connus

Constatés dans le code, non tranchés ici :

- `role.triggers.ts` (création des autres rôles par défaut après `Owner`, protection de la suppression des rôles) n'est pas importé dans `triggers/index.ts` : ces triggers ne sont donc pas enregistrés. `createDefaultRoles` n'est appelée nulle part.
- `setCLPFromRights` (permissions au niveau des classes dérivées des droits d'un rôle) est définie mais jamais appelée, et aucune permission au niveau des classes n'est déclarée dans ce dépôt : elles dépendent de ce qui est configuré en base. Le serveur autorise aussi la création de classes par le client (`allowClientClassCreation: true`).
- Beaucoup de fonctions de lecture sont enveloppées par `parseFunction` seulement (par exemple `getUser`, `getUserByEmail`, `sendEmailToUser`, `getObjectsCount`, `saveUserLanguage`) : elles n'exigent donc pas d'utilisateur connecté.
