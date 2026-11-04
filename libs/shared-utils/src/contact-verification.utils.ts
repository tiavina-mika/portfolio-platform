/** The contact facts of an account that decide whether it can be trusted. */
export type ContactVerificationSource = {
  email?: string | null;
  phone?: { number?: string | null } | null;
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
};

/**
 * Whether the account has proven every way to reach it that it has. A member who signed up by
 * phone has no email and is verified once the number is confirmed; one who signed up by email is
 * verified once the email and the number they added are both confirmed. Counting the email of an
 * account that has none would keep every phone member "unverified" for ever.
 *
 * An account with no contact at all proves nothing, so it is not verified.
 * @param source the contacts of the account and whether each was confirmed
 */
export const hasVerifiedContacts = (source?: ContactVerificationSource | null): boolean => {
  const hasEmail = !!source?.email;
  const hasPhone = !!source?.phone?.number;

  if (!hasEmail && !hasPhone) return false;

  return (!hasEmail || !!source?.emailVerified) && (!hasPhone || !!source?.phoneVerified);
};
