import { DEFAULT_PROFILE_VISIBILITY, FIXED_VISIBILITY_PROFILE_FIELDS } from '@shared/constants';
import {
  ProfileFieldEnum, type ProfileVisibility, ProfileVisibilityEnum,
} from '@shared/types';

import type { ActorSnapshot, IBan } from '@/types/user.type';

import { MAX_BANS_KEPT_ON_USER } from '@/constants/_core/constants';
import { PROFILE_FIELD_COLUMNS } from '@/constants/_core/user.constants';
import { RegisterStepEnum } from '@/types/user.type';

export const getOwnersEmails = () => (process.env.OWNERS_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/** Whether an email is on the owners allowlist (`OWNERS_EMAILS`), however either side is cased. */
export const isOwnerEmail = (email?: string | null): boolean => {
  if (!email) return false;

  const normalized = email.trim().toLowerCase();

  return getOwnersEmails().some((ownerEmail) => ownerEmail.toLowerCase() === normalized);
};

/**
 * Whether an account has confirmed no contact detail at all: one of its flags is explicitly
 * `false` and none is `true`. A very old account never got the flags (`undefined`) and is not
 * treated as unverified — it predates the check, it was never asked to confirm anything.
 */
export const hasNoVerifiedContact = (
  { emailVerified, phoneVerified }: { emailVerified?: boolean; phoneVerified?: boolean }
): boolean => {
  if (emailVerified || phoneVerified) return false;

  return emailVerified === false || phoneVerified === false;
};

export const getAdminEmailSender = () => process.env.ADMIN_EMAIL_SENDER;

/**
 * closed list of Brevo-verified sender addresses selectable from the BO "test emails" tool —
 * never a free-text field, since Brevo silently rejects (or misroutes) a sender whose domain
 * isn't SPF/DKIM-authenticated on the account. Extend this array as more senders get verified
 * in Brevo. Computed lazily (not a module-level constant) because it depends on an env var that
 * is only loaded by dotenv once the server starts — a top-level constant would freeze it as
 * empty, since ESM imports resolve before dotenv.config() runs
 */
export const getAllowedTestEmailSenders = (): string[] => [getAdminEmailSender()].filter(Boolean) as string[];

export const formatFullName = (firstName?: string, lastName?: string): string =>
  [lastName, firstName].filter(Boolean).join(' ');

const isProfileVisibilityFixed = (field: `${ProfileFieldEnum}`): boolean =>
  (FIXED_VISIBILITY_PROFILE_FIELDS as readonly string[]).includes(field);

/**
 * The audience of one profile field: the default one when the member never picked it, and always
 * the default one for a field whose audience is fixed, whatever is stored.
 */
export const getProfileFieldVisibility = (
  visibility: ProfileVisibility | undefined,
  field: `${ProfileFieldEnum}`
): `${ProfileVisibilityEnum}` => {
  if (isProfileVisibilityFixed(field)) return DEFAULT_PROFILE_VISIBILITY[field];

  return visibility?.[field] ?? DEFAULT_PROFILE_VISIBILITY[field];
};

/**
 * The columns of a member's chosen-audience fields another account may read: every `all` field,
 * the `riders` ones only when the two are travelling together, never a `self` one.
 */
export const getReadableProfileColumns = (
  visibility: ProfileVisibility | undefined,
  isTravellingTogether: boolean
): string[] => Object.values(ProfileFieldEnum).flatMap((field) => {
  const fieldVisibility = getProfileFieldVisibility(visibility, field);
  const isReadable = fieldVisibility === ProfileVisibilityEnum.ALL ||
    (fieldVisibility === ProfileVisibilityEnum.RIDERS && isTravellingTogether);

  return isReadable ? PROFILE_FIELD_COLUMNS[field] : [];
});

/**
 * The ban history with a new ban added at the end, the oldest entries dropped past `MAX_BANS_KEPT_ON_USER`.
 * @param bans the account's ban history, oldest first
 * @param ban the ban just applied
 * @returns a new array, the input is not mutated
 */
export const appendBan = (bans: IBan[], ban: IBan): IBan[] => [...bans, ban].slice(-MAX_BANS_KEPT_ON_USER);

/**
 * The ban history with its latest entry closed: `liftedAt` now, and `liftedBy` when an
 * administrator lifted it by hand — its absence is what tells an expiry from a manual lift.
 * Only the latest entry can be in force, and an entry already closed is left as it was.
 * @param bans the account's ban history, oldest first
 * @param liftedBy who lifted it, when someone did
 * @returns a new array, the input is not mutated
 */
export const closeBanInForce = (bans: IBan[], liftedBy?: ActorSnapshot): IBan[] => {
  const latestBan = bans[bans.length - 1];

  if (!latestBan || latestBan.liftedAt) return bans;

  return [
    ...bans.slice(0, -1),
    { ...latestBan, liftedAt: new Date(), ...(liftedBy ? { liftedBy } : {}) },
  ];
};

/**
 * Where a sign-up goes once the contact it was waiting on is confirmed: the infos step, or the
 * picture step when the infos were filled before (a number added at the profile step is confirmed
 * after them). Anything else — a back-office account, a contact change from the profile, a
 * confirmation that is not the pending one — leaves the step alone.
 * @param pendingStep the step the account is on
 * @param confirmed the contact just confirmed
 * @param hasInfos whether the infos step was already completed (the last name is mandatory there)
 * @returns the new step, or `undefined` when the step does not move
 */
export const getRegisterStepAfterConfirmation = (
  pendingStep: RegisterStepEnum | undefined,
  confirmed: 'email' | 'phone',
  hasInfos: boolean
): RegisterStepEnum | undefined => {
  const isWaitingForThis = (confirmed === 'email' && pendingStep === RegisterStepEnum.VERIFY_EMAIL) ||
    (confirmed === 'phone' && pendingStep === RegisterStepEnum.VERIFY_PHONE);

  if (!isWaitingForThis) return undefined;

  return hasInfos ? RegisterStepEnum.PROFILE : RegisterStepEnum.INFOS;
};
