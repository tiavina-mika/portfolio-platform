/** the fields a back-office user writes on a mission; the status and the authors are the server's */
export const MISSION_EDITABLE_FIELDS = [
  'title', 'client', 'quote', 'assignee', 'phase', 'startDate', 'endDate', 'description',
] as const;

// the pointers among the editable fields, written from the ids the back-office sends
export const MISSION_POINTER_FIELDS = ['client', 'quote', 'assignee'] as const;

// once a mission left `planned` the work started for this client and this quote: they no longer change
export const MISSION_FROZEN_FIELDS = ['client', 'quote'] as const;

/** the columns the mission list and the edit dialog need (the dialog opens on the row already loaded) */
export const MISSION_LIST_FIELDS = [
  ...MISSION_EDITABLE_FIELDS, 'status', 'createdAt', 'updatedAt',
  // the pointed objects are read through their pointers, never copied: only what the list shows of them
  'client.name', 'client.email',
  'quote.number', 'quote.version', 'quote.title',
  'assignee.firstName', 'assignee.lastName', 'assignee.email',
];

// the pointers a mission is read with
export const MISSION_INCLUDED_POINTERS = ['client', 'quote', 'assignee'];

/** the columns a list may be ordered on; anything else falls back to the most recently changed */
export const MISSION_ORDER_FIELDS = ['title', 'startDate', 'endDate', 'createdAt', 'updatedAt'];

/** the most missions one page of the list may ask for */
export const MISSION_LIST_MAX_LIMIT = 100;

/*
 * the most roles, and the most users of one role, read to propose the teammates a mission can be given
 * to: far above a real team, so nobody is left out, and bounded so the call stays cheap
 */
export const MISSION_ASSIGNEE_ROLES_LIMIT = 100;
export const MISSION_ASSIGNEES_PER_ROLE_LIMIT = 200;
