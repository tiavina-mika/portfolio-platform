import { DEFAULT_COUNTRY } from './country.constants';

/**
 * Mobile operators the support team has a line with, in the order the lines are offered — the
 * default country's, the only one the apps run in today.
 */
export const SUPPORT_PHONE_OPERATORS = DEFAULT_COUNTRY.support.phoneOperators;

/** Brand name of each operator, shown as is in every language (a brand is not translated) */
export const SUPPORT_PHONE_OPERATOR_LABELS: Record<(typeof SUPPORT_PHONE_OPERATORS)[number], string> = {
  yas: 'Yas',
  airtel: 'Airtel',
  orange: 'Orange',
};
