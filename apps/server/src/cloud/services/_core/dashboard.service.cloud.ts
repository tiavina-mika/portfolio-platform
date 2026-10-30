import { PaymentStatusEnum } from '@shared/types';
import { startOfInZone } from '@shared/utils';
import dayjs from 'dayjs';

import {
  collections, DASHBOARD_ALERT_ROWS_LIMIT, DASHBOARD_RECENT_ROWS_LIMIT, OPEN_REPORT_STATUSES, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { STATISTICS_TIME_ZONE } from '@/constants/_core/statistics.constants';
import { resolveScopedCountry } from '@/utils/_core/agent-context.utils';

import { attachReportListFields } from './report-list.service.cloud';
import { getAllRoleUserIds, getRolesForUser } from './userRole.service.cloud';
import { newAgentQuery } from '../../utils/_core/parse.utils.cloud';
import { isHighestRole, rolesGrantRight } from '../../utils/_core/role.utils.cloud';

export interface IDashboardKpiContext {
  weekAgo: Date;
  monthStart: Date;
  todayStart: Date;
  /** ISO 4217 code the money figures are summed in */
  currency: string;
}

export type DashboardKpis = Record<string, unknown>;
export type DashboardAlerts = Record<string, unknown>;
export type DashboardRecentActivity = Record<string, unknown>;

type DashboardKpiProvider = (context: IDashboardKpiContext) => Promise<DashboardKpis>;
type DashboardAlertsProvider = () => Promise<DashboardAlerts>;
type DashboardRecentActivityProvider = () => Promise<DashboardRecentActivity>;

/**
 * a provider and the collection its figures come from: the dashboard is open to every back-office
 * account, so each part is only computed for an account allowed to list that collection — a role
 * without any right on payments must not read the month's revenue off the home page
 */
type Registered<T> = { className: string; provider: T };

const kpiProviders: Registered<DashboardKpiProvider>[] = [];
const alertsProviders: Registered<DashboardAlertsProvider>[] = [];
const recentActivityProviders: Registered<DashboardRecentActivityProvider>[] = [];

/**
 * Lets each business domain (ride/request, or any other transaction-based domain)
 * contribute its own dashboard KPIs/alerts/recent activity, without this generic
 * service knowing about domain-specific types (e.g. ride.type.ts).
 * @param className the collection the provider reads, whose `find` right gates it
 */
export const registerDashboardKpiProvider = (className: string, provider: DashboardKpiProvider): void => {
  kpiProviders.push({ className, provider });
};

export const registerDashboardAlertsProvider = (
  className: string,
  provider: DashboardAlertsProvider
): void => {
  alertsProviders.push({ className, provider });
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
   * who also rides as a passenger)
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

const getPaymentDashboardKpis = async (
  { monthStart, currency }: IDashboardKpiContext
): Promise<DashboardKpis> => {
  const successfulPayments = await newAgentQuery(collections.Payment)
    .equalTo('status', PaymentStatusEnum.SUCCESS)
    .equalTo('currency', currency)
    .greaterThanOrEqualTo('createdAt', monthStart)
    .select(['amount'])
    .find(USE_MASTER_KEY);

  const monthRevenue = successfulPayments.reduce((sum, p) => sum + (p.get('amount') ?? 0), 0);

  return { monthRevenue, monthRevenueCurrency: currency, monthPaymentsCount: successfulPayments.length };
};

/*
 * the card names the few latest failures, but its count is the whole backlog: an operator who sees
 * "3" next to three rows has no way to tell that forty more are waiting behind the link
 */
const getPaymentDashboardAlerts = async (): Promise<DashboardAlerts> => {
  const [failedPayments, failedPaymentsCount] = await Promise.all([
    newAgentQuery(collections.Payment)
      .equalTo('status', PaymentStatusEnum.FAILED)
      .descending('createdAt')
      .limit(DASHBOARD_ALERT_ROWS_LIMIT)
      .select(['amount', 'failureReason', 'type', 'snapshot', 'createdAt'])
      .find(USE_MASTER_KEY),
    newAgentQuery(collections.Payment)
      .equalTo('status', PaymentStatusEnum.FAILED)
      .count(USE_MASTER_KEY),
  ]);

  return { failedPayments: failedPayments.map(p => p.toJSON()), failedPaymentsCount };
};

/*
 * reports still owed a decision, newest first. A report names its target by id only, so the rows
 * go through the same label resolution as the report queue — a bare id tells an operator nothing
 */
const getReportDashboardAlerts = async (): Promise<DashboardAlerts> => {
  const [reports, openReportsCount] = await Promise.all([
    newAgentQuery(collections.Report)
      .equalTo('deleted', false)
      .containedIn('status', OPEN_REPORT_STATUSES)
      .descending('createdAt')
      .limit(DASHBOARD_ALERT_ROWS_LIMIT)
      .select(['reason', 'status', 'targetType', 'targetId', 'createdAt'])
      .find(USE_MASTER_KEY),
    newAgentQuery(collections.Report)
      .equalTo('deleted', false)
      .containedIn('status', OPEN_REPORT_STATUSES)
      .count(USE_MASTER_KEY),
  ]);

  const openReports = await attachReportListFields(reports);

  return { openReports: openReports.map(r => r.toJSON()), openReportsCount };
};

registerDashboardKpiProvider(collections.User, getUserDashboardKpis);
registerDashboardKpiProvider(collections.Payment, getPaymentDashboardKpis);
registerDashboardAlertsProvider(collections.Payment, getPaymentDashboardAlerts);
registerDashboardAlertsProvider(collections.Report, getReportDashboardAlerts);
registerDashboardRecentActivityProvider(collections.User, getUserDashboardRecentActivity);

const getKpiContext = (country?: string): IDashboardKpiContext => ({
  weekAgo: dayjs().subtract(7, 'day').toDate(),
  monthStart: startOfInZone(new Date(), STATISTICS_TIME_ZONE, 'month'),
  todayStart: startOfInZone(new Date(), STATISTICS_TIME_ZONE, 'day'),
  currency: resolveScopedCountry(country).currency,
});

const merge = (results: Record<string, unknown>[]): Record<string, unknown> => Object.assign({}, ...results);

/*
 * The dashboard is read as three calls — KPIs, alerts, recent activity — rather than one: each
 * band of the page is drawn as soon as its own part is in, instead of every band waiting for the
 * slowest part (the recent rows, with their joined driver/passenger, and the alert rows, which
 * resolve each report's target label in a second round-trip).
 */

/**
 * the KPI figures contributed by every registered provider (generic + each business domain) the
 * account may read — a figure it may not read is left out, never sent as zero
 */
export const getDashboardKpis = async (user: Parse.User, country?: string): Promise<DashboardKpis> => {
  const context = getKpiContext(country);
  const providers = await getAllowedProviders(kpiProviders, user);

  return merge(await Promise.all(providers.map(provider => provider(context))));
};

/**
 * the alert cards contributed by every registered provider the account may read
 */
export const getDashboardAlerts = async (user: Parse.User): Promise<DashboardAlerts> => {
  const providers = await getAllowedProviders(alertsProviders, user);

  return merge(await Promise.all(providers.map(provider => provider())));
};

/**
 * the recent activity columns contributed by every registered provider the account may read
 */
export const getDashboardRecentActivity = async (user: Parse.User): Promise<DashboardRecentActivity> => {
  const providers = await getAllowedProviders(recentActivityProviders, user);

  return merge(await Promise.all(providers.map(provider => provider())));
};
