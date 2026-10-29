# Inventory

## Table of Contents

- [Environment variables](#environment-variables)
- [Cloud Code](#cloud-code)
- [Keeping it up to date](#keeping-it-up-to-date)

## Environment variables

Real values are never committed: each app ships a `.env.example`.

### `apps/server`

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port |
| `IS_PREPROD` | Marks the pre-production environment |
| `MONGO_URL` | MongoDB connection string |
| `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY` | Parse Server credentials |
| `SERVER_URL`, `WEBSITE_URL` | Public URLs of the API and of the website |
| `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `CRYPTO_IV` | Encryption keys |
| `BREVO_API_KEY`, `ADMIN_EMAIL_SENDER`, `OWNERS_EMAILS` | Emails (sender and owners to notify) |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | File storage |

### `apps/bo`

All variables are inlined in the browser bundle: none may be a secret.

| Variable | Purpose |
|---|---|
| `VITE_ENVIRONMENT` | Environment name |
| `VITE_SERVER_URL` | Parse Server URL |
| `VITE_PARSE_APP_ID`, `VITE_REST_API_KEY` | Parse client credentials |
| `VITE_WEBSITE_URL` | Public website URL |
| `VITE_ADMIN_EMAIL_SENDER` | Sender address shown to admins |

### `apps/web`

| Variable | Purpose |
|---|---|
| `APP_ENV` | `development`, `preProduction` or `production` (set by the scripts) |
| `PARSE_APP_ID`, `SERVER_URL` | Parse access from the Next.js server |
| `APP_URL` | Public URL of the website |
| `SENDER_EMAIL` | Sender of the contact emails |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA server key |
| `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_APP_URL` | URLs exposed to the browser |
| `NEXT_PUBLIC_GOOGLE_MAP_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Public keys exposed to the browser |

## Cloud Code

Source: `apps/server/src/cloud/`.

| Kind | Files |
|---|---|
| Functions | `app`, `article`, `auth`, `category`, `contact`, `misc`, `page`, `pageSection`, `project`, `role`, `user`, `utils` (and `test`) |
| Triggers | `app`, `article`, `auth`, `category`, `contact`, `newsletter`, `page`, `project`, `role`, `user` |
| Jobs | `category`, `email`, `misc`, `newsletter` (and `test`) |

## Keeping it up to date

A new environment variable, external service, Cloud Function, trigger or job updates this page (and [services](../services/README.md) when it is a service) in the same change.
