# Implemented — add the mission collection to the Aldaron workspace

The Aldaron workspace can now follow the work done for its clients.

- A "Missions" entry in the menu lists the missions, one tab per status, searchable by title.
- A team member can create a mission for an active client, optionally for one of its accepted quotes.
- On an accepted quote, "Create the mission" opens the mission already filled with the client, the title
  and the quote.
- A mission can be given to a member of the Aldaron team, and "My missions" shows only one's own.
- A mission is started, finished or cancelled from the list; it never goes back, and a finished or
  cancelled mission stays as it is.
- Each status has its own phases (design, testing, warranty…); a wrong phase is refused, and changing the
  status clears it.
- Starting or finishing a mission fills its empty start or end date with that day.
- Once started, a mission keeps its client and its quote.
- A client who has missions can no longer be deleted.

Proved by unit tests and static checks; the same steps on a real database are still to run (see
`remaining.md`).
