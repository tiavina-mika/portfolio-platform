import { DOMAIN_COLLECTIONS } from '@shared/domain-constants';

import { USE_MASTER_KEY } from '@/constants/_core/constants';

import { workspacesTargetQuery } from '../../utils/_core/parse.utils.cloud';
import {
  type DashboardKpis,
  type IDashboardKpiContext,
  registerDashboardKpiProvider,
} from '../_core/dashboard.service.cloud';

// projects carry no country, so these counts need no agent country scope; they stay in the caller's workspaces
const getProjectDashboardKpis = async ({ workspaces }: IDashboardKpiContext): Promise<DashboardKpis> => {
  const buildQuery = () => workspacesTargetQuery(
    new Parse.Query(DOMAIN_COLLECTIONS.project),
    workspaces,
    'target'
  ).equalTo('deleted', false);

  const [projects, activeProjects] = await Promise.all([
    buildQuery().count(USE_MASTER_KEY),
    buildQuery().equalTo('active', true).count(USE_MASTER_KEY),
  ]);

  return { projects, activeProjects };
};

registerDashboardKpiProvider(DOMAIN_COLLECTIONS.project, getProjectDashboardKpis);
