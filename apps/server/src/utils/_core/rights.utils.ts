import { HIGHEST_LEVEL_ROLES } from '@shared/constants';
import { TargetEnum } from '@shared/types';
import difference from 'lodash/difference.js';
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
export type RoleGrants = {
  rights?: RightsEntry[];
  ui?: string[];
  countries?: string[];
  workspaces?: TargetEnum[];
};

/**
 * The workspaces one role opens. A role saved before the field existed (or saved with an empty list)
 * opens the portfolio only, so nobody gains access to Aldaron by the field being introduced.
 */
export const getRoleWorkspaces = (role: RoleGrants): TargetEnum[] => (
  role.workspaces?.length ? role.workspaces : [TargetEnum.PORTFOLIO]
);

/**
 * The names of the posts that do not open a workspace: what a list read in that workspace leaves out.
 * The highest roles open every workspace without storing it, so they are never part of it.
 */
export const getRoleNamesOutsideWorkspace = (
  roles: (RoleGrants & { name: string })[],
  workspace: TargetEnum
): string[] => roles
  .filter((role) => !HIGHEST_LEVEL_ROLES.includes(role.name) && !getRoleWorkspaces(role).includes(workspace))
  .map((role) => role.name);

/**
 * The workspaces a set of roles opens: the roles add up, like rights. An account holding no role at
 * all works in the portfolio. The highest roles open every workspace without storing it — the caller
 * decides that before reading roles.
 */
export const mergeRoleWorkspaces = (roles: RoleGrants[]): TargetEnum[] => (
  roles.length ? uniq(roles.flatMap(getRoleWorkspaces)) : [TargetEnum.PORTFOLIO]
);

/**
 * Whether a row published on some targets is one the given workspaces may read: a row with no target
 * is the portfolio's, and a row published on both is read from either workspace.
 * @param targets the targets the row names (`targets` of an article, `[target]` of a project)
 * @param workspaces the workspaces the reader may use
 */
export const isInWorkspaces = (
  targets: (TargetEnum | undefined)[] | undefined,
  workspaces: TargetEnum[]
): boolean => {
  const rowTargets = (targets ?? []).filter((target): target is TargetEnum => !!target);

  return (rowTargets.length ? rowTargets : [TargetEnum.PORTFOLIO])
    .some((target) => workspaces.includes(target));
};

// a row naming no target is the portfolio's
const toEffectiveTargets = (targets: (TargetEnum | undefined)[] | undefined): TargetEnum[] => {
  const named = uniq((targets ?? []).filter((target): target is TargetEnum => !!target));

  return named.length ? named : [TargetEnum.PORTFOLIO];
};

/**
 * Whether saving a row keeps the writer inside the workspaces their roles open. A row the writer
 * cannot read cannot be changed, and the workspaces a save adds to the row or takes off it must be
 * ones the writer opens — a row shared with the other workspace stays editable, as long as that
 * other side is left as it was.
 * @param previousTargets the targets the row had before the save, `null` for a row being created
 * @param nextTargets the targets the row has after the save
 * @param workspaces the workspaces the writer may use
 */
export const isWriteWithinWorkspaces = (
  previousTargets: (TargetEnum | undefined)[] | null,
  nextTargets: (TargetEnum | undefined)[] | undefined,
  workspaces: TargetEnum[]
): boolean => {
  const next = toEffectiveTargets(nextTargets);

  if (previousTargets === null) return next.every((target) => workspaces.includes(target));

  const previous = toEffectiveTargets(previousTargets);

  if (!previous.some((target) => workspaces.includes(target))) return false;

  const changed = [...difference(previous, next), ...difference(next, previous)];

  return changed.every((target) => workspaces.includes(target));
};

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

  // a post opening Aldaron cannot be handed out by somebody who cannot work in Aldaron themselves
  const giverWorkspaces = mergeRoleWorkspaces(giverRoles);
  const isInGiverWorkspaces = getRoleWorkspaces(role)
    .every((workspace) => giverWorkspaces.includes(workspace));

  return hasEveryRight && hasEveryScreen && isInGiverCountries && isInGiverWorkspaces;
};
