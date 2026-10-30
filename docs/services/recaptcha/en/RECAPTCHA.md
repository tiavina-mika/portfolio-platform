# Google reCAPTCHA

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

reCAPTCHA v3 (score based, invisible) protects the public forms of the website against bots: the contact form and the newsletter form.

## Where the code is

- `apps/web/hooks/useServerAction.ts`: when a form gives a `recaptchaActionName`, it gets a token with `react-google-recaptcha-hook` before running the server action. The forms use the names `contactForm` (`containers/contact/ContactForm.tsx`) and `newsletterForm` (`containers/newsletter/NewsLetterForm.tsx`).
- `apps/web/server/mutations/app.mutation.ts` and `newsletter.mutation.ts`: forward the token to the server inside the Cloud Function call (`createPublicContact`, `subscribeToNewsletter`). The website no longer verifies it itself and the `/api/recaptcha-verification` route is gone.
- `apps/server/src/utils/_core/recaptcha.utils.ts` (`verifyRecaptchaToken`): sends the token to Google's `siteverify` API with the secret key and accepts it when `success` is true and the score is above 0.5. Verifying inside the Cloud Function protects the data, not only the form. Skipped in development and test; a missing key fails closed elsewhere.

## Variables

| Variable | App | Purpose |
|---|---|---|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | web | Site key, public by design (exposed to the browser) |
| `RECAPTCHA_SECRET_KEY` | server | Secret key, read by the server only (it is no longer a web variable) |

## Setup

1. Register the site in the reCAPTCHA admin console with type v3 and add the domains (`localhost` for local work, the pre-production and production domains).
2. Put the site key in `apps/web/.env.local` (or on the web host) and the secret key in `apps/server/.env.preprod` (or on the server host).
3. Submit the contact form on a deployed environment: the server should accept it (outside production the check is skipped).

## Gotchas

- The keys are tied to the registered domains: a missing domain makes the token request fail.
- The server rejects scores of 0.5 or less, so strict browsers, VPNs or privacy tools can be blocked.
- A form without `recaptchaActionName` is not protected at all.
