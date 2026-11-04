'use server';

import { MetadataRoute } from 'next';
import { cacheLife, cacheTag } from 'next/cache';

import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { IServerResponse } from '@/types/app.type';
import { ICategory, ICMSInputQuery } from '@/types/cms.type';
import { getAbsoluteUrl } from '@/utils/app.utils';
import { collections, RELATED_ARTICLES_COUNT, WEB_COUNTRY_CODE } from '@/utils/constants';
import { retrievePathnameFromDynamicPathname } from '@/utils/next.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { escapeUnSlugifyText } from '@/utils/utils';
import { getParseServer } from '@/config/parse-server.config';
import { serializeParseObject, withContentCountry } from '@/utils/parse.utils';
import { IArticle } from '@/types/article.type';

import { getCategoryBySlug } from './category.queries';

const Parse = getParseServer();

export const getArticle = async (
  slug: string,
  locale: Locale
): Promise<IServerResponse<IArticle | undefined>> => {
  'use cache';
  cacheLife('hours');
  cacheTag('articles');

  try {
    // make server side because we need to retrieve the author (user)
    const article = await Parse.Cloud.run('getArticleForClient', {
      slug,
      locale,
      defaultLocale,
      country: WEB_COUNTRY_CODE,
    });

    return article ? serializeParseObject<IArticle>(article) : undefined;
  }
  catch (error) {
    return { error: (error as Error).message };
  }
};

/**
 * get paginated articles
 * tags and categories are search params
 * NOTE: if retrieving articles author (user), should use as a cloud function
 * @param param0
 * @returns
 */
export const getArticles = async ({
  limit,
  skip,
  orderedBy = 'updatedAt',
  order = 'desc',
  locale,
  tag,
  category,
}: ICMSInputQuery): Promise<
  IServerResponse<{ articles: IArticle[]; count: number }>
> => {
  'use cache';
  cacheLife('minutes');
  cacheTag('articles');

  try {
    const Parse = getParseServer();

    let query = new Parse.Query(collections.Article);

    // query by tags
    if (tag) {
      const or: any[] = [];

      locales.forEach((locale: string) => {
        or.push(
          // ex: translated.fr.tags = "Bonjour"
          new Parse.Query(collections.Article).matches(
            `translated.${locale}.tags`,
            escapeUnSlugifyText(tag)
          )
        );
      });

      query = Parse.Query.or(...or);
    }

    // query by category
    if (category) {
      const categoryData = await getCategoryBySlug(category, locale);

      if (categoryData) {
        const CategoryPointer = Parse.Object.extend(collections.Category);
        const categoryPointer = new CategoryPointer();

        categoryPointer.id = categoryData.id;
        query.equalTo('categories', categoryPointer);
      }
    }

    // after the tag search above, which replaces the query it started from
    withContentCountry(query);

    // default query
    query
      .equalTo('deleted', false)
      .equalTo('active', true)
      .include(['categories'])
      .select([`translated.${locale}`, 'categories', 'previewImage', 'image'])
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
    const articles = serializeParseObject<IArticle[]>(result.results);

    return {
      articles,
      count: result.count,
    };
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};

/**
 * get every published article slug for a given locale, used by `generateStaticParams` to
 * prerender article pages at build time instead of rendering each one on first visit
 * @param locale
 * @returns
 */
export const getArticleSlugsForLocale = async (locale: Locale): Promise<string[]> => {
  try {
    const slugs: string[] = [];

    await withContentCountry(new Parse.Query(collections.Article))
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select([`translated.${locale}.slug`])
      .each(
        // raw Parse.Object from `.each()` — only slugs (plain strings) leave this function
        (article: any) => {
          const slug = getTranslatedField(article.get('translated'), locale, 'slug');

          if (slug) slugs.push(slug);
        },
        { batchSize: 1000 }
      );

    return slugs;
  }
  catch (e) {
    console.log('getArticleSlugsForLocale e: ', e);
    return [];
  }
};

/**
 * generate a sitemap for each article in database
 * doc: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @returns
 */
export const generateArticlesSitemap = async (): Promise<
  MetadataRoute.Sitemap | undefined
> => {
  'use cache';
  cacheLife('hours');
  cacheTag('articles');

  try {
    const siteMaps: MetadataRoute.Sitemap = [];

    // translated main path, ex: /articles
    const articlesPath = retrievePathnameFromDynamicPathname(
      ROUTES.articles.preview().pathname
    );

    await withContentCountry(new Parse.Query(collections.Article))
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['translated', 'updatedAt'])
      .each(
        // raw Parse.Object from `.each()` — only sitemap entries (plain data) leave this function
        (article: any) => {
          const siteMap: Record<string, any> = {
            lastModified: new Date(article.updatedAt as Date).toISOString(),
            alternates: { languages: {} },
          };

          // loop through all locales
          locales.forEach((locale) => {
            const slug = getTranslatedField(
              article.get('translated'),
              locale,
              'slug'
            );
            // full url
            const url = getAbsoluteUrl(`/${locale}${articlesPath}${slug}`);

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
    console.log('getArticlesForSiteMap e: ', e);
  }
};

/**
 * get list of articles with the same categories as the current article
 * @param article
 * @returns
 */
export const getRelatedArticles = async (
  article: IArticle
): Promise<IServerResponse<IArticle[]>> => {
  'use cache';
  cacheLife('minutes');
  cacheTag('articles');

  try {
    const Parse = getParseServer();

    const articles = await withContentCountry(new Parse.Query(collections.Article))
      .equalTo('deleted', false)
      .equalTo('active', true)
      .notEqualTo('objectId', article.id)
      .containedIn(
        'categories.objectId',
        article.categories.map((category: ICategory) => category.id)
      )
      .include(['categories'])
      .select(['translated', 'previewImage', 'image'])
      .limit(RELATED_ARTICLES_COUNT)
      .descending('updatedAt')
      .find();

    return serializeParseObject<IArticle[]>(articles);
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};
