# ADR 001 - Parse Server on MongoDB as the backend

## Table of Contents

- [Context](#context)
- [Decision](#decision)
- [Consequences](#consequences)

**Status**: Accepted (recorded from the code)

## Context

The platform needs a database with a shape that changes often (translated content per locale, nested blocks), user accounts with roles, file handling, background jobs and server-side validation, for a single maintainer. Writing and operating a custom REST API with its own ORM, authentication and role system would cost more than the product itself.

## Decision

`apps/server` runs Express with [Parse Server](https://parseplatform.org) mounted on `/parse`, backed by MongoDB (`MONGO_URL`). The business rules live in Cloud Code under `apps/server/src/cloud/`: functions, `beforeSave` / `afterSave` / `afterDelete` triggers and jobs. Users and roles are the native `_User` and `_Role` classes. Express adds only what Parse does not cover: file upload, the CV download, the back-office static files and a ping route.

The clients use the Parse JS SDK: the back-office directly from the browser, the website from its server code (`parse/node`).

## Consequences

- Schemas are implicit: a field exists when the code writes it, so read paths must tolerate missing fields and indexes and class-level permissions are configured outside the code (see [RIGHTS_ROLES.md](../../architecture/en/RIGHTS_ROLES.md)).
- Authentication, sessions, roles, a REST API and jobs come built in, see [AUTH.md](../../architecture/en/AUTH.md).
- Server-side rules sit in triggers, so a rule applies whatever the client; the cost is that triggers run on every save and need care with `master key` calls.
- Business logic is tied to the Parse Cloud Code model; leaving Parse would mean rewriting `apps/server`.
