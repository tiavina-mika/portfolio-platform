'use server';

import { MetadataRoute } from 'next';

import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { IServerResponse } from '@/types/app.type';
import { ICategory, IProjectInputQuery } from '@/types/cms.type';
import { getAbsoluteUrl } from '@/utils/app.utils';
import { collections } from '@/utils/constants';
import { retrievePathnameFromDynamicPathname } from '@/utils/next.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { escapeUnSlugifyText } from '@/utils/utils';
import { getParseServer } from '@/config/parse-server.config';
import { IProject } from '@/types/project.type';

const Parse = getParseServer();

export const getProject = async (
  slug: string,
  locale: Locale
): Promise<IServerResponse<Parse.Object | undefined>> => {
  try {
    // make server side because we need to retrieve the author (user)
    const project = await Parse.Cloud.run('getProjectForClient', {
      slug,
      locale,
      defaultLocale,
    });

    return project;
  }
  catch (error) {
    return { error: (error as Error).message };
  }
};

/**
 * get paginated projects
 * tags and categories are search params
 * NOTE: if retrieving projects author (user), should use as a cloud function
 * @param param0
 * @returns
 */
export const getProjects = async ({
  limit,
  skip,
  orderedBy = 'dateStart',
  order = 'asc',
  locale,
  tag,
  technologies,
  society,
  otherThanProjectId,
}: IProjectInputQuery): Promise<
  IServerResponse<{ projects: IProject[]; count: number }>
> => {
  try {
    let query = new Parse.Query(collections.Project);

    // query by tags
    if (tag) {
      const or: any[] = [];

      locales.forEach((locale: string) => {
        or.push(
          // ex: translated.fr.tags = "Bonjour"
          new Parse.Query(collections.Project).matches(
            `translated.${locale}.tags`,
            escapeUnSlugifyText(tag)
          )
        );
      });

      query = Parse.Query.or(...or);
    }

    // default query
    query.equalTo('deleted', false).equalTo('active', true);

    if (technologies) {
      query.matches('technologies', escapeUnSlugifyText(technologies));
    }

    if (society) {
      query.equalTo('society', society);
    }

    if (otherThanProjectId) {
      query.notEqualTo('objectId', otherThanProjectId);
    }

    query
      .select([`translated.${locale}`, 'previewImage', 'image'])
      .limit(limit)
      .skip(skip);

    if (orderedBy) {
      const orderStr = order === 'asc' ? 'descending' : 'ascending';

      if (orderedBy === 'title') {
        query[orderStr](`translated.${locale}.title`);
      }
      else {
        query[orderStr](orderedBy);
      }
    }

    const result = (await query.withCount().find()) as any;
    const projects = result.results as IProject[];

    return {
      projects,
      count: result.count,
    };
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};

/**
 * get projects only for urls used in sitemap page
 * slug and title are the only fields needed
 * @returns
 */
export const getProjectsForUrls = async (): Promise<IProject[] | void> => {
  try {
    const projects = await new Parse.Query(collections.Project)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['translated'])
      .find();

    return projects || [];
  }
  catch (e) {
    console.log('getProjectsForSiteMap e: ', e);
  }
};

/**
 * generate a sitemap for each project in database
 * doc: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @returns
 */
export const generateProjectsSitemap = async (): Promise<
  MetadataRoute.Sitemap | undefined
> => {
  try {
    const siteMaps: MetadataRoute.Sitemap = [];

    // translated main path, ex: /projects
    const projectsPath = retrievePathnameFromDynamicPathname(
      ROUTES.projects.preview().pathname
    );

    await new Parse.Query(collections.Project)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['translated', 'updatedAt'])
      .each(
        (project: IProject) => {
          const siteMap: Record<string, any> = {
            lastModified: new Date(project.updatedAt as Date).toISOString(),
            alternates: { languages: {} },
          };

          // loop through all locales
          locales.forEach((locale) => {
            const slug = getTranslatedField(
              project.get('translated'),
              locale,
              'slug'
            );
            // full url
            const url = getAbsoluteUrl(`/${locale}${projectsPath}${slug}`);

            if (locale === defaultLocale) {
              siteMap.url = url;
            }
            else {
              siteMap.alternates.languages[locale] = url;
            }
          });

          siteMaps.push(siteMap as any);
        },
        {
          batchSize: 1000,
        }
      );

    return siteMaps;
  }
  catch (e) {
    console.log('getProjectsForSiteMap e: ', e);
  }
};

/**
 * get list of projects with the same categories as the current project
 * @param project
 * @returns
 */
export const getRelatedProjects = async (
  project: IProject
): Promise<IServerResponse<IProject[]>> => {
  try {
    const Parse = getParseServer();
    
    const projects = await new Parse.Query(collections.Project)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .notEqualTo('objectId', project.id)
      .containedIn(
        'categories.objectId',
        (project.get('categories') || []).map((category: ICategory) => category.id)
      )
      .select(['translated', 'previewImage', 'image'])
      .limit(100)
      .descending('updatedAt')
      .find();

    return projects;
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};
