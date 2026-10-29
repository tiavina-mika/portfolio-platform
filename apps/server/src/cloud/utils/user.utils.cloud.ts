import dayjs from 'dayjs';

import type { Locale } from '@/types/app.type';
import type { ICode, IPlatform } from '@/types/auth.type';

import { translate } from '@/config/i18next';
import { PlatformEnum } from '@/types/utils.type';
import { USE_MASTER_KEY } from '@/utils/constants';
import { decrypt, encrypt } from '@/utils/encrypt.utils';
import { generateNumber } from '@/utils/util';

import { createContactToCloud, sendEmailVerification } from './email.utils.cloud';


/**
 * generate 6 digits number the encrypt it to save to db
 * so it should be a random characters
 * @returns
 */
export const generateEncryptedVerificationCode = (): ICode => {
  const code = generateNumber(6);
  const encryptedCode = encrypt(code);

  return {
    code: encryptedCode as string, // a string of 6 digits
    expiredAt: dayjs().add(1, 'hour').toDate(), // 1h from now
  };
};

/**
 * decrypt the user code
 * @param user
 * @returns
 */
export const getDecryptedUserCode = (user: Parse.User): string | undefined | void => {
  if (!user.has('verification')) return;
  const verification = user.get('verification');
  const { code } = verification;
  const decryptedCode = decrypt(code);

  return decryptedCode;
};

export const isValidUserCode = (user: Parse.User, encryptedCode: string | void): undefined | void => {
  if (!user) {
    throw new Error('user:errors.userNotFound');
  }

  if (!user.has('verification')) return;
  const verification = user.get('verification');

  if (verification.code !== encryptedCode) throw new Error('user:errors.incorrectCode');
  if (new Date(verification.expiredAt).getTime() < Date.now()) throw new Error('user:errors.expiredCode');
};

/**
 * get user full name
 * @param person
 * @returns
 */
export const getUserFullName = (person: Parse.User): string => {
  if (!person) return '';
  let name = person.get('lastName');

  if (person.has('firstName')) {
    name += ' ' + person.get('firstName');
  }
  return name;
};

// user created from back office
export const isUserFromBO = (user: Parse.User): boolean => {
  return !!user.get('platforms').find((platform: IPlatform) => platform.name === PlatformEnum.BO);
};

export const getUserPlatforms = (prevUser: Parse.User, user: Parse.User): void => {
  const prevPlatforms = prevUser?.get('platforms') || [];

  const newPlatforms = prevPlatforms.map((platform: IPlatform): IPlatform => {
    if (platform.name === user.get('platform')) {
      return {
        ...platform,
        count: platform.count + 1,
        lastConnectedAt: dayjs().toDate(),
      };
    }

    return platform;
  });

  return newPlatforms;
};

/**
 * generate verification code and send it to the user email
 * it's called in the _User afterSave trigger when the user is created
 * @param user
 * @param locale
 */
export const saveUserAndSendCodeToEmail = async (user: Parse.User, locale: Locale): Promise<void> => {
  // generate verification code
  const verification = generateEncryptedVerificationCode();

  user.set('verification', verification);

  // save user with verification code
  const newUser = await user.save(null, USE_MASTER_KEY);

  try {
    // get decrypted code defined earlier
    const decryptedCode = getDecryptedUserCode(newUser) as string;

    // send email with the decrypted code
    await sendEmailVerification(newUser, decryptedCode, locale);
    /*
     * this will shallow an error if the contact already exists in the email service
     * so no need to worry about it
     */
    await createContactToCloud(newUser);
  }
  catch (error) {
    console.log('error: ', error);
    throw new Error(translate('error.sendingVerificationCode', locale));
  }
};

export const unsetBanned = (user: Parse.User): void => {
  const prevBans = user.get('bans') || [];
  // check if all bans are expired
  const expiredBans = prevBans.filter((ban: Record<string, any>) => dayjs(ban.until).isBefore(dayjs()));

  if (expiredBans.length > 0) {
    user.set('banned', false);
  }
};

export const setUserBans = (user: Parse.User, currentUser: Parse.User | undefined): void => {
  const prevBans = user.get('bans') || [];
  // check if all bans are expired
  const ban = {
    bannedAt: dayjs().toDate(),
    bannedBy: currentUser,
    until: dayjs().add(2, 'day').toDate(),
  };

  const newBans = [...prevBans, ban];

  user.set('bans', newBans);
};
