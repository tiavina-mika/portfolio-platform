import Parse from 'parse';

import {
  ICancellationReasonPoint,
  ICancellationStatistics,
  IOverviewStatistics,
  IPaymentsStatistics,
  IReportsStatistics,
  IRideActivityHeatmapPoint,
  IRidesStatistics,
  ISuspendedUserPoint,
  IUsersStatistics,
  IVehiclesStatistics,
  StatisticsPeriod,
} from '@/types/_core/statistics.type';

export const fetchOverviewStatistics = async (country?: string): Promise<IOverviewStatistics> => {
  return Parse.Cloud.run('getOverviewStatistics', { country });
};

export const fetchUsersStatistics = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<IUsersStatistics> => {
  return Parse.Cloud.run('getUsersStatistics', { period, country });
};

export const fetchRidesStatistics = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<IRidesStatistics> => {
  return Parse.Cloud.run('getRidesStatistics', { period, country });
};

export const fetchRidesActivityHeatmap = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<IRideActivityHeatmapPoint[]> => {
  return Parse.Cloud.run('getRidesActivityHeatmap', { period, country });
};

export const fetchPaymentsStatistics = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<IPaymentsStatistics> => {
  return Parse.Cloud.run('getPaymentsStatistics', { period, country });
};

export const fetchVehiclesStatistics = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<IVehiclesStatistics> => {
  return Parse.Cloud.run('getVehiclesStatistics', { period, country });
};

export const fetchCancellationStatistics = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<ICancellationStatistics> => {
  return Parse.Cloud.run('getCancellationStatistics', { period, country });
};

export const fetchReportsStatistics = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<IReportsStatistics> => {
  return Parse.Cloud.run('getReportsStatistics', { period, country });
};

export const fetchCancellationReasonBreakdown = async (
  period?: StatisticsPeriod,
  country?: string
): Promise<ICancellationReasonPoint[]> => {
  return Parse.Cloud.run('getCancellationReasonBreakdown', { period, country });
};

export const fetchSuspendedUsers = async (country?: string): Promise<ISuspendedUserPoint[]> => {
  return Parse.Cloud.run('getSuspendedUsers', { country });
};

/**
 * Ends an automatic cancellation suspension before its own expiry. `withPenalty` also writes off
 * the fine that came with it — a suspension lifted because the cancellation turned out to be
 * justified clears the fine; one lifted as a gesture does not.
 */
export const clearUserSuspensionInCloud = async (
  userId: string,
  withPenalty: boolean,
  /*
   * why support decided it. Required by the server when the fine goes with the lifting: that is
   * revenue given up, and the reason is recorded in the moderation log and in the driver's own
   * penalty history, which is where a debt that disappeared has to be accounted for.
   */
  reason?: string
): Promise<boolean> => {
  return Parse.Cloud.run('clearUserSuspension', { userId, withPenalty, reason });
};
