---
'portfolio-bo': minor
'portfolio-server': minor
---

The Aldaron workspace gets its missions. A new "Missions" sidebar entry, shown only in the Aldaron workspace, lists the work done for the clients by status, with a search on the title and "My missions" for the ones given to the signed-in user. A mission is written for an active client, optionally for one of its accepted quotes, given to a member of a role that opens the Aldaron workspace, with an optional phase of its status, dates and a description; "Create the mission" on an accepted quote opens it prefilled with the client, the title and the quote. Its status only moves forward (planned, in progress, done, or cancelled), starting or finishing it fills an empty start or end date, the phase is cleared on a status change, and the client and the quote no longer change once it started. A client that has missions can no longer be deleted. No migration: the `Mission` class and its indexes are created at startup.
