# Rôles et permissions

## Table des matières

- [Rôles par défaut](#rôles-par-défaut)
- [Modèle de droits](#modèle-de-droits)
- [Comment fonctionne une vérification](#comment-fonctionne-une-vérification)
- [Comment apparaissent les premiers Owners](#comment-apparaissent-les-premiers-owners)
- [Pièges](#pièges)

## Rôles par défaut

Les noms sont définis dans `libs/shared-constants/src/role.constants.ts` (partagé entre le serveur et le back-office) ; leurs libellés et droits par défaut dans `apps/server/src/constants/_core/role.constants.ts`. Les noms de rôles sont écrits en majuscules.

| Rôle | Niveau | Notes |
|---|---|---|
| `OWNER` | Le plus haut | Premier de `HIGHEST_LEVEL_ROLES` ; le rôle qui fait les actions réservées à l'OWNER (réinitialiser la MFA d'un administrateur, révoquer un super administrateur) |
| `SUPER_ADMIN` | Le plus haut | Second de `HIGHEST_LEVEL_ROLES` |
| `MANAGER` | Par défaut | `DEFAULT_ROLES[0]` ; les droits se règlent par entité dans le back-office |
| `SUPPORT_VIEWER` | Par défaut | Lecture seule (`find`, `get`) sur toutes les classes sauf celles toujours verrouillées ; voit la page de statistiques |
| `TEAM_LEAD` | Par défaut | Ce que lit `SUPPORT_VIEWER`, plus la création d'un compte (pour inviter un collègue) ; voit les statistiques et la gestion de l'équipe |

Les rôles par défaut sont créés au démarrage par `ensureDefaultRolesExist` une fois le rôle `SUPER_ADMIN` présent. D'autres rôles peuvent être créés depuis le back-office (`createRole`, `updateRole`). Les rôles sont stockés dans la collection Parse `_Role` ; les rôles les plus hauts sont enfants de tous les autres.

## Modèle de droits

Un rôle porte des champs personnalisés :

- `rights` : une liste de `{ className, rights }` où `rights` est une table de booléens pour les opérations `create`, `update`, `get`, `find`, `delete`, `destroy`.
- `ui` : les droits « ui » du back-office (`UIRoleEnum` dans `apps/bo/src/types/_core/role.type.ts`) : `migrations`, `cron`, `tests` (les onglets de la page divers), `impersonation`, `statistics`, `finance`, `broadcast`, `staff`. Le serveur reflète ceux qu'il doit faire respecter (par exemple `IMPERSONATION_UI_RIGHT`).
- `countries` : les pays auxquels le rôle est limité (le trigger `country-scope` restreint les requêtes en conséquence).
- un délai d'inactivité du back-office personnalisé, borné entre 15 et 480 minutes.

Entités pouvant recevoir des droits dans le formulaire du back-office : `_User`, `_Role`, `Article`, `Page`, `Category`, `Contact`, `Payment`, `Notification`, `Report`, `UserAuditLog` (`ENTITIES_WITH_RIGHTS_OPTIONS` dans `apps/bo/src/constants/_core/user.constants.ts`), plus les entités qu'un domaine enregistre avec `registerRightsEntities` (le domaine `Project` le fait dans `apps/bo/src/utils/_domain/project-role.utils.ts`).

## Comment fonctionne une vérification

`hasRight(user, className, operations)` dans `apps/server/src/cloud/utils/_core/role.utils.cloud.ts` :

1. Les utilisateurs `OWNER` et `SUPER_ADMIN` passent toujours.
2. Sinon, les droits des rôles de l'utilisateur pour l'entité s'additionnent : chaque opération demandée doit être accordée par au moins un rôle.

`fromBO(action, rights, className)` applique cette vérification à une Cloud Function ; sans argument `rights`, elle exige seulement un utilisateur connecté. `hasBoRight(user, uiRight)` vérifie un droit « ui ». Les requêtes côté serveur utilisent la master key : ces vérifications sont donc la garde d'une fonction du back-office. Les permissions de classe Parse (CLP) sont reconstruites à partir des rôles à chaque démarrage (`rebuildAllCLP`) ; les classes de `ALWAYS_LOCKED_CLASSES` ne sont jamais accordées à un rôle.

## Comment apparaissent les premiers Owners

Au démarrage, `ensureOwnerInvitationsExist` (`invitation.service.cloud.ts`) envoie une invitation au back-office avec le rôle `OWNER` (valable 90 jours) à chaque adresse de `OWNERS_EMAILS` qui n'a ni compte ni invitation en attente. En développement local, le lien d'invitation est journalisé au lieu d'être envoyé par e-mail. En `preProduction` et `production`, `validateEnv()` refuse de démarrer avec moins de deux adresses distinctes (`MIN_OWNERS_COUNT`), et `warnIfTooFewOwners` journalise un avertissement à chaque démarrage tant que moins de deux comptes ont le rôle.

## Pièges

- Les bases créées avant la séparation `_core`/`_domain` contiennent les rôles `Owner`, `Administrator` et `Manager`. Le code cherche désormais `OWNER`, `SUPER_ADMIN` et `MANAGER`, et aucun job de migration ne les renomme : tant qu'ils ne sont pas renommés à la main, les comptes existants ne sont plus reconnus comme de plus haut niveau.
- `ensureDefaultRolesExist` ne fait rien tant que le rôle `SUPER_ADMIN` n'existe pas.
