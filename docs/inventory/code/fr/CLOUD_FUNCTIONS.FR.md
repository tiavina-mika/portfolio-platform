# Cloud Code : fonctions, triggers et jobs

## Table des matières

- [Où se trouve le code](#où-se-trouve-le-code)
- [Cloud Functions](#cloud-functions)
- [Triggers](#triggers)
- [Cloud Jobs](#cloud-jobs)
- [Pièges](#pièges)

## Où se trouve le code

Source : `apps/server/src/cloud/`. Chaque type a un `index.ts` qui importe ses fichiers ; le point d'entrée du Cloud Code est `apps/server/src/cloud/index.ts`.

La plupart des fonctions sont enveloppées par `fromBO(...)` (`utils/utils.cloud.ts`), qui refuse un appel sans utilisateur connecté et peut vérifier les droits de ses rôles (voir [rôles et permissions](ROLES_AND_PERMISSIONS.FR.md)). Les fonctions `*ForClient` servent le site public.

## Cloud Functions

Les fichiers sont dans `apps/server/src/cloud/functions/`.

| Fichier | Fonctions |
|---|---|
| `app.functions.ts` | `unsubscribeNewsletter`, `resubscribeNewsletter`, `addReasonToUnsubscribeToTheNewsletter`, `getObjectsCount` |
| `article.functions.ts` | `getArticles`, `getArticle`, `getArticleForClient` |
| `auth.functions.ts` | `verifyAccountEmail`, `sendVerificationCode`, `sendResetPasswordVerificationCode`, `resetPassword` |
| `category.functions.ts` | `getCategories`, `getCategory` |
| `contact.functions.ts` | `getContacts`, `getContact` |
| `misc.functions.ts` | `clearRecycleBinInCloud` |
| `page.functions.ts` | `getPages`, `getPage` |
| `pageSection.functions.ts` | `getPageSections` |
| `project.functions.ts` | `getProjects`, `getProject`, `getProjectForClient` |
| `role.functions.ts` | `getUserRoles`, `hasRole`, `addOrUpdateRolesToUser`, `removeRolesForUser`, `createRole`, `updateRole` |
| `user.functions.ts` | `getUsers`, `getUser`, `deleteUser`, `getUserByEmail`, `deleteUsers`, `destroyUsers`, `toggleBanUser`, `createSessionTokenForAUser`, `toggleUserSeen`, `isUserExistsByEmail`, `getUserIdsFromRoles`, `sendEmailToUser`, `getNewUsersCount`, `saveUserLanguage` |
| `utils.functions.ts` | `getJobStatus`, `destroyObjects` |
| `test.functions.ts` | `createBatchTest`, `destroyBatchTest`, `sendArticleToNewsletterTest`, `sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest` (aides de test, pas pour la production) |

## Triggers

Les fichiers sont dans `apps/server/src/cloud/triggers/`.

| Fichier | Hooks |
|---|---|
| `app.triggers.ts` | `afterSave` `App` |
| `article.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Article` (`afterSave` lance `sendArticleToNewsletterJob`) |
| `auth.triggers.ts` | `beforeLogin`, `afterLogout` |
| `category.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Category` |
| `contact.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Contact` |
| `newsletter.triggers.ts` | `beforeSave`, `afterSave` `Newsletter` (`afterSave` lance `createContactToCloudJob`) |
| `page.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` sur `Page` et sur `PageSection` |
| `project.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Project` |
| `user.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `_User` (`beforeSave` donne le rôle Owner aux e-mails de `OWNERS_EMAILS`) |
| `role.triggers.ts` | `afterSave`, `beforeDelete`, `afterDelete` `_Role` (voir [pièges](#pièges)) |

## Cloud Jobs

Les fichiers sont dans `apps/server/src/cloud/jobs/`. Un job s'exécute via `runJob(name, params)` (`utils/job.utils.cloud.ts`). Le côté planifié et récurrent est dans les [tâches planifiées](SCHEDULED_JOBS.FR.md).

| Fichier | Job | Lancé par |
|---|---|---|
| `category.jobs.ts` | `updateLinkedCategoryItemCountJob` | `category.service.cloud.ts` |
| `email.jobs.ts` | `createContactToCloudJob` | `newsletter.triggers.ts` |
| `misc.jobs.ts` | `clearRecycleBinInCloudJob` | la fonction `clearRecycleBinInCloud` |
| `newsletter.jobs.ts` | `sendArticleToNewsletterJob` | `article.triggers.ts` |
| `test.jobs.ts` | `createBatchTestJob`, `destroyBatchTestJob` | les fonctions de test `*BatchTest` |

## Pièges

- `role.triggers.ts` existe mais n'est pas importé par `triggers/index.ts` : ses hooks `_Role` ne s'exécutent pas aujourd'hui.
- `createDefaultRoles` (`services/right.service.cloud.ts`) n'est appelée nulle part (son appel dans `index.ts` est commenté) : le rôle Owner vient donc uniquement du flux `OWNERS_EMAILS`.
- Tout nouveau fichier de fonctions, triggers ou jobs doit être ajouté à cette page dans le même changement (`.claude/rules/inventory.md`).
