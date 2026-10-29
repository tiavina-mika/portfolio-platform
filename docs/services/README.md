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
| Google reCAPTCHA | web | Bot protection of the contact and newsletter forms | `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` |
| Google Maps | web | Map display | `NEXT_PUBLIC_GOOGLE_MAP_KEY` |
| Render | server | Hosting the server (keep-awake cron for the free plan) | none in the code |
| GitHub (Actions) | repository | CI, security checks, release pull request | secrets and variables listed in the [inventory](../inventory/code/en/GITHUB_VARIABLES_AND_SECRETS.md) |
| Chromatic | CI | Published Storybooks and visual tests | `CHROMATIC_PROJECT_TOKEN_WEB` (GitHub secret) |
| Slack | CI | Changelog and release notes posts | `SLACK_CHANGELOG_WEBHOOK_URL` (GitHub secret) |

No error-tracking service (such as Sentry) is wired into the apps.

The full list of variables, by app, is in the [inventory](../inventory/README.md).

## Service guides

Each guide has an English and a French version (the French file name ends with `.FR`).

| Service | English | French |
|---|---|---|
| MongoDB | [MONGODB.md](mongodb/en/MONGODB.md) | [MONGODB.FR.md](mongodb/fr/MONGODB.FR.md) |
| Brevo | [BREVO.md](brevo/en/BREVO.md) | [BREVO.FR.md](brevo/fr/BREVO.FR.md) |
| Cloudinary | [CLOUDINARY.md](cloudinary/en/CLOUDINARY.md) | [CLOUDINARY.FR.md](cloudinary/fr/CLOUDINARY.FR.md) |
| Google reCAPTCHA | [RECAPTCHA.md](recaptcha/en/RECAPTCHA.md) | [RECAPTCHA.FR.md](recaptcha/fr/RECAPTCHA.FR.md) |
| Google Maps | [GOOGLE_MAPS.md](google-maps/en/GOOGLE_MAPS.md) | [GOOGLE_MAPS.FR.md](google-maps/fr/GOOGLE_MAPS.FR.md) |
| Render | [RENDER.md](render/en/RENDER.md) | [RENDER.FR.md](render/fr/RENDER.FR.md) |

GitHub, Chromatic and Slack are documented with the workflows that use them: [CI workflows](../inventory/code/en/CI_WORKFLOWS.md) and [GitHub variables and secrets](../inventory/code/en/GITHUB_VARIABLES_AND_SECRETS.md).

## Adding a service

Add a row here and its variables to the [inventory](../inventory/README.md) in the same change. When the service needs a setup or has gotchas, add `docs/services/<service>/en/NAME.md` and its French twin `fr/NAME.FR.md`, and link them in the guides table.
