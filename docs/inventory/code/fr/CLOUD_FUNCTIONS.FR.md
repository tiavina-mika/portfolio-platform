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
| `contact.functions.ts` | `createContact`, `createPublicContact`, `subscribeToNewsletter`, `confirmNewsletterSubscription`, `getContacts`, `getContact`, `getContactSummary`, `getTicketContext`, `getTicketAgents`, `getMyTickets`, `getMyTicket`, `reopenMyTicket` |
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
| `payment.functions.ts` | `getPayments`, `getPaymentLedgerSummary`, `getPayment`, `retryPayment`, `refundPayment` |
| `payoutPhone.functions.ts` | `requestPayoutPhoneVerification`, `confirmPayoutPhoneVerification` |
| `receipt.functions.ts` | `generateMyReceipt`, `resendReceipt` |
| `report.functions.ts` | `createReport`, `hasReportedTarget`, `getReports`, `getReport`, `getReportSummary`, `getReportTargetHistory`, `startReportReview`, `dismissReports`, `suspendReportedUser`, `resolveReport` |
| `role.functions.ts` | `hasRole`, `addRolesToUser`, `getRolesDelegation`, `removeRolesForUser`, `createRole`, `updateRole`, `getRoleAuditLogs`, `getHighestRoleAccounts` |
| `statistics.functions.ts` | `getOverviewStatistics` |
| `stepUpVerification.functions.ts` | `requestStepUpVerification`, `verifyStepUpCode` |
| `ticket-message.functions.ts` | `sendTicketMessage`, `getTicketMessages`, `updateTicketStatus`, `updateTicketPriority`, `assignTicket` |
| `user.functions.ts` | `getUserProfile`, `deleteAccount`, `exportMyData`, `saveUserLanguage` |
| `userSession.functions.ts` | `registerSession`, `getUserSessions`, `registerPushToken`, `unregisterPushToken`, `revokeSession`, `revokeOtherSessions`, `adminGetUserSessions`, `adminRevokeUserSession`, `adminRevokeAllUserSessions` |
| `utils.functions.ts` | `getJobStatus`, `destroyObjects` |
| `test.functions.ts` | `getTestEmailSendersOptions`, `createBatchTest`, `destroyBatchTest`, `sendArticleToNewsletterTest`, `sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest`, `sendInvitationTest`, `sendWelcomeEmailTest`, `sendVerificationCodeSmsTest`, `createRideMock` (aides de test, importées seulement en développement local et en test) |
| `_domain/project.functions.ts` | `getProjects`, `getProject`, `getProjectForClient` |

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
| `payment.triggers.ts` | `beforeSave`, `afterSave` `Payment` |
| `report.triggers.ts` | `beforeSave` `Report` |
| `role.triggers.ts` | `beforeSave`, `afterSave`, `beforeDelete`, `afterDelete` `_Role` |
| `ticket-message.triggers.ts` | `beforeSave`, `afterSave` `TicketMessage` |
| `user.triggers.ts` | `beforeSave`, `afterSave`, `beforeDelete`, `afterDelete` `_User` |
| `_domain/project.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Project` |

## Cloud Jobs

Les fichiers sont dans `apps/server/src/cloud/jobs/_core/` (`_domain/` n'a aucun job). Un job est déclaré avec `defineJob(name, handler)` et s'exécute via `runJob(name, params)` (`cloud/utils/_core/job.utils.cloud.ts`). Le côté planifié est dans les [tâches planifiées](SCHEDULED_JOBS.FR.md).

| Fichier | Jobs |
|---|---|
| `category.jobs.ts` | `updateLinkedCategoryItemCountJob` |
| `cms.jobs.ts` | `purgeOrphanedEditorFilesJob` |
| `email.jobs.ts` | `createContactToCloudJob` |
| `impersonation.jobs.ts` | `revokeExpiredImpersonationSessionsJob` |
| `misc.jobs.ts` | `clearRecycleBinInCloudJob` |
| `newsletter.jobs.ts` | `sendArticleToNewsletterJob` |
| `notification.jobs.ts` | `expireOldNotificationsJob`, `purgeOldNotificationsJob` |
| `payment.jobs.ts` | `updatePaymentAfterSaveJob`, `retryFailedPlatformPaymentsJob`, `reconcilePendingPaymentsJob` |
| `push.jobs.ts` | `processPushReceiptsJob` |
| `retention.jobs.ts` | `purgeOldLogsJob` |
| `slack.jobs.ts` | `postDailySlackSummaryJob` |
| `user.jobs.ts` | `deleteOrDestroyUserRelationsJob`, `liftExpiredBansJob`, `createUserAuditLogJob`, `purgeOrphanUserSessionsJob`, `purgeUnverifiedPhoneSignupsJob` |
| `test.jobs.ts` | `createBatchTestJob`, `destroyBatchTestJob` |

## Pièges

- Les dossiers `_core` viennent d'une plateforme de covoiturage et en gardent le vocabulaire : `createRideMock` dans les fonctions de test, et les noms de classes `Ride`, `Request`, `Vehicle`, `Rating`, `RideShare` et `SosAlert` dans la constante serveur `collections` (voir les [collections](COLLECTIONS_AND_INDEXES.FR.md#pièges)).
- `payment.functions.ts`, `payoutPhone`, `receipt` et les jobs de paiement s'appuient sur une passerelle de paiement simulée : le portfolio n'encaisse aucun paiement aujourd'hui.
- Le premier owner n'est plus créé par un trigger : au démarrage, `ensureOwnerInvitationsExist` invite chaque adresse de `OWNERS_EMAILS` avec le rôle `OWNER` (voir [rôles et permissions](ROLES_AND_PERMISSIONS.FR.md)).
- Tout nouveau fichier de fonctions, triggers ou jobs doit être ajouté à cette page dans le même changement (`.claude/rules/inventory.md`) ; `node .claude/skills/inventory/scripts/inventory.mjs --list` affiche tous les noms.
