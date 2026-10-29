'use server';

import { MetadataRoute } from 'next';

import { defaultLocale, Locale, locales } from '@/i18n/config';
import { ROUTES } from '@/i18n/routes';
import { IServerResponse } from '@/types/app.type';
import { ICategory, ICMSInputQuery } from '@/types/cms.type';
import { getAbsoluteUrl } from '@/utils/app.utils';
import { collections } from '@/utils/constants';
import { retrievePathnameFromDynamicPathname } from '@/utils/next.utils';
import { getTranslatedField } from '@/utils/translation.utils';
import { escapeText, escapeUnSlugifyText } from '@/utils/utils';
import { getParseServer } from '@/config/parse-server.config';
import { IArticle } from '@/types/article.type';

const Parse = getParseServer();

export const getArticle = async (
  slug: string,
  locale: Locale
): Promise<IServerResponse<IArticle | undefined>> => {
  try {
    // make server side because we need to retrieve the author (user)
    const article = await Parse.Cloud.run('getArticleForClient', {
      slug,
      locale,
      defaultLocale,
    });

    return article;
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
      let categoryQuery = new Parse.Query(collections.Category);

      const or: any[] = [];

      locales.forEach((locale: string) => {
        or.push(
          // ex: translated.fr.tags = "Bonjour"
          new Parse.Query(collections.Category).matches(
            `translated.${locale}.slug`,
            escapeText(category)
          )
        );
      });

      categoryQuery = Parse.Query.or(...or);

      const categoryPointer = await categoryQuery
        .equalTo('deleted', false)
        .equalTo('active', true)
        .equalTo(`translated.${locale}.slug`, category)
        .first();

      if (categoryPointer) {
        query.equalTo('categories', categoryPointer);
      }
    }

    // default query
    query
      .equalTo('deleted', false)
      .equalTo('active', true)
      .include(['categories'])
      .select([`translated.${locale}`, 'categories', 'previewImage', 'image'])
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
    const articles = result.results as IArticle[];

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
 * generate a sitemap for each article in database
 * doc: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * @returns
 */
export const generateArticlesSitemap = async (): Promise<
  MetadataRoute.Sitemap | undefined
> => {
  try {
    const siteMaps: MetadataRoute.Sitemap = [];

    // translated main path, ex: /articles
    const articlesPath = retrievePathnameFromDynamicPathname(
      ROUTES.articles.preview().pathname
    );

    await new Parse.Query(collections.Article)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['translated', 'updatedAt'])
      .each(
        (article: IArticle) => {
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
  try {
    const Parse = getParseServer();

    const articles = await new Parse.Query(collections.Article)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .notEqualTo('objectId', article.id)
      .containedIn(
        'categories.objectId',
        article.get('categories').map((category: ICategory) => category.id)
      )
      .include(['categories'])
      .select(['translated', 'previewImage', 'image'])
      .limit(100)
      .descending('updatedAt')
      .find();

    return articles;
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};
