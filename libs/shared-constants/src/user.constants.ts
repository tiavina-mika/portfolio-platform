/**
 * Minimum age (in years) required to create an account — the platform involves in-person
 * carpooling with strangers, so age is enforced at sign-up.
 */
export const MINIMUM_AGE = 18;

/**
 * Current version of the terms of service / privacy policy presented at sign-up.
 * Stored on the user as `consentVersion` (RGPD art. 7 proof of consent) — bump this when the
 * terms change so consent can be tracked against the version the user actually accepted.
 */
export const CONSENT_VERSION = '1.0';

/**
 * Audience of each profile field until the member picks one. Only what helps someone decide to
 * travel with a stranger is public; the phone waits for a confirmed trip; the rest stays private.
 * The age is private for now — reopen it if age-based trip preferences ever arrive.
 * Values mirror `ProfileVisibilityEnum` (plain strings: this package does not depend on the types one).
 */
export const DEFAULT_PROFILE_VISIBILITY = {
  photo: 'all',
  name: 'all',
  sex: 'all',
  birthday: 'self',
  phone: 'riders',
  email: 'self',
  address: 'self',
  aboutMe: 'all',
} as const;

/**
 * Profile fields whose audience is a product rule, not a member's choice: they always read
 * `DEFAULT_PROFILE_VISIBILITY`. Photo and name identify who you travel with, the phone is only
 * useful once a trip is confirmed, and the email and home address are contact data never exposed
 * to other members. The age stays adjustable: what is shared is the age in years, never the date.
 */
export const FIXED_VISIBILITY_PROFILE_FIELDS = ['photo', 'name', 'phone', 'email', 'address'] as const;

/** Longest name accepted for an emergency contact — the same cap as a first or last name. */
export const EMERGENCY_CONTACT_NAME_MAX_LENGTH = 112;
