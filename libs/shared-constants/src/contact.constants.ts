/** Longest message a contact form submission may carry. */
export const CONTACT_MESSAGE_MAX_LENGTH = 1000;

/** Longest phone number a contact form submission may carry, separators included. */
export const CONTACT_PHONE_MAX_LENGTH = 30;

/**
 * The labels that open the lines of a quote request message. The Aldaron site writes its form's answers
 * into the one message a contact has (`Product: …`, then `Estimate:` and the estimate on the next lines),
 * and the back-office reads that message back to prefill a quote: both sides use these labels, so the
 * reader never drifts from the writer.
 */
export const QUOTE_REQUEST_MESSAGE_LABELS = {
  product: 'Product',
  platforms: 'Platforms',
  brings: 'Brings',
  needs: 'Needs',
  estimate: 'Estimate',
} as const;

/** A phone number as a person writes it: an optional leading +, digits and common separators. */
export const CONTACT_PHONE_PATTERN = /^\+?[\d\s().-]{6,30}$/;
