import isEqual from 'lodash/isEqual.js';
import pickBy from 'lodash/pickBy.js';
import uniq from 'lodash/uniq.js';

type RightsEntry = { className: string; rights?: Record<string, boolean | undefined> };

// a missing right and a `false` right are the same for the CLP, so only the granted ones are compared
const getGrantedRights = (entries: RightsEntry[], className: string): Record<string, boolean | undefined> =>
  pickBy(entries.find((entry) => entry.className === className)?.rights ?? {}, Boolean);

/** the classes whose rights differ between two versions of a role — the only CLP worth rebuilding */
export const getChangedRightsClassNames = (before: RightsEntry[] = [], after: RightsEntry[] = []): string[] =>
  uniq([...before, ...after].map((entry) => entry.className))
    .filter((className) => !isEqual(getGrantedRights(before, className), getGrantedRights(after, className)));

/** what a role grants, as plain values */
export type RoleGrants = { rights?: RightsEntry[]; ui?: string[]; countries?: string[] };

/**
 * The countries a set of roles covers, or `null` when nothing limits it: a role lists the countries
 * it covers, an empty list covers every country, and the roles add up — one role without a limit
 * lifts it. No role at all limits nothing either (a member, or roles not read yet).
 */
export const mergeRoleCountries = (roles: RoleGrants[]): string[] | null => {
  if (!roles.length) return null;

  const scopes = roles.map((role) => role.countries ?? []);

  if (scopes.some((countries) => countries.length === 0)) return null;

  return uniq(scopes.flat());
};

/**
 * Whether a role grants nothing beyond what another account's roles grant together: every
 * collection right, every back-office screen, and only countries that account covers itself. A
 * member of the staff who is no owner may only hand out a post within their own reach, so giving a
 * post can never widen anybody past the one who gave it.
 * @param role the role handed out (or one of the roles above it in the hierarchy)
 * @param giverRoles the roles of the account handing it out
 */
export const isRoleWithinRights = (role: RoleGrants, giverRoles: RoleGrants[]): boolean => {
  const giverRights = giverRoles.flatMap((giverRole) => giverRole.rights ?? []);
  const giverHas = (className: string, operation: string): boolean => giverRights.some(
    (entry) => entry.className === className && !!entry.rights?.[operation]
  );
  const hasEveryRight = (role.rights ?? []).every((entry) => Object.entries(entry.rights ?? {})
    .every(([operation, isGranted]) => !isGranted || giverHas(entry.className, operation)));

  const giverScreens = new Set(giverRoles.flatMap((giverRole) => giverRole.ui ?? []));
  const hasEveryScreen = (role.ui ?? []).every((screen) => giverScreens.has(screen));

  const giverCountries = mergeRoleCountries(giverRoles);
  const roleCountries = role.countries ?? [];
  const isInGiverCountries = giverCountries === null ||
    (roleCountries.length > 0 && roleCountries.every((country) => giverCountries.includes(country)));

  return hasEveryRight && hasEveryScreen && isInGiverCountries;
};
