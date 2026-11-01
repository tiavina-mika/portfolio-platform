import dayjs from 'dayjs';

import {
  collections, DASHBOARD_RECENT_ROWS_LIMIT, USE_MASTER_KEY,
} from '@/constants/_core/constants';

import { getAllRoleUserIds, getRolesForUser } from './userRole.service.cloud';
import { newAgentQuery } from '../../utils/_core/parse.utils.cloud';
import { isHighestRole, rolesGrantRight } from '../../utils/_core/role.utils.cloud';

export interface IDashboardKpiContext {
  weekAgo: Date;
}

export type DashboardKpis = Record<string, unknown>;
export type DashboardRecentActivity = Record<string, unknown>;

type DashboardKpiProvider = (context: IDashboardKpiContext) => Promise<DashboardKpis>;
type DashboardRecentActivityProvider = () => Promise<DashboardRecentActivity>;

/**
 * a provider and the collection its figures come from: the dashboard is open to every back-office
 * account, so each part is only computed for an account allowed to list that collection
 */
type Registered<T> = { className: string; provider: T };

const kpiProviders: Registered<DashboardKpiProvider>[] = [];
const recentActivityProviders: Registered<DashboardRecentActivityProvider>[] = [];

/**
 * Lets each business domain
 * contribute its own dashboard KPIs/recent activity, without this generic
 * service knowing about domain-specific types (e.g. project.type.ts).
 * @param className the collection the provider reads, whose `find` right gates it
 */
export const registerDashboardKpiProvider = (className: string, provider: DashboardKpiProvider): void => {
  kpiProviders.push({ className, provider });
};

export const registerDashboardRecentActivityProvider = (
  className: string,
  provider: DashboardRecentActivityProvider
): void => {
  recentActivityProviders.push({ className, provider });
};

// the providers whose collection the account may list — the account's roles are read once for all of them
const getAllowedProviders = async <T>(registered: Registered<T>[], user: Parse.User): Promise<T[]> => {
  if (await isHighestRole(user)) return registered.map(({ provider }) => provider);

  const roles = (await getRolesForUser(user)) ?? [];

  return registered
    .filter(({ className }) => rolesGrantRight(roles, className, ['find']))
    .map(({ provider }) => provider);
};

const getUserDashboardKpis = async ({ weekAgo }: IDashboardKpiContext): Promise<DashboardKpis> => {
  /*
   * staff accounts (any Parse.Role, including dynamically created custom roles) are excluded
   * from user-facing counts even when they also hold a real platform account (e.g. an admin
   * who also owns a project)
   */
  const staffUserIds = await getAllRoleUserIds();

  const [totalUsers, newUsersThisWeek] = await Promise.all([
    newAgentQuery(Parse.User)
      .notEqualTo('deleted', true)
      .notContainedIn('objectId', staffUserIds)
      .count(USE_MASTER_KEY),
    newAgentQuery(Parse.User)
      .greaterThanOrEqualTo('createdAt', weekAgo)
      .notContainedIn('objectId', staffUserIds)
      .count(USE_MASTER_KEY),
  ]);

  return { totalUsers, newUsersThisWeek };
};

const getUserDashboardRecentActivity = async (): Promise<DashboardRecentActivity> => {
  const recentUsers = await newAgentQuery(Parse.User)
    .notEqualTo('deleted', true)
    .descending('createdAt')
    .limit(DASHBOARD_RECENT_ROWS_LIMIT)
    // `phone` too: a member who signed up by phone has no email, and no name until the profile step
    .select(['firstName', 'lastName', 'email', 'phone', 'createdAt'])
    .find(USE_MASTER_KEY);

  return { users: recentUsers.map(u => u.toJSON()) };
};

registerDashboardKpiProvider(collections.User, getUserDashboardKpis);
registerDashboardRecentActivityProvider(collections.User, getUserDashboardRecentActivity);

const getKpiContext = (): IDashboardKpiContext => ({
  weekAgo: dayjs().subtract(7, 'day').toDate(),
});

const merge = (results: Record<string, unknown>[]): Record<string, unknown> => Object.assign({}, ...results);

/*
 * The dashboard is read as two calls — KPIs and recent activity — rather than one: each band of
 * the page is drawn as soon as its own part is in, instead of every band waiting for the slowest
 * part (the recent rows, with their joined records).
 */

/**
 * the KPI figures contributed by every registered provider (generic + each business domain) the
 * account may read — a figure it may not read is left out, never sent as zero
 */
export const getDashboardKpis = async (user: Parse.User): Promise<DashboardKpis> => {
  const context = getKpiContext();
  const providers = await getAllowedProviders(kpiProviders, user);

  return merge(await Promise.all(providers.map(provider => provider(context))));
};

/**
 * the recent activity columns contributed by every registered provider the account may read
 */
export const getDashboardRecentActivity = async (user: Parse.User): Promise<DashboardRecentActivity> => {
  const providers = await getAllowedProviders(recentActivityProviders, user);

  return merge(await Promise.all(providers.map(provider => provider())));
};
