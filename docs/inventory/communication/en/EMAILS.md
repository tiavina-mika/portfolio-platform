# Emails

## Table of Contents

- [How emails are sent](#how-emails-are-sent)
- [Emails sent](#emails-sent)
- [Newsletter contacts](#newsletter-contacts)
- [Gotchas](#gotchas)

## How emails are sent

All emails go through Brevo transactional emails (see [Brevo](../../../services/brevo/en/BREVO.md)). Code: `apps/server/src/services/email.service.ts` (`sendEmail`) and `apps/server/src/cloud/utils/email.utils.cloud.ts` (the message builders). The HTML body comes from `generateEmailTemplate` in `apps/server/src/config/emails/index.ts`; texts are translated server-side (`apps/server/src/locales`) in the user's language. The default sender is `ADMIN_EMAIL_SENDER` with the application name.

## Emails sent

| Email | Builder | Sent from | Recipient |
|---|---|---|---|
| Account verification code | `sendEmailVerification` | Cloud Functions `sendVerificationCode` and the user creation flow | The new user |
| Reset password code | `sendEmailResetPassword` | Cloud Function `sendResetPasswordVerificationCode` | The user |
| Free message from the back-office | `sendEmailToUser` | Cloud Function `sendEmailToUser` | A user chosen by an admin |
| New article | `sendArticleToNewsletterEmails` | Job `sendArticleToNewsletterJob`, started when an article is saved | Active newsletter subscribers, with an unsubscribe link |

The test functions `sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest` and `sendArticleToNewsletterTest` send the same emails for checking.

## Newsletter contacts

On a new `Newsletter` subscription, `createContactToCloudJob` creates the contact in Brevo (`createContactEmail`), with the attributes `FIRSTNAME` and `LASTNAME` created once on first use. A new `Contact` (contact form) also creates a Brevo contact in `afterSave` (its `name` is used as last name, its id as external id).

## Gotchas

- No email is sent to the site owner when the contact form is submitted: the message is only stored in `Contact` and shown in the back-office.
- `SENDER_EMAIL` is in `apps/web/.env.example` but is not read by any code of `apps/web`.
- `sendEmail` rethrows Brevo errors while `createContactEmail` only logs them.
