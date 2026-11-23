---
'portfolio-bo': minor
'portfolio-server': minor
---

An accepted Aldaron quote gets its payments, on one schedule for every quote: a 30 % deposit due on the day of the acceptance, a 40 % milestone and a 30 % balance, the balance absorbing the rounding so the three always add up to the total. They are written once, by the acceptance; a quote that is not accepted has none. "Payments" on an accepted quote shows the total, what is paid and what is left, and each payment with its status (planned, due, paid, cancelled). A payment is marked as paid by hand with its method, an optional transfer reference and its day (today by default, never ahead); the milestone and the balance are dated once known; a mistake is corrected by cancelling the payment, which writes a new unpaid one of the same part in its place. A paid payment is never edited, no payment is ever deleted, and the quote's paid amount follows the paid payments. A quote accepted before this change gets its schedule from "Create the payment schedule". No migration: the `Payment` class and its indexes are created at startup.
