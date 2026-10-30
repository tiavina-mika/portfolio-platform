# Emails

## Table of Contents

- [How emails are sent](#how-emails-are-sent)
- [Emails sent](#emails-sent)
- [Newsletter contacts](#newsletter-contacts)
- [Gotchas](#gotchas)

## How emails are sent

All emails go through Brevo transactional emails (see [Brevo](../../../services/brevo/en/BREVO.md)). Code: `apps/server/src/services/email.service.ts` (`sendEmail`) and `apps/server/src/cloud/utils/_core/email.utils.cloud.ts` (the message builders). The HTML body comes from `generateEmailTemplate` in `apps/server/src/config/emails/index.ts` and `apps/server/src/emails/templates/`; texts are translated server-side (`apps/server/src/config/i18n/locales`) in the user's language. The default sender is `ADMIN_EMAIL_SENDER` with the application name.

## Emails sent

| Email | Builder | Sent from | Recipient |
|---|---|---|---|
| Account verification code | `sendEmailVerification` (`sendVerificationCodeToEmail`) | Cloud Functions `sendVerificationCode`, `verifyAccount` flow and user creation | The new user |
| Reset password code | `sendEmailResetPassword` | Cloud Function `sendResetPasswordVerificationCode` | The user |
| Back-office invitation | `sendInvitationEmail` | Cloud Function `sendBOInvitation`, and the owner invitation at server boot | The invited person |
| Step-up verification code | `sendStepUpVerificationEmail` | Cloud Function `requestStepUpVerification` | The logged-in user |
| Contact change code | `sendContactChangeVerificationEmail` | Cloud Function `requestContactChange` | The user |
| Ticket acknowledgement and reply | `sendTicketAcknowledgementEmail`, `sendTicketReplyEmail` | Contact form / `sendTicketMessage` | The visitor who wrote |
| Newsletter confirmation (double opt-in) | `sendNewsletterConfirmationEmail` | Cloud Function `subscribeToNewsletter` | The subscriber, with the confirmation link |
| Newsletter unsubscribe confirmation | `sendNewsletterUnsubscribeConfirmationEmail` | Cloud Function `unsubscribeNewsletter` | The subscriber |
| New article | `sendArticleToNewsletterEmails` | Job `sendArticleToNewsletterJob`, started when an article is saved | Active newsletter subscribers, with an unsubscribe link |
| Free message and notifications | `sendEmailToUser`, `sendNotificationEmailToUsers` | `sendMessageToUser`, notification sends and broadcasts | Users chosen by an admin |
| Account notices | `sendWelcomeEmail`, `sendAccountReactivatedEmail`, `sendNewDeviceLoginEmail`, `sendPasswordResetDelayedEmail` | User and login triggers and services | The user |
| Staff alerts | `sendEmailToStaffInTheirOwnLocale` | Reports, failed payments, failed jobs, large money actions | The staff (and Slack when `SLACK_ALERTS_WEBHOOK_URL` is set) |

Verification texts are also sent by SMS through MMSDuck (`sendSmsVerification`, ticket and new-device SMS): in development and test they are only logged.

The test functions (`sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest`, `sendArticleToNewsletterTest`, `sendInvitationTest`, `sendWelcomeEmailTest`) send the same emails for checking.

## Newsletter contacts

On a new `Newsletter` subscription, `createContactToCloudJob` creates the contact in Brevo (`createContactEmail`), with the attributes `FIRSTNAME` and `LASTNAME` created once on first use. A new `Contact` (contact form) also creates a Brevo contact in `afterSave` (its `name` is used as last name, its id as external id).

## Gotchas

- No email is sent to the site owner when the contact form is submitted: the message is stored in `Contact` as a ticket, shown in the back-office, and the visitor gets an acknowledgement.
- `sendEmail` rethrows Brevo errors while `createContactEmail` only logs them.
