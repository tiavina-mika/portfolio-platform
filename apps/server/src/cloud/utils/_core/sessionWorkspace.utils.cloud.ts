import { TargetEnum } from '@shared/types';

import { getMongoCollection } from './db.utils.cloud';

/*
 * a session's workspace is written once, when it opens, and never changes: what was read stays true
 * for as long as the session lives. Bounded so a server up for weeks does not keep every token it saw.
 */
const SESSION_WORKSPACE_CACHE_MAX_SIZE = 1000;
const sessionWorkspaceCache = new Map<string, TargetEnum | null>();

const rememberSessionWorkspace = (sessionToken: string, workspace: TargetEnum | null): void => {
  if (sessionWorkspaceCache.size >= SESSION_WORKSPACE_CACHE_MAX_SIZE) {
    // a Map iterates in insertion order: the first key is the oldest one
    const oldestToken = sessionWorkspaceCache.keys().next().value;

    if (oldestToken !== undefined) sessionWorkspaceCache.delete(oldestToken);
  }

  sessionWorkspaceCache.set(sessionToken, workspace);
};

/**
 * Binds a staff session to the workspace of the back-office address it was opened on. A session
 * reaches the data of that workspace only, and passes its second factor only: without this, a
 * password typed on the workspace an account left without a second factor would open a session
 * that reads the other one too.
 * @param sessionToken the session just opened
 * @param workspace the workspace of the address it was opened on
 */
export const bindSessionToWorkspace = async (sessionToken: string, workspace: TargetEnum): Promise<void> => {
  const sessions = await getMongoCollection('_Session');

  // straight on the collection, as for its expiry: the session class only takes writes from Parse itself
  await sessions.updateOne({ _session_token: sessionToken }, { $set: { workspace } });
  rememberSessionWorkspace(sessionToken, workspace);
};

/**
 * The workspace the session of a request was opened on, `undefined` for a session opened before
 * sessions were bound to one — a staff session lasts a few hours, so those are gone soon after the
 * deploy — and for a user that carries no session (an account read from the database, the server).
 * @param user the user of the request (`request.user`), which carries its session token
 */
export const getUserSessionWorkspace = async (user?: Parse.User): Promise<TargetEnum | undefined> => {
  const sessionToken = user?.getSessionToken();

  if (!sessionToken) return undefined;

  if (sessionWorkspaceCache.has(sessionToken)) return sessionWorkspaceCache.get(sessionToken) ?? undefined;

  const sessions = await getMongoCollection('_Session');
  const session = await sessions.findOne(
    { _session_token: sessionToken },
    { projection: { workspace: 1 } }
  );
  const workspace = (session?.workspace as TargetEnum | undefined) ?? null;

  // an unknown token is not cached: it may be a session still being written
  if (session) rememberSessionWorkspace(sessionToken, workspace);

  return workspace ?? undefined;
};

/**
 * The workspace whose second factor a request is judged on: the one its session is bound to, the
 * portfolio's for a session opened before sessions were bound (the second factor every account had
 * then).
 * @param user the user of the request
 */
export const getUserMfaWorkspace = async (user?: Parse.User): Promise<TargetEnum> => (
  (await getUserSessionWorkspace(user)) ?? TargetEnum.PORTFOLIO
);
