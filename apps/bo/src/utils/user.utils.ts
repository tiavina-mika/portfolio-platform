import Parse from 'parse';

import { sexOptions } from '@/constants/user.constants';
import { ISelectOption } from '@/types/app.type';
import {
  IPhone, ISex, IUser, PlatformEnum, IPlatform,
} from '@/types/user.type';

import { cutText } from './utils';

export const getSexLabelByValue = (sex: ISex): string => {
  const sexOption = sexOptions.find((option: ISelectOption) => option.value === sex);

  if (!sexOption) return '';

  return sexOption?.label;
};

/**
 * validate phone number (from Madagascar)
 * @param str
 * @returns
 */
export const validatePhoneNumber = (str: string): boolean => {
  /**
   * valid number are
   * 0341865749, 341865749, 034 18 657 49, 034-18-657-49, 0321865749, 0331865749, 0381865749
   */
  const phoneRegex = /^0?(32|33|34|38)[- ]?(\d{2})[- ]?(\d{3})[- ]?(\d{2})$/; // malagasy phone number

  if (phoneRegex.exec(str)) {
    return true;
  }

  return false;
};

/**
 * replace first 0, white space, first +0 and - from phone number
 * @param str
 * @returns
 */
export const formatPhoneNumber = (str: string): string => {
  return str.replace(/^0|\s+|-|^\+0?/g, '');
};

/**
 * get user full name
 * @param user
 * @returns
 */
export const getUserFullName = (user: Parse.User): string => {
  if (!user) return '';
  let name = user.get('lastName');

  if (user.has('firstName')) {
    name += ' ' + user.get('firstName');
  }
  return name;
};

/**
 * get full name abbreviation
 * ex: Andre Michael to AM
 * @param user
 * @returns
 */
export const getUserFullNameAbbreviation = (user: Record<string, any>): string => {
  if (!user.get('lastName') && !user.get('firstName')) {
    return 'US';
  }
  let abbreviatedName = user.get('lastName').charAt(0);

  if (user.firstName) {
    abbreviatedName += user.get('firstName').charAt(0);
  }
  return abbreviatedName.toUpperCase();
};

/*
 * ---------------------------------------------------------//
 * ---- fixing bug for await Parse.User.currentAsync() ---- //
 * ---------------------------------------------------------//
 */
/**
 * await Parse.User.currentAsync() save an user as bad ParseUser into localStorage
 * see https://github.com/parse-community/Parse-SDK-JS/issues/992
 */
const currentUserPath = 'Parse/portfolio-v4/currentUser';

/**
 * get currentUser from LocalStorage
 * @returns {Parse.Object}
 */
export const retrieveUserFromLocalStorage = (): Record<string, any> | null => {
  const userIntoLocalStorage = localStorage.getItem(currentUserPath);

  if (!userIntoLocalStorage) return null;
  const userData = JSON.parse(userIntoLocalStorage);

  // see https://github.com/parse-community/Parse-SDK-JS/issues/992
  userData.className = '_User';
  return Parse.Object.fromJSON(userData);
};

/**
 * clear user into localStorage
 */
export const clearUserIntoLocalStorage = (): void => {
  localStorage.removeItem(currentUserPath);
};

/**
 * update currentUser into localStorage
 * @param user
 */
export const updateUserIntoLocalStorage = (user: IUser): void | null => {
  if (!user) return null;

  const jsonUser = user.toJSON();

  if ('password' in jsonUser) {
    delete jsonUser.password;
  }
  const userData = JSON.stringify(jsonUser);

  localStorage.setItem(currentUserPath, userData);
};

export const getCuttedFirstName = (user: IUser): string => {
  if (user.has('firstName')) {
    const name = (user.get('firstName')!).split(' ')[0];

    return cutText(name);
  }
  return cutText(user.get('lastName'));
};

export const getFullPhoneNumber = (phone: IPhone): string => {
  return '+' + phone.code + phone.number;
};

// user created from back office
export const isUserFromBO = (user: IUser): boolean =>
  !!user.get('platforms').find(
    (platform: IPlatform) => platform.name === PlatformEnum.BO
  );

// open mail client
type SendMailtoProps = {
  email: string;
  subject: string;
  body: string;
};
export const sendMailto = ({
  email,
  subject,
  body,
}: SendMailtoProps): void => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  // const encodedBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  const mailtoLink = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;

  // Open the mailto link in the default email client
  window.location.href = mailtoLink;
};
