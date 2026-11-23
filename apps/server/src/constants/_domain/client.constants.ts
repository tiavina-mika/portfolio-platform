/** the fields a back-office user writes on a client; the status and the authors are set by the server */
export const CLIENT_EDITABLE_FIELDS = [
  'name', 'kind', 'email', 'phone', 'address', 'taxId', 'notes',
] as const;

/** the columns the client list and the edit dialog need (the dialog opens on the row already loaded) */
export const CLIENT_LIST_FIELDS = [
  ...CLIENT_EDITABLE_FIELDS, 'status', 'createdAt', 'updatedAt',
];

/** the columns a list may be ordered on; anything else falls back to the most recently changed */
export const CLIENT_ORDER_FIELDS = ['name', 'email', 'createdAt', 'updatedAt'];

/** the most clients one page of the list may ask for */
export const CLIENT_LIST_MAX_LIMIT = 100;
