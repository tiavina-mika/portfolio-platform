# External Services

## Table of Contents

- [Services](#services)
- [Adding a service](#adding-a-service)

## Services

| Service | Used by | What for | Variables |
|---|---|---|---|
| MongoDB (local or Atlas) | server | Database behind Parse Server | `MONGO_URL` |
| Brevo | server | Transactional emails and newsletter | `BREVO_API_KEY`, `ADMIN_EMAIL_SENDER` |
| Cloudinary | server | Image and file storage | `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Google reCAPTCHA | web | Bot protection of the contact form | `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` |
| Google Maps | web | Map display | `NEXT_PUBLIC_GOOGLE_MAP_KEY` |

The full list of variables, by app, is in the [inventory](../inventory/README.md).

## Adding a service

Add a row here and its variables to the [inventory](../inventory/README.md) in the same change.
