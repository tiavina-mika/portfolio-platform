---
'portfolio-bo': minor
'portfolio-server': minor
---

A sent quote can now be revised: "Revise" creates a draft copy under the same number with the next version (v2, v3…), and the sent version becomes expired. An accepted quote can be completed by an amendment: "Create an amendment" opens the quote form prefilled with its client, currency, VAT rate and terms, and the amendment gets its own number. The quote list shows the version and the quote each revision or amendment comes from. The server decides from the status of that quote (sent: revision, accepted: amendment), keeps its client, and never revises an accepted quote. No migration: existing quotes are first versions with no parent.
