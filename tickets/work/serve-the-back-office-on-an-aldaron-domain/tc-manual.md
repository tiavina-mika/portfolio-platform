## Before starting

- Local stack (`/rd`). In the hosts file, add `127.0.0.1 admin.aldaron.test`.
- Server `.env.local`: `AGENCY_SERVER_URL=http://admin.aldaron.test:<server port>`,
  `AGENCY_WEBSITE_URL=http://localhost:3000`, `AGENCY_APP_NAME=Aldaron Test`.
- Back-office env: `VITE_AGENCY_HOSTNAME=admin.aldaron.test`.
- Accounts: one holding both workspaces, one portfolio-only, and a role that opens Aldaron only.

## Cases (numbers as in `tc.md`)

1. Invite a new e-mail with the Aldaron-only role. Open the received mail: the button link must start with
   `http://admin.aldaron.test`. Failure: it starts with the portfolio address.
2. Invite with a portfolio role: the link starts with the portfolio address.
3. In the Aldaron mail, the logo link, the footer link and the name show `Aldaron Test` and the Aldaron website.
4. Open `http://admin.aldaron.test:<port>` signed in with the two-workspace account, with no stored choice
   (private window): the Aldaron workspace is active.
5. Same address, portfolio-only account: the portfolio workspace stays, no clients, quotes or missions menu.
6. On both addresses: sign in, upload an image. No error in the console.

## Result to send back

| # | ok / ko | remark |
|---|---|---|
