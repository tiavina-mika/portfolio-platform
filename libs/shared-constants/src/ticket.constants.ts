export const TICKET_ATTACHMENT_MAX_COUNT = 5;

/** Longest message a support request may carry — same limit as the app's text field. */
export const CONTACT_MESSAGE_MAX_LENGTH = 1000;

/**
 * The most of an agent's reply a text carries (two SMS segments). The reply to a requester with a
 * phone number and no email leaves by SMS, and a long answer is cut rather than paid for segment
 * after segment — the back-office tells the agent so before they write.
 */
export const TICKET_REPLY_SMS_MAX_LENGTH = 300;
