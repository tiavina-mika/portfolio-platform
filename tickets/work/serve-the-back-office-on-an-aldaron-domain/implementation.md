## Goal

Let the back-office be opened on an Aldaron-only domain (same Express server) and make the invitation
e-mail point to, and be signed for, the workspace the invited person lands in.

## Read

The ticket; `invitation.functions.ts`, `invitation.service.cloud.ts`, `email.utils.cloud.ts`,
`emails/index.ts`, `utils/_core/utils.ts`, `validateEnv.ts`, `config.ts` (CORS), `userRole.service.cloud.ts`,
`role.utils.cloud.ts`, `rights.utils.ts`; bo `parse.config.ts`, `http.ts`, `utils.ts`, `settings.reducer.ts`,
`useWorkspace.ts`, `workspace.constants.ts`.

## Apps touched

- `server`: yes (env, URL helpers, invitation, e-mail frame).
- `bo`: yes (host → default workspace, server URL follows the address it was opened on).
- `web`: no. `libs`: no (`TargetEnum` already has `AGENCY`).

## Approach

- Three optional env variables, no proper name in an identifier (`AGENCY_*`): `AGENCY_SERVER_URL`,
  `AGENCY_WEBSITE_URL`, `AGENCY_APP_NAME`. Each falls back to the portfolio value while unset.
- `getServerUrl`, `getClientUrl` and a new `getAppName` take an optional workspace (default portfolio), so
  Parse `serverURL`, CORS and every other caller are untouched.
- The workspace of an invitation is computed on the server from the roles it grants
  (`getLandingWorkspace`): agency only when no role opens the portfolio; the highest roles land in the
  portfolio. Never read from the request, so a forged URL cannot reach an e-mail.
- `generateEmailTemplate` takes the workspace and uses its website and name.
- Bo: `getServerUrl` returns the address the page was opened on (Parse already did), so the upload calls
  of a second domain are not sent to the first. `VITE_AGENCY_HOSTNAME` (public) gives the default
  workspace when nothing is stored; a stored choice and the roles still win.
- 🔎 Deduction: CORS is not changed. The back-office on the Aldaron domain is same-origin to this server.

## Files

See the diff: `utils.ts`, `validateEnv.ts`, `.env.example` (server and bo), `userRole.service.cloud.ts`,
`invitation.functions.ts`, `email.utils.cloud.ts`, `emails/index.ts`, `utils.test.ts`, bo `utils.ts`,
`workspace.utils.ts`, `settings.reducer.ts`.

## Docs and inventory

`docs/inventory/README.md` (server and bo variables), `EMAIL_NOTIFICATIONS.md` and its French twin.

## Risks

- ⚠️ The Aldaron domain and display name are not known: configuration only.
- The e-mail logo is still the portfolio's (one Cloudinary `logo`).
