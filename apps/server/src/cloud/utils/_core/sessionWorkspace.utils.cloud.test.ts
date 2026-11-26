import { TargetEnum } from '@shared/types';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

import {
  bindSessionToWorkspace, getOtherWorkspaceSessionTokens, getUserMfaWorkspace, getUserSessionWorkspace,
} from './sessionWorkspace.utils.cloud';

// the `_Session` collection, the only thing these helpers talk to
const storedSessions = new Map<string, { workspace?: TargetEnum; _p_user?: string }>();

type SessionFilter = { _session_token: string };
type OtherWorkspaceFilter = { _p_user: string; workspace: { $ne: TargetEnum } };

// the sessions of the pointed account that are bound to a workspace, and not to the excluded one
const findSessions = ({ _p_user: pointer, workspace }: OtherWorkspaceFilter) => {
  const rows = [...storedSessions]
    .filter(([, session]) => session._p_user === pointer)
    .filter(([, session]) => !!session.workspace && session.workspace !== workspace.$ne)
    .map(([token]) => ({ _session_token: token }));

  return { limit: () => ({ toArray: () => Promise.resolve(rows) }) };
};

vi.mock('./db.utils.cloud', () => ({
  getMongoCollection: () => Promise.resolve({
    find: findSessions,
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

describe('the sessions a change of one workspace second factor leaves alone', () => {
  it('should be those of the account bound to another workspace', async () => {
    storedSessions.set('r:agency', { _p_user: '_User$user1', workspace: TargetEnum.AGENCY });
    storedSessions.set('r:portfolio', { _p_user: '_User$user1', workspace: TargetEnum.PORTFOLIO });
    storedSessions.set('r:unbound', { _p_user: '_User$user1' });
    storedSessions.set('r:stranger', { _p_user: '_User$user2', workspace: TargetEnum.PORTFOLIO });

    expect(await getOtherWorkspaceSessionTokens('user1', TargetEnum.AGENCY)).toEqual(['r:portfolio']);
  });
});
