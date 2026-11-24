---
type: feat
apps: [server, bo]
branch: feat/serve-back-office-on-aldaron-domain
pr:
---

## Context

The Aldaron employees use the same back-office as the portfolio, served by the Express server, and reach it
through the portfolio's address. Everything the server builds comes from one fixed URL and one fixed name:

- the invitation link is `${getServerUrl()}/invite?token=…` (`SERVER_URL`), in `invitation.service.cloud.ts`
  and in `email.utils.cloud.ts`: an Aldaron employee is invited to the portfolio's domain;
- the e-mail frame (`emails/index.ts`) links its logo, "home" and "contact" to `getClientUrl()`
  (`WEBSITE_URL`, the portfolio website) and signs with `APP_NAME`;
- `publicServerURL` of Parse is `SERVER_URL + '/parse'`, and the CORS list allows only the host of
  `SERVER_URL` and the website.

The password reset is not concerned: it uses a code, not a link.

The back-office is served by Express, so a second domain only has to point to the same server. The URLs
come from environment variables per workspace and are **not** sent by the back-office: a value taken from
the client would let a forged link leave in an official e-mail.

⚠️ Deduction to validate: the Aldaron domain name, and the display name used in the e-mails of that
workspace, are not known yet.

## To do

- Server: add the Aldaron back-office URL, website URL and display name as environment variables; one function
  returns them for a workspace (portfolio by default) and replaces the fixed values in the invitation link
  and in the e-mail frame. Add the new domain to the CORS list and check that `/parse` answers on both domains.
- Bo: when the page is opened on the Aldaron domain, the Aldaron workspace is the active one by default
  (the switch stays available to an account that holds both).
- Docs: `.env.example`, `docs/inventory/README.md` and `docs/services/README.md` if hosting changes.

## Out of scope

- Buying the domain, the DNS records and the HTTPS certificate (done by the human).
- A separate Aldaron login page or branding of the back-office.
- The Aldaron public website, which is another repository.

## Acceptance criteria

- [ ] An employee invited to the Aldaron workspace receives a link to the Aldaron domain
- [ ] A portfolio invitation still points to the portfolio domain
- [ ] The e-mails of the Aldaron workspace show its name and link to its website, not the portfolio's
- [ ] Opening the back-office on the Aldaron domain lands in the Aldaron workspace
- [ ] An account that holds only the portfolio workspace cannot open the Aldaron screens from that domain
- [ ] Signing in, the Parse calls and the CORS work on both domains
- [x] No URL sent by the browser ever ends up in an e-mail link

## Comments

### 2026-11-24 · Claude · backlog
Written from a review of how the server builds its URLs: one fixed `SERVER_URL` and `WEBSITE_URL` for every
e-mail. Nothing was changed in the code.

### 2026-11-24 · Claude · in-progress
Started on `feat/serve-back-office-on-aldaron-domain`. Implemented server (three optional `AGENCY_*` variables,
workspace-aware URL and name helpers, invitation workspace computed from the roles, e-mail frame) and bo
(`VITE_AGENCY_HOSTNAME` default workspace, server URL follows the address the page was opened on). Ran:
typecheck, server unit tests, lint (server, bo) and the doc checks, all green. Criteria 1 to 6 need a second
hostname and stay unticked (`tickets/work/serve-the-back-office-on-an-aldaron-domain/tc-manual.md`).
CORS left unchanged on purpose (the back-office is same-origin on its own domain). Domain, DNS, certificate and
the Aldaron e-mail logo remain (see `remaining.md`). `/branch-review` not yet written.
