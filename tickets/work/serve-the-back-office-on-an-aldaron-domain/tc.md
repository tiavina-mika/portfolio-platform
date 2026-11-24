| # | Criterion | Steps | Expected | Type | Status | Place | Test |
|---|---|---|---|---|---|---|---|
| 1 | Aldaron invitation links to the Aldaron domain | Set `AGENCY_SERVER_URL`, invite an e-mail with a role that opens Aldaron only | The button link starts with the Aldaron domain | human | to do | local | `utils.test.ts` covers the URL choice only |
| 2 | Portfolio invitation unchanged | Invite with a portfolio role | Link starts with `SERVER_URL` | human | to do | local | `utils.test.ts` (default workspace) |
| 3 | Aldaron e-mails show their name and website | Set `AGENCY_WEBSITE_URL`, `AGENCY_APP_NAME`, send the invitation | Frame logo link, footer link and name are the Aldaron ones | human | to do | local | `utils.test.ts` covers the values |
| 4 | Aldaron domain lands in Aldaron workspace | Set `VITE_AGENCY_HOSTNAME`, open the BO on that hostname with an account holding both workspaces, no stored choice | Aldaron workspace is active | human | to do | local (hosts file) | none |
| 5 | Portfolio-only account cannot open Aldaron screens | Open the Aldaron hostname with a portfolio-only account | Portfolio workspace, no Aldaron menu | human | to do | local | none (existing selector rule) |
| 6 | Sign-in, Parse calls and uploads work on both domains | Sign in and upload a file on each hostname | No cross-origin error | human | to do | local (hosts file) | none |
| 7 | No browser URL ends up in an e-mail link | Read `sendBOInvitationSchema` and the function | No URL parameter; workspace computed from roles | auto | ok | n/a | code review |

Checks run: `pnpm nx run-many -t typecheck -p server bo` ok; `pnpm nx run server:test` ok;
`pnpm nx run-many -t lint -p server bo` ok.
