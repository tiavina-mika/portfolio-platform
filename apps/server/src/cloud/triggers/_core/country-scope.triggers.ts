import { CONTENT_CLASSES, COUNTRY_SCOPED_CLASSES } from '@/constants/_core/country-scope.constants';

import { contentCountriesQuery, keepCountries } from '../../utils/_core/parse.utils.cloud';
import { getAllowedCountryCodes } from '../../utils/_core/role.utils.cloud';

/*
 * A member's mobile app reads these classes constantly with its own session, and the roles are read
 * from the database: remembering the answer for a short while keeps that to a query per user every
 * half minute instead of one per read. A change of roles therefore takes up to this long to apply
 * to a session already open on another server instance (updating a role, or giving or taking one from
 * an account, clears it at once on the server that handled the change).
 */
const ALLOWED_COUNTRIES_TTL_MS = 30_000;

// one line per account that read something: capped so a large membership cannot grow it without end
const ALLOWED_COUNTRIES_MAX_ENTRIES = 5_000;

const allowedCountriesByUser = new Map<string, { countries: string[] | null; expiresAt: number }>();

export const clearAllowedCountriesCache = (): void => allowedCountriesByUser.clear();

// a role given to or taken from one account: this server forgets that account at once
export const forgetAllowedCountriesOf = (userId: string): boolean => allowedCountriesByUser.delete(userId);

// makes room for one more line: the expired ones go first, then the oldest (a Map keeps insertion order)
const makeRoomInAllowedCountriesCache = (): void => {
  if (allowedCountriesByUser.size < ALLOWED_COUNTRIES_MAX_ENTRIES) return;

  const now = Date.now();

  for (const [userId, entry] of allowedCountriesByUser) {
    if (entry.expiresAt <= now) allowedCountriesByUser.delete(userId);
  }

  while (allowedCountriesByUser.size >= ALLOWED_COUNTRIES_MAX_ENTRIES) {
    allowedCountriesByUser.delete(allowedCountriesByUser.keys().next().value!);
  }
};

const getAllowedCountriesOf = async (user: Parse.User): Promise<string[] | null> => {
  const cached = allowedCountriesByUser.get(user.id);

  if (cached && cached.expiresAt > Date.now()) return cached.countries;

  const countries = await getAllowedCountryCodes(user);

  allowedCountriesByUser.delete(user.id);
  makeRoomInAllowedCountriesCache();
  allowedCountriesByUser.set(user.id, { countries, expiresAt: Date.now() + ALLOWED_COUNTRIES_TTL_MS });

  return countries;
};

/*
 * Every read made with the session of a back-office user whose roles cover only some countries is
 * narrowed to them, `get` by id included — which is how the back-office opens a ride, a payment or
 * a ticket. A read made with the master key is the server itself and is never narrowed: the
 * functions that use it scope their own lists.
 */
for (const className of COUNTRY_SCOPED_CLASSES) {
  Parse.Cloud.beforeFind(className, async (request: Parse.Cloud.BeforeFindRequest): Promise<void> => {
    if (request.master || !request.user) return;

    const allowed = await getAllowedCountriesOf(request.user);

    if (!allowed) return;

    if (CONTENT_CLASSES.includes(className)) {
      contentCountriesQuery(request.query, allowed);
    }
    else {
      keepCountries(request.query, allowed);
    }
  });
}
