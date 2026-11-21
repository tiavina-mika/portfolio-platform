import { cacheLife, cacheTag } from "next/cache";

import { getParseServer } from "@/config/parse-server.config";
import { serializeParseObject, withContentTarget } from "@/utils/parse.utils";
import { IApp } from "@/types/app.type";
import { collections } from "@/utils/constants";

/**
 * get items only for urls used in sitemap page
 * slug and title are the only fields needed
 * @example articles, pages, ...
 * @param targetField when given, only the items published on this website are kept (the field holding
 * where an item is published)
 * @returns
 */
export const getDataForUrls = async <R = Record<string, any>>(
  collection: string,
  targetField?: string
): Promise<R[] | undefined> => {
  'use cache';
  cacheLife('hours');
  // matches the coarse tags set in article/page.queries.ts (e.g. 'Article' -> 'articles')
  cacheTag(`${collection.toLowerCase()}s`);

  try {
    const Parse = getParseServer();

    const query = targetField
      ? withContentTarget(new Parse.Query(collection), targetField)
      : new Parse.Query(collection);

    const items =
      (await query
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

/**
 * the single App object (CV, images, translated quote and description)
 * @returns the serialized object, undefined when none exists or the request failed
 */
export const getApp = async (): Promise<IApp | undefined> => {
  'use cache';
  cacheLife('hours');
  cacheTag('app');

  try {
    const Parse = getParseServer();
    const app = await new Parse.Query(collections.App).ascending('createdAt').first();

    return app ? serializeParseObject<IApp>(app) : undefined;
  }
  catch (e) {
    console.log('getApp e: ', e);
  }
};
