# Remaining — turn a site quote request into a client and a quote

| # | What | Type | What it blocks or makes fake | Who or what unblocks it | Where |
|---|---|---|---|---|---|
| 1 | The live cases 1 to 4 of `tc.md` (filing, conversion, reuse of a client, no second quote) | to verify | nothing is fake, but nothing was run on a real database | a person on pre-production, `tc-manual.md` | `tickets/work/turn-a-site-quote-request-into-a-client-and-a-quote/tc-manual.md` |
| 2 | The unread badge and the global search still count and show both workspaces' messages | not implemented | an Aldaron request raises the badge in the portfolio, and shows in the search of a portfolio-only account | `190-scope-the-contact-badge-and-search-to-the-workspace` | server unread count, `globalSearch.service.cloud.ts` |
| 3 | Requests sent before this ticket have no target and stay in the portfolio, with no button | not implemented | old Aldaron requests cannot be converted from the back-office | `150-move-old-contacts-to-the-aldaron-target` | `Contact.target` |
| 4 | What the prefill takes from the estimate (title, lines at 0) | to validate | the prices are typed by hand | the human, `recommendation.md` #1 | `apps/server/src/utils/_domain/quote-request.utils.ts` |
| 5 | The client is created when the button is clicked, and stays if the form is cancelled | to validate | a client with no quote may remain | the human, `recommendation.md` #2 | `prepareQuoteFromContact` |
| 6 | New client kind, archived client refused, rights, request with no e-mail | to validate | — | the human, `recommendation.md` #3 to #6 | `contact-quote.service.cloud.ts` |
| 7 | Two quotes from one request saved at the same second | deferred risk | rare duplicate draft | [debt #1](../../../docs/code/reviews/en/debt/261123-feat-debt-site-quote-request-conversion.md) | `createQuote` |
| 8 | `pnpm nx run aldaron-web:build` failed locally on a Windows symlink privilege (os error 1314) after Next compiled | to verify | nothing: an environment issue | the CI build | — |
