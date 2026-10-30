import type { Phone } from '@/types/user.type';

import { RegisterStepEnum } from '@/types/user.type';

import { normalizePhone, toPhoneUsername } from './phone.utils';

/** What a sign-up request claims about the account's contact details, exactly as the client sent it. */
export type SignUpIdentityInput = {
  registerStep?: unknown;
  email?: unknown;
  phone?: unknown;
  /** back-office accounts are created from an invitation: no `registerStep`, an email only */
  isFromBO: boolean;
};

/** What the account is actually created with — every field derived by the server. */
export type SignUpIdentity = {
  username: string;
  email?: string;
  phone?: Phone;
};

/** The way emails are stored and compared everywhere: trimmed and lower-cased. */
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

const toPhone = (value: unknown): Phone | undefined => {
  if (!value || typeof value !== 'object') return undefined;

  const { code, number } = value as Record<string, unknown>;

  if (!isNonEmptyString(code) && typeof code !== 'number') return undefined;
  if (!isNonEmptyString(number) && typeof number !== 'number') return undefined;

  const phone = normalizePhone({ code: String(code), number: String(number) });

  return phone.number ? phone : undefined;
};

/**
 * Works out the identity a new account gets, instead of trusting what the client sent. Parse
 * enforces `username` uniqueness, so a client free to pick it could squat somebody else's number
 * or email (`+261<victim>`, `victim@x.com`) and lock the real owner out of signing up.
 *
 * - phone sign-up: the username is the normalized international number; no email is kept — the
 *   account has none until it adds one through the confirmed contact change.
 * - email sign-up: the username is the lower-cased email; a phone typed at this step is kept
 *   normalized (it is confirmed later, by code).
 * - back-office invitation: the username is the lower-cased email.
 *
 * @returns undefined when the request cannot name an account: an unknown `registerStep`, or the
 * contact detail its step requires is missing or unusable
 */
export const resolveSignUpIdentity = ({
  registerStep, email, phone, isFromBO,
}: SignUpIdentityInput): SignUpIdentity | undefined => {
  if (isFromBO) {
    if (!isNonEmptyString(email)) return undefined;

    const boEmail = normalizeEmail(email);

    return { username: boEmail, email: boEmail };
  }

  if (registerStep === RegisterStepEnum.VERIFY_PHONE) {
    const signUpPhone = toPhone(phone);

    if (!signUpPhone) return undefined;

    return { username: toPhoneUsername(signUpPhone), phone: signUpPhone };
  }

  if (registerStep === RegisterStepEnum.VERIFY_EMAIL) {
    if (!isNonEmptyString(email)) return undefined;

    const signUpEmail = normalizeEmail(email);

    return { username: signUpEmail, email: signUpEmail, phone: toPhone(phone) };
  }

  return undefined;
};
