/**
 * The form an e-mail address is stored and compared in: `Jean@X.com ` and `jean@x.com` reach the same
 * mailbox, so they must name one client.
 * @param email the address as typed
 */
export const normalizeClientEmail = (email: string): string => email.trim().toLowerCase();
