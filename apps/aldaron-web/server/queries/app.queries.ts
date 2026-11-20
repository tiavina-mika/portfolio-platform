import { cacheLife, cacheTag } from "next/cache";

import { getParseServer } from "@/config/parse-server.config";
import { serializeParseObject } from "@/utils/parse.utils";

/**
 * get items only for urls used in sitemap page
 * slug and title are the only fields needed
 * @example articles, pages, ...
 * @returns
 */
export const getDataForUrls = async <R = Record<string, any>>(
  collection: string
): Promise<R[] | undefined> => {
  'use cache';
  cacheLife('hours');
  // matches the coarse tags set in article/page.queries.ts (e.g. 'Article' -> 'articles')
  cacheTag(`${collection.toLowerCase()}s`);

  try {
    const Parse = getParseServer();

    const items =
      (await new Parse.Query(collection)
        .equalTo('deleted', false)
        .equalTo('active', true)
        .select(['translated'])
        .limit(1000)
        .find()) || [];

    return serializeParseObject<R[]>(items);
  }
  catch (e) {
    console.log('getDataForUrls e: ', e);
  }
};
