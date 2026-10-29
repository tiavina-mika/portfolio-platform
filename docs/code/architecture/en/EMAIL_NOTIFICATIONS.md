# Email and Notifications

## Table of Contents

- [Overview](#overview)
- [Provider and configuration](#provider-and-configuration)
- [Emails sent](#emails-sent)
- [Template](#template)
- [Brevo contacts](#brevo-contacts)
- [Newsletter delivery](#newsletter-delivery)
- [Unsubscribing](#unsubscribing)
- [Back-office notification counters](#back-office-notification-counters)
- [Test functions](#test-functions)
- [Known gaps](#known-gaps)

## Overview

All emails are transactional emails sent by the server through [Brevo](https://www.brevo.com) (formerly Sendinblue). The apps `web` and `bo` never send mail: they call a Cloud Function or save an object, and the server does the rest. There is no push, SMS or in-app notification channel; the only in-app "notifications" are the counters of new items in the back-office, see below.

| File | Role |
|---|---|
| `apps/server/src/services/email.service.ts` | Brevo client: `sendEmail`, `createContactEmail`, `getContacts` |
| `apps/server/src/cloud/utils/email.utils.cloud.ts` | one function per email, builds subject and body |
| `apps/server/src/config/emails/index.ts` | HTML layout shared by every email (`generateEmailTemplate`) |
| `apps/server/src/locales/{fr,en,mg}/common.json` | translated email texts |

## Provider and configuration

- Brevo SDK `@getbrevo/brevo`, one client created on first use with `BREVO_API_KEY`.
- Sender: `ADMIN_EMAIL_SENDER` as the address and the constant `APP_NAME` (`Portfolio`) as the name.
- `BREVO_API_KEY` and `WEBSITE_URL` are required at startup (`validateEnv`); `ADMIN_EMAIL_SENDER` is read where emails are built. Links in emails point to `WEBSITE_URL` (in local development, `http://localhost:9012`), and the logo is served by the server at `/logo.svg`.
- `sendEmail` logs the Brevo response and rethrows on failure; a helper reports success when the response carries a `messageId`.
- The text of each email is translated with the server i18n (`translate(key, locale)`), see [I18N.md](I18N.md). The locale comes from the Cloud Function parameter or from the save context; the default is `fr`.

## Emails sent

| Email | Function | Sent when | Recipient |
|---|---|---|---|
| Account confirmation (6-digit code, valid 1 hour) | `sendEmailVerification` | on user creation in production (`afterSave` of `_User`); `sendVerificationCode` Cloud Function; `beforeLogin` when the account confirmation is enabled | the new user |
| Password reset (6-digit code, valid 1 hour) | `sendEmailResetPassword` | `sendResetPasswordVerificationCode` Cloud Function | the user |
| Free message | `sendEmailToUser` | `sendEmailToUser` Cloud Function, called by the "send an email" action of the users pages in the back-office (subject and message typed by the administrator) | the chosen user |
| New article | `sendArticleToNewsletterEmails` | `sendArticleToNewsletterJob`, see below | each active newsletter subscriber |

Nothing is sent when a visitor submits the contact form or subscribes to the newsletter: no confirmation to the visitor and no alert to the site owner. The back-office learns about new messages through the counters below.

## Template

`generateEmailTemplate({ title, content, buttonUrl, buttonText, footer, cardStyle, locale })` returns one HTML table layout: logo linked to the website, optional title, content, optional button, optional footer and a copyright line with the current year. Styles are inline in a `<style>` block, since mail clients ignore external CSS. The emails use their own hard-coded colors, which is accepted for email HTML.

## Brevo contacts

The server also keeps a contact list in Brevo (`createContactToCloud` / `createContactEmail`), with the attributes `FIRSTNAME`, `LASTNAME`, `EMAIL` and `SMS`; the attributes are created once per process (`ensureContactAttributes`) and an error there is logged without blocking.

| Source | When |
|---|---|
| New user (production) | after the confirmation email, in `saveUserAndSendCodeToEmail` |
| New `Contact` | `afterSave` of `Contact`, with the contact `objectId` as external id |
| New `Newsletter` subscription | `afterSave` of `Newsletter` starts `createContactToCloudJob`, which derives a first and last name from the part of the email before `@` |

A failure to create a Brevo contact is logged, not raised, except in the user creation path where it is turned into a translated `error.sendingVerificationCode` error.

## Newsletter delivery

1. Saving a new `Article` (an authenticated save, from the back-office) starts the Parse job `sendArticleToNewsletterJob` with the article id.
2. The job loads the article only if it is `active: true` and `deleted: false`; otherwise it ends silently.
3. It runs over the `Newsletter` subscriptions that are `active: true` and `deleted: false`, 20 at a time (`runParallelJob`), waiting 250 ms after each one.
4. Each subscriber gets the article in their own `language`: translated title as the subject, the content cut by `cutHtmlString`, a button to the article page (`WEBSITE_URL/<locale>/<articles route>/<slug>`), and an unsubscribe link in the footer.
5. A failure for one subscriber is logged and the job moves on to the next.

## Unsubscribing

The footer link is `WEBSITE_URL/<locale>/newsletter/<encrypted email>/unsubscribe`, where the email is encrypted with the fixed key in hexadecimal form. The website page calls the Cloud Functions `unsubscribeNewsletter`, `resubscribeNewsletter` and `addReasonToUnsubscribeToTheNewsletter` (reason among `tooFrequent`, `notInterested`, `notRelevant`, `other`). Unsubscribing sets `active: false` and `unsubscribeAt`; resubscribing reverses both.

## Back-office notification counters

The sidebar shows how many items are new. `getNewUsersCount` counts users with `seen: false` and `deleted: false`; `getObjectsCount({ className })` does the same for any class (the back-office loads it for `Contact` and `_User`, the `NOTIFICATION_COLLECTIONS`, on each dashboard entry). Opening an item marks it as seen (`getUser` with `shouldMarkAsSeen`, `toggleUserSeen`). Replying to a contact is a flag (`replied`) set from the back-office, not an email.

## Test functions

`sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest` and `sendArticleToNewsletterTest` (`test.functions.ts`, `fromBO`) let the Tests page of the back-office send each email to a given address. They need the `tests` UI right, see [RIGHTS_ROLES.md](RIGHTS_ROLES.md).

## Known gaps

- Only a newly created article triggers the newsletter job: an article created inactive is not sent when it is activated later.
- `sendArticleToNewsletterTest` starts the job with `articleId` while the job reads `id`.
- Email bodies mix translated text with HTML built by string concatenation; values such as a user name are inserted without escaping.
