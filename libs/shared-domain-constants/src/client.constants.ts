/*
 * the longest value each field of an Aldaron client may hold: the back-office form refuses it before the
 * server does, so a pasted document is never stored as a name
 */
export const CLIENT_NAME_MAX_LENGTH = 200;
export const CLIENT_EMAIL_MAX_LENGTH = 254;
export const CLIENT_PHONE_MAX_LENGTH = 40;
export const CLIENT_ADDRESS_LINE_MAX_LENGTH = 200;
export const CLIENT_TAX_ID_MAX_LENGTH = 60;
export const CLIENT_NOTES_MAX_LENGTH = 5000;
