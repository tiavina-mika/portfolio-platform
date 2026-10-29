import Parse from 'parse';

import { IDashboardAlerts, IDashboardKpis, IDashboardRecent } from '@/types/_core/dashboard.type';

export const fetchDashboardKpis = async (country?: string): Promise<IDashboardKpis> => {
  return Parse.Cloud.run('getDashboardKpis', { country });
};

export const fetchDashboardAlerts = async (): Promise<IDashboardAlerts> => {
  return Parse.Cloud.run('getDashboardAlerts');
};

export const fetchDashboardRecent = async (): Promise<IDashboardRecent> => {
  return Parse.Cloud.run('getDashboardRecentActivity');
};
