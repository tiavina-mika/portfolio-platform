import { COUNTRIES } from '@shared/constants';

import type { Locale } from '@/types/app.type';
import type { Phone } from '@/types/user.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { UserModerationActionEnum } from '@/types/user.type';
import { resolveScopedCountry } from '@/utils/_core/agent-context.utils';
import { logger } from '@/utils/_core/logger';

import {
  applyContactChange, assertContactAvailable, CONTACT_CHANGE_CONFIRMED_CONTEXT,
  type ContactChangeInput, notifyPreviousContact,
} from './contactChange.service.cloud';
import { createUserModerationLog } from './userModerationLog.service.cloud';
import { revokeAllUserSessionsService } from './userSession.service.cloud';
import { sendEmailResetPassword } from '../../utils/_core/email.utils.cloud';
import { assertCanActOnUser } from '../../utils/_core/role.utils.cloud';
import { sendSmsVerification } from '../../utils/_core/sms.utils.cloud';
import {
  checkVerificationRateLimit, generateEncryptedVerificationCode, getDecryptedUserCode, toEmailRecipient,
  type VerificationField,
} from '../../utils/_core/user.utils.cloud';
import { actingUserContext } from '../../utils/_core/utils.cloud';

/**
 * What an administrator asks to do for a member: who asks, why, and in which language the refusal
 * should be written. What the member receives is written in the member's own language.
 */
export type AccountHelpRequest = {
  userId: string;
  admin: Parse.User;
  reason: string;
  locale?: Locale;
};

const PASSWORD_RESET_FIELD: VerificationField = 'resetPasswordVerification';

/** Only what the three actions read or write — a member is never fetched whole for support. */
const MEMBER_HELP_FIELDS = [
  'username', 'email', 'phone', 'emailVerified', 'phoneVerified', 'firstName', 'lastName', 'locale',
  'deleted', 'country', 'verification', PASSWORD_RESET_FIELD, 'contactChangeVerification',
];

/**
 * The member to help, refused when they do not exist, when their account is closed (nothing is
 * left to help), or when they hold a higher role than the administrator asking.
 */
const findMemberToHelp = async (
  { userId, admin, locale = DEFAULT_LANGUAGE }: AccountHelpRequest
): Promise<Parse.User> => {
  const member = await new Parse.Query(Parse.User)
    .equalTo('objectId', userId)
    .select(MEMBER_HELP_FIELDS)
    .first(USE_MASTER_KEY);

  if (!member || member.get('deleted')) {
    throw new Error(translate('error.userNotFound', locale));
  }

  await assertCanActOnUser(admin, member, locale);
  // a member of a country the administrator's roles do not cover is out of their reach
  resolveScopedCountry(member.get('country'));

  return member;
};

const getMemberLocale = (member: Parse.User): Locale => member.get('locale') ?? DEFAULT_LANGUAGE;

/**
 * Generates a fresh code in one of the member's verification slots, saves it and returns it in
 * clear for the one message that carries it. The slot decides what the member can do with it: the
 * sign-up slot confirms a number, the reset slot is what `verifyAccount` accepts for a new password.
 */
const issueVerificationCode = async (member: Parse.User, field: VerificationField): Promise<string> => {
  member.set(field, generateEncryptedVerificationCode(member.get(field)));

  const savedMember = await member.save(null, USE_MASTER_KEY);

  return getDecryptedUserCode(savedMember, field) as string;
};

/*
 * A text or an email that did not go out is still something the administrator did, and the one who
 * reads the history later has to be able to tell the two apart. Logging never fails the action: the
 * member's account is already in the state the administrator wanted by then.
 */
const recordHelp = (
  member: Parse.User,
  { admin, reason }: AccountHelpRequest,
  action: UserModerationActionEnum,
  isDelivered = true
): Promise<void> => createUserModerationLog({
  targetUser: member,
  action,
  performedBy: admin,
  reason,
  details: isDelivered ? undefined : 'not_delivered',
});

/**
 * Sends a new sign-up code by SMS to the number the member typed and has not confirmed yet — the
 * case of a member whose first code never arrived and who cannot sign in without it. The same
 * cooldown and daily cap as the member's own "resend" apply: an administrator is not a way around
 * the limit that protects the SMS bill.
 * @returns whether the SMS was accepted by the provider
 */
export const resendMemberPhoneVerificationCodeService = async (
  request: AccountHelpRequest
): Promise<boolean> => {
  const locale = request.locale ?? DEFAULT_LANGUAGE;
  const member = await findMemberToHelp(request);
  const phone = member.get('phone') as Phone | undefined;

  // a confirmed number has nothing left to prove, and a member with none has nowhere to send it
  if (!phone?.number || member.get('phoneVerified') === true) {
    throw new Error(translate('user.accountHelpPhoneNotPending', locale));
  }

  await checkVerificationRateLimit(member, locale, { flow: 'verification', phoneNumber: phone.number });

  const code = await issueVerificationCode(member, 'verification');
  const isSent = await sendSmsVerification(phone.number, code, getMemberLocale(member), phone.code);

  await recordHelp(member, request, UserModerationActionEnum.PHONE_CODE_RESENT, isSent);

  return isSent;
};

/**
 * Starts the member's usual "forgot my password" flow from the back-office: the reset code goes to
 * their confirmed number by SMS, or to their email when they have no confirmed number. The member
 * still chooses their new password themselves, in the app — the administrator never sees a code or
 * a password. Only the last code sent is valid, so one the member asks for again replaces this one.
 * @returns whether the code was accepted by the SMS or email provider
 */
export const sendMemberPasswordResetCodeService = async (
  request: AccountHelpRequest
): Promise<boolean> => {
  const locale = request.locale ?? DEFAULT_LANGUAGE;
  const member = await findMemberToHelp(request);
  const phone = member.get('phone') as Phone | undefined;
  // the number is an identity the member owns only once confirmed; the email is the account's login
  const phoneNumber = phone?.number && member.get('phoneVerified') === true ? phone.number : undefined;

  if (!phoneNumber && !member.get('email')) {
    throw new Error(translate('user.accountHelpNoContactForReset', locale));
  }

  await checkVerificationRateLimit(member, locale, { flow: PASSWORD_RESET_FIELD, phoneNumber });

  const code = await issueVerificationCode(member, PASSWORD_RESET_FIELD);
  const memberLocale = getMemberLocale(member);

  const isSent = phoneNumber
    ? await sendSmsVerification(phoneNumber, code, memberLocale, phone?.code)
    : await sendEmailResetPassword({ recipient: toEmailRecipient(member), code, locale: memberLocale });

  await recordHelp(member, request, UserModerationActionEnum.PASSWORD_RESET_SENT, isSent);

  return isSent;
};

/**
 * Replaces the member's phone number or email after the administrator checked who they are — the
 * way back for someone whose old number or mailbox is lost. There is no code to type: nobody can
 * receive one on a contact they do not have yet, which is why only a confirmed identity and a
 * recorded reason stand in for it, and the new contact counts as verified.
 *
 * Everything a contact change normally does around the write is done here too, since this is the
 * move that hands an account over: the other devices are signed out, the pending change the member
 * may have started is dropped, and the contact that was replaced is told.
 */
export const changeMemberContactService = async (
  request: AccountHelpRequest & { input: ContactChangeInput }
): Promise<void> => {
  const { input, admin } = request;
  const locale = request.locale ?? DEFAULT_LANGUAGE;
  const member = await findMemberToHelp(request);

  await assertContactAvailable(member, input, locale);

  const previous = {
    email: member.get('email') as string | undefined,
    phone: member.get('phone') as Phone | undefined,
    wasPhoneVerified: !!member.get('phoneVerified'),
  };

  await applyContactChange(member, input);

  member.unset('contactChangeVerification');
  await member.save(null, {
    ...USE_MASTER_KEY,
    context: { ...CONTACT_CHANGE_CONFIRMED_CONTEXT, ...actingUserContext(admin).context },
  });

  await revokeAllUserSessionsService(member);
  await notifyPreviousContact(member, input, previous, getMemberLocale(member));

  logger.info('A member contact was changed by an administrator', {
    userId: member.id, adminId: admin.id, kind: input.type,
  });

  await recordHelp(member, request, UserModerationActionEnum.CONTACT_CHANGED_BY_ADMIN);
};

/**
 * Moves a member's account to another country, after support checked it is the right one — a member
 * who signed up with a foreign SIM, or who moved. The country decides the rules read from the
 * account (currency of the trips they publish, SMS provider, clock of the morning notices, languages
 * offered), so it only moves here. Trips and bookings already made keep the country they were made
 * in: a ride is priced and paid in one currency from start to end.
 * @throws when the country is the account's own, or one the platform does not run in
 */
export const changeMemberCountryService = async (
  request: AccountHelpRequest & { country: string }
): Promise<void> => {
  const { country, admin } = request;
  const locale = request.locale ?? DEFAULT_LANGUAGE;
  const member = await findMemberToHelp(request);
  const previousCountry: string | undefined = member.get('country');

  if (!(country in COUNTRIES)) {
    throw new Error(translate('error.invalidCountry', locale));
  }

  if (previousCountry === country) {
    throw new Error(translate('error.countryUnchanged', locale));
  }

  // nor can a member be moved to a country the administrator may not work on
  resolveScopedCountry(country);

  member.set('country', country);
  await member.save(null, { ...USE_MASTER_KEY, context: actingUserContext(admin).context });

  logger.info('A member country was changed by an administrator', {
    userId: member.id, adminId: admin.id, from: previousCountry, to: country,
  });

  await createUserModerationLog({
    targetUser: member,
    action: UserModerationActionEnum.COUNTRY_CHANGED_BY_ADMIN,
    performedBy: admin,
    reason: request.reason,
    details: `${previousCountry ?? ''}>${country}`,
  });
};
