# Test cases — add the client collection to the Aldaron workspace

Fake data only. "Live" cases need the server running on a database; no local database is configured on
the machine that ran `/dev --auto` (the server env files point at a remote one), so they were **not
run** there and are listed for pre-production after the merge. They are `auto` by nature (a browser or
a script could run them) and stay unverified until someone does.

| # | Acceptance criterion | Steps | Expected | Type | Status | Place | Test |
|---|---|---|---|---|---|---|---|
| 1 | A user with `aldaron` + `create` creates a client | Sign in with a role opening Aldaron and holding `find` + `create` on Clients; Aldaron workspace; Clients → New client; fill name, e-mail; Save | Dialog closes, success message, the client leads the list, status Active | auto (live) | to do — not run, no local database | pre-production | — |
| 1b | Same, refused input | Call `createClient` with `status: 'archived'` or `createdBy` | Refused by validation | auto | ok | local | `apps/server/src/validations/_domain/client.validations.test.ts` |
| 2 | Two e-mails differing by case give one client | Create `jean@example.com`, then `Jean@Example.COM` | Second save refused with the name of the first client; dialog stays open | auto (live) | to do — not run, no local database | pre-production | — |
| 2b | Same, the normalization itself | `normalizeClientEmail` on two spellings | Same stored value | auto | ok | local | `apps/server/src/utils/_domain/client.utils.test.ts` |
| 3 | A client can be edited and archived; archived filterable out | Edit the phone, Save; row menu → Archive; open the "Active" tab; open "Archived" → Put back in the list | Phone updated; status Archived; Active tab hides it; Archived tab shows it; put back → Active | auto (live) | to do — not run, no local database | pre-production | — |
| 4 | A portfolio-only user sees no entry and cannot call the functions | Role opening `portfolio` only, with every right on Clients: look at the sidebar; type `/clients`; call `getClients` with that session | No entry; redirected to the dashboard; the call returns "You are not authorized to perform this action" | auto (live) | to do — not run, no local database | pre-production | — |
| 4b | Same, a raw SDK query | Class-level permissions built for `Client` from a role granting every right | No role grant on any operation, nothing public | auto | ok | local | `apps/server/src/cloud/services/_core/security.service.cloud.test.ts` |
| 5 | The sidebar entry shows only in Aldaron | Owner account: switch Settings → workspace to Portfolio, then Aldaron | Clients entry absent in Portfolio, present in Aldaron | auto (live) | to do — not run, no local database | pre-production | — |
| 6 | Labels and errors in fr / en / mg | `pnpm check-i18n` | Passes | auto | ok | local | `scripts/check-i18n.mjs` |
| 7 | (regression) A role can be saved with rights on `Client` / `Project` | Roles → edit a role → give `find` on Clients → Save | Saved (the server used to refuse a domain class name) | auto (live) | to do — not run, no local database | pre-production | — |

Static proof run on 2026-11-23 (Nx hung on the machine, so the app scripts were run directly):
`pnpm --filter portfolio-server run typecheck` ok, `pnpm --filter portfolio-bo run typecheck` ok,
`pnpm --filter portfolio-server run test` ok (4 files, 30 tests), ESLint on every touched server and bo
file: 0 errors. The build is proved by the CI of the PR.

No case needs human judgement: nothing is a look-and-feel decision. The live cases are listed in
`tc-manual.md` only because nobody could run them where the work was done.
