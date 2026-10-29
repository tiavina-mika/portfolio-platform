import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { COUNTRY_SCOPED_BULK_CLASSES } from '@/constants/_core/country-scope.constants';
import { ReportStatusEnum } from '@/types/report.type';

import { scopeToAgentCountries } from '../../utils/_core/parse.utils.cloud';

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

/**
 * The query behind every back-office badge: what is still waiting in this collection's queue.
 *
 * Most classes track that with `seen: false`, but two answer the same question with a field of
 * their own — a report moves through a status workflow (`pending -> under_review ->
 * resolved/dismissed`) that makes a `seen` boolean redundant, and a support ticket tracks new
 * admin-facing activity through `unreadByAdmin`. Any other class can ask for a `status`-scoped
 * count instead of the default (ex: failed payments, tracked as their own badge next to the
 * generic payment queue).
 *
 * Kept as one function rather than inlined in `getObjectsCount` because the bulk "mark as seen"
 * actions have to recompute the very same figure to hand back a badge value the client does not
 * have to guess at.
 */
export const buildBadgeCountQuery = (className: string, status?: string): Parse.Query => {
  const query = buildClassQuery(className).equalTo('deleted', false);

  if (className === collections.Report) return query.equalTo('status', ReportStatusEnum.PENDING);
  if (className === collections.Contact) return query.equalTo('unreadByAdmin', true);
  if (status) return query.equalTo('status', status);

  return query.equalTo('seen', false);
};

export const countBadgeObjects = async (className: string, status?: string): Promise<number> => {
  return buildBadgeCountQuery(className, status).count(USE_MASTER_KEY);
};
