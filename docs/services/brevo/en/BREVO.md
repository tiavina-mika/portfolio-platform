# Brevo

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

Brevo (formerly Sendinblue) sends the transactional emails of the platform and holds the contact list of newsletter subscribers and contact-form senders. The emails themselves are listed in [emails](../../../inventory/communication/en/EMAILS.md).

## Where the code is

- `apps/server/src/services/email.service.ts`: Brevo client (`@getbrevo/brevo`, singleton), `sendEmail`, `createContactEmail`, `getContacts`.
- `apps/server/src/cloud/utils/email.utils.cloud.ts`: message builders.
- `apps/server/src/cloud/jobs/email.jobs.ts` and `newsletter.jobs.ts`: asynchronous contact creation and newsletter sending.

Only `apps/server` talks to Brevo; `web` and `bo` go through Cloud Functions.

## Variables

| Variable | App | Purpose |
|---|---|---|
| `BREVO_API_KEY` | server | API key (required at boot by `validateEnv`) |
| `ADMIN_EMAIL_SENDER` | server | Default sender address |
| `VITE_ADMIN_EMAIL_SENDER` | bo | Sender address shown to admins (exposed in the browser bundle, not a secret) |

## Setup

1. Create a Brevo account and generate an API key (SMTP and API settings).
2. Validate the sender: the address in `ADMIN_EMAIL_SENDER` must be a verified sender (or domain) in Brevo, otherwise sends are rejected.
3. Put the variables in `apps/server/.env.preprod` (local) or on the host.
4. Start the server and subscribe to the newsletter once: the `FIRSTNAME` and `LASTNAME` contact attributes are created on first use.

## Gotchas

- Failures of contact creation are only logged (the user flow continues); failures of `sendEmail` are thrown.
- The free plan has a daily sending limit: a newsletter to many subscribers can be cut short.
- The code comments mention Brevo list ids 2 and 5; the list used is the one configured in the Brevo account, check it there.
