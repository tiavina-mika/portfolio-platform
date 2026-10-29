import { ComponentType } from 'react';

import {
  DASHBOARD_ALERT_FIELDS, DASHBOARD_KPI_FIELDS, DASHBOARD_RECENT_FIELDS,
} from '@/constants/_core/dashboard.constants';
import { IDashboardKpis, IDashboardRecent, IDashboardStats } from '@/types/_core/dashboard.type';

/**
 * Open registries: a business domain (ride/request, or a future non-carpooling domain)
 * contributes extra KPI cards / recent-activity columns to the generic dashboard
 * (`pages/Home.tsx`, `containers/dashboard/`) instead of `KpiSection.tsx`/`RecentSection.tsx`
 * hard-importing ride/request fields, so the generic core stays reusable by a non-carpooling clone.
 */
export type DashboardKpiCardComponent = ComponentType<{ kpis: IDashboardKpis }>;

export type DashboardKpiCard = {
  key: string;
  // the figure the card draws: the card is left out when the server did not send it
  field: keyof IDashboardKpis;
  Component: DashboardKpiCardComponent;
  order?: number;
};

const dashboardKpiCards: DashboardKpiCard[] = [];

export const registerDashboardKpiCard = (card: DashboardKpiCard): void => {
  dashboardKpiCards.push(card);
};

export const getDashboardKpiCards = (): DashboardKpiCard[] =>
  [...dashboardKpiCards].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export type DashboardRecentColumnComponent = ComponentType<{ recent: IDashboardRecent }>;

export type DashboardRecentColumn = {
  key: string;
  // the rows the column lists: the column is left out when the server did not send them
  field: keyof IDashboardRecent;
  Component: DashboardRecentColumnComponent;
  order?: number;
};

const dashboardRecentColumns: DashboardRecentColumn[] = [];

export const registerDashboardRecentColumn = (column: DashboardRecentColumn): void => {
  dashboardRecentColumns.push(column);
};

export const getDashboardRecentColumns = (): DashboardRecentColumn[] =>
  [...dashboardRecentColumns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export type DashboardCoverage = 'full' | 'partial' | 'none';

/**
 * How much of the dashboard the account sees, from the parts the server sent: every part of every
 * band (`full`), some of them (`partial`) or none (`none`) — in which case there is nothing to draw.
 */
export const getDashboardCoverage = ({ kpis, alerts, recent }: IDashboardStats): DashboardCoverage => {
  const parts = [
    ...[...DASHBOARD_KPI_FIELDS, ...getDashboardKpiCards().map((card) => card.field)]
      .map((field) => kpis[field]),
    ...DASHBOARD_ALERT_FIELDS.map((field) => alerts[field]),
    ...[...DASHBOARD_RECENT_FIELDS, ...getDashboardRecentColumns().map((column) => column.field)]
      .map((field) => recent[field]),
  ];
  const sentCount = parts.filter((part) => part !== undefined).length;

  if (sentCount === 0) return 'none';

  return sentCount < parts.length ? 'partial' : 'full';
};
