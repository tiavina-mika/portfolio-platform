import { USE_MASTER_KEY } from '@/constants/_core/constants';

/**
 * The identity fields a notification freezes about a person, so the list still renders correctly
 * after the account is edited or deleted.
 */
export const toUserSnapshot = (user: Parse.User): Record<string, unknown> => ({
  firstName: user.get('firstName'),
  lastName: user.get('lastName'),
  // a phone account has no email: the key is left out rather than frozen as an empty value
  ...(user.get('email') ? { email: user.get('email') } : {}),
  id: user.id,
  image: user.get('image'),
});

/**
 * Same snapshot, for people the caller only holds as pointers — an afterSave trigger receives
 * `from`/`to` unfetched, so reading the fields straight off those pointers would freeze a row of
 * nulls that says nothing about who was involved. Loads the identity fields once for the whole
 * set, keyed by id so the caller can keep its own ordering.
 */
export const getUserSnapshotsById = async (
  users: Parse.User[]
): Promise<Map<string, Record<string, unknown>>> => {
  if (users.length === 0) return new Map();

  const ids = [...new Set(users.map((user) => user.id))];
  const fetched = await new Parse.Query(Parse.User)
    .containedIn('objectId', ids)
    .select(['firstName', 'lastName', 'email', 'image'])
    .limit(ids.length)
    .find(USE_MASTER_KEY);

  return new Map(fetched.map((user) => [user.id, toUserSnapshot(user)]));
};
