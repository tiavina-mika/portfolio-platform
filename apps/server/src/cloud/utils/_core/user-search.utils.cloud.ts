import { toPhoneSearchDigits } from '@/utils/_core/phone.utils';

/**
 * The extra branch an account search adds when the text typed looks like a phone number. A member
 * who signed up by phone has no email, and a name is often not yet filled in: the number is the one
 * thing support has in hand, in whatever form the member quoted it (`034…`, `+261…`, `261…`).
 *
 * It is a prefix match on the stored national number rather than a free regex, so it can walk the
 * `phone.number` index instead of reading every account — which is also why a fragment shorter than
 * a few digits is not treated as a number at all.
 * @param text what the operator typed in a search box
 * @returns one query to add to the `Parse.Query.or(...)` of the account search, or none when the text
 * is not a phone number
 */
export const getUserPhoneSearchQueries = (text: string): Parse.Query<Parse.User>[] => {
  const digits = toPhoneSearchDigits(text);

  return digits ? [new Parse.Query(Parse.User).startsWith('phone.number', digits)] : [];
};
