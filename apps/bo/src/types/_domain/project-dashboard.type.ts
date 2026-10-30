import type { DashboardRow } from '@/types/_core/dashboard.type';
import type { IProject } from '@/types/_domain/project.type';

/**
 * Module augmentation: adds the project fields onto the generic `IDashboardKpis`/`IDashboardRecent`
 * without that generic file importing anything project-specific, so the dashboard still builds for
 * a platform without the project domain.
 */
declare module '@/types/_core/dashboard.type' {
  // optional like the generic parts: left out for an account that may not list projects
  interface IDashboardKpis {
    activeProjects?: number;
    projects?: number;
  }

  interface IDashboardRecent {
    projects?: DashboardRow<IProject>[];
  }
}
