import { PASSWORD_EMAIL_WORD_MIN_LENGTH } from '@shared/constants';
import { z } from 'zod';

export const passwordFieldSchema = z
  .string()
  .min(8)
  .max(64);

/** A password equal to the email it protects is the first thing anyone tries — case does not count. */
export const isPasswordSameAsEmail = (password: string, email: string): boolean => {
  const typedPassword = password.trim().toLowerCase();

  return !!typedPassword && typedPassword === email.trim().toLowerCase();
};

/**
 * A password built from the words of the email (`jane.doe@…` → "jane", "doe") is guessed as fast as
 * the email itself. Only the part before the "@" is read: the domain ("gmail") is shared by millions
 * of accounts and says nothing about this one.
 */
export const isPasswordContainingEmailWord = (password: string, email: string): boolean => {
  const typedPassword = password.trim().toLowerCase();
  const [localPart] = email.trim().toLowerCase().split('@');

  if (!typedPassword || !localPart || !email.includes('@')) return false;

  return localPart
    .split(/[^\p{L}\p{N}]+/u)
    .some((word) => word.length >= PASSWORD_EMAIL_WORD_MIN_LENGTH && typedPassword.includes(word));
};

const getDigits = (value: string): string => value.replace(/\D/g, '');

/**
 * A password equal to the phone number, whatever way the digits are written: with or without the
 * leading 0, with or without the dial code, with spaces. A password mixing those digits with letters
 * is a different password.
 */
export const isPasswordSameAsPhone = (
  password: string,
  { dialCode, number }: { dialCode: string; number: string }
): boolean => {
  const typedPassword = password.trim();
  const nationalDigits = getDigits(number).replace(/^0/, '');

  if (!typedPassword || !nationalDigits || !/^[+\d\s]+$/.test(typedPassword)) return false;

  return [
    nationalDigits,
    `0${nationalDigits}`,
    `${getDigits(dialCode)}${nationalDigits}`,
  ].includes(getDigits(typedPassword));
};
