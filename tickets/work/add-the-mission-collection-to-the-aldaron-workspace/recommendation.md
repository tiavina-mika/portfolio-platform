# Recommendations — add the mission collection to the Aldaron workspace

Decisions taken alone in autonomous mode. Each one is a 🔎 Deduction to validate, never a fact.

## 1. The stored value of the phase "cancelled by Aldaron"

- **Question**: the design note names it `byAldaron`.
- **Chosen**: `byAgency` (label "Cancelled by us" / « Annulée par nous »).
- **Reason**: the naming rule forbids a proper name in any stored value; the note was corrected.
- **Discarded**: `byAldaron` (a rename of the brand would need a data migration).
- **Impact if wrong**: a label to change only; the stored value stays.

## 2. Who can be given a mission

- **Question**: the note says "a back-office user".
- **Chosen**: a user whose roles open the Aldaron workspace (or an Owner / Super Admin), checked by the
  trigger; the picker lists the members of those roles, through a mission function.
- **Reason**: a mission given to someone who cannot open the workspace would be invisible to them; a delivery
  role has no right to read the user list.
- **Discarded**: any user (could pick a member of the public); the user list (needs a right on users).
- **Impact if wrong**: the check and the picker are in one service and one trigger function.

## 3. "My missions"

- **Chosen**: a toggle of the advanced search, compared on the server to the signed-in user.
- **Discarded**: a tab (tabs are the statuses); an assignee id sent by the browser.

## 4. Editing a done or cancelled mission

- **Chosen**: still allowed (phase, dates, assignee, description); client and quote frozen after `planned`.
- **Reason**: the done phases (handover → warranty → closed) are moved after the mission is done.
- **Impact if wrong**: one condition on the "Edit" action and one in the trigger.

## 5. Dates compared by day

- **Chosen**: "end before start" is compared on the calendar day in the business time zone.
- **Reason**: a start dated by the server at 2 p.m. and an end typed as that day would otherwise be refused.
