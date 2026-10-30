export type Platform = 'ios' | 'android' | 'web';

export interface IUserSessionAttributes {
  id: string;
  user: Parse.User;
  sessionToken: string;
  deviceId: string;
  deviceName: string;
  platform: Platform;
  appVersion?: string;
  lastActiveAt: Date;
  /** Expo push token for this device — undefined until the user grants push permission */
  pushToken?: string;
}

export interface IUserSession extends Parse.Object<IUserSessionAttributes> {
  id: string;
}

/**
 * How a session was opened, as a support agent needs to read it: a password (or a signup, which
 * sets one), a one-time code sent by SMS, or a support session opened from the back-office
 */
export type SessionSignInMethod = 'password' | 'sms' | 'support';

/**
 * One signed-in session of a user, as the back-office lists it. The session token is never part of
 * it: whoever reads the list must not be able to reuse a session, only to close it.
 */
export type AdminUserSession = {
  // the Parse `_Session` id — what the back-office sends back to close this one session
  id: string;
  // left unset for a session no device ever registered (a back-office or support login)
  deviceName?: string;
  platform?: Platform;
  appVersion?: string;
  // when the device last signed in: the device's registration time, or the session's creation
  signedInAt: Date;
  signInMethod: SessionSignInMethod;
};

// what the session audit log records an agent doing to somebody else's sessions
export type SessionAuditAction = 'session_revoked' | 'all_sessions_revoked';
