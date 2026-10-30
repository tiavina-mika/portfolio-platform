import { getCountry } from '@shared/utils';

import { USE_MASTER_KEY } from '@/constants/_core/constants';

/**
 * The accounts of one country — the country is written on every account at sign-up, so this is a
 * plain equality the `country` index answers.
 * @param countryCode ISO 3166-1 alpha-2 code
 */
export const buildCountryUsersQuery = (countryCode: string): Parse.Query<Parse.User> => (
  new Parse.Query(Parse.User).equalTo('country', countryCode)
);

/**
 * The country of an account named by a pointer, which carries no field: read once from the account.
 * @returns the stored code, or `undefined` for a missing account or one with no country yet
 */
export const getAccountCountryCode = async (account?: Parse.Object | null): Promise<string | undefined> => {
  if (!account) return undefined;

  const known = account.get('country');

  if (known) return known;
  if (!account.id) return undefined;

  const stored = await new Parse.Query(Parse.User)
    .equalTo('objectId', account.id)
    .select(['country'])
    .first(USE_MASTER_KEY);

  return stored?.get('country');
};

/**
 * Writes the country a row belongs to when it is created, so a list or a statistic can filter on a
 * stored value instead of looking the author up on every read. The country is the author's own —
 * the account that files the ticket, the report, the review or owns the vehicle.
 *
 * It is decided here only: a client cannot pick the country of its own row at creation (a master-key
 * save may, a seed or a repair naming the country it means), and cannot change it afterwards.
 * @param request the `beforeSave` request of the row
 * @param countryCode ISO 3166-1 alpha-2 code of the author's country; an unknown or missing one is
 * read as the default country
 */
export const stampCountry = (request: Parse.Cloud.BeforeSaveRequest, countryCode?: string | null): void => {
  const object = request.object;

  if (object.existed()) {
    if (!request.master && object.dirty('country')) object.revert('country');
    return;
  }

  if (request.master && object.get('country')) return;

  object.set('country', getCountry(countryCode).code);
};
