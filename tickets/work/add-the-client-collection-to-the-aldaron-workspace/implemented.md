# Implemented — add the client collection to the Aldaron workspace

The Aldaron workspace of the back-office can now keep the list of its clients. This is written from the
code and its unit tests: the screens were not run on a database (see `remaining.md`).

- In the Aldaron workspace, a "Clients" entry in the sidebar opens the list of clients.
- A user with the rights can add a client (company or person, name, e-mail, phone, address, tax number,
  notes) and edit it, in a window over the list.
- An e-mail address names one client, whatever its capital letters: a second client with the same address
  is refused, with a message naming the first one.
- A client can be archived and put back in the list; the "Active" and "Archived" tabs separate them.
- The list can be searched by name or e-mail, filtered by kind, sorted and paged.
- In the portfolio workspace the entry is absent, and the clients cannot be reached, even by an account
  holding every right on clients.
- A role can be given rights on clients in the Roles page.
- Every label and message exists in French, English and Malagasy.
