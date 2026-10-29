# Error Handling

## Table of Contents

- [Overview](#overview)
- [Server](#server)
  - [Cloud Functions and triggers](#cloud-functions-and-triggers)
  - [Validation](#validation)
  - [Translated messages](#translated-messages)
  - [Express routes](#express-routes)
  - [Jobs](#jobs)
  - [Startup](#startup)
  - [Logging](#logging)
- [Back-office](#back-office)
- [Public website](#public-website)
- [Known gaps](#known-gaps)

## Overview

The server throws plain `Error`s whose message is meant to be shown to a person. A message is either already translated by the server, or a translation key (`namespace:path`) that the client translates. Each client turns what it receives into something readable: the back-office puts it in a Redux error slice displayed in a snackbar, the website returns it from a server action.

## Server

### Cloud Functions and triggers

Every Cloud Function and trigger is wrapped in `parseFunction` (`apps/server/src/cloud/utils/utils.cloud.ts`). It logs the start and the end of the call with the object id, the user id and the client IP, and in case of failure logs the error and rejects with `new Error(message)`: the client receives the message, not a stack. A function that returns nothing returns `'ok'`. `fromBO` adds the "must be logged in" check on top, see [RIGHTS_ROLES.md](RIGHTS_ROLES.md).

Business errors are thrown with a message of one of two forms:

```ts
throw new Error('user:errors.userNotFound');            // key, translated by the client
throw new Error(translate('user.noAccountByEmail', locale)); // already translated by the server
```

Functions that must not fail the client return `false` instead of throwing when an item is missing (`getArticle`, `getUserByEmail`), because an `undefined` result would be serialized as a success.

### Validation

- Cloud Function parameters: `parseFunctionValidation(schema)` is passed as the validator of `Parse.Cloud.define`. It runs `safeParse` on `request.params` and throws the message of the first Zod issue. A schema can be a function of the locale (`params.locale`, default `fr`) so that its messages are translated.
- Object saves: `parseTriggerValidation(schema)` validates `object.toJSON()` in `beforeSave` (used for `Contact`); `signupTriggerValidation()` picks the BO or the public sign-up schema for `_User` creation.
- Schemas live in `apps/server/src/validations/`.

### Translated messages

`translate(key, locale)` (`apps/server/src/config/i18next.ts`) reads `apps/server/src/locales/{fr,en,mg}/common.json` through i18next with `fr` as the fallback. The locale reaches triggers through the save context (`context: { locale }`, set by the website for `Contact`) and Cloud Functions through the `locale` parameter. Keys with a namespace prefix such as `user:errors.accessDenied` are not in the server files: they are the back-office's keys.

### Express routes

Outside Parse:

- `validateApiInput` (`middlewares/validation.middleware.ts`) validates body, query and params with Zod and answers `400 { error: 'Invalid data', details: [{ message, key }] }`.
- `protectionMiddleware` forwards an `HttpException(400, message)` for a missing or wrong API key or session.
- `errorMiddleware` turns an `HttpException` into `{ message }` with its status, but it is not registered on the Express app (see [Known gaps](#known-gaps)).
- Controllers such as `uploadFiles` catch their own errors and log them.

### Jobs

Jobs (`cloud/jobs/`) catch errors, log them with `logger.info` / `logger.error` and return. The newsletter job also catches the error of each subscriber so one failing email does not stop the others. A job started with a missing parameter throws.

### Startup

`validateEnv` (`envalid`) checks the required environment variables before Parse Server starts and stops the process with the list of missing ones. `init()` errors are caught and logged.

### Logging

`logger` (`apps/server/src/utils/logger.ts`) is a Winston logger with daily rotating files under `src/logs/debug` and `src/logs/error` (the `logs` folder is ignored by git). `parseFunction` also writes to the console.

## Back-office

- Thunks are created through `actionWithLoader` (`apps/bo/src/redux/actions/util.action.ts`). It starts and stops a loading flag (global or local), checks the optional `collection` / `action` / `uiRight` rights, and catches any thrown error: the message goes through `translatedError` and is stored with `setErrorSlice`. `SnackBars.tsx` displays the error and clears it on close.
- `translatedError`: when the message contains `:` it is treated as an i18next key and translated (`user:errors.userNotFound`), otherwise displayed as is. This is why server keys carry the BO namespace.
- Parse error codes are handled where they matter: sign-up maps code 202 to "account already exists" and 142 to the server message; login maps 141 to the verification flow when the confirmation is enabled.
- Route loaders use `onEnterActionWithLoader`, which turns the internal `Errors.notFound` into TanStack Router's `notFound()` (404 page) and `Errors.redirect` into `redirect()`. TanStack Router cannot catch these inside the generic wrapper, so loaders do not use `actionWithLoader`.
- `checkSession` handles an invalid session by clearing the local user and showing `common:errors.badSession`.
- Form validation messages come from Zod schemas in `src/validations/`, translated through `zod-i18n.ts` and the `zod` namespace, see [I18N.md](I18N.md).

## Public website

- Reads (`apps/web/server/queries`) catch the error and return `{ error: message }`; the type `IServerResponse<T>` is `T | IError`, and the page decides what to show.
- Writes are server actions built on `next-safe-action` (`apps/web/config/safeAction.ts`). `handleServerError` returns, in this order: the message of an `ActionError` as is; for a `Parse.Error`, the `ServerError.<message>` translation when the message is a key, the message itself when it is a sentence, or `ServerError.somethingWentWrong`; for anything else, a matching `ServerError` translation or the library default message.
- Client-side form validation uses react-hook-form and Zod with messages from the `zod` and `Form` namespaces of `next-intl`.
- `components/ErrorBoundary.tsx` is the error screen ("something went wrong", try again, contact), plugged in through `error.tsx` of a route. Only `app/[locale]/sitemap/error.tsx` exists today. Routes with data have a `loading.tsx` skeleton, and `app/[locale]/not-found.tsx` renders the 404 page.

## Known gaps

- `errorMiddleware` is never registered with `app.use(...)` in `apps/server/src/index.ts`.
- The web server action middleware logs the client input and the action result with `console.log` on every call.
- Only one route of the website has an `error.tsx`; other routes rely on the Next.js default error page.
- `parseFunction` returns `Promise.reject(new Error(message))`: the original Parse error code is lost, so clients can only match on the message.
