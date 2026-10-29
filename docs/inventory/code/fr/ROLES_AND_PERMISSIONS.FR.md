# Rôles et permissions

## Table des matières

- [Rôles par défaut](#rôles-par-défaut)
- [Modèle de droits](#modèle-de-droits)
- [Comment fonctionne une vérification](#comment-fonctionne-une-vérification)
- [Comment apparaît le premier Owner](#comment-apparaît-le-premier-owner)
- [Pièges](#pièges)

## Rôles par défaut

Définis dans `libs/shared-constants/src/role.constants.ts` (partagé entre le serveur et le back-office).

| Rôle | Niveau | Notes |
|---|---|---|
| `Owner` | Le plus élevé | Premier de `HIGHEST_LEVEL_ROLES`, parent de tous les autres rôles |
| `Administrator` | Le plus élevé | Second de `HIGHEST_LEVEL_ROLES` |
| `Manager` | Par défaut | `DEFAULT_ROLES` ; les droits se règlent par entité |

D'autres rôles peuvent être créés depuis le back-office (`createRole`, `updateRole`). Les rôles sont stockés dans la collection Parse `_Role`.

## Modèle de droits

Un rôle porte deux champs personnalisés :

- `rights` : une liste de `{ className, rights }` où `rights` est une table de booléens pour les opérations `create`, `update`, `get`, `find`, `delete`, `destroy`.
- `ui` : les onglets ou menus du back-office que le rôle peut voir.

Entités qui peuvent recevoir des droits dans le formulaire du back-office (`apps/bo/src/constants/user.constants.ts`, `ENTITIES_WITH_RIGHTS_OPTIONS`) : `_User`, `_Role`, `Article`, `Page`, `Project`, `Category`, `Contact`.

## Comment fonctionne une vérification

`hasRight(user, className, operations)` dans `apps/server/src/cloud/utils/role.utils.cloud.ts` :

1. Les utilisateurs `Owner` et `Administrator` passent toujours.
2. Sinon, chaque rôle de l'utilisateur pour l'entité doit accorder chaque opération demandée.

`fromBO(action, rights, className)` applique cette vérification à une Cloud Function ; sans argument `rights`, il exige seulement un utilisateur connecté. Les requêtes côté serveur utilisent la master key (`USE_MASTER_KEY`) : la vérification est donc la seule protection d'une fonction du back-office.

## Comment apparaît le premier Owner

La variable `OWNERS_EMAILS` (e-mails séparés par des virgules) est lue par `user.triggers.ts` : un utilisateur créé avec l'un de ces e-mails reçoit le rôle `Owner` dans `beforeSave`. Le propriétaire doit être le premier compte créé.

## Pièges

- `hasRight` lit `roleForClassName.rights` sans garde : un rôle sans entrée pour l'entité fait lever une erreur au lieu de renvoyer faux.
- `role.triggers.ts` n'est pas importé (voir [Cloud Code](CLOUD_FUNCTIONS.FR.md#pièges)).
- `createDefaultRoles` n'est appelée nulle part : les rôles autres que `Owner` sont donc créés à la main.
