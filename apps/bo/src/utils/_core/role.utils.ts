import {
  ROLE_SESSION_TIMEOUT_MAX_MINUTES, ROLE_SESSION_TIMEOUT_MIN_MINUTES, SHARED_CLASS_ALIASES,
} from '@shared/constants';
import dayjs from 'dayjs';
import clamp from 'lodash/clamp';

import { COLLECTIONS, DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import {
  MINUTES_PER_HOUR, MS_PER_MINUTE, SESSION_INACTIVITY_TIMEOUT_MS,
} from '@/constants/_core/auth.constants';
import { PAYMENT_FAILED_NOTIFICATION_KEY } from '@/constants/_core/payment.constants';
import { HIGHEST_LEVEL_ROLES, HIGHEST_ROLE_STALE_LOGIN_DAYS } from '@/constants/_core/user.constants';
import { ITabSearchParams } from '@/types/_core/app.type';
import { ISidebarSubMenu } from '@/types/_core/navigation.type';
import {
  HighestRoleAccountIssue, IHasRights, IHighestRoleAccount,
  IRightsItem, IRole, IRoleAction, UIRoleEnum,
} from '@/types/_core/role.type';
import { isCurrentTab } from '@/utils/_core/app.utils';

/**
 * the "Divers" page used to be gated by a single catch-all "miscellaneous" UI right, later split
 * into one right per tab (migrations, cron, tests) so a role can be granted only some of them —
 * roles saved before the split still carry the old value, so it's treated as granting all three
 * tabs to avoid silently locking existing roles out of a page they already had access to
 */
const LEGACY_MISCELLANEOUS_UI_RIGHT = 'miscellaneous';
const TABS_MIGRATED_FROM_MISCELLANEOUS: string[] = [
  UIRoleEnum.MIGRATIONS, UIRoleEnum.CRON, UIRoleEnum.TESTS,
];

const roleHasUiRight = (role: IRole, right: string): boolean => {
  if (role.ui?.includes(right)) return true;

  return TABS_MIGRATED_FROM_MISCELLANEOUS.includes(right) &&
    !!role.ui?.includes(LEGACY_MISCELLANEOUS_UI_RIGHT);
};

/**
 * classes/keys that must always be governed by another class's rights instead of having their
 * own entry in the role rights UI — the class aliases are shared with the server (`SHARED_CLASS_ALIASES`,
 * kept in sync with `CLP_CLASS_ALIASES`); `PAYMENT_FAILED_NOTIFICATION_KEY` is BO-only since it's
 * a status-filtered subset of Payment, not a real Parse class — it follows the same rights as
 * Payment (see the notifications audit §8.2)
 */
const RIGHTS_CLASS_ALIASES: Record<string, string> = {
  ...SHARED_CLASS_ALIASES,
  [PAYMENT_FAILED_NOTIFICATION_KEY]: COLLECTIONS.payment,
};

const resolveRightsClassName = (className?: string): string | undefined => (
  className ? RIGHTS_CLASS_ALIASES[className] ?? className : className
);

/**
 * action based on roles and rights
 * @param roles
 * @param className
 * @param action {find, get, update, delete}
 * @returns
 */
export const canAccessTo = (
  roles: IRole[],

  /**
   * class name of the object = collection name
   * @example '_User', 'Role', 'Article', ...
   */
  className?: string,

  /**
   * action to perform on the object (database action)
   * it differs from the ui role by the fact that it's used for database access
   * NOTE: it is not needed for UI access
   * @example 'find', 'get', 'update', 'delete'
   */
  action: IRoleAction = 'find',

  /**
   * ui role(s) to check
   * it differs from the database role by the fact that it's used for UI access
   * an array checks for access to ANY of the given rights (ex: a page gated by several tabs,
   * each with its own right)
   * @example access to a tab, a page, a menu, (migrations, cron, tests, ...)
   */
  uiRight?: string | string[]
): boolean => {
  // high level roles can access to all
  const hasHighestRoles = roles.some((role: IRole) => HIGHEST_LEVEL_ROLES.includes(role.name));

  if (hasHighestRoles) {
    return true;
  }

  // Rights for resources (database collections), ex: _User, _Role, Article, Page, Category
  if (className) {
    const resolvedClassName = resolveRightsClassName(className);

    for (const role of roles) {
      const rights = role.rights;

      if (rights) {
        const right = rights.find(
          (right: IRightsItem) => right.className === resolvedClassName && right.rights[action]
        );

        if (right) {
          return true;
        }
      }
    }
    return false;
  }

  // UI rights (ex: migrations, cron, tests)
  if (uiRight) {
    const uiRights = Array.isArray(uiRight) ? uiRight : [uiRight];

    return roles.some((role: IRole) => uiRights.some((right) => roleHasUiRight(role, right)));
  }

  return false;
};

export const getRights = (
  roles: IRole[],
  className?: string,
  uiRight?: string | string[]
): any => {
  // high level roles can access to all
  const hasHighestRoles = roles.some((role: IRole) => HIGHEST_LEVEL_ROLES.includes(role.name));

  const rightsObj: IHasRights = {
    canPreview: false,
    canDelete: false,
    canCreate: false,
    canFind: false,
    canEdit: false,
    canDestroy: false,
  };

  if (hasHighestRoles) {
    Object.keys(rightsObj).forEach((key: string) => (rightsObj[key as keyof IHasRights] = true));
    return rightsObj;
  }

  // Rights for resources (database collections), ex: _User, _Role, Article, Page, Category
  if (className) {
    const resolvedClassName = resolveRightsClassName(className);

    for (const role of roles) {
      const rights = role.rights;

      if (rights) {
        const right = rights.find((right: IRightsItem) => right.className === resolvedClassName);

        // the rights of every role add up, as in `canAccessTo` and on the server
        if (right) {
          rightsObj.canCreate ||= !!right.rights.create;
          rightsObj.canFind ||= !!right.rights.find;
          rightsObj.canPreview ||= !!right.rights.get;
          rightsObj.canEdit ||= !!right.rights.update;
          rightsObj.canDelete ||= !!right.rights.delete;
          rightsObj.canDestroy ||= !!right.rights.destroy;
        }
      }
    }
  }

  // UI rights (ex: migrations, cron, tests)
  if (uiRight) {
    const uiRights = Array.isArray(uiRight) ? uiRight : [uiRight];
    const hasUIRight = roles.some(
      (role: IRole): boolean => uiRights.some((right) => roleHasUiRight(role, right))
    );

    if (hasUIRight) {
      rightsObj.canFind = true;
      rightsObj.canPreview = true;
    }
  }

  return rightsObj;
};

/**
 * whether the roles let the account open a navigation entry — the sidebar and every other list of
 * pages the account can reach read the same answer
 */
export const canOpenMenuItem = (roles: IRole[], menuItem: ISidebarSubMenu): boolean => (
  !!menuItem.alwaysVisible ||
  !!getRights(roles, menuItem.className, menuItem.uiRight)[menuItem.hasRightName!]
);

/**
 * get rights for a collection
 * it's used to display the rights in the UI
 */
type IGetActionRightsOutput = {
  canDelete: boolean;
  canPreview: boolean;
  canEdit: boolean;
  canDestroy: boolean;
  canCreate: boolean;
};

export const getActionRights = <T extends Partial<ITabSearchParams>>(
  roles: IRole[],
  collection: string,
  searchParams: T
): IGetActionRightsOutput => {
  const canDelete = canAccessTo(roles, collection, 'delete');
  const canPreview = canAccessTo(roles, collection, 'get');
  const canEdit = canAccessTo(roles, collection, 'update');
  const canCreate = canAccessTo(roles, collection, 'create');

  const canDestroy = isCurrentTab(searchParams.tab) &&
    canAccessTo(roles, collection, 'destroy');

  return { canDelete, canPreview, canEdit, canDestroy, canCreate };
};

/**
 * inactivity timeout (in ms) that applies to a user, resolved from the roles they hold.
 *
 * A multi-role user gets the SHORTEST timeout of their roles: a permissive role must never widen
 * the window a stricter one grants. A role that carries no custom value counts as the back-office
 * default, and so does an empty roles array — roles are fetched asynchronously when the dashboard
 * mounts, and falling back to the default rather than to a longer value keeps the strict timeout
 * in force while they are still loading.
 */
export const getSessionInactivityTimeoutMs = (roles: IRole[]): number => {
  if (!roles.length) return SESSION_INACTIVITY_TIMEOUT_MS;

  const timeouts = roles.map((role: IRole): number => {
    const minutes = role.sessionTimeoutMinutes;

    if (typeof minutes !== 'number' || !Number.isFinite(minutes)) {
      return SESSION_INACTIVITY_TIMEOUT_MS;
    }

    /*
     * clamped on read as well as on write: a value can reach the database without going through
     * the role form (data migration, direct edit), and an out-of-range one would either lock
     * everyone out instantly or disable the inactivity protection entirely
     */
    const boundedMinutes = clamp(
      minutes, ROLE_SESSION_TIMEOUT_MIN_MINUTES, ROLE_SESSION_TIMEOUT_MAX_MINUTES
    );

    return boundedMinutes * MS_PER_MINUTE;
  });

  return Math.min(...timeouts);
};

/**
 * the role form asks for the timeout in hours, the role stores it in minutes — these two convert
 * between the two units at that boundary. Everything else (storage, cloud validation, the
 * inactivity hook) works in minutes only.
 */
export const getSessionTimeoutHoursFromMinutes = (minutes?: number): number | undefined => (
  typeof minutes === 'number' ? minutes / MINUTES_PER_HOUR : undefined
);

/**
 * rounded to a whole minute: the input allows any typed value, not only the quarter-hour steps,
 * and a fractional minute has no meaning for the stored field
 */
export const getSessionTimeoutMinutesFromHours = (hours?: number): number | null => (
  typeof hours === 'number' ? Math.round(hours * MINUTES_PER_HOUR) : null
);

/**
 * How a role names itself on screen: its label in the reader's language, the label in the default
 * language when it has not been translated yet, and the raw role name when it has no label at all
 * — roles created before the "translated" field existed carry none, and a role has to be
 * identifiable in every case rather than showing an empty chip.
 * @param role
 * @param locale the reader's language
 * @returns a label that is never empty
 */
export const getRoleLabel = (role: IRole, locale: string): string => {
  return role.translated?.[locale]?.label || role.translated?.[DEFAULT_LOCALE]?.label || role.name;
};

/**
 * whether the roles of the signed-in account should be re-read: only when the tab is visible and
 * the last read is older than the minimum interval
 */
export const shouldRefreshRoles = (
  visibilityState: string,
  lastRefreshAt: number,
  now: number,
  minIntervalMs: number
): boolean => visibilityState === 'visible' && now - lastRefreshAt >= minIntervalMs;

/**
 * The countries the signed-in user may work on, or `null` when nothing limits them. The same rule as
 * the server's, which is the one that enforces it: a role lists the countries it covers, an empty
 * list covers every country, and the roles of a user add up — one role without a limit lifts it.
 * Roles are fetched after the dashboard mounts, so an empty list of roles limits nothing yet.
 */
export const getAllowedCountryCodes = (roles: IRole[], isAdmin: boolean): string[] | null => {
  if (isAdmin || !roles.length) return null;

  const scopes = roles.map((role: IRole): string[] => role.countries ?? []);

  if (scopes.some((countries) => countries.length === 0)) return null;

  return [...new Set(scopes.flat())];
};

/**
 * Why an account holding a highest role is one to check at the owners' review: its second factor is
 * off, nobody ever signed in with it, or its last sign-in is older than the staleness threshold.
 * An empty list means nothing to check.
 */
export const getHighestRoleAccountIssues = (account: IHighestRoleAccount): HighestRoleAccountIssue[] => {
  const issues: HighestRoleAccountIssue[] = [];

  if (!account.isMfaEnabled) issues.push('mfaOff');
  if (!account.lastLoginAt) issues.push('neverLoggedIn');
  else if (dayjs().diff(dayjs(account.lastLoginAt), 'day') > HIGHEST_ROLE_STALE_LOGIN_DAYS) {
    issues.push('stale');
  }
  return issues;
};

/** the accounts to check first; the others keep their order */
export const sortHighestRoleAccountsToCheckFirst = (
  accounts: IHighestRoleAccount[]
): IHighestRoleAccount[] => [...accounts].sort((a, b) => (
  Number(getHighestRoleAccountIssues(b).length > 0) - Number(getHighestRoleAccountIssues(a).length > 0)
));
