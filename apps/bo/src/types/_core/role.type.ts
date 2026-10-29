
import { z } from 'zod';

import { roleSchema, rolesForUserSchema } from '@/validations/_core/role.validations';

/*
 * roleSchema spreads the translated fields' loosely typed `z.ZodObject<any>` shape (see
 * `generateTranslatedFieldsInputSchema`), which degrades `name`/`children`/`ui`/`rights` to
 * `unknown` in the raw `z.infer` — same issue documented on `IPageFormInput` in page.type.ts.
 * Intersecting with their real types below restores them without touching the (correct at
 * runtime) zod schema itself.
 */
export type IRoleInput = z.infer<typeof roleSchema> & {
  name: string;
  children: string[];
  ui?: string[];
  rights: IRightsItem[];
  // the form asks for hours; the role itself stores minutes (see IRoleAttributes below)
  sessionTimeoutHours?: number;
  /** the countries the role covers — none means every country */
  countries?: string[];
};
export type RolesForUserInput = z.infer<typeof rolesForUserSchema>;

export interface IRights {
  create: boolean;
  find: boolean;
  get: boolean;
  update: boolean;
  delete: boolean;
  destroy: boolean;
}

export interface IHasRights {
  canPreview: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canFind: boolean;
  canEdit: boolean;
  canDestroy: boolean;
}

export type IRoleAction = keyof IRights;

export interface IRightsItem {
  label?: string;
  className: string;
  rights: IRights;
}

export interface IRoleTranslatedFields {
  label: string;
}

/**
 * A role's labels, one entry per locale: `{ fr: { label }, en: { label }, … }`. Reading a label
 * off it directly (`translated.label`) always yields undefined — go through `getRoleLabel`.
 */
export type IRoleTranslated = Record<string, IRoleTranslatedFields>;

export interface IRoleAttributes {
  objectId: string;
  name: string;
  updatedAt?: string;
  createdAt?: string;
  rights: IRightsItem[];
  ui: string[];
  children: IRole[];
  count?: number;
  translated: IRoleTranslated;
  /**
   * inactivity timeout applied to the users holding this role, in minutes — left undefined, the
   * back-office falls back to its own default (see getSessionInactivityTimeoutMs in role.utils)
   */
  sessionTimeoutMinutes?: number;
  /** the countries the role covers — left out or empty, it covers every country */
  countries?: string[];
}

export type IRole = IRoleAttributes & { id: string };

/** an account holding OWNER or SUPER_ADMIN, as the owners review them */
export interface IHighestRoleAccount {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  isMfaEnabled: boolean;
  /** ISO date, absent for an account that has not signed in since sign-ins started being recorded */
  lastLoginAt?: string;
}

/** what makes an account holding a highest role one to check at the owners' review */
export type HighestRoleAccountIssue = 'mfaOff' | 'neverLoggedIn' | 'stale';

/**
 * What the signed-in account may do with the posts of another account: `lock` says why they cannot be
 * changed at all, `undelegableRoleNames` which of the posts listed cannot be given
 */
export interface IRolesDelegation {
  lock?: 'ownAccount' | 'highestRoleAccount' | 'staffAccount';
  undelegableRoleNames: string[];
}

export interface IRoleState {
  loading: boolean;
  role: IRole | null;
  roles: IRole[];
  userRoles: IRole[];
  // the roles of the account being read are fetched after its page is drawn, under their own flag
  userRolesLoading: boolean;
  currentUserRoles: IRole[];
  // the accounts holding a highest role, read by the owners and super administrators only
  highestRoleAccounts: IHighestRoleAccount[];
  highestRoleAccountsLoading: boolean;
  // what the signed-in account may do with the posts of the account on screen, asked of the server
  rolesDelegation: IRolesDelegation | null;
  // from the moment the posts of that account are asked for until the server has answered
  rolesDelegationLoading: boolean;
  isAdmin: boolean;
}

export interface ILoadRolesInput {
  limit: number;
  skip: number;
  withAdminOrBetter: boolean;
  withUsersCount: boolean;
  incrementItems: boolean;
  selects: string[];
}

// add new ui role here
export enum UIRoleEnum {
  /*
   * granular rights for the "Divers" page tabs — a role only sees the tabs it was granted,
   * instead of a single catch-all "miscellaneous" right gating the whole page
   */
  MIGRATIONS = 'migrations',
  CRON = 'cron',
  TESTS = 'tests',
  /*
   * lets a role's users log in as any non-admin user for support/debugging — never as an
   * OWNER/SUPER_ADMIN account, which `assertNotStaffAccount` blocks server-side regardless of
   * who holds this right (see impersonation.service.cloud.ts)
   */
  IMPERSONATION = 'impersonation',
  STATISTICS = 'statistics',
  /**
   * gates the Finance module (GMV vs net revenue, reconciliation) — distinct from STATISTICS so a
   * role can see operational stats without seeing the platform's actual retained revenue
   */
  FINANCE = 'finance',
  /**
   * lets a role's users write an announcement to a whole segment of the members at once (an
   * operator incident, a new feature). Its own right rather than the `create` right on
   * notifications: every domain of the platform creates notifications, while writing to the entire
   * membership is a decision a handful of people should be able to take. Checked server-side too
   * (see `BROADCAST_UI_RIGHT` in apps/server) — the client check only hides the page.
   */
  BROADCAST = 'broadcast',
  /**
   * lets a role's users staff the back-office without holding a highest role: invite a colleague, give
   * or take back a post, read the roles journal. Bounded server-side — never an owner or a
   * super-administrator, never their own account, only a post within their own rights — so the owners,
   * who are not employees, are not needed for the everyday work
   */
  STAFF = 'staff'
}

export type UIRole = `${UIRoleEnum}`;
