# Authentication

## Table of Contents

- [Overview](#overview)
- [Sessions](#sessions)
- [Sign-up](#sign-up)
- [Email confirmation](#email-confirmation)
- [Login and logout](#login-and-logout)
- [Password reset](#password-reset)
- [Changing the password](#changing-the-password)
- [Bans and deletion](#bans-and-deletion)
- [Authenticated REST routes](#authenticated-rest-routes)
- [Secrets involved](#secrets-involved)
- [Known gaps](#known-gaps)

## Overview

Only the back-office (`apps/bo`) has user accounts. The public website (`apps/web`) has no login: it talks to Parse Server as an anonymous client and never reads a user session (the `saveUserLanguage` helper of the web is documented in its code as unused until an authentication exists).

Authentication is the native Parse `_User` mechanism (email used as the username), completed by Cloud Code in `apps/server/src/cloud/`:

| File | Role |
|---|---|
| `functions/auth.functions.ts` | `verifyAccountEmail`, `sendVerificationCode`, `sendResetPasswordVerificationCode`, `resetPassword` |
| `triggers/user.triggers.ts` | `beforeSave` / `afterSave` / `afterDelete` of `_User` |
| `triggers/auth.triggers.ts` | `beforeLogin`, `afterLogout` |
| `utils/user.utils.cloud.ts` | verification code generation and check, platforms, bans |
| `utils/utils.cloud.ts` | `signupTriggerValidation` and the other validation wrappers |

The back-office reaches it through the Parse JS SDK (`Parse.User.signUp`, `logIn`, `logOut`, `Parse.Cloud.run`); the Redux thunks are in `apps/bo/src/redux/actions/auth.action.ts`.

## Sessions

- A successful login gives a Parse session token, kept by the Parse SDK in the browser storage. The back-office does not build its own token.
- `checkSession` (BO) runs when the app loads: it reads `Parse.User.currentAsync()`, then checks the session with `Parse.Session.current()`. A session that no longer exists on the server clears the local user, shows the bad-session error and logs out; with no user, the back-office redirects to the login page.
- The current user is also copied to `localStorage` by `updateUserIntoLocalStorage`, and the Redux `settings` slice (persisted with redux-persist) keeps `isAuthenticated`.
- Server-side, Cloud Code reads the user from `request.user` (the session token of the call). The REST route `POST /files` reads it from the `X-Parse-Session-Token` header, see [Authenticated REST routes](#authenticated-rest-routes).

## Sign-up

1. The sign-up form of the back-office builds a `Parse.User` with `username = email`, `platform = 'bo'` and `fromBO = true`, then calls `signUp()`.
2. `beforeSave(_User)` validates a new user with the Zod schema `getSignUpFromBOSchema`: valid email, `lastName` up to 112 characters, optional `firstName` up to 112, password 8 to 64 characters. Error messages are translated with the locale passed in the save context. It then sets `deleted: false` and the first entry of `platforms` (`{ name, count: 1, lastConnectedAt }`), and removes the `fromBO` helper field.
3. `afterSave(_User)` on creation:
   - in production (`NODE_ENV=production`): generates the verification code, stores it encrypted on the user, sends the confirmation email and creates the contact in Brevo (`saveUserAndSendCodeToEmail`);
   - in any other environment: marks the user `verified: true` directly;
   - if the email is listed in the `OWNERS_EMAILS` environment variable, grants the `Owner` role. Creating the owner role triggers the creation of the other default roles, see [RIGHTS_ROLES.md](RIGHTS_ROLES.md).
4. The temporary `platform` field is removed after save: `platforms` is the stored list.

A new user has no role, so it sees nothing in the back-office until a role is assigned.

## Email confirmation

- The code has 6 digits (`generateNumber(6)`), is stored encrypted (AES-256-CTR, `encrypt` in `apps/server/src/utils/encrypt.utils.ts`) in `verification.code` with `verification.expiredAt` one hour later. Only the encrypted form is in the database; the clear code is decrypted once to be put in the email.
- `verifyAccountEmail({ code, type })` encrypts the submitted code, finds the user with that code, checks it with `isValidUserCode` (error keys `user:errors.incorrectCode` and `user:errors.expiredCode`), removes `verification` and, when `type` is not `resetPassword`, sets `verified: true`. It returns the user email encrypted with the fixed key.
- `sendVerificationCode({ email, locale })` regenerates and resends a code; it does nothing for an already verified user.
- The whole step can be turned off with `DISABLE_USER_ACCOUNT_CONFIRMATION` in `apps/server/src/utils/constants.ts`. It is `true` today: `beforeLogin` then no longer checks `verified` and does not resend codes. The back-office has its own constant with the same name in `apps/bo/src/utils/constants.ts` (see [Known gaps](#known-gaps)).

## Login and logout

- Login: `Parse.User.logIn(email, password)`, then `loginSuccess` loads the current user into Redux (the roles are loaded when a dashboard page is entered) and redirects to the home page. On a failure the form shows the translated error (invalid username or password, and when the confirmation is enabled, error code 141 sends the user to the verification page).
- `beforeLogin` sets `isOnline: true` on the user.
- When a save of an existing user carries the `platform` field, `beforeSave` increments the `count` and `lastConnectedAt` of that platform in `platforms` (`getUserPlatforms`).
- Logout: `Parse.User.logOut()`, then the BO clears its local storage and Redux state and redirects to the login page. `afterLogout` sets `isOnline: false`.

## Password reset

1. The user enters their email: `sendResetPasswordVerificationCode({ email, locale })` fails with the translated `user.noAccountByEmail` message if no account matches, otherwise stores a new code and sends the reset email.
2. The user enters the code: the BO calls `verifyAccountEmail` with `type: 'resetPassword'`, which does not mark the account verified and returns the encrypted email; the BO navigates to the reset form with it.
3. `resetPassword` decrypts the email (fixed key, hexadecimal form without special characters), finds the non-deleted user, sets the new password and removes `verification`.

## Changing the password

A logged-in user sets `password` on their own `Parse.User` and saves it (`changePassword` thunk); Parse checks the session. There is no old-password check in the code.

## Bans and deletion

- `toggleBanUser` (back-office users only) sets `banned`. The `afterSave` trigger then appends `{ bannedAt, bannedBy, until }` with `until` two days later; `unsetBanned` clears `banned` once every ban of the history is expired. Nothing in the server login path rejects a banned user today.
- `deleteUser` / `deleteUsers` soft-delete (`deleted: true`, with `deletedAt` and `deletedBy` stamped by the trigger); `destroyUsers` destroys users already soft-deleted. Both bulk functions are meant to require an administrator (see the administrator check gap in [RIGHTS_ROLES.md](RIGHTS_ROLES.md)).
- `createSessionTokenForAUser` (administrator only) creates an anonymous user and a session token for it.

## Authenticated REST routes

The Express routes outside `/parse` are:

| Route | Protection |
|---|---|
| `POST /files` | `protectionMiddleware({})`: header `X-portfolio-key` equal to `REST_API_KEY`, and a valid Parse session (`X-Parse-Session-Token` header or `sessionToken` query), checked with `getUserForSessionToken` |
| `GET /download/cv.pdf` | public, query validated by a Zod schema |
| `GET /ping` | public, used by a cron to keep the host awake |

The back-office sends the key from `VITE_REST_API_KEY` (`protectRequest` in `apps/bo/src/config/http.ts`). Because `VITE_*` variables are exposed to the browser, that key is not a secret.

## Secrets involved

Names only, see the inventory for the full list: `PARSE_APP_ID`, `PARSE_MASTER_KEY`, `REST_API_KEY`, `OWNERS_EMAILS`, and the three encryption variables `CRYPTO_FIXED_PART_KEY`, `CRYPTO_FIXED_FULL_KEY`, `CRYPTO_IV` (all checked at startup by `validateEnv`, except `OWNERS_EMAILS`).

## Known gaps

Observed in the code, not decided here:

- `DISABLE_USER_ACCOUNT_CONFIRMATION` is `true` on the server and `false` in the back-office: the BO sign-up form sends the user to the confirmation page, but outside production the server has already marked the account verified and sent no code.
- Several Cloud Functions are wrapped by `parseFunction` only, so they accept any caller (for example `getUser`, `getUserByEmail`, `sendEmailToUser`, `getNewUsersCount`, `saveUserLanguage`); `fromBO` is what requires a logged-in user. See [RIGHTS_ROLES.md](RIGHTS_ROLES.md).
- A banned user is not rejected by the server login path.
