import { getParseServer } from '@/config/parse-server.config';
import { ICategory } from '@/types/cms.type';
import { collections } from '@/utils/constants';

const Parse = getParseServer();

/**
 * get articles only for urls used in sitemap page
 * slug and title are the only fields needed
 * @returns
 */
export const getCategoriesForUrls = async (): Promise<
  ICategory[] | void
> => {
  try {    
    const categories = await new Parse.Query(collections.Category)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select(['translated', 'entity'])
      .find();

    return categories || [];
  }
  catch (e) {
    console.log('getCategoriesForUrls e: ', e);
  }
};
