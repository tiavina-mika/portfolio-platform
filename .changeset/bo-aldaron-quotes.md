---
'portfolio-bo': minor
'portfolio-server': minor
---

The Aldaron workspace gets its quotes. A new "Quotes" sidebar entry, shown only in the Aldaron workspace, lists the quotes by status and writes a draft for an active client (a client can be created from the quote form), with its lines, its currency (euro or ariary), an optional VAT rate and its total computed while typing. Each quote gets a readable number `AL-<year>-<NNN>`, gap-free and restarting each year. A draft is edited; it is then marked sent, and accepted (with how the client accepted), refused or expired: no other move is allowed, and a quote that left draft can no longer be edited. The number, the total and the paid amount are computed by the server and refused as input. A default currency, in the languages section of the settings, only prefills a new quote. A client that has quotes can no longer be deleted. No migration: the `Quote` and `Counter` classes and their indexes are created at startup.
