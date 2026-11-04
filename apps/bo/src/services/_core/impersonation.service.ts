import Parse from 'parse';

import { ImpersonationSession } from '@/types/_core/impersonation.type';

export const impersonateUserInCloud = async (
  userId: string,
  reason: string
): Promise<ImpersonationSession> => {
  return Parse.Cloud.run('impersonateUser', { userId, reason });
};

export const endImpersonationSessionInCloud = async (sessionId: string): Promise<void> => {
  await Parse.Cloud.run('endImpersonationSession', { sessionId });
};
