import Parse from 'parse';

import { IDashboardKpis, IDashboardRecent } from '@/types/_core/dashboard.type';

export const fetchDashboardKpis = async (country?: string): Promise<IDashboardKpis> => {
  return Parse.Cloud.run('getDashboardKpis', { country });
};

export const fetchDashboardRecent = async (): Promise<IDashboardRecent> => {
  return Parse.Cloud.run('getDashboardRecentActivity');
};
