# Cloud Code: Functions, Triggers and Jobs

## Table of Contents

- [Where it lives](#where-it-lives)
- [Cloud Functions](#cloud-functions)
- [Triggers](#triggers)
- [Cloud Jobs](#cloud-jobs)
- [Gotchas](#gotchas)

## Where it lives

Source: `apps/server/src/cloud/`. Each kind has an `index.ts` that imports its files; the Cloud Code entry is `apps/server/src/cloud/index.ts`.

Most functions are wrapped by `fromBO(...)` (`utils/utils.cloud.ts`), which rejects a call without a logged-in user and can check the rights of the user's roles (see [roles and permissions](ROLES_AND_PERMISSIONS.md)). The `*ForClient` functions serve the public website.

## Cloud Functions

Files are in `apps/server/src/cloud/functions/`.

| File | Functions |
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
| `test.functions.ts` | `createBatchTest`, `destroyBatchTest`, `sendArticleToNewsletterTest`, `sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest` (test helpers, not for production use) |

## Triggers

Files are in `apps/server/src/cloud/triggers/`.

| File | Hooks |
|---|---|
| `app.triggers.ts` | `afterSave` `App` |
| `article.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Article` (`afterSave` starts `sendArticleToNewsletterJob`) |
| `auth.triggers.ts` | `beforeLogin`, `afterLogout` |
| `category.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Category` |
| `contact.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Contact` |
| `newsletter.triggers.ts` | `beforeSave`, `afterSave` `Newsletter` (`afterSave` starts `createContactToCloudJob`) |
| `page.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` on `Page` and on `PageSection` |
| `project.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Project` |
| `user.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `_User` (`beforeSave` gives the Owner role to the emails of `OWNERS_EMAILS`) |
| `role.triggers.ts` | `afterSave`, `beforeDelete`, `afterDelete` `_Role` (see [gotchas](#gotchas)) |

## Cloud Jobs

Files are in `apps/server/src/cloud/jobs/`. A job runs through `runJob(name, params)` (`utils/job.utils.cloud.ts`). The scheduled and recurring side is in [scheduled tasks](SCHEDULED_JOBS.md).

| File | Job | Started by |
|---|---|---|
| `category.jobs.ts` | `updateLinkedCategoryItemCountJob` | `category.service.cloud.ts` |
| `email.jobs.ts` | `createContactToCloudJob` | `newsletter.triggers.ts` |
| `misc.jobs.ts` | `clearRecycleBinInCloudJob` | function `clearRecycleBinInCloud` |
| `newsletter.jobs.ts` | `sendArticleToNewsletterJob` | `article.triggers.ts` |
| `test.jobs.ts` | `createBatchTestJob`, `destroyBatchTestJob` | the `*BatchTest` test functions |

## Gotchas

- `role.triggers.ts` exists but is not imported by `triggers/index.ts`: its `_Role` hooks do not run today.
- `createDefaultRoles` (`services/right.service.cloud.ts`) is not called anywhere (its call in `index.ts` is commented out), so the Owner role comes from the `OWNERS_EMAILS` flow only.
- Any new function, trigger or job file must be added to this page in the same change (`.claude/rules/inventory.md`).
