---
'portfolio-bo': minor
'portfolio-server': minor
---

The Aldaron workspace gets its first business list: the clients. In the Aldaron workspace a new "Clients" sidebar entry lists, creates, edits and archives them (an archived client can be put back); one e-mail address, whatever its case, is one client. The entry is hidden in the portfolio workspace, and the server refuses every client function to an account whose roles do not open Aldaron, whatever its rights on clients. The `Client` class is reached through its Cloud Functions only: its class-level permissions never mirror the role rights. A role can now be saved with rights on a domain class (`Project`, `Client`), which the server used to refuse. No migration: the class and its indexes are created at startup.
