import dayjs from 'dayjs';

import type { ICode } from '@/types/auth.type';

import { translate } from '@/config/i18n';
import { PASSWORD_RESET_TOKEN_VALIDITY_MINUTES, USE_MASTER_KEY } from '@/constants/_core/constants';
import { RegisterStepEnum } from '@/types/user.type';
import { decrypt, generateSingleUseToken, hashSingleUseToken } from '@/utils/_core/encrypt.utils';
import { logger } from '@/utils/_core/logger';
import { normalizePhoneNumber } from '@/utils/_core/phone.utils';
import { getRegisterStepAfterConfirmation } from '@/utils/_core/user.utils';
import {
  changePasswordSchema, emailFieldSchema, emailLoginSchema, phoneAuthSchema, resetPasswordSchema,
  sendVerificationCodeSchema, verifyAccountSchema,
} from '@/validations/_core/auth.validations';

import { sendWelcomeEmail } from '../../emails/_core/user.email';
import {
  getSmsResetHoldDate, PASSWORD_RESET_DELAY_FIELD,
} from '../../services/_core/passwordResetDelay.service.cloud';
import {
  clearVerificationSmsError, findUserByEmailWithVerification, findUserByPhoneWithVerification,
  findUserByVerifiedEmail,
} from '../../services/_core/user.service.cloud';
import { logInResolvedUser } from '../../utils/_core/auth.utils.cloud';
import { sendEmailResetPassword, sendEmailVerification } from '../../utils/_core/email.utils.cloud';
import { getClientIp } from '../../utils/_core/parse.utils.cloud';
import { sendSmsVerification } from '../../utils/_core/sms.utils.cloud';
import {
  checkVerificationRateLimit, generateEncryptedVerificationCode,
  getDecryptedUserCode, logoutUserOtherDevices, recordVerificationFailure, toEmailRecipient,
  type VerificationField,
} from '../../utils/_core/user.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

const RESET_PASSWORD_VERIFICATION_FIELD: VerificationField = 'resetPasswordVerification';

/**
 * Verify an account's email or phone.
 * 3 use cases:
 * - account verification on sign up (BO)
 * - account verification on sign in if the account is not verified (BO)
 * - password reset verification (mobile + BO)
 *
 * Locks the verification after MAX_VERIFICATION_ATTEMPTS wrong guesses.
 * The caller must request a new code to unlock.
 */
Parse.Cloud.define(
  'verifyAccount',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void | Record<string, any>> => {
    const {
      code, type, toVerify, email, phoneNumber, locale,
    } = request.params;

    const isPasswordReset = type === 'resetPassword';

    /*
     * A reset by phone only ever resolves an account whose number is verified. An email account
     * types its number at sign-up step 2 and never confirms it, so a typo there would otherwise
     * hand whoever owns the mistyped number a reset code for a stranger's account — and one
     * unverified number can sit on several accounts, making `.first()` pick one at random.
     * Those accounts reset through their email instead, which is the identity they did verify.
     */
    /*
     * the contact being confirmed decides the lookup: an account found by its email while the
     * request asks to confirm a phone would raise the flag on whatever number sits on the row
     */
    const user = toVerify === 'email'
      ? await findUserByEmailWithVerification(email)
      : await findUserByPhoneWithVerification(phoneNumber, {
        requireVerified: isPasswordReset,
        // a sign-up confirming its own number: resolve the account by its id, not by the number
        forUserId: isPasswordReset ? undefined : request.user?.id,
      });

    // generic error — do not reveal whether the account exists (avoids user enumeration)
    if (!user) throw new Error(translate('user.incorrectCode', locale));

    /*
     * A mobile sign-up is confirmed by the session it was created with: resolving it by its email
     * alone let anyone burn the five attempts of a pending sign-up, or probe its code. The
     * back-office confirms an account that has no session yet (it signs in afterwards), and a
     * password reset is a recovery — its caller is not signed in either.
     */
    const isMobileSignUp = !isPasswordReset && user.get('platform') !== 'bo';

    if (isMobileSignUp && request.user?.id !== user.id) {
      throw new Error(translate('user.incorrectCode', locale));
    }

    /*
     * a password reset and a sign-up verification each keep their own pending code: they used to
     * share one field, so asking for a reset in the middle of a sign-up silently invalidated the
     * sign-up code the user had just received (and the other way round)
     */
    const verificationField: VerificationField = isPasswordReset
      ? RESET_PASSWORD_VERIFICATION_FIELD
      : 'verification';

    if (!user.has(verificationField)) {
      throw new Error(translate('user.noVerificationPending', locale));
    }

    const verification = user.get(verificationField) as ICode;

    if (verification.lockedAt) {
      throw new Error(translate('user.verificationLocked', locale));
    }

    if (new Date(verification.expiredAt).getTime() < Date.now()) {
      throw new Error(translate('user.verificationExpired', locale));
    }

    /*
     * A code only confirms the contact it was sent to: an account has a single sign-up code slot, so
     * a code read in an email would otherwise validate any phone number written on the row. Codes
     * issued before channels existed carry none and stay valid until they expire (one hour); drop
     * this exception once that hour has passed after the release.
     */
    if (verification.channel && verification.channel !== toVerify) {
      await recordVerificationFailure(user, verificationField);
      throw new Error(translate('user.incorrectCode', locale));
    }

    const decryptedStoredCode = decrypt(verification.code) as string;

    if (decryptedStoredCode !== code.trim()) {
      const isNowLocked = await recordVerificationFailure(user, verificationField);

      throw new Error(translate(isNowLocked ? 'user.verificationLocked' : 'user.incorrectCode', locale));
    }

    user.unset(verificationField);

    /*
     * Confirming a reset code is what authorizes the password change, so it mints a dedicated
     * single-use token here and `resetPassword` consumes it. The previous flow handed back
     * `encrypt(email)`, the exact same value the newsletter unsubscribe link in every marketing
     * email carries — anyone holding one of those links could take over that account. Only the
     * hash is stored, so a database read yields nothing replayable.
     */
    if (isPasswordReset) {
      /*
       * A reset proven by SMS on an account unused for a long time may come from the new holder of
       * a recycled number rather than the member: the token is still minted, but it cannot be
       * spent before `availableAt` (see `resetPassword`) and the member is alerted. A reset proven
       * by email has no such doubt — the email is an identity the account itself confirmed.
       */
      const availableAt = email ? undefined : await getSmsResetHoldDate(user, locale);
      const resetToken = generateSingleUseToken();

      user.set('passwordResetToken', {
        token: hashSingleUseToken(resetToken),
        expiredAt: dayjs().add(PASSWORD_RESET_TOKEN_VALIDITY_MINUTES, 'minute').toDate(),
        ...(availableAt ? { availableAt } : {}),
      });
      await user.save(null, USE_MASTER_KEY);

      return {
        success: true,
        resetToken,
        ...(availableAt ? { availableAt: availableAt.toISOString() } : {}),
      };
    }

    /*
     * read before the flag below is written: a BO account re-verifying its email (the sign-in
     * path re-sends a code whenever `emailVerified` is false) would otherwise be greeted with the
     * welcome email again every single time.
     */
    const isFirstEmailVerification = toVerify === 'email' && !user.get('emailVerified');

    let registerStep: RegisterStepEnum | undefined;

    if (type) {
      if (toVerify === 'email') {
        user.set('emailVerified', true);
      } else if (toVerify === 'phone') {
        user.set('phoneVerified', true);
      }

      // a sign-up waiting for this very confirmation moves on in the same write
      registerStep = getRegisterStepAfterConfirmation(
        user.get('registerStep'), toVerify, !!user.get('lastName')
      );
      if (registerStep) user.set('registerStep', registerStep);
    }

    const newUser = await user.save(null, USE_MASTER_KEY);

    if (toVerify === 'email') {
      if (isFirstEmailVerification) {
        // fire-and-forget — the welcome email must not add Brevo's latency to this response
        sendWelcomeEmail(toEmailRecipient(newUser), locale).catch((error) => {
          logger.error('sendWelcomeEmail failed', { userId: newUser.id, error: (error as Error).message });
        });
      }
    }

    // `registerStep` is the step the sign-up moved to, left out when this confirmation was not the pending one
    return { success: true, ...(registerStep ? { registerStep } : {}) };
  }),
  // -------- validation -------- //
  parseFunctionValidation(verifyAccountSchema)
);

Parse.Cloud.define(
  'changePassword',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const currentUser = request.user;

    if (!currentUser) throw new Error('Unauthorized');

    const {
      currentPassword, newPassword, logoutOtherDevices = true, locale,
    } = request.params;

    /*
     * `username`, not `email`: an account created by phone has no email at all, so checking the
     * old password against the email made the change fail for every one of them.
     *
     * `verifyPassword` rather than `logIn`: logging in to check a password minted a second session
     * nothing ever cleaned up (it showed up in the member's active devices and could trip the
     * "new device" alert), and it ran `beforeLogin`, which throws MFA_REQUIRED for a back-office
     * admin with MFA on — locking those admins out of their own password change.
     */
    try {
      await Parse.User.verifyPassword(currentUser.get('username') as string, currentPassword);
    } catch {
      throw new Error(translate('user.wrongPassword', locale));
    }

    currentUser.set('password', newPassword);
    await currentUser.save(null, {
      sessionToken: currentUser.getSessionToken(),
      ...(logoutOtherDevices ? { logoutOtherDevices: true } : {}),
    });
  }),
  parseFunctionValidation(changePasswordSchema)
);

Parse.Cloud.define(
  'sendVerificationCode',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void | boolean> => {
    const { email, locale } = (request).params;
    const phoneNumber = request.params.phoneNumber
      ? normalizePhoneNumber(request.params.phoneNumber)
      : undefined;
    const query = new Parse.Query(Parse.User);

    let user: Parse.User | undefined;

    /*
     * "not verified" is `notEqualTo(…, true)`, not `equalTo(…, false)`: an account created before
     * the flags existed carries neither, Mongo never matches an absent field against `false`, and
     * its code request used to be answered with a generic success while nothing was sent
     */
    if (email) {
      user = await query
        .equalTo('email', email)
        .notEqualTo('emailVerified', true)
        .first(USE_MASTER_KEY);
    } else if (phoneNumber) {
      /*
       * Narrowed to the caller's own account when there is one: an unverified number is not
       * unique, so two sign-ups holding the same one would otherwise send each other's code.
       */
      if (request.user?.id) query.equalTo('objectId', request.user.id);

      user = await query
        .equalTo('phone.number', phoneNumber)
        .notEqualTo('phoneVerified', true)
        .first(USE_MASTER_KEY);
    }

    /*
     * A mobile sign-up asks for its code from the session it was created with. Looked up by its
     * email alone, anyone could trigger codes to an address they do not own: a stranger's call is
     * answered like an unknown account (the back-office signs in afterwards, so it has no session).
     */
    if (user && user.get('platform') !== 'bo' && request.user?.id !== user.id) user = undefined;

    /*
     * generic success — the two "no account with this email/phone" errors this used to raise told
     * a script exactly which addresses and numbers are registered, one request at a time. Every
     * legitimate caller (sign-up resend, back-office sign-in resend, activating the phone as a
     * login identifier) already knows the account exists, so none of them loses anything.
     */
    if (!user) {
      logger.info('sendVerificationCode: no unverified account matched', { hasEmail: !!email });
      return true;
    }

    await checkVerificationRateLimit(user, locale, {
      flow: 'verification', phoneNumber: email ? undefined : phoneNumber, ip: getClientIp(request),
    });

    const verification = generateEncryptedVerificationCode(
      user.get('verification') as ICode | undefined,
      email ? 'email' : 'phone'
    );

    /*
     * ----------------------------------------------------- //
     * --- send verification code to the email or phone ---- //
     * ----------------------------------------------------- //
     */
    user.set('verification', verification);

    const newUser = await user.save(null, USE_MASTER_KEY);
    const code = getDecryptedUserCode(newUser) as string;

    const hasSent = email
      ? await sendEmailVerification(toEmailRecipient(newUser), code, locale)
      : await sendSmsVerification(phoneNumber!, code, locale, newUser.get('phone')?.code);

    // the code the sign-up screen was told was not coming is on its way now
    if (hasSent && !email) await clearVerificationSmsError(newUser);

    return hasSent;
  }),
  // -------- validation -------- //
  parseFunctionValidation(sendVerificationCodeSchema)
);

Parse.Cloud.define(
  'sendResetPasswordVerificationCode',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void | boolean> => {
    const { email, locale } = request.params;
    const phoneNumber = request.params.phoneNumber
      ? normalizePhoneNumber(request.params.phoneNumber)
      : undefined;

    /*
     * `phoneVerified` is what makes a number an identity the account actually owns. Without it,
     * anyone could ask for a reset on a number an email account merely typed at sign-up step 2 —
     * receive the SMS on their own phone, and reset a stranger's password with it.
     */
    const user = email
      ? await new Parse.Query(Parse.User).equalTo('email', email).first(USE_MASTER_KEY)
      : await new Parse.Query(Parse.User)
        .equalTo('phone.number', phoneNumber)
        .equalTo('phoneVerified', true)
        .first(USE_MASTER_KEY);

    // generic success — do not reveal whether the account exists (avoids user enumeration)
    if (!user) return true;

    await checkVerificationRateLimit(user, locale, {
      flow: RESET_PASSWORD_VERIFICATION_FIELD,
      phoneNumber: email ? undefined : phoneNumber,
      ip: getClientIp(request),
    });

    /*
     * ----------------------------------------------------------- //
     * -------- send verification code to the email or phone ----- //
     * ----------------------------------------------------------- //
     * generate a verification code
     */
    const verification = generateEncryptedVerificationCode(
      user.get(RESET_PASSWORD_VERIFICATION_FIELD) as ICode | undefined,
      email ? 'email' : 'phone'
    );

    // save it in the reset-only slot so a sign-up code pending on the same account survives
    user.set(RESET_PASSWORD_VERIFICATION_FIELD, verification);

    const newUser = await user.save(null, USE_MASTER_KEY);
    const code = getDecryptedUserCode(newUser, RESET_PASSWORD_VERIFICATION_FIELD) as string;

    const isSent = email
      ? await sendEmailResetPassword({ recipient: toEmailRecipient(newUser), code, locale })
      : await sendSmsVerification(phoneNumber!, code, locale, newUser.get('phone')?.code);

    return isSent;
  }),
  // -------- validation -------- //
  parseFunctionValidation(sendVerificationCodeSchema)
);

/**
 * Logs an existing account in by phone number + password. Existing accounts still have
 * `username = email` (phone-as-username only applies to phone-created accounts, a later phase),
 * so the phone has to be resolved to its account's username first, then the actual password check
 * is delegated to `Parse.User.logIn` itself (see `logInResolvedUser`).
 */
Parse.Cloud.define(
  'loginWithPhone',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, any>> => {
    const { password, locale } = request.params;
    // the number is stored bare ('341234567'); a client sending '0341234567' must still match
    const phoneNumber = normalizePhoneNumber(request.params.phoneNumber);

    const user = await new Parse.Query(Parse.User)
      .equalTo('phone.number', phoneNumber)
      .equalTo('phoneVerified', true)
      .select(['username'])
      .first(USE_MASTER_KEY);

    return logInResolvedUser(user, password, 'user.invalidPhoneCredentials', locale);
  }),
  // -------- validation -------- //
  parseFunctionValidation(phoneAuthSchema)
);

/**
 * Logs an account in by a confirmed email + password, whatever its `username` is. A phone-created
 * account keeps its number as `username` when it adds an email later (the email is stored confirmed,
 * see the contact change flow), so `Parse.User.logIn(email, …)` cannot find it: the email is resolved
 * to the account's `username` first, exactly as `loginWithPhone` does for the number. An account
 * created by email (`username = email`) resolves to itself, so it keeps signing in the same way.
 */
Parse.Cloud.define(
  'loginWithEmail',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, any>> => {
    const { password, locale } = request.params;
    // stored trimmed and lower-cased — the same normalization the sign-up applies
    const email = emailFieldSchema.parse(request.params.email);

    const user = await findUserByVerifiedEmail(email);

    return logInResolvedUser(user, password, 'user.invalidEmailCredentials', locale);
  }),
  // -------- validation -------- //
  parseFunctionValidation(emailLoginSchema)
);

/**
 * Consumes the single-use token `verifyAccount` minted when the reset code was confirmed. That
 * token is the only proof of authorization accepted here: an email address, encrypted or not, is
 * never enough, since the same encrypted value is published in every newsletter unsubscribe link.
 */
Parse.Cloud.define(
  'resetPassword',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const { resetToken, password } = request.params;

    const user = await new Parse.Query(Parse.User)
      .equalTo('deleted', false)
      .equalTo('passwordResetToken.token', hashSingleUseToken(resetToken))
      .select(['passwordResetToken'])
      .first(USE_MASTER_KEY);

    const { expiredAt, availableAt } = user?.get('passwordResetToken') ?? {};

    if (!user || !expiredAt || new Date(expiredAt).getTime() < Date.now()) {
      return {
        success: false,
        clientMessageKey: 'resetLinkExpired',
      };
    }

    /*
     * A token minted for a reset held back on an unused account (see `verifyAccount`) is refused
     * until its date, and left untouched: nothing is consumed, nothing is changed. It expires long
     * before that date, so the reset is started over once the wait is served.
     */
    if (availableAt && new Date(availableAt).getTime() > Date.now()) {
      return {
        success: false,
        clientMessageKey: 'resetDelayed',
        availableAt: new Date(availableAt).toISOString(),
      };
    }

    user.set('password', password);
    // single use: the token is burned whether or not the caller ever comes back with it
    user.unset('passwordResetToken');
    user.unset(PASSWORD_RESET_DELAY_FIELD);
    const updatedUser = await user.save(null, USE_MASTER_KEY);

    // invalidate all existing sessions — the password may have been compromised
    await logoutUserOtherDevices(updatedUser, '');

    return {
      success: !!updatedUser,
    };
  }),
  // -------- validation -------- //
  parseFunctionValidation(resetPasswordSchema)
);
