# Review — Serve the back-office on an Aldaron domain

- **Branch**: `feat/serve-back-office-on-aldaron-domain`
- **Type**: New feature
- **Author**: tiavina-mika — `tiavinamika@gmail.com`
- **Created**: 2026-11-24 at 08:32
- **Apps touched**: Server, Back-office

## Table of contents

- [In short](#in-short)
- [Database](#database)
- [Server](#server)
- [Back-office](#back-office)
- [See the result locally](#see-the-result-locally)
- [Possible bugs, regressions and holes](#possible-bugs-regressions-and-holes)
- [What is left to do](#what-is-left-to-do)

## In short

The Aldaron team can now have its own back-office address instead of the portfolio's. An employee invited with Aldaron-only roles receives a link to that address, and the invitation e-mail carries the Aldaron name and website. Opened on that address, the back-office starts in the Aldaron workspace. Nothing changes until the new optional settings are filled in.

## Database

No database change.

## Server

- Three optional settings: `AGENCY_SERVER_URL`, `AGENCY_WEBSITE_URL`, `AGENCY_APP_NAME`. Each one falls back to the portfolio value when it is not set or left empty. They are listed in `docs/inventory/README.md`, `.env.example` and the Render deployment guide.
- The invitation (`sendBOInvitation`) works out the workspace from the roles it grants, never from the request: Aldaron only when no role opens the portfolio, portfolio otherwise (the highest roles stay on the portfolio).
- The e-mail frame (logo link, footer links, name) follows the same workspace.
- Documentation: [EMAIL_NOTIFICATIONS.md](../../architecture/en/EMAIL_NOTIFICATIONS.md).

## Back-office

- On the Aldaron address (`VITE_AGENCY_HOSTNAME`), a first visit starts in the Aldaron workspace; a stored choice still wins, and an account that only holds the portfolio workspace stays in the portfolio.
- File uploads now call the address the page was opened on, as the rest of the back-office already did.
- No page changes: the invitation page is still `/invite`.

## See the result locally

`pnpm nx run server:dev` and `pnpm nx run bo:dev` (back-office on `http://localhost:5174`). Testing a second address needs a hosts-file entry: the steps are in `tickets/work/serve-the-back-office-on-an-aldaron-domain/tc-manual.md`. No story changed.

## Possible bugs, regressions and holes

| Severity | Type | What can happen | When | Follow-up |
|---|---|---|---|---|
| 🔴 High | Bug | A setting left empty in the env file (as `.env.example` ships it) stopped the server at boot: the plain URL check refuses an empty value | Copying `.env.example` without filling the new lines | ✅ fixed on the branch: an empty value now means "not set" (checked with an empty, a valid and an invalid value) |
| 🟡 Low | Regression | Uploads called a fixed address from the build settings; they now call the page's own address, which differs if the back-office were ever hosted apart from the server | A back-office deployed on another host than the server | ⏳ deferred — [debt #1](debt/261124-feat-debt-serve-back-office-on-aldaron-domain.md#1-uploads-follow-the-page-address) |
| 🟡 Low | Bug | The other e-mails to an Aldaron employee (verification code, password reset, alerts) keep the portfolio frame and name | Any such e-mail | ⏳ deferred, existed before the branch — [debt #2](debt/261124-feat-debt-serve-back-office-on-aldaron-domain.md#2-other-e-mails-keep-the-portfolio-frame) |
| 🟡 Low | Bug | A person invited with roles that open both workspaces gets the portfolio link | Mixed-role invitation | ⏳ deferred — [debt #3](debt/261124-feat-debt-serve-back-office-on-aldaron-domain.md#3-mixed-roles-get-the-portfolio-link) |

Details and fixes: [debt file](debt/261124-feat-debt-serve-back-office-on-aldaron-domain.md).

## What is left to do

- Domain name, DNS and HTTPS certificate, then the four settings (yours). Set them last: a link to an address that does not answer yet would be broken.
- The manual cases of `tc.md` (second hostname) have not been run.
