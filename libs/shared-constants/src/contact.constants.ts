/** Longest message a contact form submission may carry. */
export const CONTACT_MESSAGE_MAX_LENGTH = 1000;

/** Longest phone number a contact form submission may carry, separators included. */
export const CONTACT_PHONE_MAX_LENGTH = 30;

/** A phone number as a person writes it: an optional leading +, digits and common separators. */
export const CONTACT_PHONE_PATTERN = /^\+?[\d\s().-]{6,30}$/;
