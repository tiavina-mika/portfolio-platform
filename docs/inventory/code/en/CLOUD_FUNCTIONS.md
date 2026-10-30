# Cloud Code: Functions, Triggers and Jobs

## Table of Contents

- [Where it lives](#where-it-lives)
- [Cloud Functions](#cloud-functions)
- [Triggers](#triggers)
- [Cloud Jobs](#cloud-jobs)
- [Gotchas](#gotchas)

## Where it lives

Source: `apps/server/src/cloud/`. Functions, triggers and jobs each have a `_core/` folder (generic, reusable) and a `_domain/` folder (the `project` domain), and an `index.ts` that imports their files; the Cloud Code entry is `apps/server/src/cloud/index.ts`.

Most functions are wrapped by `fromBO(...)` (`cloud/utils/_core/`), which rejects a call without a logged-in user and can check the rights of the user's roles (see [roles and permissions](ROLES_AND_PERMISSIONS.md)). The `*ForClient` functions and a few others (newsletter, contact form) serve the public website.

## Cloud Functions

Files are in `apps/server/src/cloud/functions/_core/` unless noted.

| File | Functions |
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
| `test.functions.ts` | `getTestEmailSendersOptions`, `createBatchTest`, `destroyBatchTest`, `sendArticleToNewsletterTest`, `sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest`, `sendInvitationTest`, `sendWelcomeEmailTest`, `sendVerificationCodeSmsTest`, `createRideMock` (test helpers, imported only in local development and tests) |
| `_domain/project.functions.ts` | `getProjects`, `getProject`, `getProjectForClient` |

## Triggers

Files are in `apps/server/src/cloud/triggers/_core/` unless noted.

| File | Hooks |
|---|---|
| `app.triggers.ts` | `beforeSave`, `afterSave` `App` |
| `article.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Article` (`afterSave` starts `sendArticleToNewsletterJob`) |
| `auth.triggers.ts` | `beforeLogin`, `afterLogin`, `afterLogout` |
| `category.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Category` |
| `contact.triggers.ts` | `beforeSave`, `afterSave`, `afterDelete` `Contact` |
| `country-scope.triggers.ts` | `beforeFind` on the classes scoped by country |
| `newsletter.triggers.ts` | `beforeSave`, `afterSave` `Newsletter` (`afterSave` starts `createContactToCloudJob`) |
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

Files are in `apps/server/src/cloud/jobs/_core/` (`_domain/` has no job). A job is declared with `defineJob(name, handler)` and run through `runJob(name, params)` (`cloud/utils/_core/job.utils.cloud.ts`). The scheduled side is in [scheduled tasks](SCHEDULED_JOBS.md).

| File | Jobs |
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

## Gotchas

- The `_core` folders were ported from a carpooling platform and still carry its vocabulary: `createRideMock` in the test functions, and the `Ride`, `Request`, `Vehicle`, `Rating`, `RideShare` and `SosAlert` class names in the server `collections` constant (see [collections](COLLECTIONS_AND_INDEXES.md#gotchas)).
- `payment.functions.ts`, `payoutPhone`, `receipt` and the payment jobs run against a simulated payment gateway: the portfolio takes no payment today.
- The first owner is not created by a trigger any more: at boot `ensureOwnerInvitationsExist` invites each `OWNERS_EMAILS` address with the `OWNER` role (see [roles and permissions](ROLES_AND_PERMISSIONS.md)).
- Any new function, trigger or job file must be added to this page in the same change (`.claude/rules/inventory.md`); `node .claude/skills/inventory/scripts/inventory.mjs --list` prints every name.
