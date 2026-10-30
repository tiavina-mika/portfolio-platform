# Authentication

## Table of Contents

- [Overview](#overview)
- [Sign-up by invitation](#sign-up-by-invitation)
- [Verification codes](#verification-codes)
- [Login, MFA and sessions](#login-mfa-and-sessions)
- [Password reset](#password-reset)
- [Sensitive actions](#sensitive-actions)
- [Authenticated REST routes](#authenticated-rest-routes)
- [Secrets involved](#secrets-involved)
- [Known gaps](#known-gaps)

## Overview

Only the back-office (`apps/bo`) has accounts. The public website (`apps/web`) has no login and talks to Parse Server as an anonymous client. Authentication is the native Parse `_User` mechanism completed by Cloud Code in `apps/server/src/cloud/`:

| File | Role |
|---|---|
| `functions/_core/auth.functions.ts` | `verifyAccount`, `sendVerificationCode`, `sendResetPasswordVerificationCode`, `resetPassword`, `changePassword`, `loginWithEmail`, `loginWithPhone` |
| `functions/_core/invitation.functions.ts` | `sendBOInvitation`, `verifyBOInvitationToken` |
| `functions/_core/mfa.functions.ts` | `generateMfaSecret`, `confirmMfaEnrollment`, `verifyMfaLogin`, `disableMfa`, `regenerateMfaBackupCodes`, `adminResetMfa` |
| `functions/_core/stepUpVerification.functions.ts` | `requestStepUpVerification`, `verifyStepUpCode` |
| `functions/_core/userSession.functions.ts` | device sessions: list, revoke one or all others |
| `triggers/_core/user.triggers.ts`, `auth.triggers.ts` | `_User` save rules, `beforeLogin`, `afterLogout` |

The back-office calls them through the Parse JS SDK; thunks are in `apps/bo/src/redux/actions/_core/auth.action.ts` and `mfa.action.ts`.

## Sign-up by invitation

There is no free sign-up. An administrator sends an invitation (`sendBOInvitation`, with the roles to grant); the invited person opens the link (`verifyBOInvitationToken`) and creates the account. `beforeSave(_User)` checks the invitation token against the e-mail (`assertValidInvitationForSignup`); the roles of the invitation are granted once the address is verified. The first owners are invited at boot from `OWNERS_EMAILS`, see [RIGHTS_ROLES.md](RIGHTS_ROLES.md).

## Verification codes

A code is sent by e-mail (or SMS through MMSDuck) and stored encrypted with an expiry; `verifyAccount` locks after `MAX_VERIFICATION_ATTEMPTS` wrong guesses until a new code is requested. A sign-up code and a reset code each have their own slot. A code only confirms the contact it was sent to.

## Login, MFA and sessions

- `beforeLogin` throws `MFA_REQUIRED` with a challenge token for an account that has MFA; the back-office then calls `verifyMfaLogin` with the authenticator (TOTP) or a backup code to obtain the session. Highest-privilege accounts are expected to enrol; an owner can reset an administrator's MFA (`adminResetMfa`).
- A successful login gives a Parse session token kept by the SDK. `registerSession` records the device; a new device triggers an alert e-mail. A user can revoke other sessions, an administrator can revoke a user's sessions.
- The back-office logs out after inactivity (the role's timeout, or the default).
- Impersonation (`impersonateUser`, `endImpersonationSession`) is limited to roles holding the `impersonation` ui right, and is logged.

## Password reset

1. `sendResetPasswordVerificationCode({ email, locale })` sends a code.
2. `verifyAccount` with the reset type confirms it and returns a dedicated single-use token (only its hash is stored).
3. `resetPassword` consumes the token. A reset proven by SMS on a long-unused account is delayed, and the member is alerted (`cancelPasswordResetDelay` stops it).

`changePassword` checks the old password.

## Sensitive actions

High-risk actions (changing a contact, large money actions) ask for a step-up code (`requestStepUpVerification`, `verifyStepUpCode`).

## Authenticated REST routes

| Route | Protection |
|---|---|
| `POST /files` | `protectionMiddleware`: header `X-portfolio-key` equal to `REST_API_KEY`, and a valid Parse session |
| `GET /download/...` | public, query validated by a Zod schema |
| `GET /ping` | public, used by a cron to keep the host awake |
| `/docs` | documentation route of the server; the documentation app is not ported |

The back-office sends the key from `VITE_REST_API_KEY`; being a `VITE_*` variable it is exposed to the browser and is not a secret.

## Secrets involved

Names only, see [the inventory](../../../inventory/README.md): `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY`, `OWNERS_EMAILS`, `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `UPSTASH_REDIS_*`, `MMSDUCK_API_KEY`. `validateEnv` checks them at startup (see the inventory for the deployed-only rules).

## Known gaps

- Existing databases keep the old role names, so their accounts are not recognised as highest-level until renamed (see the branch review debt).
- `apps/web` still has a `saveUserLanguage` helper that is unused: the website has no login.
