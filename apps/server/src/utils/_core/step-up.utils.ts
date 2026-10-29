import type { StepUpChannel } from '@/types/auth.type';
import type { Phone } from '@/types/user.type';

import { maskEmail, maskPhoneNumber } from './pii.utils';

/**
 * The channel a step-up code goes through, and where, for an account: its e-mail address when it has
 * one, its phone number otherwise — the same priority the code itself is sent with. The destination
 * is masked: it is shown to the member so they recognise it, not so it can be copied off a screen.
 * @example getStepUpDestination({ email: 'jonas@example.com' })
 * => { channel: 'email', destination: 'jo***@example.com' }
 * @example getStepUpDestination({ phone: { code: '261', number: '341234567' } })
 * => { channel: 'phone', destination: '+261 *******67' }
 */
export const getStepUpDestination = (
  account: { email?: string; phone?: Phone }
): { channel: StepUpChannel; destination: string } => {
  if (account.email) return { channel: 'email', destination: maskEmail(account.email) ?? '' };

  const dialCode = account.phone?.code?.replace(/^\+/, '');
  const maskedNumber = maskPhoneNumber(account.phone?.number) ?? '';

  return { channel: 'phone', destination: dialCode ? `+${dialCode} ${maskedNumber}` : maskedNumber };
};
