# Recommendations — add-quote-payments-with-the-30-40-30-schedule

Decisions taken alone in autonomous mode. Each one is a 🔎 Deduction to validate, never a fact.

## 1. What makes a payment `planned` or `due`

- **Question**: the design note gives the deposit `due` dated today and the others `planned`, but says
  nothing of what moves a milestone or a balance to `due`.
- **Chosen**: the due date does. Setting it on an unpaid payment makes it `due`; emptying it takes it back to
  `planned` (`getOpenPaymentStatus`).
- **Reason**: "overdue" (ticket `070`) is defined as a `due` payment whose date has passed: an undated
  payment can never be overdue, a dated one is always `due`. One rule, a query on the status.
- **Discarded**: a separate "Mark as due" action (a second step to forget); `due` only from the deposit (the
  milestone and balance would never show as overdue).
- **Impact if wrong**: one shared function and the service of `setPaymentDueDate`.

## 2. How a mistake is "re-entered"

- **Question**: "a `cancelled` payment replaces a mistake with a new one": who writes the new one?
- **Chosen**: `cancelPayment` writes it itself, same kind, percent, amount and due date, unpaid; the user
  then marks it paid with the right details. Any non-cancelled payment can be cancelled this way.
- **Reason**: the open and paid payments of a quote always add up to its total, and no form ever lets a user
  type an amount (amounts stay the server's).
- **Discarded**: a free "New payment" form (amounts typed by hand, the schedule could stop adding up).
- **Impact if wrong**: one service function; the trigger already accepts any unpaid new payment of an
  accepted quote.

## 3. Quotes accepted before this change

- **Question**: accepted quotes already stored have no payment, and nothing backfills them.
- **Chosen**: the payments dialog shows "Create the payment schedule" when an accepted quote has none
  (`createQuotePayments`, right `create`, refused when the quote already has payments).
- **Reason**: no one-off job to run in each environment; it also repairs a quote whose acceptance could not
  write its payments.
- **Discarded**: a migration job (one more inventory entry and a manual run); writing the schedule while
  reading the payments (a read that writes).
- **Impact if wrong**: one function and one button.

## 4. The day a payment is paid

- **Chosen**: typed in "Mark as paid", today when left empty; a day still to come is refused (server and form).
- **Reason**: a transfer is often recorded a few days after it arrived; a future day would be a typo.

## 5. Rights

- **Chosen**: `find` opens the dialog; `update` marks paid and dates; `create` + `update` cancel and
  re-enter (and create the schedule). `delete` is used by no function.
- **Reason**: the ticket gives `create` and `update` to the sales role; cancelling writes a new payment.
