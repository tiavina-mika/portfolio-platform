| # | What | Type | Blocks or makes fake | Unblocked by | Where |
|---|---|---|---|---|---|
| 1 | Domain, DNS and HTTPS certificate of the Aldaron back-office, then the three `AGENCY_*` values and `VITE_AGENCY_HOSTNAME` | blocker worked around | Nothing is live until set: Aldaron mails still carry the portfolio values | The human (ticket says out of scope) | host settings |
| 2 | The e-mail logo is still the portfolio's | not implemented | Aldaron mails show the portfolio logo | ⚠️ unknown: needs an agency logo asset | `getLogoUrl` |
| 3 | The `human` cases 1 to 6 of `tc.md` | to verify | Not run: no second hostname locally | The human | `tc-manual.md` |
| 4 | The domain name and display name | to validate | 🔎 Deduction: they are configuration, not code | The human | env |
