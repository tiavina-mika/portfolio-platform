import { SUPPORT_PHONE_OPERATORS } from '@shared/constants';

export type SupportPhoneOperator = (typeof SUPPORT_PHONE_OPERATORS)[number];

/** One line of the support team: the number to call and the operator network it belongs to */
export type SupportPhoneContact = {
  operator: SupportPhoneOperator;
  phoneNumber: string;
};

/**
 * Support lines actually configured, in the order of `SUPPORT_PHONE_OPERATORS`. An operator whose
 * number is unset or blank is left out: the real lines are an operational detail set per
 * environment, so a missing one must hide its action rather than offer a dead link.
 * @param numbers number of each operator, as read from the environment
 */
export const buildSupportPhoneContacts = (
  numbers: Partial<Record<SupportPhoneOperator, string | undefined>>,
): SupportPhoneContact[] => SUPPORT_PHONE_OPERATORS.flatMap((operator) => {
  const phoneNumber = numbers[operator]?.trim();

  return phoneNumber ? [{ operator, phoneNumber }] : [];
});

/**
 * `tel:` link of a number written for humans, or `undefined` when it holds no digit — the caller
 * then has no phone action to offer. Spaces and dashes are dropped: a dialer only reads digits
 * and '+'.
 */
export const getPhoneDialUrl = (phoneNumber: string): string | undefined => {
  const dialable = phoneNumber.replace(/[^\d+]/g, '');

  return dialable ? `tel:${dialable}` : undefined;
};
