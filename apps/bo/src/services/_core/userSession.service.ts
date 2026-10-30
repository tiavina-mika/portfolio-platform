import dayjs from 'dayjs';
import Parse from 'parse';

import { IUserActiveSession } from '@/types/_core/userSession.type';

export const fetchUserSessions = async (userId: string): Promise<IUserActiveSession[]> => {
  const { results } = await Parse.Cloud.run('adminGetUserSessions', { userId });

  // the SDK decodes the date into a Date object: the store keeps plain strings
  return results.map((session: IUserActiveSession) => ({
    ...session,
    signedInAt: dayjs(session.signedInAt).toISOString(),
  }));
};

export const revokeUserSessionInCloud = async (userId: string, sessionId: string): Promise<void> => {
  await Parse.Cloud.run('adminRevokeUserSession', { userId, sessionId });
};

export const revokeAllUserSessionsInCloud = async (userId: string): Promise<void> => {
  await Parse.Cloud.run('adminRevokeAllUserSessions', { userId });
};
