# External Services

## Table of Contents

- [Services](#services)
- [Service guides](#service-guides)
- [Adding a service](#adding-a-service)

## Services

| Service | Used by | What for | Variables |
|---|---|---|---|
| MongoDB (local or Atlas) | server | Database behind Parse Server | `MONGO_URL` |
| Brevo | server | Transactional emails and newsletter contacts | `BREVO_API_KEY`, `ADMIN_EMAIL_SENDER` |
| Cloudinary | server (web displays the files) | Image and file storage | `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Google reCAPTCHA | web (token), server (check) | Bot protection of the contact and newsletter forms | `RECAPTCHA_SECRET_KEY` (server), `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (web) |
| Google Maps | web | Map display | `NEXT_PUBLIC_GOOGLE_MAP_KEY` |
| Upstash Redis | server, web | Rate limits, Parse Server cache and LiveQuery, scheduled job lock | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `UPSTASH_REDIS_URL` |
| MMSDuck | server | SMS: verification codes, notices, notification fallback | `MMSDUCK_API_KEY`, `ANDROID_SMS_RETRIEVER_HASH` |
| Expo push | server | Push notifications to the mobile app | `EXPO_ACCESS_TOKEN` |
| Slack (alerts webhook) | server | Staff alerts and the daily summary | `SLACK_ALERTS_WEBHOOK_URL` |
| Sentry | bo | Browser error reporting | `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| Google Analytics 4 | web | Audience measurement (off when unset) | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Render | server | Hosting the server (keep-awake cron for the free plan) | none in the code |
| GitHub (Actions) | repository | CI, security checks, release pull request | secrets and variables listed in the [inventory](../inventory/code/en/GITHUB_VARIABLES_AND_SECRETS.md) |
| Chromatic | CI | Published Storybooks and visual tests | `CHROMATIC_PROJECT_TOKEN_WEB` (GitHub secret) |
| Slack (changelog webhook) | CI | Changelog and release notes posts | `SLACK_CHANGELOG_WEBHOOK_URL` (GitHub secret) |

Only the back-office reports its errors (Sentry); the server and the website have no error-tracking service. The Expo push and the Slack alerts webhook have no guide of their own: see the variables above and [emails](../inventory/communication/en/EMAILS.md).

The full list of variables, by app, is in the [inventory](../inventory/README.md).

## Service guides

Each guide has an English and a French version (the French file name ends with `.FR`).

| Service | English | French |
|---|---|---|
| MongoDB | [MONGODB.md](mongodb/en/MONGODB.md) | [MONGODB.FR.md](mongodb/fr/MONGODB.FR.md) |
| Brevo | [BREVO.md](brevo/en/BREVO.md) | [BREVO.FR.md](brevo/fr/BREVO.FR.md) |
| Cloudinary | [CLOUDINARY.md](cloudinary/en/CLOUDINARY.md) | [CLOUDINARY.FR.md](cloudinary/fr/CLOUDINARY.FR.md) |
| Google reCAPTCHA | [RECAPTCHA.md](recaptcha/en/RECAPTCHA.md) | [RECAPTCHA.FR.md](recaptcha/fr/RECAPTCHA.FR.md) |
| Upstash Redis | [UPSTASH_REDIS.md](upstash/en/UPSTASH_REDIS.md) | [UPSTASH_REDIS.FR.md](upstash/fr/UPSTASH_REDIS.FR.md) |
| MMSDuck | [MMSDUCK.md](mmsduck/en/MMSDUCK.md) | [MMSDUCK.FR.md](mmsduck/fr/MMSDUCK.FR.md) |
| Sentry | [SENTRY.md](sentry/en/SENTRY.md) | [SENTRY.FR.md](sentry/fr/SENTRY.FR.md) |
| Google Maps | [GOOGLE_MAPS.md](google-maps/en/GOOGLE_MAPS.md) | [GOOGLE_MAPS.FR.md](google-maps/fr/GOOGLE_MAPS.FR.md) |
| Render | [RENDER.md](render/en/RENDER.md) | [RENDER.FR.md](render/fr/RENDER.FR.md) |
| Render, step-by-step deployment tutorial | [RENDER_DEPLOYMENT.md](render/en/RENDER_DEPLOYMENT.md) | [RENDER_DEPLOYMENT.FR.md](render/fr/RENDER_DEPLOYMENT.FR.md) |

GitHub, Chromatic and Slack are documented with the workflows that use them: [CI workflows](../inventory/code/en/CI_WORKFLOWS.md) and [GitHub variables and secrets](../inventory/code/en/GITHUB_VARIABLES_AND_SECRETS.md).

## Adding a service

Add a row here and its variables to the [inventory](../inventory/README.md) in the same change. When the service needs a setup or has gotchas, add `docs/services/<service>/en/NAME.md` and its French twin `fr/NAME.FR.md`, and link them in the guides table.
