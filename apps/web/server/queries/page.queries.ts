'use server';

import { getParseServer } from '@/config/parse-server.config';
import { Locale } from '@/i18n/config';
import { IInputQuery, ISelectOption, IServerResponse } from '@/types/app.type';
import {
  IPage,
  PageLinkPositionEnum,
  PagesForUrlsOutput,
} from '@/types/cms.type';
import { goToItemBySlug } from '@/utils/app.utils';
import { collections } from '@/utils/constants';
import { getTranslatedField } from '@/utils/translation.utils';

const Parse = getParseServer();

export const getPage = async (
  slug: string,
  locale: Locale
): Promise<IServerResponse<IPage | any | undefined>> => {
  try {
    const page = await new Parse.Query(collections.Page)
      .equalTo(`translated.${locale}.slug`, slug)
      .notEqualTo('deleted', true)
      .equalTo('active', true)
      .include('blocks')
      .first();

    return page;
  }
  catch (error) {
    return { error: (error as Error).message };
  }
};

export const getPaginatedPages = async ({
  limit,
  skip,
  orderedBy,
  order,
}: IInputQuery): Promise<
  IServerResponse<{ pages: IPage[]; count: number }>
> => {
  try {
    const query = new Parse.Query(collections.Page).limit(limit).skip(skip);

    if (orderedBy) {
      if (order === 'asc') {
        query.ascending(orderedBy);
      }
      else {
        query.descending(orderedBy);
      }
    }

    const result = (await query.withCount().find()) as any;
    const pages = result.results as IPage[];

    return {
      pages,
      count: result.count,
    };
  }
  catch (e) {
    return { error: (e as Error).message };
  }
};

/**
 * get pages only for urls used in sitemap page
 * slug and title are the only fields needed
 * @returns
 */
export const getPagesForMenusUrls = async (
  locale: Locale
): Promise<PagesForUrlsOutput> => {
  const footers: ISelectOption[] = [];
  const menus: ISelectOption[] = [];

  await new Parse.Query(collections.Page)
    .equalTo('deleted', false)
    .equalTo('active', true)
    .select(['translated', 'linkLocations'])
    .each((page: IPage) => {
      const translated = page.get('translated');
      const linkLocations = page.get('linkLocations') || [];
      const name = getTranslatedField(translated, locale, 'name');
      const url = goToItemBySlug(translated, locale, 'pages');

      for (const linkLocation of linkLocations) {
        if (linkLocation === PageLinkPositionEnum.FOOTER) {
          footers.push({
            label: name,
            value: url,
          });
        }
        else {
          menus.push({
            label: name,
            value: url,
          });
        }
      }
    });

  return {
    footers,
    menus,
  };
};
