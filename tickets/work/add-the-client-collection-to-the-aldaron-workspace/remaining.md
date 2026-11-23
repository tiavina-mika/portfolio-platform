# Remaining — add the client collection to the Aldaron workspace

| # | What | Type | What it blocks or makes fake | Who or what unblocks it | Where |
|---|---|---|---|---|---|
| 1 | The live cases 1, 2, 3, 4, 5 and 7 of `tc.md` (create, duplicate e-mail, edit / archive / put back, portfolio-only account, sidebar per workspace, role with rights on clients) were not run: no local database on the machine that did the work | to verify | criteria 1 to 5 stay unticked until someone runs them | a human, or a session with a database, following `tc-manual.md` | `tc-manual.md` |
| 2 | Refusing the deletion of a client that has quotes or missions | link to wire | nothing today: no function deletes a client and `delete` is the owner's alone | `020-add-the-quote-collection-to-the-aldaron-workspace` (and `050-add-the-mission-collection-to-the-aldaron-workspace`) | `apps/server/src/cloud/triggers/_domain/client.triggers.ts`, `TODO(link:020-add-the-quote-collection-to-the-aldaron-workspace)` |
| 3 | Anonymizing a client | not implemented | the `anonymized` status exists but nothing sets it | `120-anonymize-an-aldaron-client` | — |
| 4 | Decisions 1 to 6 of `recommendation.md` (tabs, putting back an archived client, dialog, Cloud Functions only, role rights on domain classes, delete guard deferred) | to validate | a different product choice changes the list tabs or the archive menu | the human | `recommendation.md` |
| 5 | The local build: Nx hung on the machine (no output, a lock on `.nx/workspace-data`), so typecheck, tests and ESLint ran through the app scripts and the build was left to the CI | to verify | nothing for the user; the CI of the PR proves the build | the CI | ticket comment |
