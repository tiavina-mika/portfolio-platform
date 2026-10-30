/** The generic label shown for a member nothing can name — no name, no number, no address. */
export const DEFAULT_DISPLAY_IDENTIFIER_FALLBACK = '—';

/** A phone number the way accounts store it: the dial code without its `+`, then the national number. */
export type DisplayPhone = {
  code?: string | null;
  number?: string | null;
};

/** What every screen has at hand about a member, whichever way it read them. */
export type DisplayIdentifierSource = {
  firstName?: string | null;
  lastName?: string | null;
  // a ticket keeps the number as one string, an account as its dial code and its national number
  phone?: DisplayPhone | string | null;
  email?: string | null;
};

/**
 * A stored phone number in its international form (`+261341234567`).
 * @param phone the stored number, possibly missing on an old or half-created account — or already a
 * single string, which is only trimmed
 * @returns the number with its `+`, or an empty string when there is no number to show
 */
export const toInternationalPhone = (phone?: DisplayPhone | string | null): string => {
  if (typeof phone === 'string') return phone.trim();

  const number = (phone?.number ?? '').trim();

  if (!number) return '';

  return `+${(phone?.code ?? '').replace(/^\+/, '').trim()}${number}`;
};

/**
 * The name of a member, last name first like everywhere else on the platform. Either part may be
 * missing: a first name is optional, and an account still being created has neither.
 * @returns the name, or an empty string when the member has none
 */
export const getDisplayName = (
  source?: Pick<DisplayIdentifierSource, 'firstName' | 'lastName'> | null
): string =>
  [source?.lastName, source?.firstName]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');

/**
 * How a screen names a member whose name it cannot take for granted. A member who signed up by
 * phone may have no email, and an account that is still signing up has no name yet, so a cell
 * reading only the name — or only the email — comes out empty or reads `undefined`.
 *
 * The order goes from the most human to the least: the name, then the phone number (the one
 * contact every account of this platform has, and what support dials), then the email, and only
 * then a generic label.
 * @param source whatever is known about the member
 * @param fallbackLabel what to show when nothing at all identifies them
 */
export const getDisplayIdentifier = (
  source?: DisplayIdentifierSource | null,
  fallbackLabel: string = DEFAULT_DISPLAY_IDENTIFIER_FALLBACK
): string => (
  getDisplayName(source) ||
  toInternationalPhone(source?.phone) ||
  (source?.email ?? '').trim() ||
  fallbackLabel
);

/**
 * The ways to reach a member that exist, phone first. Shown under the name, it is the list the
 * identifier falls back on: a member without an email simply has one line fewer, not a hole.
 * @returns the phone number and the email address that the member actually has
 */
export const getDisplayContacts = (
  source?: Pick<DisplayIdentifierSource, 'phone' | 'email'> | null
): string[] =>
  [toInternationalPhone(source?.phone), (source?.email ?? '').trim()].filter(Boolean);
