# ADR 004 - Redux Toolkit for the back-office state

## Table of Contents

- [Context](#context)
- [Decision](#decision)
- [Consequences](#consequences)

**Status**: Accepted (recorded from the code)

## Context

The back-office is a data-heavy admin panel: lists with filters and pagination, forms, the current user and their roles, notification counters, loading and error states shared by many screens, and route loaders that must load data before a page is shown.

## Decision

State is held in [Redux Toolkit](https://redux-toolkit.js.org) with one reducer file and one action file per domain (`redux/reducers/<domain>.reducer.ts`, `redux/actions/<domain>.action.ts`). The flow is Parse call, thunk, reducer, component, through typed selectors. Thunks are created with `actionWithLoader` (loading flag, rights check, error handling) and route loaders with `onEnterActionWithLoader`, which maps errors to the TanStack Router `notFound()` and `redirect()`. Only the `settings` slice (locale, theme, sidebar) is persisted with redux-persist.

`apps/web` does not use Redux: its data comes from server components and queries, and mutations from server actions.

## Consequences

- Loading, error and message handling is written once in the wrappers, see [ERROR_HANDLING.md](../../architecture/en/ERROR_HANDLING.md).
- A new domain needs an action file, a reducer and selectors, which is more code than local state but predictable to navigate.
- Rights checks happen in the same wrappers, which keeps screens thin, see [RIGHTS_ROLES.md](../../architecture/en/RIGHTS_ROLES.md).
- The wrappers' catch-and-store behavior means a thunk error is shown in a snackbar rather than thrown, so a missing import can silently make an action do nothing.
