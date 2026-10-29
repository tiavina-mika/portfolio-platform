import {
  APP_NAME, DEFAULT_COUNTRY, DEFAULT_ROLES, HIGHEST_LEVEL_ROLES, LANGUAGE_CODES,
  LIVE_QUERY_SUBSCRIBABLE_CLASSES,
} from '@shared/constants';
import { CurrencyEnum } from '@shared/types';

import type { ReportReason, ReportStatus } from '@/types/report.type';

import { EnvEnum } from '@/types/app.type';
import { ReportReasonEnum, ReportStatusEnum } from '@/types/report.type';

export {
  APP_NAME, DEFAULT_COUNTRY, DEFAULT_ROLES, HIGHEST_LEVEL_ROLES,
};


/*
 * ---------------------------------------------- //
 * ------------- Force environment -------------- //
 * ---------------------------------------------- //
 */
export const FORCE_PROD = false; // test the prod env in local
export const FORCE_PREPROD = false; // test the prod env in local
/**
 * use to use real isolated temporary database (test)
 * @important use "test" database name before setting this to true
 * @NOTE delete the database after use
 * @NOTE it's not jest test, it's real test with the application running
 * @NOTE it's mainly used to populate the database with data
 */
export const FORCE_TEST = false;

/*
 * ---------------------------------------------- //
 * ----------- check the environment ------------ //
 * ---------------------------------------------- //
 */
export const IS_LOCAL = process.env.NODE_ENV === EnvEnum.DEV;
// global.IS_TEST is defined in jest.setup.ts for testing (generally node env suffice)
export const IS_TEST = process.env.NODE_ENV === EnvEnum.TEST || !!global.IS_TEST || (IS_LOCAL && FORCE_TEST);
export const IS_PROD = process.env.NODE_ENV === EnvEnum.PROD;
export const IS_PREPROD = process.env.NODE_ENV === EnvEnum.PREPROD;
/*
 * K_SERVICE is injected automatically by the Cloud Run/Knative container runtime — never set
 * locally or on the current host (onrender).
 */
export const IS_CLOUD_RUN = !!process.env.K_SERVICE;
/*
 * set only by the E2E runner (apps/e2e), on top of NODE_ENV=test: opens CORS to its dedicated
 * ports, records e-mails and SMS instead of sending them, and registers the e2e* seeding functions.
 * Tied to the test environment so a stray E2E=true on a deployed server can never open any of it.
 */
export const IS_E2E = process.env.E2E === 'true' && process.env.NODE_ENV === EnvEnum.TEST;
/*
 * Jest verifies a new account's email or phone on creation, so it never needs a code. An E2E run
 * goes through the real code instead (read back from the outbox): typing it is the step a member
 * actually does, and the one worth covering end to end.
 */
/*
 * A dedicated Jest run that exercises the real confirmation (sign-up, code, `verifyAccount`) sets
 * REAL_SIGN_UP_VERIFICATION=true: the constant is read at import, so it needs its own process.
 */
export const SKIP_SIGN_UP_VERIFICATION =
  IS_TEST && !IS_E2E && process.env.REAL_SIGN_UP_VERIFICATION !== 'true';

/*
 * The one way to stop charging passengers without a redeployment.
 *
 * Under instant booking the debit is on the critical path of every single booking: there is no
 * longer a human step between the passenger paying and their seat being theirs, so a failure on
 * the money path is not an isolated bad click, it is every booking of the night. This closes the
 * booking tunnel at its entrance — the seats are never taken, nothing is debited, and the
 * passenger is told the ride cannot be booked right now.
 *
 * It is an operations lever, not a product option: no member ever sees it, no driver can set it,
 * and it is off by default. Set BOOKINGS_CLOSED=true on the server to pull it.
 */
export const ARE_BOOKINGS_CLOSED = process.env.BOOKINGS_CLOSED === 'true';

/*
 * ---------------------------------------------- //
 * ------------ Parse Server options ------------ //
 * ---------------------------------------------- //
 */
export const USE_MASTER_KEY = { useMasterKey: true };
export const WITHOUT_CASCADE_SAVE = { cascadeSave: false };
export const USE_MASTER_KEY_WITHOUT_CASCADE_SAVE = { useMasterKey: true, cascadeSave: false };
export const USE_READ_PREFERENCE = { readPreference: 'SECONDARY' };

export const DEFAULT_CURRENCY = DEFAULT_COUNTRY.currency as CurrencyEnum;

export const DEFAULT_QUERY_LIMIT = 50;

/**
 * server-side hard cap for caller-provided `limit` params on BO list endpoints (getRides,
 * getRequests…) — above the BO's own highest `rowsPerPageOptions` value (75) so legitimate
 * pagination is unaffected, but callers can't bypass pagination entirely with an arbitrary limit
 */
export const MAX_QUERY_LIMIT = 100;

/**
 * per-entity cap for the BO's cross-entity global search (globalSearch Cloud Function) —
 * kept small since results are rendered in a dropdown, not a paginated list
 */
export const GLOBAL_SEARCH_RESULT_LIMIT_PER_ENTITY = 5;

/**
 * Caps the BO bulk-delete `destroyObjects` query.
 * The result set is already bounded by the caller-provided `ids` array,
 * but the previous 10000 cap was high enough to allow a near-full collection scan.
 */
export const MAX_DESTROY_OBJECTS_LIMIT = 500;

/**
 * Caps generic BO bulk-update Cloud Functions (`bulkToggleEntitiesSeen`,
 * `bulkSetNotificationsReceiverSeen`, `bulkSoftDeleteNotifications`).
 * The result set is already bounded by the caller-provided `ids` array — this only
 * guards against an accidentally huge selection.
 */
export const MAX_BULK_UPDATE_LIMIT = 500;

/**
 * Caps the "mark the whole collection as seen" Cloud Function (`markAllEntitiesSeen`). Unlike the
 * bulk toggle above, its result set is bounded by nothing the caller passes — it clears whatever
 * is left unseen — so this is the only thing standing between one click and a full-collection
 * write. A backlog deeper than this takes a second click, which is the right trade for a queue
 * nobody has emptied in months.
 */
export const MAX_MARK_ALL_SEEN_LIMIT = 500;

/**
 * The boolean the back-office queues are built on: `false` is "still in the queue", and it is the
 * one boolean `setBooleanFields` keeps a history for, with a first/last/count triplet rather than
 * a plain At/By pair.
 */
export const SEEN_FIELD = 'seen';

/**
 * Save-context key naming the admin a master-key write is made on behalf of. A `saveAll` fired
 * from a Cloud Function reaches the triggers with no `request.user`, so without this the audit
 * fields those triggers write (`seenBy`, `deletedBy`…) would be left empty on every bulk action.
 */
export const ACTING_USER_CONTEXT_KEY = 'actingUserId';

/**
 * Google's reCAPTCHA v3 answers with a score rather than a verdict; below this the submission is
 * treated as automated. Same threshold the website used before the check moved server-side, so a
 * real visitor sees no change.
 */
export const RECAPTCHA_SCORE_THRESHOLD = 0.5;
export const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/** Error thrown by the public contact/newsletter functions, mapped to a message by the website. */
export const RECAPTCHA_VERIFICATION_FAILED = 'recaptchaVerificationFailed';

export const MAX_VERIFICATION_ATTEMPTS = 5;

export const VERIFICATION_CODE_COOLDOWN_SECONDS = 60;
export const VERIFICATION_CODE_DAILY_LIMIT = 5;

/**
 * Verification SMS one phone number may be sent per day, whatever the flow and whoever asks. The
 * per-account limit above does not protect the number: a script creating one throw-away account
 * per attempt gets a fresh allowance each time, while every text costs the platform real money and
 * lands on a handset that never asked for it.
 */
export const VERIFICATION_SMS_DAILY_LIMIT_PER_PHONE = 5;

/**
 * Verification SMS one IP address may trigger per day. Much wider than the per-number cap: mobile
 * operators put many handsets behind one shared address, and a family or an office signs several
 * people up from the same connection.
 */
export const VERIFICATION_SMS_DAILY_LIMIT_PER_IP = 30;

/**
 * Verification SMS the whole platform may send per day: a ceiling no single caller can raise. The
 * per-number and per-IP caps above do not stop an attacker who rotates both, and the first sign of
 * that would otherwise be "no credit left". Raise it with the sign-up volume expected at launch.
 */
export const VERIFICATION_SMS_DAILY_LIMIT_GLOBAL = 2000;

/** Reverse proxies between the Internet and the app whose forwarded address is believed (Cloud Run: 1). */
export const TRUST_PROXY_HOPS = 1;

/** The error code MMSDuck answers a text with (HTTP 402) when the account has no credit left. */
export const SMS_INSUFFICIENT_CREDITS_CODE = 'insufficient_credits';

/**
 * The code a text is refused with, before reaching any provider, when no provider serves the
 * country of the number — recorded on the recipient like a provider's own refusal.
 */
export const SMS_UNREACHABLE_COUNTRY_CODE = 'unreachable_country';

/**
 * Minimum time between two "SMS credit exhausted" e-mails to the staff. Every refused text raises
 * the alert, and a burst of sign-ups would otherwise send one e-mail per attempt.
 */
export const SMS_OUT_OF_CREDIT_ALERT_INTERVAL_SECONDS = 6 * 60 * 60;

/**
 * Shape of the Android app hash the SMS Retriever API looks for at the end of a verification SMS:
 * 11 base64 characters. Anything else in the env var is a copy-paste mistake — appending it would
 * only add noise to every SMS without ever triggering the automatic read.
 */
export const SMS_RETRIEVER_APP_HASH_PATTERN = /^[A-Za-z0-9+/]{11}$/;

/**
 * The most characters a fixed SMS template may reach once its variables are filled with the longest
 * realistic values. A GSM-7 segment holds 160 characters and an operator bills each extra segment:
 * 20 are kept free for the sender prefix the provider prepends and for the Android app hash
 * appended to a verification code (a blank line, then its 11 characters). A character outside the
 * GSM-7 set (a curly apostrophe, for instance) turns the whole message into UCS-2, 70 characters
 * per segment, so the templates stay inside that set as well.
 */
export const SMS_SEGMENT_BUDGET_CHARS = 140;

/** A device name comes straight from the phone and has no bound: cut where it is quoted in an SMS. */
export const SMS_DEVICE_NAME_MAX_LENGTH = 30;

/**
 * How long a successful step-up verification (see stepUpVerification.service.cloud.ts) stays
 * valid before a sensitive action (e.g. deleteAccount) requires a fresh code again — a short
 * "sudo mode" window, not a standing re-auth.
 */
export const STEP_UP_VERIFICATION_VALIDITY_MINUTES = 10;

/**
 * Lifetime of the single-use token `verifyAccount` mints once a password-reset code is confirmed,
 * and which `resetPassword` then consumes. Short on purpose: it only has to survive the user
 * typing a new password on the very next screen.
 */
export const PASSWORD_RESET_TOKEN_VALIDITY_MINUTES = 15;

/**
 * How long an account must have gone without a sign-in before an SMS password reset on it is held
 * back. Past that, the phone number may well have been reassigned by the operator to someone who
 * never owned the account — a reset confirmed on that number is then the new holder's, not the
 * member's. Accounts signed in more recently see no difference.
 */
export const INACTIVE_ACCOUNT_THRESHOLD_DAYS = 180;

/**
 * The waiting period imposed on an SMS password reset for an inactive account (see
 * `INACTIVE_ACCOUNT_THRESHOLD_DAYS`). It is the window the original owner has to notice the alert
 * sent to their last device (and email) and sign in, which cancels the pending reset.
 */
export const RECYCLED_NUMBER_RESET_DELAY_HOURS = 72;

export const MFA_BACKUP_CODES_COUNT = 10;
export const MFA_MAX_VERIFICATION_ATTEMPTS = 5;

// how long the MFA stays locked after MFA_MAX_VERIFICATION_ATTEMPTS wrong codes
export const MFA_LOCK_DURATION_MINUTES = 15;

// TOTP codes change every 30 seconds (the default of authenticator apps)
export const MFA_TOTP_STEP_SECONDS = 30;

/**
 * Lifetime of the one-time token minted by `beforeLogin` when a user with MFA enabled submits a
 * correct password — the BO exchanges it for a real session via `verifyMfaLogin` once the TOTP/
 * backup code is confirmed. Short-lived since it carries no rights of its own but does prove the
 * password step already passed.
 */
export const MFA_CHALLENGE_TOKEN_TTL_SECONDS = 5 * 60;

/**
 * Number of days a BO invitation link stays valid before it must be resent.
 */
export const INVITATION_EXPIRY_DAYS = 7;

/**
 * Expiry for the system-generated bootstrap invitation sent to OWNERS_EMAILS. No admin exists
 * yet to resend it by hand if it expires, and nothing re-sends it automatically either (see
 * ensureOwnerInvitationsExist) — so the window must comfortably cover the gap between a first
 * deploy and the owner's first login, unlike the short-lived default above.
 */
export const OWNER_INVITATION_EXPIRY_DAYS = 90;

export const collections = {
  Article: 'Article',
  Newsletter: 'Newsletter',
  Page: 'Page',
  PageSection: 'PageSection',
  Category: 'Category',
  Contact: 'Contact',
  App: 'App',
  Ride: 'Ride',
  Request: 'Request',
  Vehicle: 'Vehicle',
  Notification: 'Notification',
  Payment: 'Payment',
  User: '_User',
  Rating: 'Rating',
  Report: 'Report',
  UserAuditLog: 'UserAuditLog',
  RoleAuditLog: 'RoleAuditLog',
  SessionAuditLog: 'SessionAuditLog',
  UserSession: 'UserSession',
  PushReceipt: 'PushReceipt',
  ContentVersion: 'ContentVersion',
  Invitation: 'Invitation',
  ImpersonationSession: 'ImpersonationSession',
  TicketMessage: 'TicketMessage',
  MfaAuditLog: 'MfaAuditLog',
  UserModerationLog: 'UserModerationLog',
  PenaltyLog: 'PenaltyLog',
  NotificationResend: 'NotificationResend',
  RideShare: 'RideShare',
  SosAlert: 'SosAlert',
  Counter: 'Counter',
};

/**
 * Classes that publish create/update/delete events into the LiveQuery pub/sub, so a
 * `Parse.Query.subscribe()` from the BO gets pushed the "new items" badge changes instead of
 * relying only on a periodic re-fetch (see the `liveQuery` option in `index.ts`).
 *
 * Deliberately the same list the client subscribes to (`LIVE_QUERY_SUBSCRIBABLE_CLASSES`) rather
 * than every class the badges track: publishing a class no session can be pushed events for costs
 * a pub/sub message per save and buys nothing, and subscribing to a class that does not publish
 * fires nothing. The two lists only ever make sense equal, so they are one list — see that
 * constant for why a class with role-scoped reads or read pointer permissions cannot be pushed at
 * all. Every other badge in `NOTIFICATION_COLLECTIONS` (apps/bo) is polled instead.
 */
export const LIVE_QUERY_CLASS_NAMES = LIVE_QUERY_SUBSCRIBABLE_CLASSES;

/**
 * Impersonation ("login as") sessions must stay short-lived and non-renewable.
 */
export const IMPERSONATION_SESSION_TTL_MINUTES = 30;

/**
 * BO "ui" right gating the impersonation feature — must match apps/bo's
 * `UIRoleEnum.IMPERSONATION` (apps/bo/src/types/_core/role.type.ts)
 */
export const IMPERSONATION_UI_RIGHT = 'impersonation';

/**
 * Number of distinct members with an unresolved report on the same target before notifying admins.
 */
export const REPORT_ADMIN_NOTIFICATION_THRESHOLD = 3;

/**
 * Number of distinct members with an unresolved report on the same target before applying a
 * preventive suspension. Distinct authors, not reports: one member repeating the same report every
 * day must not be able to suspend someone alone.
 */
export const REPORT_AUTO_SUSPENSION_THRESHOLD = 5;

/**
 * Duration of the preventive suspension applied when REPORT_AUTO_SUSPENSION_THRESHOLD is reached.
 */
export const REPORT_AUTO_SUSPENSION_DAYS = 7;

/**
 * Window during which a user cannot report the same target twice.
 */
export const REPORT_DUPLICATE_WINDOW_HOURS = 24;

/**
 * Reports a member may file per window (all targets together). Generous for honest use, tight enough
 * to stop a script flooding the moderation queue.
 */
export const REPORT_RATE_LIMIT_PER_USER = 10;
/**
 * Most open reports read to count the distinct members behind a target's complaints. Far above the
 * suspension threshold, so reaching it means the threshold was crossed long ago.
 */
export const UNRESOLVED_REPORTS_SCAN_LIMIT = 200;
export const REPORT_RATE_LIMIT_WINDOW = '1 h';
export const REPORT_RATE_LIMIT_PREFIX = 'ratelimit:createReport';

/**
 * Report statuses that still owe someone a decision. Grouped here rather than redeclared next to
 * each query that needs them: the ride list, the review moderation screen and the report queue all
 * ask the same question of a report, and a list that drifted from the others would silently show a
 * different backlog than the one the operator is being told to work through.
 */
export const OPEN_REPORT_STATUSES: ReportStatus[] = [
  ReportStatusEnum.PENDING,
  ReportStatusEnum.UNDER_REVIEW,
];

/** Back-office path of the report queue (`<server>/<path>`), linked from the staff alerts. */
export const REPORT_BO_PATH = 'signalements';

/**
 * Reasons that touch someone's physical safety or money rather than the quality of a piece of
 * content. They set the order the report queue opens in and drive the "handle first" counter, so
 * they are a single list here rather than a judgement made again at each call site.
 */
export const URGENT_REPORT_REASONS: ReportReason[] = [
  ReportReasonEnum.HARASSMENT,
  ReportReasonEnum.DANGEROUS_DRIVING,
  ReportReasonEnum.FRAUD,
];

/**
 * How many rows each list of the back-office dashboard carries. The dashboard is read at a glance,
 * not worked through: an alert card names the few latest items and links to the full queue, and the
 * recent activity columns stay short enough for the three of them to sit side by side.
 */
export const DASHBOARD_ALERT_ROWS_LIMIT = 3;
export const DASHBOARD_RECENT_ROWS_LIMIT = 4;

/**
 * Duration of the suspension a back-office operator applies from a report file. Same length as the
 * automatic one so a target does not get a longer or shorter ban depending on whether a human or
 * the threshold rule reached the decision.
 */
export const REPORT_MANUAL_SUSPENSION_DAYS = REPORT_AUTO_SUSPENSION_DAYS;

/**
 * The reasons a review can actually be reported for. The mobile report dialog offers exactly
 * these on a review, so the back-office filter that narrows the moderation list by reason offers
 * the same ones — a panel listing the others would be filters that can never match a row.
 */
export const RATING_REPORT_REASONS: ReportReason[] = [
  ReportReasonEnum.FAKE_REVIEW,
  ReportReasonEnum.INAPPROPRIATE_CONTENT,
  ReportReasonEnum.SPAM,
  ReportReasonEnum.HARASSMENT,
  ReportReasonEnum.PERSONAL_DATA,
  ReportReasonEnum.COERCED_REVIEW,
  ReportReasonEnum.OTHER,
];

/**
 * Duration of the suspension an operator applies to the author of a review from the moderation
 * list. Same length as the one reached from a report file, so the person receiving it gets the
 * same block whichever screen the decision was made on.
 */
export const RATING_AUTHOR_SUSPENSION_DAYS = REPORT_AUTO_SUSPENSION_DAYS;

/**
 * Default duration of a temporary ban when no explicit duration is provided.
 */
export const DEFAULT_BAN_DURATION_DAYS = 2;

/**
 * How many of the most recent bans stay on the `_User.bans` array. Older entries are dropped from the
 * account document so it cannot grow for ever; the complete history lives in `UserModerationLog`.
 */
export const MAX_BANS_KEPT_ON_USER = 10;

/**
 * How long a sign-up that never confirmed its email or phone is kept before being destroyed.
 * Such an account is unusable — every sign-in is refused by the `beforeLogin` trigger (the only
 * session it ever holds is the one Parse hands out at sign-up), and a phone one holds its number's
 * `username` hostage so the number's real owner can never sign up. Long enough that someone who started in
 * the evening and finished the next morning is never wiped mid-registration.
 */
export const UNVERIFIED_PHONE_SIGNUP_RETENTION_HOURS = 48;

/**
 * NOTE: it is also defined in /config/copyBuilds.js
 * so if changed here, change it there too
 */
export const BO_BUILD_FOLDERS = {
  preprod: 'clientBuild/bo/preprod',
  prod: 'clientBuild/bo/prod',
};

export const BO_BUILD_FOLDER = (process.env.NODE_ENV === 'production' || FORCE_PROD)
  ? BO_BUILD_FOLDERS.prod
  : BO_BUILD_FOLDERS.preprod;

/**
 * Local dev server ports for the web (Next.js) and BO (Vite) apps.
 * Used to build the CORS allowlist and the web client URL in local development.
 */
export const WEB_DEV_PORT = 9012;
export const BO_DEV_PORT = 5174;
/**
 * Local dev ports of the mobile app's WEB targets — Expo's own web build (`expo start --web`)
 * and its Storybook (`storybook dev -p 6007`).
 *
 * On a device the mobile app is a native client and sends no `Origin`, so CORS never applies to
 * it. Run in a browser it is an ordinary web origin like any other, and every call it makes to
 * this server is preflighted because of the `x-portfolio-key` header. Without these two entries
 * those calls are blocked, and the ride form silently loses the driver's current position and
 * its stop suggestions.
 */
export const MOBILE_WEB_DEV_PORT = 8081;
export const MOBILE_STORYBOOK_DEV_PORT = 6007;

export const LOCALES = LANGUAGE_CODES;
export const MAX_FILES_UPLOAD = 10;

/**
 * File uploads go through a dedicated multer route (files.route.ts), not this middleware,
 * so the JSON body limit only needs to cover regular API payloads.
 */
export const JSON_BODY_LIMIT = '5mb';

export const LOG_TOPIC = {
  PARSE_TRIGGER: 'PARSE_TRIGGER',
  PARSE_FUNCTION: 'PARSE_FUNCTION',
  SERVICE: 'SERVICE',
  CONTROLLER: 'CONTROLLER',
};

export const DISABLE_USER_ACCOUNT_CONFIRMATION = IS_LOCAL || IS_TEST;

/**
 * Whether the server refuses back-office functions to an OWNER / SUPER_ADMIN who has not enabled
 * MFA. Off in local and test so seeds, integration tests and E2E accounts keep working without an
 * authenticator app.
 */
export const ENFORCE_HIGHEST_ROLES_MFA = !IS_LOCAL && !IS_TEST;

export enum ERRORS {
  NOT_ENOUGH_BALANCE = 'Not enough balance',
  PAYMENT_FAILED = 'Payment failed',
  PAYER_PHONE_NOT_FOUND = 'Payer phone not found',
  RECEIVER_PHONE_NOT_FOUND = 'Receiver phone not found',
  PAYMENT_NOT_FOUND = 'Payment not found',
  PAYMENT_NOT_FAILED = 'Only a failed payment can be retried',
  PAYMENT_NOT_PENDING = 'Only a payment still waiting for the operator can be checked again',
  PAYMENT_NOT_SUCCESS = 'Only a successful payment can be reversed',
  PAYMENT_NOT_REFUNDABLE = 'Only a settled passenger collection can be refunded',
  PAYMENT_ALREADY_REFUNDED = 'This payment has already been refunded in full',
  /*
   * a booking still standing is paid out to its driver on the whole fare: refunding its collection
   * by hand would have the platform pay the same seat twice. It is cancelled instead.
   */
  PAYMENT_DRIVER_ALREADY_PAID = 'The driver of this booking was already paid for the ride: it can no longer be refunded by hand',
  /*
   * a payout only goes to a number the driver proved to control with a code: the ride stays waiting
   * for its payout until they confirm one, instead of sending money to an unproven number
   */
  PAYOUT_PHONE_NOT_VERIFIED = 'The payout number of this ride was never confirmed by its driver',
  PAYMENT_REFUND_AMOUNT_TOO_HIGH = 'A refund cannot exceed what is left of the payment',
  RECEIPT_NOT_AVAILABLE = 'Only a successful payment has a receipt',
  PAYMENT_CONFIRMATION_TIMEOUT = 'The payment was not confirmed in time',
  /*
   * the call to the operator never came back, so nothing tells which of its transactions this was:
   * support has to check the operator's statement before anything else is done with it
   */
  PAYMENT_OUTCOME_UNKNOWN = 'The operator never answered: check its statement before retrying',
  PAYMENT_AMOUNT_MISMATCH = 'The operator confirmed another amount than the one requested',
  /* the first attempt of a payment went through at the operator after all: sending it again would pay twice */
  PAYMENT_ALREADY_SETTLED_AT_OPERATOR = 'The first attempt of this payment went through at the operator',
  /* the first attempt of a payment is still waiting at the operator: sending it again would pay twice */
  PAYMENT_STILL_PENDING_AT_OPERATOR = 'The first attempt of this payment is still waiting at the operator',
  /* another payout of the same ride went through, or is still waiting for its operator */
  PAYMENT_RIDE_ALREADY_PAID = 'This ride has already been paid to its driver',
  /*
   * the booking this collection was for is refused, expired or cancelled: paying it now would
   * debit a passenger who has no seat, and the money would answer to no booking
   */
  BOOKING_CLOSED_BOOK_AGAIN = 'This booking is closed: book the ride again instead of paying again',
  /* another refund of the same booking is already under way, or it has already been given back */
  REQUEST_REFUND_ALREADY_CLAIMED = 'This booking is already being refunded',
  /* nothing was ever collected for this booking, so there is no amount a refund could come out of */
  REQUEST_COLLECTION_NOT_FOUND = 'No settled collection found for this booking',
  REQUEST_NOT_FOUND = 'Booking not found',
  /* settled by someone else meanwhile, or never charged: neither confirming nor refunding applies */
  REQUEST_NOT_CHARGED_PENDING = 'This booking is not a charged booking waiting to be settled',
  /* the booking stays open and listed, so the refund can be tried again or the seat confirmed */
  REQUEST_REFUND_REFUSED = 'The operator refused the refund: the booking was left open',
  /* writing off a driver's debt gives up real revenue: nothing is erased without a recorded why */
  PENALTY_WRITE_OFF_REASON_REQUIRED = 'A reason is required to write off a driver penalty'
}

export const DISABLE_TRIGGERS_CONTEXT = {
  context: {
    disableBeforeSave: true,
    disableAfterSave: true,
  },
};

export const FROM_PROJECT = {
  MOBILE: 'mobile',
  BO: 'bo',
  WEB: 'web',
};

/**
 * The REST paths that check a credential, as Parse Server's own `rateLimit` option matches them —
 * relative to the `/parse` mount, since that is the form a `/parse/batch` sub-request is unpacked
 * into. Kept next to the Express `authRateLimiter` registrations in index.ts, which cover the same
 * endpoints for direct calls; both are needed, because a batch never reaches the Express layer.
 */
export const CREDENTIAL_RATE_LIMITED_PATHS = [
  '/login',
  '/users',
  '/functions/loginWithPhone',
  '/functions/loginWithEmail',
  '/functions/verifyMfaLogin',
  '/functions/generateMfaSecret',
  '/functions/confirmMfaEnrollment',
  '/functions/disableMfa',
  '/functions/regenerateMfaBackupCodes',
  '/functions/verifyBOInvitationToken',
  '/functions/verifyAccount',
  '/functions/sendVerificationCode',
  '/functions/sendResetPasswordVerificationCode',
  '/functions/resetPassword',
  '/functions/requestStepUpVerification',
  '/functions/verifyStepUpCode',
  '/functions/requestContactChange',
  '/functions/confirmContactChange',
];

/**
 * BO "ui" right gating the manual announcement broadcast — must match apps/bo's
 * `UIRoleEnum.BROADCAST` (apps/bo/src/types/_core/role.type.ts).
 *
 * Its own right rather than the `create` right on notifications: every domain of the platform
 * already creates notifications, while writing to the whole membership at once is a decision a
 * handful of people should be able to take.
 */
export const BROADCAST_UI_RIGHT = 'broadcast';

/**
 * BO "ui" right gating the Finance module — must match apps/bo's `UIRoleEnum.FINANCE`
 * (apps/bo/src/types/_core/role.type.ts).
 *
 * Kept independent from the `find` right on Payment on purpose: a role may be allowed to look up
 * an individual payment for support without seeing the platform's own retained revenue, its
 * drivers' outstanding debt or its reconciliation backlog.
 */
export const FINANCE_UI_RIGHT = 'finance';

/**
 * BO "ui" right gating the "Divers" migrations tab (data migration, recycle bin and orphaned
 * editor files purge) — must match apps/bo's `UIRoleEnum.MIGRATIONS`.
 *
 * These actions write in bulk or delete files for good, so the interface check that only hides
 * the tab is not enough: the Cloud Functions refuse a caller without it.
 */
export const MIGRATIONS_UI_RIGHT = 'migrations';

/**
 * BO "ui" right gating the "Divers" tests tab (test emails and SMS, mock batches) — must match
 * apps/bo's `UIRoleEnum.TESTS`. The test functions send real messages through the paid providers.
 */
export const TESTS_UI_RIGHT = 'tests';

/**
 * BO "ui" right gating the "Divers" cron tab (the status of the scheduled jobs) — must match apps/bo's
 * `UIRoleEnum.CRON`.
 */
export const CRON_UI_RIGHT = 'cron';

/**
 * BO "ui" right gating the overview statistics — must match apps/bo's `UIRoleEnum.STATISTICS`. The
 * per-domain statistics stay gated by the `find` right on their own collection.
 */
export const STATISTICS_UI_RIGHT = 'statistics';

/**
 * BO "ui" right letting a role manage the staff without holding a highest role: invite a colleague,
 * give or take back a post, read the roles journal — must match apps/bo's `UIRoleEnum.STAFF`.
 *
 * The owners and super-administrators are not employees and rarely open the back-office, so the
 * everyday staff work cannot wait for them. The right stays bounded: it never reaches a highest role
 * nor its holders, never the holder's own account, and only hands out a post that grants nothing the
 * holder does not hold already (see `isRoleWithinRights`).
 */
export const STAFF_UI_RIGHT = 'staff';
