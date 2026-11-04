import Auth from 'parse-server/lib/Auth.js';
import Config from 'parse-server/lib/Config.js';

import type { User } from 'parse';
import type { ParsedQs } from 'qs';

/**
 * query a user by session token
 * @param sessionToken
 * @returns
 */
export const getUserForSessionToken = async (
  sessionToken: string | ParsedQs | string[] | ParsedQs[]
): Promise<User> => {
  const config = Config.get(Parse.applicationId);
  const auth = await Auth.getAuthForSessionToken({ config, sessionToken });

  return auth.user;
};
