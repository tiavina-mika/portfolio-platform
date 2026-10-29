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
- `apps/web/app/api/recaptcha-verification/route.ts`: sends the token to Google's `siteverify` API with the secret key and accepts the call when `success` is true and the score is above 0.5.

## Variables

| Variable | App | Purpose |
|---|---|---|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | web | Site key, public by design (exposed to the browser) |
| `RECAPTCHA_SECRET_KEY` | web | Secret key, server only |

## Setup

1. Register the site in the reCAPTCHA admin console with type v3 and add the domains (`localhost` for local work, the pre-production and production domains).
2. Put the site key and the secret key in `apps/web/.env.local` or on the host.
3. Submit the contact form: the verification call should answer a score.

## Gotchas

- The keys are tied to the registered domains: a missing domain makes the token request fail.
- The verification route rejects scores of 0.5 or less, so strict browsers, VPNs or privacy tools can be blocked.
- A form without `recaptchaActionName` is not protected at all.
