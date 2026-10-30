# Deploying on Render, step by step

## Table of Contents

- [What you will deploy](#what-you-will-deploy)
- [Before you start](#before-you-start)
- [Step 1: the database (MongoDB Atlas)](#step-1-the-database-mongodb-atlas)
- [Step 2: generate the secrets](#step-2-generate-the-secrets)
- [Step 3: deploy the server and the back-office](#step-3-deploy-the-server-and-the-back-office)
- [Step 4: deploy the website](#step-4-deploy-the-website)
- [Step 5: close the loop](#step-5-close-the-loop)
- [Step 6: check that everything works](#step-6-check-that-everything-works)
- [Pre-production and production](#pre-production-and-production)
- [Updating and redeploying](#updating-and-redeploying)
- [Troubleshooting](#troubleshooting)

## What you will deploy

Two Render **Web Services**, created from the same GitHub repository, plus a MongoDB database:

| Render service | Contains | Public URL used for |
|---|---|---|
| `tiavina-mika-bo.preprod` | `apps/server` (Parse API, uploads) **and** `apps/bo` (the back-office is built, copied into the server and served by Express) | the API (`/parse`) and the back-office (`/`) |
| `tiavina-mika-preprod` | `apps/web` (Next.js website) | the public website |

The back-office has **no service of its own**: it is part of the server service. Deploy order matters: the server first, because the website build reads its data from the live API.

This is done twice, once for **pre-production** (`develop`) and once for **production** (`main`). The steps below use the real pre-production services, both on the same Render account; [Pre-production and production](#pre-production-and-production) lists what changes for production.

```text
GitHub repo ──► tiavina-mika-bo.preprod (API + back-office) ──► MongoDB Atlas
            └─► tiavina-mika-preprod (website) ──► calls tiavina-mika-bo.preprod
```

## Before you start

- A [Render](https://render.com) account, with your GitHub account connected (Account Settings → GitHub).
- The repository pushed on GitHub, on the branch you want to deploy (`main` for production).
- The accounts of the external services, with their keys at hand (see [services](../../README.md)): MongoDB Atlas, Cloudinary, Brevo, Google reCAPTCHA (site key and secret), Google Maps.
- The two service names: `tiavina-mika-bo.preprod` (server + back-office) and `tiavina-mika-preprod` (website). Render derives each public URL `https://<slug>.onrender.com` from the name; always read the real URL under the service name in the dashboard. Below, **server URL** and **website URL** mean those two real URLs.

## Step 1: the database (MongoDB Atlas)

1. Create a cluster and a **database user** (Database Access).
2. Network Access → **Add IP Address** → `0.0.0.0/0` (allow from anywhere). Render's free services have no fixed outbound IP, so a narrower rule would make the server fail at boot with a connection error.
3. Connect → Drivers → copy the connection string and put the database name in it:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
4. Keep it for Step 3 (`MONGO_URL`). Use one database per environment.

## Step 2: generate the secrets

The server needs random secrets. Generate each one in a terminal with Node:

```bash
# PARSE_MASTER_KEY, REST_API_KEY, CRYPTO_FIXED_FULL_KEY need 32 characters
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# CRYPTO_IV needs exactly 16 characters
node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"

# CRYPTO_FIXED_PART_KEY needs 22 characters
# (it is completed by a 10-character Parse object id to make a 32-character AES-256 key)
node -e "console.log(require('crypto').randomBytes(11).toString('hex'))"
```

Rules:

- Use a **different** value for each variable, and different values from your local ones.
- Save them in a password manager. Changing `CRYPTO_*` later makes already-encrypted data unreadable.
- `REST_API_KEY` is also sent by the back-office (`VITE_REST_API_KEY`) and is therefore visible in the browser: treat it as an identifier, not as a secret.

## Step 3: deploy the server and the back-office

### 3.1 Create the service

Render dashboard → **New +** → **Web Service** → pick the repository → **Connect**.

| Field | Value |
|---|---|
| Name | `tiavina-mika-bo.preprod` |
| Language | `Node` |
| Branch | `develop` |
| Root Directory | *leave empty* (the build needs the whole workspace: `libs/` and `apps/bo`) |
| Region | the one closest to your users and to your Atlas cluster |
| Instance Type | `Free` to test (it sleeps), `Starter` or more for a real site |

### 3.2 Build and start commands

**Build Command:**

```bash
mkdir -p "$HOME/.local/bin" && corepack enable --install-directory "$HOME/.local/bin" && export PATH="$HOME/.local/bin:$PATH" && pnpm install --frozen-lockfile --prod=false && pnpm --filter portfolio-bo exec vite build && pnpm --filter portfolio-server build && NODE_ENV=preProduction pnpm --filter portfolio-server copy
```

What it does:

1. `corepack enable --install-directory "$HOME/.local/bin"` makes the pnpm version pinned in the root `package.json` available. A plain `corepack enable` fails on Render (`EROFS: read-only file system, unlink '/usr/bin/pnpm'`) because it tries to replace `/usr/bin/pnpm`; the links go into a writable folder that is then added to the `PATH`.
2. `pnpm install --frozen-lockfile --prod=false` installs the whole workspace, including dev dependencies (the build tools). `--prod=false` matters: when `NODE_ENV=production` is set, pnpm would otherwise skip them.
3. `vite build` builds the back-office with the `VITE_*` variables of the service (Step 3.3). `pnpm build:prod` is not used here because it reads a `.env.prod` file, which does not exist on Render.
4. `pnpm --filter portfolio-server build` type-checks and compiles the server into `dist`.
5. `copy` puts the back-office build into `apps/server/clientBuild/bo/preprod`, the folder the server serves when `NODE_ENV` is not `production`.

**Start Command:**

```bash
pnpm --filter portfolio-server start:preprod
```

This runs `NODE_ENV=preProduction node --import tsx dist/index.js`.

**Production version** (service on the `main` branch):

```bash
# Build Command
mkdir -p "$HOME/.local/bin" && corepack enable --install-directory "$HOME/.local/bin" && export PATH="$HOME/.local/bin:$PATH" && pnpm install --frozen-lockfile --prod=false && pnpm --filter portfolio-bo exec vite build && pnpm --filter portfolio-server build && NODE_ENV=production pnpm --filter portfolio-server copy

# Start Command
pnpm --filter portfolio-server start
```

`copy` then writes into `clientBuild/bo/prod`, and `start` runs `NODE_ENV=production node --import tsx dist/index.js`.

### 3.3 Environment variables

In **Advanced → Environment Variables** (or **Environment** once created), add:

| Variable | Value |
|---|---|
| `NODE_VERSION` | `24` (the version of `.nvmrc`) |
| `MONGO_URL` | the Atlas connection string (Step 1) |
| `PARSE_APP_ID` | an identifier of your choice, e.g. `portfolio` |
| `PARSE_MASTER_KEY` | generated (Step 2) |
| `REST_API_KEY` | generated (Step 2) |
| `SERVER_URL` | the server URL, as shown in the dashboard (`https://…`, no trailing slash) |
| `WEBSITE_URL` | the website URL |
| `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `CRYPTO_IV` | generated (Step 2) |
| `BREVO_API_KEY` | from Brevo |
| `ADMIN_EMAIL_SENDER` | the verified sender address in Brevo |
| `OWNERS_EMAILS` | comma-separated emails that receive the back-office Owner invitation at boot |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | from Cloudinary |

Do **not** set `PORT`: Render injects it (and the server requires it).

Back-office variables, read **at build time** by `vite build` and inlined in the browser code (no secret here):

| Variable | Value |
|---|---|
| `VITE_ENVIRONMENT` | `PREPROD` |
| `VITE_SERVER_URL` | the same value as `SERVER_URL` |
| `VITE_PARSE_APP_ID` | the same value as `PARSE_APP_ID` |
| `VITE_REST_API_KEY` | the same value as `REST_API_KEY` |
| `VITE_WEBSITE_URL` | the same value as `WEBSITE_URL` |
| `VITE_ADMIN_EMAIL_SENDER` | the same value as `ADMIN_EMAIL_SENDER` |

> Never put a real secret in a `VITE_*` variable: the value would be readable in the downloaded JavaScript. On Render the secret scan of `pnpm copy` finds no `bo/.env.*` file to compare with and skips itself, so nothing protects you there.

### 3.4 Health check and deploy

- Advanced → **Health Check Path**: `/ping`.
- Click **Create Web Service**. Follow the **Logs**: the build takes a few minutes.
- Success looks like a log block `[PREPROD]` followed by the server URL, and the service status **Live**.

### 3.5 Check the real URL

Render shows the service URL under its name. If it differs from the one you typed in `SERVER_URL`, `VITE_SERVER_URL` and `WEBSITE_URL` (a name already taken gets a suffix), fix the variables and use **Manual Deploy → Clear build cache & deploy**: the `VITE_*` values are baked into the bundle, a restart is not enough.

Quick test: `<server URL>/ping` answers `pong`, and `/` shows the back-office login page.

## Step 4: deploy the website

The website build calls the live API to prerender pages: **the server must be Live first**, and it must contain some content for the pages to prerender.

### 4.1 Create the service

**New +** → **Web Service** → same repository.

| Field | Value |
|---|---|
| Name | `tiavina-mika-preprod` |
| Language | `Node` |
| Branch | `develop` |
| Root Directory | *leave empty* |
| Instance Type | `Free` to test, `Starter` or more for a real site |

### 4.2 Build and start commands

**Build Command:**

```bash
mkdir -p "$HOME/.local/bin" && corepack enable --install-directory "$HOME/.local/bin" && export PATH="$HOME/.local/bin:$PATH" && pnpm install --frozen-lockfile --prod=false && pnpm --filter portfolio-web build:preprod
```

**Start Command:**

```bash
pnpm --filter portfolio-web start:preprod
```

This runs `APP_ENV=preProduction node server.js` (a custom Express server around Next.js, which listens on the `PORT` Render provides).

**Production version** (service on the `main` branch):

```bash
# Build Command
mkdir -p "$HOME/.local/bin" && corepack enable --install-directory "$HOME/.local/bin" && export PATH="$HOME/.local/bin:$PATH" && pnpm install --frozen-lockfile --prod=false && pnpm --filter portfolio-web build:prod

# Start Command
pnpm --filter portfolio-web start
```

`start` runs `APP_ENV=production node server.js`.

### 4.3 Environment variables

All of them are validated by `apps/web/env.ts`; a missing or invalid one stops the build.

| Variable | Value |
|---|---|
| `NODE_VERSION` | `24` |
| `PARSE_APP_ID` | the same as the server |
| `SERVER_URL` | the server URL |
| `APP_URL` | the website URL |
| `SENDER_EMAIL` | the address the contact form emails come from |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA **secret** key |
| `NEXT_PUBLIC_SERVER_URL` | the same as `SERVER_URL` |
| `NEXT_PUBLIC_APP_URL` | the same as `APP_URL` |
| `NEXT_PUBLIC_GOOGLE_MAP_KEY` | Google Maps key (restrict it to your domain in Google Cloud) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA **site** key |

`NEXT_PUBLIC_*` values are inlined at build time and visible in the browser. `APP_ENV` is set by the `build:preprod` and `start:preprod` scripts: do not set it.

### 4.4 Health check and deploy

- Advanced → **Health Check Path**: `/api/ping`.
- **Create Web Service** and follow the logs. Success: `NextJs server` in the logs and the status **Live**.

## Step 5: close the loop

1. **reCAPTCHA**: in the Google reCAPTCHA admin, add the website domain (and your custom domain) to the key's domains.
2. **Google Maps**: add the same domain to the key's HTTP referrer restrictions.
3. **Brevo**: check that the `ADMIN_EMAIL_SENDER` and `SENDER_EMAIL` addresses are verified senders.
4. **Back-office first login**: the server creates an Owner invitation for every address in `OWNERS_EMAILS` at boot. Open the invitation email, set the password, then sign in at the server URL.
5. **Content**: create your first projects and articles in the back-office, then redeploy the website (Manual Deploy) if its build ran against an empty database.
6. **Custom domain** (optional): Settings → Custom Domains on each service, add the DNS record Render shows, wait for the certificate. Then update `SERVER_URL`, `VITE_SERVER_URL`, `WEBSITE_URL`, `VITE_WEBSITE_URL`, `APP_URL`, `NEXT_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_APP_URL`, and redeploy both services with the build cache cleared.

## Step 6: check that everything works

| Check | Expected |
|---|---|
| `<server>/ping` | `pong` |
| `<server>/` | back-office login page, no console error |
| Sign in to the back-office | the dashboard opens, lists load |
| Upload an image in the back-office | the image appears (Cloudinary) |
| `<web>/api/ping` | `{"message":"pong"}` |
| `<web>/` | home page with the content created in the back-office |
| Contact form and newsletter | a message is stored and the email is sent (Brevo, reCAPTCHA) |

## Pre-production and production

The project runs two environments, each with **its own pair of Render services and its own database**. Steps 1 to 6 above describe pre-production (services `tiavina-mika-bo.preprod` and `tiavina-mika-preprod`); to set up production, repeat them with the production column below. Releases flow `develop` → pre-production, then `develop` is merged into `main` → production.

| | Pre-production | Production |
|---|---|---|
| Branch | `develop` | `main` |
| Service names | `tiavina-mika-bo.preprod` (server + back-office build), `tiavina-mika-preprod` (web) | `portfolio-server`, `portfolio-web` (replace with your production names) |
| Atlas database / Cloudinary | its own database, its own folder or account | its own database, its own folder or account |
| Server build: copy step | `NODE_ENV=preProduction pnpm --filter portfolio-server copy` | `NODE_ENV=production pnpm --filter portfolio-server copy` |
| Server start command | `pnpm --filter portfolio-server start:preprod` | `pnpm --filter portfolio-server start` |
| Server `NODE_ENV` at runtime | `preProduction` (set by the start script) | `production` (set by the start script) |
| Back-office folder served | `clientBuild/bo/preprod` | `clientBuild/bo/prod` |
| `VITE_ENVIRONMENT` | `PREPROD` | `PROD` |
| Web build command | `… pnpm --filter portfolio-web build:preprod` | `… pnpm --filter portfolio-web build:prod` |
| Web start command | `pnpm --filter portfolio-web start:preprod` | `pnpm --filter portfolio-web start` |
| Web `APP_ENV` | `preProduction` (set by the scripts) | `production` (set by the scripts) |
| URLs in the variables | the pre-production services | the production services |

Both pre-production services live on the same Render account. `tiavina-mika-bo.preprod` is the server service: it builds the back-office and serves it, so the back-office has no service of its own. `tiavina-mika-preprod` is the website. The public URL is derived from the name by Render and may differ from it, so always copy the real URL shown under each service in the dashboard (`https://<slug>.onrender.com`) into `SERVER_URL`, `VITE_SERVER_URL`, `WEBSITE_URL`, `VITE_WEBSITE_URL`, `APP_URL`, `NEXT_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_APP_URL`.

Everything else (the rest of each build command, the health check paths, the variable names) is identical. Keep each secret different between the two environments, and never point a pre-production service at the production database or at the production server URL.

## Updating and redeploying

- **Auto-Deploy** (Settings → Build & Deploy) is on by default: each push to the branch redeploys. To avoid redeploying the website when only the back-office changed, set **Build Filters → Included Paths** (for example `apps/web/**`, `libs/**`, `pnpm-lock.yaml` for the web; `apps/server/**`, `apps/bo/**`, `libs/**`, `pnpm-lock.yaml` for the server).
- A change of a `VITE_*` or `NEXT_PUBLIC_*` variable needs a new **build** (Manual Deploy → Clear build cache & deploy), not a restart.
- After a content change that the website prerenders, redeploy the website.
- A change of build or start command is made in the dashboard and is not reviewed in a pull request: record it in [RENDER.md](RENDER.md) when it changes.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Build fails with `tsc: not found`, `swc: not found` or `vite: not found` | dev dependencies were skipped: keep `--prod=false` in the install command |
| Build fails with `Invalid environment variables` (web) | a variable of Step 4.3 is missing or not a valid URL; fix it and redeploy |
| Web build fails with a network error on the API | the server is not Live yet, or `SERVER_URL` is wrong (check there is no trailing slash and the scheme is `https`) |
| Server exits at boot with `Missing environment variables` | the log lists them: add them in Environment (do not add `PORT`) |
| Server exits with a Mongo connection error | Atlas Network Access does not allow `0.0.0.0/0`, or the user or password in `MONGO_URL` is wrong (special characters must be URL-encoded) |
| Server is Live but `/` answers an error or a blank page | the back-office was not copied: check the `copy` step in the build log and that `NODE_ENV=production` is in the build command |
| Back-office calls the wrong server | `VITE_SERVER_URL` was wrong at build time: fix it and clear the build cache |
| First request after a while takes 30–60 seconds | free instances sleep after about 15 minutes; the keep-awake cron only runs while the service is awake. Use a paid instance for a real site |
| Out of memory during the web build | the free instance (512 MB) may be too small for `next build` or `vite build`: switch to `Starter` or more |
