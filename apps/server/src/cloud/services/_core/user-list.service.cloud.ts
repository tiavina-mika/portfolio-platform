import { PlatformEnum } from '@shared/types';

import type { IPlatform } from '@/types/auth.type';

import { getRolesByUserId } from './userRole.service.cloud';
import { withComputedFields } from '../../utils/_core/parse.utils.cloud';

/**
 * Open registry for the extra per-row facts the back-office users list shows that do not live on
 * the `_User` record itself. `_core` owns the list but must not know what a vehicle or a ride is,
 * so a domain registers its own enricher here at module load time instead.
 *
 * An enricher reads the whole page in one query and returns what it found, keyed by user id — it
 * never writes on the users itself, since a `.set()` would leave them holding unsaved changes and
 * `Parse._encode` strips such an object down to a bare pointer on its way back to the caller.
 */
type UserListEnricher = (users: Parse.User[]) => Promise<Map<string, Record<string, unknown>>>;

const userListEnrichers: UserListEnricher[] = [];

export const registerUserListEnricher = (enricher: UserListEnricher): void => {
  userListEnrichers.push(enricher);
};

/**
 * Enriches one page of users with every registered per-row fact.
 * @param users the page of users returned by `getUsers`
 * @returns a new array of users carrying the extra fields — the caller must use it, the users it
 * was given are left untouched
 */
export const attachUserListCounters = async (users: Parse.User[]): Promise<Parse.User[]> => {
  if (users.length === 0) return users;

  const enriched = await Promise.all(userListEnrichers.map((enricher) => enricher(users)));

  return users.map((user) => withComputedFields(
    user,
    Object.assign({}, ...enriched.map((fieldsByUserId) => fieldsByUserId.get(user.id) ?? {}))
  ));
};

/**
 * Attaches to each user of the page the roles they hold, which the back-office list shows in its
 * "Roles" column. They are not on the user record — a role holds its members in a relation on
 * `_Role` — so the list query alone leaves every row of that column empty.
 *
 * Only run when the page actually holds a back-office account: the column is only shown on the
 * administrators tab, and reading the roles costs one query per existing role, which is pure waste
 * on a page of travellers that hold none.
 * @param users the page of users returned by `getUsers`
 * @returns a new array of users carrying their roles — the caller must use it, the users it was
 * given are left untouched
 */
export const attachUserRoles = async (users: Parse.User[]): Promise<Parse.User[]> => {
  const hasBackOfficeAccount = users.some((user) => (user.get('platforms') ?? [])
    .some((platform: IPlatform) => platform.name === PlatformEnum.BO));

  if (!hasBackOfficeAccount) return users;

  const rolesByUserId = await getRolesByUserId(users);

  return users.map((user) => withComputedFields(user, { roles: rolesByUserId.get(user.id) ?? [] }));
};
