# Debt — Serve the back-office on an Aldaron domain

> Review: [261124-feat-serve-back-office-on-aldaron-domain.md](../261124-feat-serve-back-office-on-aldaron-domain.md)
> Branch: `feat/serve-back-office-on-aldaron-domain` · Created 2026-11-24 at 08:32 · Author: `tiavinamika@gmail.com`
> Overall status: ⏳ to do

## Table of contents

- [Summary](#summary)
- [1. Uploads follow the page address](#1-uploads-follow-the-page-address)
- [2. Other e-mails keep the portfolio frame](#2-other-e-mails-keep-the-portfolio-frame)
- [3. Mixed roles get the portfolio link](#3-mixed-roles-get-the-portfolio-link)

## Summary

| # | Severity | Type | Risk | Status |
|---|---|---|---|---|
| 1 | 🟡 Low | Regression | Uploads call the page's address instead of `VITE_SERVER_URL` | ⏳ to do |
| 2 | 🟡 Low | Bug | Verification, reset and alert e-mails keep the portfolio frame (existed before) | ⏳ to do |
| 3 | 🟡 Low | Bug | Roles opening both workspaces get the portfolio link | ⏳ to do |

## 1. Uploads follow the page address

- **Severity**: 🟡 Low · **Type**: Regression · **Status**: ⏳ to do
- **Concerned**: `apps/bo/src/utils/_core/utils.ts` (`getServerUrl`), `apps/bo/src/config/http.ts`

**What can happen** — If the back-office were deployed on a host other than the server, uploads would go to the back-office host and fail.

**Why** — `getServerUrl` returned `VITE_SERVER_URL` outside local; it now returns `window.location.origin`, as `initializeParse` already did for every Parse call. Today the server serves the back-office, so both are equal.

**How to check** — Sign in on the deployed back-office and upload an image; the request must reach the server host.

**How to fix**

1. **(recommended)** Keep the change and say in the deployment guide that the back-office must be served by the server.
   *Why*: it is already the architecture, and one rule for Parse and uploads is simpler.
2. Restore `VITE_SERVER_URL` and add a per-domain value — costs a build variable per domain and defeats the point of one build.

## 2. Other e-mails keep the portfolio frame

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do — existed before the branch
- **Concerned**: `apps/server/src/cloud/utils/_core/email.utils.cloud.ts` (verification, reset, step-up, alerts)

**What can happen** — An Aldaron employee receives a verification code or an alert signed with the portfolio name and linking to the portfolio website.

**Why** — Only the invitation passes a workspace to `generateEmailTemplate`; the other builders use the default.

**How to check** — Trigger a password reset for an Aldaron-only account and read the e-mail footer.

**How to fix**

1. **(recommended)** Derive the workspace of the recipient with `getUserWorkspaces` in the shared e-mail sender and pass it to the frame.
   *Why*: one place, no change for each builder, and the recipient's roles decide, not the request.
2. Add a `workspace` argument to each builder — more edits, easy to forget one.

## 3. Mixed roles get the portfolio link

- **Severity**: 🟡 Low · **Type**: Bug · **Status**: ⏳ to do
- **Concerned**: `apps/server/src/cloud/services/_core/userRole.service.cloud.ts` (`getLandingWorkspace`)

**What can happen** — A person invited with roles that open both workspaces, or with a role inheriting one, is sent to the portfolio address.

**Why** — The rule picks the Aldaron address only when no role opens the portfolio, and reads the granted roles without their parents.

**How to check** — Invite with one portfolio role and one Aldaron role; the link is the portfolio's.

**How to fix**

1. **(recommended)** Leave it and decide the product rule (who should land where) before changing it.
   *Why*: the account still gets exactly the workspaces its roles open; only the first address differs, and no rule exists yet.
2. Prefer the Aldaron address whenever Aldaron is opened — would send portfolio staff holding one Aldaron role to the wrong domain.
