import { DEFAULT_COUNTRY } from '@shared/constants';
import { RequestStatusEnum } from '@shared/domain-types';
import { ProfileFieldEnum } from '@shared/types';

/**
 * The part of somebody else's profile `getUserProfile` always serves: counters and trust signals
 * the member does not choose an audience for. Anything absent here and from
 * `PROFILE_FIELD_COLUMNS` — mobile money numbers, the encrypted `mfa`/`verification` blobs, roles,
 * ban history — stays server-side, whatever the caller asks for: the function runs with the master
 * key, so an unfiltered `select` used to read any column of any account.
 */
export const PUBLIC_USER_PROFILE_FIELDS: string[] = [
  'objectId',
  'createdAt',
  'spokenLanguages',
  'stats',
  'rideStats',
  'requestStats',
  'emailVerified',
  'phoneVerified',
  'trustedDriver',
  /*
   * the badge the app renders on a public profile and on a search result. Missing from this list
   * until now, which is why the reliability card could not be shown to the passenger it is for:
   * `computeTrustedDriverBadge` writes `badges.trustedDriver`, not the legacy `trustedDriver` flag
   */
  'badges',
  'completedRidesThisMonth',
];

/**
 * The columns behind each profile field whose audience the member chooses (`profileVisibility`).
 * `getUserProfile` serves a column only when that field's visibility lets the caller see it: `all`
 * for anyone, `riders` for someone the member is travelling with (see `areTravellingTogether`
 * — the rule the leading carpooling platforms apply to a phone number), `self` for nobody else.
 */
export const PROFILE_FIELD_COLUMNS: Record<`${ProfileFieldEnum}`, string[]> = {
  photo: ['image'],
  name: ['firstName', 'lastName'],
  sex: ['sex'],
  birthday: ['birthday'],
  phone: ['phone'],
  email: ['email'],
  address: ['address'],
  aboutMe: ['aboutMe'],
};

/**
 * Booking statuses that count as "these two are travelling together" for the `riders` visibility
 * above. A pending or refused booking never unlocks a phone number.
 */
export const CONFIRMED_BOOKING_STATUSES = [
  RequestStatusEnum.CONFIRMED,
  RequestStatusEnum.COMPLETED,
  // an absence can be contested: both sides may still need to reach each other while it is examined
  RequestStatusEnum.NO_SHOW,
  RequestStatusEnum.CONTESTED_NO_SHOW,
];

/**
 * Fields a user may never write on their own account, even though `_User` is self-managed (the
 * ACL Parse writes at sign-up gives the owner write access to their own row, and the CLP has to
 * stay open enough for profile edits). They are all fed by server-side flows — trip counters,
 * verification state, moderation state, commission tier — and several of them decide how much
 * money the platform takes or whether the account is allowed to act at all, so a single
 * `PUT /parse/users/me` could otherwise wipe a cancellation history or drop a driver into the
 * cheapest commission bracket. Enforced in the `_User` beforeSave trigger.
 */
export const SERVER_MANAGED_USER_FIELDS: string[] = [
  /*
   * the sign-in identity: it only moves through the contact-change confirmation (a code sent to
   * the new value), which saves with the master key. Written from the profile, it would redirect
   * every notification to a third party while `emailVerified` stays true. Set at sign-up too, but
   * there the server derives them itself (see `resolveSignUpIdentity`).
   */
  'email',
  'username',
  // the country whose rules apply to the account: derived at sign-up, then changed by support only
  'country',
  // written through `updateNotificationPreferences`, which validates the shape against a schema
  'notificationPreferences',
  'rideStats',
  'sosAlertsCount',
  'requestStats',
  'stats',
  'completedRidesThisMonth',
  'lastCompletedRideMonth',
  'lastCompletedRideYear',
  'totalGain',
  'hasPublishedRide',
  'emailVerified',
  'phoneVerified',
  'trustedDriver',
  'trustedDriverSince',
  'banned',
  'bans',
  'bannedAt',
  'bannedBy',
  'suspendedUntil',
  'isSuspendedUntil',
  'suspension',
  'pendingPenalty',
  'penalties',
  'verification',
  'resetPasswordVerification',
  'stepUpVerification',
  'stepUpVerifiedAt',
  'contactChangeVerification',
  'payoutPhoneVerification',
  // the numbers the driver proved to control by a code: only a server write may add one
  'verifiedPayoutPhones',
  // why the sign-up code SMS did not go out — written by the server, read by the app
  'verificationSmsError',
  'passwordResetToken',
  // the SMS reset delay of an unused account and the sign-in date it is judged on
  'passwordResetDelay',
  'lastLoginAt',
  'mfa',
  'mfaEnabled',
  'mfaBackupCodes',
  'deleted',
  'deletedAt',
  'deletedBy',
  'seen',
  'seenAt',
  'seenBy',
  'roles',
  'platforms',
  'sexChangeCount',
  'birthdayChangeCount',
  'acceptedTermsAt',
];

/**
 * Cloud Functions a sign-up still waiting for its code may call: the confirmation itself. Parse
 * hands out a session at sign-up, before any code was typed, so everything else is refused until
 * one contact is confirmed.
 */
export const UNVERIFIED_ACCOUNT_ALLOWED_FUNCTIONS: string[] = ['verifyAccount', 'sendVerificationCode'];

/** The columns that make up the sign-in identity of an account, derived by the server at sign-up. */
export const SIGN_UP_IDENTITY_FIELDS: string[] = ['email', 'username'];

/**
 * Columns Parse Server strips from every `_User` row returned to a client — the REST class API
 * (`GET /parse/users`) and LiveQuery events included, not just the Cloud Functions. `_User` is
 * readable by any signed-in account (see `AUTHENTICATED_READABLE_CLASSES`), so without this a
 * mobile user could page through `/parse/users` and collect every phone number and mobile money
 * number on the platform. Parse only hides `email` by default.
 *
 * The owner's own row is filtered too (`protectedFieldsOwnerExempt: false`), so the app reads the
 * signed-in user's own contact details through `Parse.User.current()`/`me` rather than a query.
 */
export const USER_PROTECTED_FIELDS: string[] = [
  'email',
  // a phone-signup account's username IS its number (`+261…`), and an email account's is its email
  'username',
  'phone',
  'paymentPhones',
  'verifiedPayoutPhones',
  // someone else's number, who has no account here and never agreed to be listed
  'emergencyContact',
  'mfa',
  'mfaBackupCodes',
  'verification',
  'resetPasswordVerification',
  'stepUpVerification',
  'contactChangeVerification',
  'payoutPhoneVerification',
  'passwordResetToken',
  'passwordResetDelay',
  // when someone last signed in is not for other members to read
  'lastLoginAt',
  'authData',
  'birthday',
  'emailBefore',
  'usernameBefore',
  'firstNameBefore',
  'lastNameBefore',
  'phoneBefore',
  'deletionReason',
  'bans',
  'penalties',
  // why an account was suspended is a moderation decision: its holder reads it, nobody else does
  'suspension',
];

/**
 * The default country's dial code as phone numbers store it: bare, without the '+'. What a number
 * typed with no dial code is read with — the website's contact form, a phone search in the
 * back-office. Which numbers a text can reach is decided by each country's SMS provider instead.
 */
export const DEFAULT_DIAL_CODE = DEFAULT_COUNTRY.dialCode.replace('+', '');

/**
 * A free-text search of digits, spaces and separators is read as a phone number as well as as text.
 * Accounts and tickets keep a number in a normalized form while an operator types it the way the
 * member quotes it (`034 12 345 67`, `+261 34 12 345 67`), so the search is made on the bare
 * national digits.
 */
export const PHONE_SEARCH_PATTERN = /^[\d\s+\-.()]+$/;

/** Fewer digits than this is a reference or a fragment, not a number worth a phone match. */
export const PHONE_SEARCH_MIN_DIGITS = 6;

/**
 * Written in the `details` of a lifted suspension's moderation log row when the fine was written
 * off with it. A bare marker, not a sentence: it is what tells a lifting that cost the platform
 * money from one that only ended a suspension. The agent's wording goes in `reason`, the amount
 * in the driver's penalty history.
 */
export const PENALTY_CLEARED_DETAILS = 'penalty_cleared';

/** The back-office audit trail of one member: rows shown by default, and the most one call returns. */
export const USER_AUDIT_TRAIL_DEFAULT_LIMIT = 20;
export const USER_AUDIT_TRAIL_MAX_LIMIT = 100;

/**
 * The columns the back-office user page reads off `_User` (`getUser`). An explicit list because
 * the function runs with the master key: without it every column went to the browser, the
 * encrypted MFA secret, its backup codes and the pending verification codes included. `mfa` is
 * read whole — MongoDB does not narrow an object column to some of its keys through Parse — and
 * cut down to the two keys the page shows before it leaves the server (`getUserDetailsById`).
 */
export const USER_DETAILS_FIELDS: string[] = [
  // profile
  'username', 'email', 'firstName', 'lastName', 'phone', 'image', 'aboutMe', 'birthday', 'sex', 'address',
  'locale', 'spokenLanguages', 'paymentPhones', 'emergencyContact', 'profileVisibility', 'country',
  'sexChangeCount', 'lastSexChangeAt', 'birthdayChangeCount', 'lastBirthdayChangeAt',
  // account and access
  'platform', 'platforms', 'fromBO', 'registerStep', 'emailVerified', 'phoneVerified', 'isOnline',
  'acceptedTermsAt', 'mfa',
  // the member's own switches (fallback text, e-mail, push…), shown read-only so the support can explain a missing text
  'notificationPreferences',
  // activity and trust
  'stats', 'rideStats', 'requestStats', 'rating', 'trustedDriver', 'trustedDriverSince',
  'completedRidesThisMonth', 'totalGain', 'sosAlertsCount',
  // moderation
  'banned', 'bans', 'isSuspendedUntil', 'suspension', 'pendingPenalty', 'lastCancellations',
  // record traceability
  'createdAt', 'updatedAt', 'seen', 'seenAt', 'lastSeenAt', 'seenCount', 'unseenAt',
  'deleted', 'deletedAt', 'deletionReason',
];

/**
 * The pointers to other accounts the user page may ask `getUser` to include (who created, edited,
 * deleted or opened the record), and the only columns read from each: an included account would
 * otherwise come with its own MFA secret and verification codes.
 */
export const USER_DETAILS_POINTER_FIELDS: string[] = [
  'createdBy', 'updatedBy', 'deletedBy', 'seenBy', 'lastSeenBy', 'unseenBy',
];
export const USER_DETAILS_POINTER_SUBFIELDS: string[] = ['firstName', 'lastName', 'email', 'image'];

/** How many numbers a driver can be paid on — enough for a few operators, too few to farm texts */
export const MAX_VERIFIED_PAYOUT_PHONES = 5;

/** Back-office path of a member's page (`<server>/<path>/<userId>`), linked from the staff alerts. */
export const USER_BO_PATH = 'utilisateurs';
