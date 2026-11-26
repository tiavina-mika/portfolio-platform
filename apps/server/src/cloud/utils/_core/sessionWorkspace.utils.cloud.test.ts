import { TargetEnum } from '@shared/types';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

import {
  bindSessionToWorkspace, getUserMfaWorkspace, getUserSessionWorkspace,
} from './sessionWorkspace.utils.cloud';

// the `_Session` collection, the only thing these helpers talk to
const storedSessions = new Map<string, { workspace?: TargetEnum }>();

type SessionFilter = { _session_token: string };

vi.mock('./db.utils.cloud', () => ({
  getMongoCollection: () => Promise.resolve({
    findOne: ({ _session_token: token }: SessionFilter) => Promise.resolve(storedSessions.get(token) ?? null),
    updateOne: ({ _session_token: token }: SessionFilter, { $set }: { $set: { workspace: TargetEnum } }) => {
      storedSessions.set(token, { ...storedSessions.get(token), ...$set });

      return Promise.resolve();
    },
  }),
}));

const userOfSession = (sessionToken?: string): Parse.User => (
  { getSessionToken: () => sessionToken } as unknown as Parse.User
);

let tokenCount = 0;
// every test opens sessions of its own: the helpers remember what they read
const newToken = (): string => {
  tokenCount += 1;
  return `r:token-${tokenCount}`;
};

beforeEach(() => {
  storedSessions.clear();
});

describe('the workspace a staff session is bound to', () => {
  it('should be the workspace the session was opened on', async () => {
    const token = newToken();

    storedSessions.set(token, {});
    await bindSessionToWorkspace(token, TargetEnum.AGENCY);

    expect(await getUserSessionWorkspace(userOfSession(token))).toBe(TargetEnum.AGENCY);
    expect(await getUserMfaWorkspace(userOfSession(token))).toBe(TargetEnum.AGENCY);
  });

  it('should be read from the stored session the first time it is asked', async () => {
    const token = newToken();

    storedSessions.set(token, { workspace: TargetEnum.AGENCY });

    expect(await getUserSessionWorkspace(userOfSession(token))).toBe(TargetEnum.AGENCY);
  });

  it('should bind nothing for a session opened before sessions were bound', async () => {
    const token = newToken();

    storedSessions.set(token, {});

    expect(await getUserSessionWorkspace(userOfSession(token))).toBeUndefined();
    // the second factor every account had then
    expect(await getUserMfaWorkspace(userOfSession(token))).toBe(TargetEnum.PORTFOLIO);
  });

  it('should bind nothing for an account read from the database, which carries no session', async () => {
    expect(await getUserSessionWorkspace(userOfSession(undefined))).toBeUndefined();
    expect(await getUserSessionWorkspace(undefined)).toBeUndefined();
  });
});
