# Test cases — turn a site quote request into a client and a quote

No MongoDB on this machine (port 27017 refused) and no local stack: the live cases need one. They are
`auto` by nature (a browser or a script can run them) but were **not run**; they are given in detail in
`tc-manual.md` so a person can run them on pre-production. The pure logic is proved by tests that stay in
the repository.

| # | Criterion | Steps | Expected | Type | Status | Place | Test |
|---|---|---|---|---|---|---|---|
| 1 | A request from the Aldaron site appears only in the Aldaron contacts | Send the Aldaron contact form; open Contacts in the portfolio workspace, then in Aldaron | Absent from portfolio, present in Aldaron; its address opened by an account without Aldaron reads "not found" | auto (live) | not run: no database | pre-production | — |
| 1a | The site sends its target, the server stores `portfolio` by default | Read the mutation and the function; validation accepts `target` | `target: agency` sent; `createPublicContactSchema` takes the enum | auto | ok (code read, lint + typecheck green) | local | — |
| 2 | A user creates a client and a prefilled draft in one action | Aldaron request → "Create the client and the quote" → price a line → Save | Dialog prefilled (client, product as title, estimate lines at 0); quote saved as draft | auto (live) | not run: no database | pre-production | — |
| 2a | The prefill is read from the message the site writes | `pnpm nx run server:test` | 7 cases of `parseQuoteRequestMessage` pass | auto | ok | local | `apps/server/src/utils/_domain/quote-request.utils.test.ts` |
| 3 | A client with the same e-mail is reused | Create client `jane@x.com`; convert a request from `Jane@X.com` | No second client; the dialog names the existing one | auto (live) | not run: no database | pre-production | — |
| 4 | A converted contact shows its quote and cannot be converted again | Reopen the converted request; call `createQuote` with the same `contact` | Banner with the number, no button; the server refuses with "already became quote …" | auto (live) | not run: no database | pre-production | — |
| 4a | A request named on an amendment, or a malformed prepare call, is refused | `pnpm nx run server:test` | 3 validation cases pass | auto | ok | local | `apps/server/src/validations/_domain/quote.validations.test.ts` |
| 5 | The public form behaves exactly as before | Diff of aldaron-web: only the label constants and the extra `target` param; `composeQuoteMessage` produces the same text | Same message text, same success, estimate still cleared | auto | ok (diff read; the labels hold the same strings) | local | — |
| 6 | Checks | lint, typecheck (bo, server, aldaron-web, shared-constants), server tests, build server + bo, aldaron-web compile, check-i18n, lint:docs, check-doc-links, check-doc-twins | All green (aldaron-web: Next compiled and generated, Nx then failed on a Windows symlink privilege, os error 1314) | auto | ok | local | — |
