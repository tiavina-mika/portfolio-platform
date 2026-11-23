# Implemented — add-quote-payments-with-the-30-40-30-schedule

What an Aldaron back-office user can do now (rules proved by tests; the screens not yet seen running on a
database, see `remaining.md`):

- Accepting a quote gives it three payments: a 30 % deposit due the same day, a 40 % milestone and a 30 %
  balance, always adding up to the exact total.
- Saving an accepted quote again never adds payments, and a quote that is not accepted has none.
- On an accepted quote, "Payments" shows the total, what is already paid and what is left to pay.
- A payment is marked as paid with how the client paid, an optional transfer reference and the day (today
  by default, never a day to come).
- The milestone and the balance get their due date once it is known.
- A mistake is corrected by cancelling the payment: it stays in the history and a new payment takes its place.
- A paid payment is never changed, and no payment can be deleted.
- A quote accepted before this change gets its payments from "Create the payment schedule".
- A role can be given the rights to see, record and correct payments.
