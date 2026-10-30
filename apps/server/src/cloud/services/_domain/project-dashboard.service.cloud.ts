import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';

import { USE_MASTER_KEY } from '@/constants/_core/constants';

import {
  type DashboardKpis,
  registerDashboardKpiProvider,
} from '../_core/dashboard.service.cloud';

// projects carry no country, so these counts need no agent country scope
const getProjectDashboardKpis = async (): Promise<DashboardKpis> => {
  const [projects, activeProjects] = await Promise.all([
    new Parse.Query(DOMAIN_COLLECTIONS.project)
      .equalTo('deleted', false)
      .count(USE_MASTER_KEY),

    new Parse.Query(DOMAIN_COLLECTIONS.project)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .count(USE_MASTER_KEY),
  ]);

  return { projects, activeProjects };
};

registerDashboardKpiProvider(DOMAIN_COLLECTIONS.project, getProjectDashboardKpis);
