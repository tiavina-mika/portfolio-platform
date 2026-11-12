'use server';

import { MetadataRoute } from 'next';
import { cacheLife, cacheTag } from 'next/cache';

import { getParseServer } from '@/config/parse-server.config';
import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { IServerResponse } from '@/types/app.type';
import { IProjectInputQuery } from '@/types/cms.type';
import { IProject } from '@/types/project.type';
import { getAbsoluteUrl } from '@/utils/app.utils';
import { collections } from '@/utils/constants';
import { retrievePathnameFromDynamicPathname } from '@/utils/next.utils';
import { serializeParseObject } from '@/utils/parse.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { escapeUnSlugifyText } from '@/utils/utils';

const Parse = getParseServer();

export const getProject = async (
  slug: string,
  locale: Locale
): Promise<IServerResponse<IProject | undefined>> => {
  'use cache';
  cacheLife('hours');
  cacheTag('projects');

  try {
    const project = await Parse.Cloud.run('getProjectForClient', {
      slug,
      locale,
      defaultLocale,
    });

    return project ? serializeParseObject<IProject>(project) : undefined;
  }
  catch (error) {
    return { error: (error as Error).message };
  }
};

/**
 * get paginated projects
 * tags, technologies and society are search params
 * @param param0
 * @returns
 */
export const getProjects = async ({
  limit,
  skip,
  orderedBy = 'dateStart',
  order = 'desc',
  locale,
  tag,
  technologies,
  society,
  otherThanProjectId,
}: IProjectInputQuery): Promise<
  IServerResponse<{ projects: IProject[]; count: number }>
> => {
  'use cache';
  cacheLife('minutes');
  cacheTag('projects');

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
      const orderStr = order === 'asc' ? 'ascending' : 'descending';

      if (orderedBy === 'title') {
        query[orderStr](`translated.${locale}.title`);
      }
      else {
        query[orderStr](orderedBy);
      }
    }

    const result = (await query.withCount().find()) as any;

    return {
      projects: serializeParseObject<IProject[]>(result.results),
      count: result.count,
    };
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};

/**
 * get every published project slug for a given locale, used by `generateStaticParams` to
 * prerender project pages at build time instead of rendering each one on first visit
 * @param locale
 * @returns
 */
export const getProjectSlugsForLocale = async (locale: Locale): Promise<string[]> => {
  try {
    const slugs: string[] = [];

    await new Parse.Query(collections.Project)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select([`translated.${locale}.slug`])
      .each(
        // raw Parse.Object from `.each()` — only slugs (plain strings) leave this function
        (project: any) => {
          const slug = getTranslatedField(project.get('translated'), locale, 'slug');

          if (slug) slugs.push(slug);
        },
        { batchSize: 1000 }
      );

    return slugs;
  }
  catch (e) {
    console.log('getProjectSlugsForLocale e: ', e);
    return [];
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
  'use cache';
  cacheLife('hours');
  cacheTag('projects');

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
        // raw Parse.Object from `.each()` — only sitemap entries (plain data) leave this function
        (project: any) => {
          const siteMap: Record<string, any> = {
            lastModified: new Date(project.updatedAt as Date).toISOString(),
            alternates: { languages: {} },
          };

          // loop through all locales
          locales.forEach((locale) => {
            const slug = getTranslatedField(project.get('translated'), locale, 'slug');
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
    console.log('generateProjectsSitemap e: ', e);
  }
};
