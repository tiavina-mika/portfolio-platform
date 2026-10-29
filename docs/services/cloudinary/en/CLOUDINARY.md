# Cloudinary

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

Cloudinary stores the images and files uploaded from the back-office (project and article images, site images, the CV). The public website displays them from `res.cloudinary.com`.

## Where the code is

- `apps/server/src/config/config.ts`: `initializeCloudinary()` (called at server start) and the `multer` memory storage.
- `apps/server/src/services/files.service.ts`: upload and deletion through the Cloudinary SDK.
- `apps/server/src/controllers/files.controller.ts` and `routes/files.route.ts`: the `/files` upload route.
- `apps/server/src/utils/file.utils.ts`: folder names (`users/<userId>/<folder>` when a user id is given).
- `apps/server/src/utils/cms.utils.ts` (`destroyOldFilesAfterUpdate`): removes the replaced file after an update.
- `apps/web/next.config.*`: allows `res.cloudinary.com` for `next/image`.

## Variables

| Variable | App | Purpose |
|---|---|---|
| `CLOUDINARY_NAME` | server | Cloud name |
| `CLOUDINARY_API_KEY` | server | API key |
| `CLOUDINARY_API_SECRET` | server | API secret (never expose it) |

All three are required at boot by `validateEnv`.

## Setup

1. Create a Cloudinary account and copy the cloud name and API credentials from the dashboard.
2. Put the three variables in `apps/server/.env.preprod` (local) or on the host.
3. Upload a file from the back-office to check it: it appears in the Media Library under the requested folder.

## Gotchas

- Files go through the server (memory storage, at most `MAX_FILES_UPLOAD` files per request) and are not kept on disk.
- Use a separate Cloudinary account or folder per environment so that pre-production tests never delete production images.
- Replacing a file in the back-office deletes the old one from Cloudinary.
