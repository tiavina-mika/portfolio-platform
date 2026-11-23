# Test cases — add-quote-payments-with-the-30-40-30-schedule

Fake data only. "Live" cases need the server running on a database: no local database is reachable on the
machine that ran `/dev --auto` (port 27017 refused, the env files point at a remote one), so they were
**not run** there and are listed in `tc-manual.md` for pre-production after the merge. They are `auto` by
nature (a browser or a script could run them) and stay unverified until someone does. Each rule they rest on
is proved by a unit test that stays in the repository.

| # | Acceptance criterion | Steps | Expected | Type | Status | Place | Test |
|---|---|---|---|---|---|---|---|
| 1 | Accepting a quote creates exactly three payments of 30 %, 40 % and 30 % that add up to its total | `splitQuotePayments` on 100 000, 1 001, 0, 1, 2, 3, 7, 99, 12 345, 999 999 999 | 30/40/30, deposit first; the balance takes the rounding; always the exact total, integers, never negative | auto | ok | local | `apps/server/src/utils/_domain/payment.utils.test.ts` |
| 1b | Same, on a real acceptance | Accept a sent quote of 1 001,00 € → "Payments" | Deposit 300,30 € due today, milestone 400,40 € planned, balance 300,30 € planned; total 1 001,00 € | auto (live) | to do — not run, no local database | pre-production | — |
| 2 | Saving the accepted quote again does not create more payments | `isQuoteJustAccepted` on accepted ← accepted, accepted ← sent | Only the move to accepted writes them | auto | ok | local | `payment.utils.test.ts` |
| 2b | Same, on a real save | Mark a payment paid (the quote is saved again with its paid amount), reopen "Payments"; call `createQuotePayments` on the quote | Still three payments; the call is refused "already has its payments" | auto (live) | to do — not run, no local database | pre-production | — |
| 3 | Marking a payment as paid records the method and the date and updates the paid amount | `markPaymentAsPaidSchema` (method required, reference trimmed, day optional), `isPaidInTheFuture`, `sumPaidPayments`, `changesPaidAmount` | Method required; a future day refused; the paid amount sums the paid payments only and is summed again on paid / cancel of a paid one | auto | ok | local | `payment.utils.test.ts`, `apps/server/src/validations/_domain/payment.validations.test.ts` |
| 3b | Same, on a real save | "Mark as paid" on the deposit, method Bank transfer, reference VIR-1 | Row Paid, today, "Bank transfer · VIR-1"; "Already paid" = deposit; the quote row of the list updated | auto (live) | to do — not run, no local database | pre-production | — |
| 4 | A paid payment cannot be edited or deleted; an error is fixed by cancelling and re-entering | `getNextPaymentStatuses(PAID)` = cancelled only; cancelled final; no delete function (`payment.functions.ts` read); no raw SDK access (CLP) | Only paid → cancelled; nothing from cancelled; no role CLP grant | auto | ok | local | `payment.utils.test.ts`, `apps/server/src/cloud/services/_core/security.service.cloud.test.ts` |
| 4b | Same, on a real save | "Cancel and re-enter" on the paid deposit; then `markPaymentAsPaid` / `setPaymentDueDate` on the cancelled one | Cancelled row kept, a new Due deposit under it, paid amount back to 0; both calls refused | auto (live) | to do — not run, no local database | pre-production | — |
| 5 | The remaining amount of a quote equals its total minus what is paid | `computeQuoteRemainingAmount` | 1000 − 700 = 300; 1000 − 1000 = 0 | auto | ok | local | `payment.utils.test.ts` |
| 5b | Same, on screen | Dialog after paying the deposit of a 1 001,00 € quote | "Left to pay" 700,70 € | auto (live) | to do — not run, no local database | pre-production | — |
| 6 | A quote that is not accepted has no payment | `isQuoteJustAccepted` for draft, sent, refused, expired; `getQuotePayments` returns `[]` for a non-accepted quote (code read); "Payments" shown on accepted quotes only (code read) | No schedule written; no action offered | auto | ok | local | `payment.utils.test.ts` |
| 7 | (security) Amount, percent and status cannot be imposed | Strict schemas with `amount`, `percent`, `status` | Refused | auto | ok | local | `payment.validations.test.ts` |
| 8 | (rule) Dating a payment | `getOpenPaymentStatus`, `setPaymentDueDateSchema` | Dated → due, undated → planned; ISO string read as a date | auto | ok | local | both test files |
| 9 | Labels and errors in `fr`, `en`, `mg` | `pnpm check-i18n` | Passes | auto | ok | local | `scripts/check-i18n.mjs` |
| 10 | (legacy) An accepted quote with no payment gets its schedule | "Payments" on a quote accepted before this change → "Create the payment schedule" | Three payments created once; the button disappears | auto (live) | to do — not run, no local database | pre-production | — |

Static proof run on 2026-11-23: `pnpm nx run-many -t lint typecheck test -p server bo` ok (server 11 files,
164 tests); `pnpm nx run-many -t lint typecheck -p shared-domain-constants shared-domain-types
shared-domain-utils` ok; `pnpm nx run-many -t build -p server bo` ok; `pnpm check-i18n`,
`pnpm check-doc-links`, `pnpm check-doc-twins --worktree`, `pnpm lint:docs` ok.

No case needs human judgement. The live cases are in `tc-manual.md` only because nobody could run them where
the work was done.
