# Email and Notifications

## Table of Contents

- [Overview](#overview)
- [Provider and configuration](#provider-and-configuration)
- [Emails sent](#emails-sent)
- [Newsletter](#newsletter)
- [In-app notifications](#in-app-notifications)
- [Test functions](#test-functions)
- [Known gaps](#known-gaps)

## Overview

Emails are transactional emails sent by the server through [Brevo](https://www.brevo.com). Verification texts can also go by SMS through MMSDuck, and push notifications through Expo. The apps `web` and `bo` never send anything: they call a Cloud Function or save an object, and the server does the rest. The full list of emails is in [the inventory](../../../inventory/communication/en/EMAILS.md).

| File | Role |
|---|---|
| `apps/server/src/services/email.service.ts` | Brevo client: `sendEmail`, `createContactEmail`, `getContacts` |
| `apps/server/src/cloud/utils/_core/email.utils.cloud.ts` and `cloud/emails/_core/` | one builder per email |
| `apps/server/src/emails/templates/` and `config/emails/index.ts` | HTML templates and the shared layout (`generateEmailTemplate`) |
| `apps/server/src/config/i18n/locales/{fr,en,mg}/_core/common.json` | translated email texts |

## Provider and configuration

- `BREVO_API_KEY`, `WEBSITE_URL` and `ADMIN_EMAIL_SENDER` are required at startup (`validateEnv`). Links in emails point to `WEBSITE_URL`.
- SMS need `MMSDUCK_API_KEY` in `preProduction` and `production`; in development they are only logged.
- Texts are translated with the server i18n, see [I18N.md](I18N.md); the locale comes from the function parameter or the save context, default `fr`.
- A staff alert (reports, failed payments, failed jobs) goes to the staff by e-mail and to Slack when `SLACK_ALERTS_WEBHOOK_URL` is set.

## Emails sent

Account (verification and reset codes, invitation, step-up code, contact change, welcome, new device), support tickets (acknowledgement to the visitor who used the contact form, replies), newsletter (confirmation, unsubscribe confirmation, new article), notifications and broadcasts, staff alerts. Builders, triggers and recipients are in the inventory page above.

## Newsletter

1. A visitor subscribes on the website: `subscribeToNewsletter` stores a pending `Newsletter` (`confirmed: false`, `active: false`) and e-mails a confirmation link (`/newsletter/confirm/<token>`; only a hash of the token is stored).
2. `confirmNewsletterSubscription` activates it; the contact is then created in Brevo (`createContactToCloudJob`).
3. Saving a new `Article` starts `sendArticleToNewsletterJob` with the article id. The job sends only if the article is `active: true` and `deleted: false`, to the active subscribers, 20 at a time, in each subscriber's `language`, with an unsubscribe link (`/newsletter/<encrypted email>/unsubscribe`).
4. `unsubscribeNewsletter` sets `active: false` and sends a confirmation e-mail; `addReasonToUnsubscribeToTheNewsletter` stores the reason. A failure for one subscriber is logged and the job goes on.

## In-app notifications

The back-office has a notification system (`Notification` class, notification pages, preferences, resend, broadcasts with daily SMS counts, `notification.jobs.ts`). Channels (in-app, e-mail, SMS, push) are registered in `notification.service.cloud.ts`. Counters of new items in the sidebar come from `getObjectsCount`.

## Test functions

`sendVerificationCodeTest`, `sendResetPasswordVerificationCodeTest`, `sendArticleToNewsletterTest`, `sendInvitationTest`, `sendWelcomeEmailTest`, `sendVerificationCodeSmsTest` (`test.functions.ts`) let the Tests page send each message to an address. They need the `tests` UI right, see [RIGHTS_ROLES.md](RIGHTS_ROLES.md).

## Known gaps

- Only a newly created article starts the newsletter job: an article created inactive is not sent when activated later.
- `resubscribeNewsletter` sets `active: true` directly from a valid unsubscribe link, even for an address that never confirmed.
- `sendArticleToNewsletterTest` starts the job with `articleId` while the job reads `id`.
- Several test functions still mention carpooling (`createRideMock`).
