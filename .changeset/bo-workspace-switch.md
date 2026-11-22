---
'portfolio-bo': minor
'portfolio-server': minor
---

The back-office works in one of two workspaces, the portfolio or Aldaron, picked in Settings by anyone whose roles open both. The Aldaron logo replaces the portfolio one in the sidebar, the website forms of Settings (details, main images, CV) are hidden, and the lists of projects, articles, pages and categories follow the workspace. A role has a new `workspaces` field (the portfolio when left out; the highest roles open both), and the server refuses an Aldaron list or detail to an account whose roles do not open it. No migration is needed: a role saved before the field opens the portfolio only.
