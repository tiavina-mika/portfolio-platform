import { type Phone } from '@/types/app.type';

const MASK_CHAR = '*';

// keeps the domain readable (e.g. "jo***@gmail.com") so an admin can still recognize the account
export const maskEmail = (email?: string | null): string | undefined => {
  if (!email) return undefined;

  const atIndex = email.indexOf('@');

  if (atIndex === -1) return MASK_CHAR.repeat(email.length);

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  const visibleLength = Math.min(2, local.length);
  const visible = local.slice(0, visibleLength);
  const masked = MASK_CHAR.repeat(Math.max(local.length - visibleLength, 1));

  return `${visible}${masked}@${domain}`;
};

export const maskPhoneNumber = (number?: string | number | null): string | undefined => {
  if (number === undefined || number === null || number === '') return undefined;

  const digits = String(number);
  const visibleLength = Math.min(2, digits.length);
  const visible = digits.slice(-visibleLength);
  const masked = MASK_CHAR.repeat(Math.max(digits.length - visibleLength, 0));

  return `${masked}${visible}`;
};

export const maskPhone = (phone?: Phone | null): Phone | undefined => {
  if (!phone) return undefined;

  return { code: phone.code, number: maskPhoneNumber(phone.number) ?? '' };
};

/**
 * An account's `username` is its email when it was created by email and `+<code><number>` when it
 * was created by phone, so it is masked like the contact detail it stands for.
 */
export const maskUsername = (username?: string | null): string | undefined => {
  if (!username) return undefined;

  return username.includes('@') ? maskEmail(username) : maskPhoneNumber(username);
};
