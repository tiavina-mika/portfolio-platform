import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { COUNTRY_SCOPED_BULK_CLASSES } from '@/constants/_core/country-scope.constants';

import { excludeStaffAccounts } from './userRole.service.cloud';
import { scopeToAgentCountries, workspacesTargetQuery } from '../../utils/_core/parse.utils.cloud';
import { getUserWorkspaces } from '../../utils/_core/role.utils.cloud';

/**
 * `_User` is reached through `Parse.User` rather than by its raw class name, so the SDK returns
 * `Parse.User` instances (and applies the user-specific handling Parse Server has for that class)
 * instead of plain objects.
 *
 * Its callers read with the master key, so the countries an agent's roles cover are applied here: a
 * badge, a bulk "mark as seen" or a bulk delete never reaches the rows of another country.
 */
export const buildClassQuery = (className: string): Parse.Query => {
  const query = className === collections.User
    ? new Parse.Query(Parse.User)
    : new Parse.Query(className);

  return COUNTRY_SCOPED_BULK_CLASSES.includes(className) ? scopeToAgentCountries(query) : query;
};

// the field that holds the workspace of each class that is filed in one
const WORKSPACE_FIELD_BY_CLASS: Record<string, string> = {
  [collections.Contact]: 'target',
  [collections.Article]: 'targets',
  [collections.Page]: 'targets',
  [collections.Category]: 'targets',
};

/**
 * Lets a business domain file its own class in a workspace without this generic service importing
 * the domain — same registry pattern as the global search and the dashboard.
 * @param className the class whose rows carry a workspace
 * @param field the field holding it
 */
export const registerWorkspaceField = (className: string, field: string): void => {
  WORKSPACE_FIELD_BY_CLASS[className] = field;
};

/**
 * `buildClassQuery`, narrowed to the workspaces the caller's roles open. Messages and content carry the
 * workspace they were filed in, so a badge, a bulk action or a search must never reach those of a
 * workspace the caller cannot open (the list and the detail already refuse them). Other classes
 * are not workspace-scoped and come back unchanged.
 * @param className
 * @param user the caller; without one the server acts and nothing is narrowed
 */
export const buildScopedClassQuery = async (className: string, user?: Parse.User): Promise<Parse.Query> => {
  const query = buildClassQuery(className);
  const field = WORKSPACE_FIELD_BY_CLASS[className];

  if (!field || !user) return query;

  return workspacesTargetQuery(query, await getUserWorkspaces(user), field);
};

/**
 * The query behind every back-office badge: what is still waiting in this collection's queue.
 *
 * Classes track that with `seen: false`; any class can ask for a `status`-scoped count instead of the
 * default (a subset of the default queue, tracked as its own badge).
 *
 * Kept as one function rather than inlined in `getObjectsCount` because the bulk "mark as seen"
 * actions have to recompute the very same figure to hand back a badge value the client does not
 * have to guess at.
 */
export const buildBadgeCountQuery = async (
  className: string,
  status?: string,
  user?: Parse.User
): Promise<Parse.Query> => {
  const query = (await buildScopedClassQuery(className, user)).equalTo('deleted', false);

  if (status) return query.equalTo('status', status);

  query.equalTo('seen', false);

  return className === collections.User ? excludeStaffAccounts(query) : query;
};

export const countBadgeObjects = async (
  className: string,
  status?: string,
  user?: Parse.User
): Promise<number> => {
  return (await buildBadgeCountQuery(className, status, user)).count(USE_MASTER_KEY);
};
