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

The agency (Aldaron) can have an account of its own:

| Variable | App | Purpose |
|---|---|---|
| `AGENCY_CLOUDINARY_NAME` | server | Cloud name of the agency account |
| `AGENCY_CLOUDINARY_API_KEY` | server | API key of the agency account |
| `AGENCY_CLOUDINARY_API_SECRET` | server | API secret of the agency account (never expose it) |

Optional, but all three or none: a partial set stops the boot. Unset, the agency's files go to the portfolio's account.

## Setup

1. Create a Cloudinary account and copy the cloud name and API credentials from the dashboard.
2. Put the three variables in `apps/server/.env.preprod` (local) or on the host.
3. Upload a file from the back-office to check it: it appears in the Media Library under the requested folder.

## Which account holds a file

- An upload goes to the account of the workspace it is made for: the one the back-office is in (sent with the upload, and checked against the roles of the account), the account's own workspace when none is sent.
- A file is found again by the cloud name in its stored address (`https://res.cloudinary.com/<cloud name>/…`): deleting, replacing, moving it to the recycle bin or downloading it goes to the account named there. Files stored before the agency had its own account carry the portfolio's name, so they stay where they are.
- The purge jobs (recycle bin, orphaned editor images) run once per account.
- The `agency-logo` asset of the agency's e-mails is read from the agency account, so it must be uploaded there (root, public id `agency-logo`).

## Gotchas

- Files go through the server (memory storage, at most `MAX_FILES_UPLOAD` files per request) and are not kept on disk.
- Use a separate Cloudinary account or folder per environment so that pre-production tests never delete production images.
- Replacing a file in the back-office deletes the old one from Cloudinary.
