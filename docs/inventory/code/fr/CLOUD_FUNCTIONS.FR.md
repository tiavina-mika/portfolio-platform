# Cloud Code : fonctions, triggers et jobs

## Table des matières

- [Où se trouve le code](#où-se-trouve-le-code)
- [Cloud Functions](#cloud-functions)
- [Triggers](#triggers)
- [Cloud Jobs](#cloud-jobs)
- [Pièges](#pièges)

## Où se trouve le code

Source : `apps/server/src/cloud/`. Les fonctions, triggers et jobs ont chacun un dossier `_core/` (générique, réutilisable) et un dossier `_domain/` (le domaine `project`), et un `index.ts` qui importe leurs fichiers ; le point d'entrée du Cloud Code est `apps/server/src/cloud/index.ts`.

La plupart des fonctions sont enveloppées par `fromBO(...)` (`cloud/utils/_core/`), qui refuse un appel sans utilisateur connecté et peut vérifier les droits de ses rôles (voir [rôles et permissions](ROLES_AND_PERMISSIONS.FR.md)). Les fonctions `*ForClient` et quelques autres (newsletter, formulaire de contact) servent le site public.

## Cloud Functions

Les fichiers sont dans `apps/server/src/cloud/functions/_core/` sauf mention contraire.

| Fichier | Fonctions |
|---|---|
| `accountHelp.functions.ts` | `resendMemberPhoneVerificationCode`, `sendMemberPasswordResetCode`, `changeMemberContact`, `changeMemberCountry` |
| `admins.functions.ts` | `getUsers`, `getUser`, `deleteUser`, `deleteUsers`, `destroyUsers`, `banUser`, `liftUserBan`, `toggleUsersSeen`, `getUserIdsFromRoles`, `sendMessageToUser` |
| `app.functions.ts` | `unsubscribeNewsletter`, `resubscribeNewsletter`, `addReasonToUnsubscribeToTheNewsletter`, `getObjectsCount`, `incrementShareCount` |
| `article.functions.ts` | `getArticles`, `getArticle`, `getArticleForClient`, `incrementArticleViewCount` |
| `auditLog.functions.ts` | `getAuditLogs`, `getAuditLogByUserId`, `getUserAuditTrail` |
| `auth.functions.ts` | `verifyAccount`, `changePassword`, `sendVerificationCode`, `sendResetPasswordVerificationCode`, `loginWithPhone`, `loginWithEmail`, `resetPassword` |
| `category.functions.ts` | `getCategories`, `getCategory` |
| `contact.functions.ts` | `createPublicContact` (enregistre la `target` envoyée par le site, `portfolio` par défaut), `subscribeToNewsletter`, `confirmNewsletterSubscription`, `getContacts`, `getContact` (les deux suivent l'espace de travail : `resolveWorkspace` pour la liste, un message d'un espace que le compte n'ouvre pas se lit comme introuvable) |
| `contactChange.functions.ts` | `requestContactChange`, `confirmContactChange` |
| `contentVersion.functions.ts` | `getContentVersions`, `getContentVersionSnapshot` |
| `dashboard.functions.ts` | `getDashboardKpis`, `getDashboardAlerts`, `getDashboardRecentActivity` |
| `faq.functions.ts` | `getFaq` |
| `globalSearch.functions.ts` | `globalSearch` |
| `impersonation.functions.ts` | `impersonateUser`, `endImpersonationSession` |
| `invitation.functions.ts` | `sendBOInvitation`, `verifyBOInvitationToken` |
| `mfa.functions.ts` | `generateMfaSecret`, `confirmMfaEnrollment`, `verifyMfaLogin`, `disableMfa`, `regenerateMfaBackupCodes`, `adminResetMfa` |
| `misc.functions.ts` | `clearRecycleBinInCloud`, `purgeOrphanedEditorFilesInCloud` |
| `notification.functions.ts` | `getNotifications`, `getNotification`, `resendNotification`, `resendNotificationFailedDeliveries`, `getNotificationResends`, `setNotificationReceiverSeen`, `markAllMyNotificationsSeen`, `updateNotificationPreferences`, `bulkSetNotificationsReceiverSeen`, `bulkSoftDeleteNotifications`, `bulkRestoreNotifications`, `destroyNotifications`, `previewNotificationBroadcast`, `sendNotificationBroadcast`, `getNotificationBroadcastHistory`, `getNotificationSmsDailyCounts` |
| `page.functions.ts` | `getPages`, `getPage` |
| `pageSection.functions.ts` | `getPageSections` |
| `passwordResetDelay.functions.ts` | `cancelPasswordResetDelay` |
| `role.functions.ts` | `hasRole`, `getCurrentUserWorkspaces`, `addRolesToUser`, `getRolesDelegation`, `removeRolesForUser`, `createRole`, `updateRole`, `getRoleAuditLogs`, `getHighestRoleAccounts` |
| `stepUpVerification.functions.ts` | `requestStepUpVerification`, `verifyStepUpCode` |
| `user.functions.ts` | `getUserProfile`, `deleteAccount`, `exportMyData`, `saveUserLanguage` |
| `userSession.functions.ts` | `registerSession`, `getUserSessions`, `revokeSession`, `revokeOtherSessions`, `adminGetUserSessions`, `adminRevokeUserSession`, `adminRevokeAllUserSessions` |
| `utils.functions.ts` | `getJobStatus`, `destroyObjects` |
| `test.functions.ts` | `getTestEmailSendersOptions`, `createBatchTest`, `destroyBatchTest`, `sendArticleToNewsletterTest`, `sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest`, `sendInvitationTest`, `sendWelcomeEmailTest`, `sendVerificationCodeSmsTest` (aides de test, importées seulement en développement local et en test) |
| `_domain/client.functions.ts` | `getClients`, `getClient`, `createClient`, `updateClient`, `archiveClient` (espace Aldaron seulement : chacune commence par `resolveWorkspace` ; pas de fonction de suppression) |
| `_domain/mission.functions.ts` | `getMissions` (avec « mes missions », lu depuis la session), `getMission`, `createMission`, `updateMission`, `changeMissionStatus`, `getMissionAssignees` (les membres des rôles qui ouvrent l'espace Aldaron) (espace Aldaron seulement : chacune commence par `resolveWorkspace` ; pas de fonction de suppression) |
| `_domain/payment.functions.ts` | `getQuotePayments` (les paiements d'un devis accepté), `createQuotePayments` (l'échéancier 30 / 40 / 30 d'un devis accepté qui n'en a pas encore), `markPaymentAsPaid`, `setPaymentDueDate`, `cancelPayment` (annule un paiement et écrit son remplaçant non payé) (espace Aldaron seulement : chacune commence par `resolveWorkspace` ; pas de fonction de suppression) |
| `_domain/project.functions.ts` | `getProjects`, `getProject`, `getProjectForClient` |
| `_domain/quote.functions.ts` | `getQuotes`, `getQuote`, `createQuote` (aussi un avenant à un devis accepté, ou un premier devis écrit depuis une demande de devis du site, qui pointe alors vers lui), `prepareQuoteFromContact` (trouve ou crée le client d'une demande de devis et lit la demande en un brouillon à préremplir), `updateQuote` (un brouillon seulement), `reviseQuote` (nouvelle version brouillon d'un devis envoyé), `changeQuoteStatus` (espace Aldaron seulement : chacune commence par `resolveWorkspace` ; pas de fonction de suppression) |

## Triggers

Les fichiers sont dans `apps/server/src/cloud/triggers/_core/` sauf mention contraire.

| Fichier | Hooks |
|---|---|
| `app.triggers.ts` | `beforeSave`, `afterSave` `App` |
| `article.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Article` (`afterSave` lance `sendArticleToNewsletterJob`) |
| `auth.triggers.ts` | `beforeLogin`, `afterLogin`, `afterLogout` |
| `category.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Category` |
| `contact.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Contact` |
| `country-scope.triggers.ts` | `beforeFind` sur les classes cloisonnées par pays |
| `newsletter.triggers.ts` | `beforeSave`, `afterSave` `Newsletter` (`afterSave` lance `createContactToCloudJob`) |
| `notification.triggers.ts` | `beforeSave`, `afterSave` `Notification` |
| `page.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Page` |
| `pageSection.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `PageSection` |
| `role.triggers.ts` | `beforeSave`, `afterSave`, `beforeDelete`, `afterDelete` `_Role` |
| `user.triggers.ts` | `beforeSave`, `afterSave`, `beforeDelete`, `afterDelete` `_User` |
| `_domain/client.triggers.ts` | `beforeSave` `Client` (e-mail en minuscules et unique, statut et auteurs) ; `beforeDelete` `Client` (refusé tant que le client a des devis ou des missions) |
| `_domain/mission.triggers.ts` | `beforeSave` `Mission` (née planifiée ; statut seulement vers l'avant, `done` et `cancelled` définitifs ; phase du statut courant, effacée au changement de statut ; dates de début et de fin remplies si vides, fin jamais avant le début ; client et devis figés après `planned` ; devis accepté et du même client ; personne assignée capable d'ouvrir l'espace Aldaron) |
| `_domain/payment.triggers.ts` | `beforeSave` `Payment` (écrit pour un devis accepté seulement, client lu sur le devis ; devis, client, type, pourcentage et montant figés ; un paiement payé ne devient qu'annulé, un paiement annulé ne change plus ; payé exige un moyen, la date vaut aujourd'hui par défaut et n'est jamais à venir) ; `afterSave` `Payment` (additionne les paiements payés dans le `paidAmount` du devis) |
| `_domain/project.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Project` |
| `_domain/quote.triggers.ts` | `beforeSave` `Quote` (né brouillon, numéro, total, transitions, contenu figé hors brouillon, `paidAmount` écrit par le trigger des paiements seulement) ; `afterSave` `Quote` (écrit les trois paiements d'un devis qui vient d'être accepté, une seule fois) |

## Cloud Jobs

Les fichiers sont dans `apps/server/src/cloud/jobs/_core/` (`_domain/` n'a aucun job). Un job est déclaré avec `defineJob(name, handler)` et s'exécute via `runJob(name, params)` (`cloud/utils/_core/job.utils.cloud.ts`). Le côté planifié est dans les [tâches planifiées](SCHEDULED_JOBS.FR.md).

| Fichier | Jobs |
|---|---|
| `category.jobs.ts` | `updateLinkedCategoryItemCountJob` |
| `cms.jobs.ts` | `purgeOrphanedEditorFilesJob`, `renameContentTargetFieldsJob` (migration ponctuelle des champs de cible et de l’ancienne valeur `aldaron`, lancée à la main) |
| `email.jobs.ts` | `createContactToCloudJob` |
| `impersonation.jobs.ts` | `revokeExpiredImpersonationSessionsJob` |
| `misc.jobs.ts` | `clearRecycleBinInCloudJob` |
| `newsletter.jobs.ts` | `sendArticleToNewsletterJob` |
| `notification.jobs.ts` | `expireOldNotificationsJob`, `purgeOldNotificationsJob` |
| `retention.jobs.ts` | `purgeOldLogsJob` |
| `user.jobs.ts` | `deleteOrDestroyUserRelationsJob`, `liftExpiredBansJob`, `createUserAuditLogJob`, `purgeOrphanUserSessionsJob`, `purgeUnverifiedPhoneSignupsJob` |
| `test.jobs.ts` | `createBatchTestJob`, `destroyBatchTestJob` |

## Pièges

- Le premier owner n'est plus créé par un trigger : au démarrage, `ensureOwnerInvitationsExist` invite chaque adresse de `OWNERS_EMAILS` avec le rôle `OWNER` (voir [rôles et permissions](ROLES_AND_PERMISSIONS.FR.md)).
- Tout nouveau fichier de fonctions, triggers ou jobs doit être ajouté à cette page dans le même changement (`.claude/rules/inventory.md`) ; `node .claude/skills/inventory/scripts/inventory.mjs --list` affiche tous les noms.
