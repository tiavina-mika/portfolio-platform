import { getParseServer } from "@/config/parse-server.config";

/**
 * get items only for urls used in sitemap page
 * slug and title are the only fields needed
 * @example articles, pages, ...
 * @returns
 */
export const getDataForUrls = async <R = Record<string, any>>(
  collection: string
): Promise<R[] | undefined> => {
  try {
    const Parse = getParseServer();
  
    const items =
      (await new Parse.Query(collection)
        .equalTo('deleted', false)
        .equalTo('active', true)
        .select(['translated'])
        .limit(1000)
        .find()) || [];

    return items as R[];
  }
  catch (e) {
    console.log('getDataForUrls e: ', e);
  }
};
