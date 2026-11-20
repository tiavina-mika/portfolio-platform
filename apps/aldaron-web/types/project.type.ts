// the supports a project is delivered on: a website, a web app, a mobile app, a back office
export type ProjectSupportType = 'web' | 'app' | 'mobile' | 'bo';

/**
 * A delivered project of the projects page. Its texts (field, summary, price) are translated:
 * they live in the `ProjectsPage` messages under the `id` of the project.
 */
export interface IProject {
  id: string;
  name: string;
  supports: ProjectSupportType[];
  // number of screens delivered on each support the project holds
  screens: Partial<Record<ProjectSupportType, number>>;
  // delivery lead time
  weeks: number;
}
