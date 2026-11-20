---
'portfolio-server': patch
'portfolio-bo': patch
---

Sign-in and sign-up routes are now limited per account identifier on top of a wider cap per address, a client can no longer claim to be a back-office account or move the sign-up step of an account that confirmed no contact, a new password may not be the email or phone number nor contain a word of the email (with translated messages for each rule), the server refuses to boot when the static encryption key is not exactly 32 bytes, and an account deleted from the users list leaves the list right away.
