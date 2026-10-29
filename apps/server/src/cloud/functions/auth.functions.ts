
import { translate } from '@/config/i18next';
import { USE_MASTER_KEY } from '@/utils/constants';
import { decrypt, encrypt } from '@/utils/encrypt.utils';
import {
  getResetPasswordSchema, getEmailSchema, getVerifyAccountEmailSchema, getVerifyEmailSchema,
} from '@/validations/auth.validation';

import { sendEmailResetPassword, sendEmailVerification } from '../utils/email.utils.cloud';
import { generateEncryptedVerificationCode, getDecryptedUserCode, isValidUserCode } from '../utils/user.utils.cloud';
import { parseFunction, parseFunctionValidation } from '../utils/utils.cloud';

/**
 * Verify an account's email.
 * 3 use case possible:
 * - for account verification on sign up.
 * - for account verification on sign in if the account is not verified.
 * - for account verification on password reset (maybe later on login too would be added)
 */
Parse.Cloud.define(
  'verifyAccountEmail',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void | Record<string, any>> => {
    const { code, type } = (request).params;
    const encryptedCode = encrypt(code);
    const user = await new Parse.Query(Parse.User).equalTo('verification.code', encryptedCode).first(USE_MASTER_KEY);

    if (!user) return;
    isValidUserCode(user, encryptedCode);

    user.unset('verification');

    if (type && type !== 'resetPassword') {
      user.set('verified', true); // ? maybe should put an if clause before running this statement
    }

    const newUser = await user.save(null, USE_MASTER_KEY);
    const email = newUser.get('email');
    const encryptedEmail = encrypt(email, null, false); // text, use fixed key, no special char

    return { success: true, email: encryptedEmail };
  }),
  // -------- validation -------- //
  parseFunctionValidation(getVerifyAccountEmailSchema)
);

Parse.Cloud.define(
  'sendVerificationCode',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void | boolean> => {
    const { email, locale } = (request).params;
    const user = await new Parse.Query(Parse.User).equalTo('email', email).first(USE_MASTER_KEY);

    if (!user) throw new Error(translate('user.noAccountByEmail', locale));

    if (user.get('verified')) return;

    const verification = generateEncryptedVerificationCode();

    /*
     * ----------------------------------------------------- //
     * -------- send verification code to the email -------- //
     * ----------------------------------------------------- //
     */
    user.set('verification', verification);

    const newUser = await user.save(null, USE_MASTER_KEY);

    const hasSent = await sendEmailVerification(newUser, getDecryptedUserCode(newUser) as string, locale);

    return hasSent;
  }),
  // -------- validation -------- //
  parseFunctionValidation(getVerifyEmailSchema)
);

Parse.Cloud.define(
  'sendResetPasswordVerificationCode',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void | boolean> => {
    const { email, locale } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('email', email).first(USE_MASTER_KEY);

    if (!user) throw new Error(translate('user.noAccountByEmail', locale));

    /*
     * ----------------------------------------------------- //
     * -------- send verification code to the email -------- //
     * ----------------------------------------------------- //
     * generate a verification code
     */
    const verification = generateEncryptedVerificationCode();

    // save it to the user (encrypted)
    user.set('verification', verification);

    const newUser = await user.save(null, USE_MASTER_KEY);

    // send the code to the email
    const isSent = await sendEmailResetPassword({
      user: newUser,
      code: getDecryptedUserCode(newUser) as string,
      locale,
    });

    return isSent;
  }),
  // -------- validation -------- //
  parseFunctionValidation(getEmailSchema)
);

Parse.Cloud.define(
  'resetPassword',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const { encryptedEmail, password, locale } = (request).params;

    const decryptedEmail = decrypt(encryptedEmail, null, false); // text, use fixed key, no special char

    const user = await new Parse.Query(Parse.User).equalTo('email', decryptedEmail).equalTo('deleted', false).first(USE_MASTER_KEY);

    if (!user) throw new Error(translate('user.noAccountByEmail', locale));

    user.set('password', password);
    user.unset('verification');
    await user.save(null, USE_MASTER_KEY);
  }),
  // -------- validation -------- //
  parseFunctionValidation(getResetPasswordSchema)
);
