import {
  getDashboardAlerts, getDashboardKpis, getDashboardRecentActivity,
} from '../../services/_core/dashboard.service.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';

Parse.Cloud.define(
  'getDashboardKpis',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, unknown>> => (
    getDashboardKpis(request.user!, request.params.country)
  ))
);

Parse.Cloud.define(
  'getDashboardAlerts',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, unknown>> => (
    getDashboardAlerts(request.user!)
  ))
);

Parse.Cloud.define(
  'getDashboardRecentActivity',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, unknown>> => (
    getDashboardRecentActivity(request.user!)
  ))
);
