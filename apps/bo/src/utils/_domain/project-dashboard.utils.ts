import { lazy } from 'react';

import '@/types/_domain/project-dashboard.type';
import { registerDashboardKpiCard, registerDashboardRecentColumn } from '@/utils/_core/dashboard.utils';

/**
 * Side-effect only: registers the project KPI card and recent-activity column for the generic
 * dashboard, so the core dashboard never imports a project of its own. Imported once for effect from
 * `config/domain-registrations.ts`, the composition point loaded eagerly at app startup.
 *
 * The components are registered lazily: this module sits in the entry chunk, and a static import
 * would drag every registered container into the first paint of every page, when they are only
 * drawn once the dashboard is open. The consumers render them inside a Suspense boundary with a
 * skeleton of the same shape.
 */

const ActiveProjectsKpiCard = lazy(async () => ({
  default: (await import('@/containers/_domain/dashboard/ProjectDashboardKpiCards')).ActiveProjectsKpiCard,
}));

const RecentProjectsColumn = lazy(async () => ({
  default: (await import('@/containers/_domain/dashboard/ProjectDashboardRecentColumns')).RecentProjectsColumn,
}));

registerDashboardKpiCard({
  key: 'activeProjects',
  field: 'activeProjects',
  order: 10,
  Component: ActiveProjectsKpiCard,
});

registerDashboardRecentColumn({
  key: 'recentProjects',
  field: 'projects',
  order: 10,
  Component: RecentProjectsColumn,
});
