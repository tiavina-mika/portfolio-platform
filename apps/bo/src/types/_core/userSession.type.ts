import { z } from 'zod';

import { suspendUserFormSchema } from '@/validations/_core/userSession.validations';

export type SuspendUserInput = z.infer<typeof suspendUserFormSchema>;

/*
 * how a session was opened: a password (or a signup), a one-time code sent by SMS, or a support
 * session an agent opened from the back-office
 */
export type SessionSignInMethod = 'password' | 'sms' | 'support';

export type SessionPlatform = 'ios' | 'android' | 'web';

// one signed-in session of a user, as the back-office lists it — never with its token
export interface IUserActiveSession {
  id: string;
  // unset for a login that never registered a device: the back-office, a support session
  deviceName?: string;
  platform?: SessionPlatform;
  appVersion?: string;
  // when the device last signed in, as an ISO string
  signedInAt: string;
  signInMethod: SessionSignInMethod;
}

export interface IUserSessionState {
  sessions: IUserActiveSession[];
  loading: boolean;
  hasError: boolean;
}
