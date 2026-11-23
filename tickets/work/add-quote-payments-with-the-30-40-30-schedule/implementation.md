# Implementation — add-quote-payments-with-the-30-40-30-schedule

**Goal**: an accepted Aldaron quote gets its three payments (30 / 40 / 30), which the back-office lists,
marks as paid, dates and corrects by cancelling, the quote's `paidAmount` following the paid ones.

## Read

- The ticket, `docs/code/design/fr/ALDARON_QUOTES_CLIENTS_MISSIONS.FR.md` ("Paiement", "Qui crée, et quand").
- The mission and quote code (server functions / services / triggers / validations / constants, bo
  page, dialogs, actions, reducer, service), the CLP constants and their test, `db-indexes.ts`.
- Rules: `parse-patterns.md` (root and server), `core-domain-boundary`, `implementation-completeness.md`,
  `inventory.md`, `feature-docs.md`, `typescript.md`, `naming-conventions.md`.

## Apps touched

| App | Change |
|---|---|
| `libs/shared-domain-constants` | `payment` in `DOMAIN_COLLECTIONS`, `QUOTE_PAYMENT_SCHEDULE`, `PAYMENT_REFERENCE_MAX_LENGTH` |
| `libs/shared-domain-types` | `PaymentKindEnum`, `PaymentStatusEnum`, `PaymentMethodEnum` |
| `libs/shared-domain-utils` | `splitQuotePayments`, `canChangePaymentStatus`, `getPaymentStatusForDueDate`, `sumPaidPayments`, `computeQuoteRemainingAmount` |
| `apps/server` | types, constants, validations, service, functions, triggers (payment + quote afterSave), `paidAmount` upkeep in the quote trigger, indexes, CLP lock, i18n, tests |
| `apps/bo` | types, validation, service, actions, reducer, payments dialog + mark-paid dialog + due-date dialog, row action on accepted quotes, rights registration, locales |
| `apps/web`, `apps/aldaron-web` | Nothing: payments are back-office only (design note, "Site web") |
| Docs | `docs/features/bo/quotes/fr/QUOTES.FR.md` (payments section; no new sidebar entry so no README entry), inventory (README + code/ twins), design note twins (step 5 ✅) |

## Approach

- **Creation**: the quote `afterSave` creates the three payments when the save moved the quote to
  `accepted` (original not accepted) **and** the quote has no payment yet. Amounts from
  `splitQuotePayments(totalAmount)`: `Math.floor` for the first parts, the last takes the rest, so the
  three always add up to the total and none is negative. Deposit `due` dated today, others `planned`.
- **Payment status**: `planned` (no due date) → `due` (has a due date) → `paid` → `cancelled`.
  Setting a due date moves `planned` to `due`, clearing it moves `due` back to `planned`
  (🔎 decision, `recommendation.md`). `paid` only moves to `cancelled`; `cancelled` is final.
- **Correction**: `cancelPayment` cancels a payment and writes its replacement (same kind, percent,
  amount, due date; `due` or `planned`), so the non-cancelled payments always add up to the total.
- **Trigger `beforeSave` Payment**: a new payment needs an accepted quote, takes the quote's client and is
  born `planned` / `due` only; `quote`, `client`, `kind`, `percent`, `amount` are put back on any later
  save; a `paid` payment refuses every change but `cancelled`; a `cancelled` one refuses any change;
  `paid` requires a method and sets `paidAt` (today by default).
- **Trigger `afterSave` Payment**: recomputes the quote's `paidAmount` from its `paid` payments and saves
  the quote with a context flag. The quote `beforeSave` now puts `paidAmount` back unless that flag is on
  (the `TODO(link:060-…)` of the quote trigger is wired).
- **Functions** (each `fromBO` + `resolveWorkspace`): `getQuotePayments` (`find`), `markPaymentAsPaid`,
  `setPaymentDueDate` (`update`), `cancelPayment` (`create` + `update`), and (added during the work)
  `createQuotePayments` (`create`) for quotes accepted before this change, behind a dialog button.
  The three payments are saved one after the other, not in a batch, so each save keeps its context. No delete function, `delete`
  given to nobody by the code (CLP locked + function-only).
- **Bo**: a "Payments" row action on accepted quotes (right `find` on payments) opens a dialog: summary
  (total, paid, remaining), the payments in a `CompactTable`, row actions "Mark as paid", "Set the due
  date" (milestone and balance), "Cancel and re-enter". Each action refreshes the payments and the quote row.

## Files

Created: `libs/shared-domain-constants/src/payment.constants.ts`, `libs/shared-domain-types/src/payment.type.ts`,
`libs/shared-domain-utils/src/payment.utils.ts`, `apps/server/src/types/payment.type.ts`,
`apps/server/src/constants/_domain/payment.constants.ts`, `apps/server/src/validations/_domain/payment.validations.ts`
(+ test), `apps/server/src/utils/_domain/payment.utils.test.ts`, `apps/server/src/cloud/services/_domain/payment.service.cloud.ts`,
`apps/server/src/cloud/functions/_domain/payment.functions.ts`, `apps/server/src/cloud/triggers/_domain/payment.triggers.ts`,
server locales `payment.json` ×3, bo `types/_domain/payment.type.ts`, `services/_domain/payment.service.ts`,
`redux/actions/_domain/payment.action.ts`, `constants/_domain/payment.constants.ts`, `validations/_domain/payment.validation.ts`,
`utils/_domain/payment-role.utils.ts`, `redux/reducers/_domain/payment.reducer.ts`, containers
`payment/QuotePaymentsDialog.tsx`, `PaymentPayDialog.tsx`, `PaymentDueDateDialog.tsx`, `PaymentCancelDialog.tsx`,
bo locales `payment-entity.json` ×3, server `utils/_domain/payment.utils.ts`.

Edited: `collections.constants.ts`, the three lib `index.ts`, `quote.triggers.ts`, functions / triggers
`index.ts`, `db-indexes.ts`, `security.constants.ts` (+ test), `config/i18n/index.ts`, bo
`Quotes.tsx`, `domain-registrations.ts`, bo locales `index.ts`, docs.

## Data and security

- `Payment`: `quote`, `client` (pointers), `kind`, `percent`, `amount` (integer, smallest unit),
  `status`, `dueDate`, `paidAt`, `method`, `reference`, `createdBy`, `updatedBy`. Bounded: three per
  quote plus the replacements of corrections; read by quote, `limit` named.
- Indexes: `{ _p_quote: 1, status: 1 }`, `{ status: 1, dueDate: 1 }`.
- CLP: master key only (`ALWAYS_LOCKED_CLASSES`, `FUNCTION_ONLY_CLASSES`).
- Validation: strict schemas; `amount`, `percent`, `status`, `kind`, `quote`, `client` refused in input.

## Risks

- An `afterSave` that fails does not undo the acceptance: the payments would be missing (logged). See review.
- Two concurrent first acceptances are impossible (the status moves once), the existence check covers re-saves.
