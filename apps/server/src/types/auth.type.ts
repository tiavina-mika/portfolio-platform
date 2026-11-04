import type { Phone } from './user.type';
import type { ContactChangeTypeEnum } from '@shared/types';

export type VerificationChannel = 'email' | 'phone';

export interface ICode {
  code: string;
  /** where the code was sent: it only confirms the contact it travelled through */
  channel?: VerificationChannel;
  expiredAt: Date;
  failedAttempts: number;
  lockedAt?: Date;
  sentAt?: Date;
  dailySentCount?: number;
  dailySentDate?: string; // YYYY-MM-DD
}

export interface IPlatform {
  name: 'bo' | 'web' | 'android' | 'ios';
  count: number;
  lastConnectedAt: Date;
}

/**
 * TOTP-based MFA state for a user, stored on `user.get('mfa')`. `secret` is encrypted at rest
 * (encrypt.utils) and never returned to the client after the initial enrollment step.
 * `backupCodes` are hashed (not encrypted) since they're single-use and only ever compared, never
 * decrypted back to plaintext.
 */
export interface IMfa {
  secret: string;
  enabled: boolean;
  enabledAt?: Date;
  backupCodes?: string[];
  failedAttempts?: number;
  lockedAt?: Date;
  // last TOTP time step accepted: a code of that step (or an older one) cannot be replayed
  lastUsedStep?: number;
}

/**
 * A code sent to a login identifier the member wants to switch to. The new value waits here until
 * the code comes back: it is never written on the account before, so a typo can't lock anyone out.
 */
export interface IContactChangeCode extends ICode {
  type: `${ContactChangeTypeEnum}`;
  email?: string;
  phone?: Phone;
}

/** Where a step-up code is sent: the address on file when there is one, the phone number otherwise. */
export type StepUpChannel = 'email' | 'phone';

/**
 * What a step-up code request answers: whether the code left, which channel it went through and
 * where — masked, so the member can recognise the address or the number without it being readable
 * by someone holding their unlocked phone.
 */
export type StepUpRequestResult = {
  isSent: boolean;
  channel: StepUpChannel;
  destination: string;
};
