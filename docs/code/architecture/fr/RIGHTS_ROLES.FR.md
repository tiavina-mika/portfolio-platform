# Droits et rôles

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Rôles par défaut](#rôles-par-défaut)
- [Modèle de droits](#modèle-de-droits)
- [Attribuer des rôles](#attribuer-des-rôles)
- [Contrôles côté serveur](#contrôles-côté-serveur)
- [Contrôles dans le back-office](#contrôles-dans-le-back-office)
- [Site public](#site-public)
- [Lacunes connues](#lacunes-connues)

## Vue d'ensemble

Le contrôle d'accès repose sur les objets Parse `_Role`. Un rôle porte des champs personnalisés :

- `rights` : une liste de `{ className, rights: { create, find, get, update, delete, destroy } }`, une entrée par collection (booléens) ;
- `ui` : les zones du back-office que le rôle ouvre (`UIRoleEnum` dans `apps/bo/src/types/_core/role.type.ts` : `migrations`, `cron`, `tests`, `impersonation`, `broadcast`, `staff`) ;
- `countries` : les pays auxquels le rôle est limité, et un délai d'inactivité optionnel (15 à 480 minutes).

La page des rôles du back-office (`apps/bo/src/containers/_core/roles/RoleForm.tsx`) les édite. Les collections proposées sont `ENTITIES_WITH_RIGHTS_OPTIONS` (`_User`, `_Role`, `Article`, `Page`, `Category`, `Contact`, `Notification`, `UserAuditLog`) plus les entités que le domaine enregistre avec `registerRightsEntities` (`Project`, dans `apps/bo/src/utils/_domain/project-role.utils.ts`), voir [CORE_DOMAIN.FR.md](CORE_DOMAIN.FR.md).

## Rôles par défaut

Noms dans `libs/shared-constants/src/role.constants.ts`, libellés et droits par défaut dans `apps/server/src/constants/_core/role.constants.ts`. Les noms sont en majuscules.

| Rôle | Niveau | Signification |
|---|---|---|
| `OWNER` | le plus haut (`HIGHEST_LEVEL_ROLES[0]`) | fait les actions réservées au propriétaire (réinitialiser la MFA d'un administrateur, révoquer un super administrateur) |
| `SUPER_ADMIN` | le plus haut (`HIGHEST_LEVEL_ROLES[1]`) | tous les droits sur toutes les collections |
| `MANAGER` | par défaut (`DEFAULT_ROLES[0]`) | droits réglés par entité dans le back-office |
| `SUPPORT_VIEWER` | par défaut | lecture seule |
| `TEAM_LEAD` | par défaut | lit comme `SUPPORT_VIEWER`, peut inviter un collègue, voit la gestion du personnel |
| `AGENCY_STAFF` | par défaut (`DEFAULT_ROLES[3]`) | mêmes droits que `SUPPORT_VIEWER`, mais n'ouvre que l'espace de l'agence (Aldaron) |
| `AGENCY_LEAD` | par défaut (`DEFAULT_ROLES[4]`) | mêmes droits que `TEAM_LEAD`, mais n'ouvre que l'espace de l'agence (Aldaron) |
| `AGENCY_ADMIN` | par défaut (`DEFAULT_ROLES[5]`) | tous les droits sur toutes les classes sauf celles toujours verrouillées, et la gestion du personnel, dans l'espace de l'agence (Aldaron) uniquement ; donné aux `AGENCY_OWNERS_EMAILS` à la place de `OWNER` |

Les deux rôles les plus hauts passent tous les contrôles sans entrée `rights`, côté serveur (`hasRight`) et dans le back-office. Les rôles par défaut sont créés au démarrage par `ensureDefaultRolesExist`, une fois `SUPER_ADMIN` présent.

Les anciennes bases contiennent `Owner`, `Administrator` et `Manager`. Aucun job ne les renomme : voir le fichier de dette de la revue de la branche.

Comment apparaissent les premiers propriétaires : au démarrage, `ensureOwnerInvitationsExist` envoie une invitation au back-office avec le rôle `OWNER` (valable 90 jours) à chaque adresse de `OWNERS_EMAILS` qui n'a ni compte ni invitation en attente. En `preProduction` et `production`, `validateEnv` refuse de démarrer avec moins de deux adresses distinctes.

## Modèle de droits

| Concept | Où |
|---|---|
| Entrée `rights` par collection | `_Role.rights` |
| `ui`, `countries`, délai | `_Role.ui`, `_Role.countries` |
| Hiérarchie | `_Role.roles` : les rôles les plus hauts sont enfants de tous les autres |
| Rôles d'un utilisateur | relation `_Role.users` |
| Permissions de classe | reconstruites depuis les rôles à chaque démarrage (`rebuildAllCLP`) ; les classes de `ALWAYS_LOCKED_CLASSES` ne sont jamais accordées |

## Attribuer des rôles

Cloud Functions dans `apps/server/src/cloud/functions/_core/role.functions.ts` : `hasRole`, `addRolesToUser`, `removeRolesForUser`, `createRole`, `updateRole`, `getRolesDelegation`, `getRoleAuditLogs`, `getHighestRoleAccounts`. Un rôle peut aussi être donné par une invitation (`sendBOInvitation`) : les rôles arrivent une fois l'adresse vérifiée. Les changements de rôles sont écrits dans un journal des rôles.

## Contrôles côté serveur

Dans `apps/server/src/cloud/utils/_core/` :

- `parseFunction(fn)` : journalise l'appel et normalise les erreurs, aucune autorisation.
- `fromBO(fn, rights?, className?)` : exige un utilisateur connecté ; avec `rights`, exige aussi `hasRight(user, className, rights)`.
- `hasRight(user, className, operations)` : les rôles les plus hauts passent ; sinon chaque opération demandée doit être accordée par au moins un rôle de l'utilisateur.
- `hasBoRight(user, uiRight)` : vérifie un droit `ui`.
- Le trigger `country-scope` restreint les requêtes aux pays du rôle.
- Espaces de travail (portfolio, Aldaron) : les listes, détails, badges, actions groupées, recherche globale et compteurs du tableau de bord des contenus rangés dans l'un d'eux (articles, pages, catégories, contacts, projets) restent dans les espaces ouverts par les rôles (`getUserWorkspaces`, `workspacesTargetQuery`). Une sauvegarde est refusée quand elle modifie, crée ou déplace une ligne d'un espace que l'éditeur ne peut pas ouvrir (`assertCanSaveInWorkspaces`, dans le `beforeSave` des articles, pages, catégories et projets). La liste des utilisateurs masque le staff d'un espace que le lecteur ne peut pas ouvrir (`getStaffUserIdsHiddenFrom`) ; les comptes membres sont communs aux deux espaces.
- Un espace par session : une session du staff est liée à l'espace de l'adresse du back-office sur laquelle elle a été ouverte (`_Session.workspace`, écrit par `bindSessionToWorkspace` depuis `afterLogin` et `issueParseSession`), et `getUserWorkspaces` ne garde que celui-là pour l'utilisateur d'une requête. Chaque espace a sa propre double authentification, dans sa propre colonne de `_User` (`MFA_FIELD_BY_WORKSPACE` dans `@shared/constants` : `mfa` pour le portfolio, `agencyMfa` pour l'agence) : `beforeLogin` demande celle de l'adresse où le mot de passe est saisi, et les postes les plus élevés se voient refuser les fonctions du back-office tant que celle de l'espace de leur session n'est pas active. Sans ce lien, un mot de passe saisi sur l'espace resté sans double authentification ouvrirait une session qui lit l'autre. Une session ouverte avant ce lien n'a pas d'espace et garde tous les espaces de ses rôles jusqu'à son expiration (quelques heures pour une session du staff). Activer ou désactiver la double authentification d'un espace ne révoque que les autres sessions du compte sur cet espace et celles sans espace (`revokeOtherWorkspaceSessionsService`) ; la réinitialisation par un owner les révoque toutes.
- Les sections de page n'ont pas d'espace : les deux espaces les partagent.

Les requêtes tournent ensuite avec la clé maître : ces contrôles sont la garde d'une fonction du back-office.

## Contrôles dans le back-office

`canAccessTo` et `getRights` (`apps/bo/src/utils/_core/role.utils.ts`) donnent `canCreate`, `canFind`, `canPreview`, `canEdit`, `canDelete`, `canDestroy` ; `useProtect(className)` les renvoie à un composant. Le menu (`useNavigationMenus.tsx`) affiche une entrée quand l'utilisateur peut `find` la classe ou a le droit `ui`. Les loaders de routes et les thunks appliquent les mêmes options. Ces contrôles ne font que façonner l'interface ; le serveur fait foi.

## Site public

Pas de rôles. Le site lit via des Cloud Functions qui filtrent sur `deleted: false` et `active: true` (`getProjectForClient`, `getArticleForClient`, ...) et envoie le formulaire de contact et l'inscription à la newsletter par des Cloud Functions publiques (`createPublicContact`, `subscribeToNewsletter`).

## Lacunes connues

- Les rôles `Owner`, `Administrator`, `Manager` d'une base existante ne sont pas renommés (voir plus haut).
- L'entrée de menu `Diffusion` n'a pas de `hasRightName`, elle est donc masquée pour tout le monde ; `Paramètres` n'est visible que des rôles les plus hauts.
- La restauration de version de contenu n'est pas branchée pour `Project`.
