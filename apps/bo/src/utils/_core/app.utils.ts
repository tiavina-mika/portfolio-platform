import { z } from 'zod';

import i18n from '@/config/i18n';
import {
  IApp, IAppInput, IListTabValue, ITableHeadCell, IToFilters,
} from '@/types/_core/app.type';
import { getFileFromUrl } from '@/utils/_core/file.utils';

/**
 * Which edge a column is read from — the same answer for its name and for every value under it.
 *
 * A column is left-aligned unless it holds figures, which are compared down the column and so hang
 * off their right edge, or unless it asks for something else outright. Both ends of a column go
 * through here rather than each defaulting on its own: a head that falls back to the left over
 * cells that fall back to the right leaves the label and its values pointing opposite ways.
 */
export const getTableCellAlign = <D>(headCell?: ITableHeadCell<D>): 'left' | 'center' | 'right' => {
  if (headCell?.align) return headCell.align;

  return headCell?.numeric
    ? 'right'
    : 'left';
};

/**
 * change tab name (search params) to database queries
 * add all search params to filters
 * ex: ?tab=new to { seen: false };
 * ex: ?name=cool to { name: 'cool' };
 * @param tab
 * @returns
 */
export const convertSearchParamsToFilters = ({
  tabs, searchParams, filters, acceptedFields = [],
}: IToFilters): Record<string, any> => {
  const tabValue = searchParams.tab;
  const currentTab = tabs?.find((tab: IListTabValue): boolean => tab.tab === tabValue);

  const newFilters = Object.keys(filters).reduce((acc: Record<string, any>, key: string) => {
    if (acceptedFields.includes(key)) {
      acc[key] = filters[key];
    }
    return acc;
  }, {});

  const finalFilters: Record<string, any> = { ...searchParams, ...newFilters };

  if (currentTab) {
    finalFilters[currentTab.key] = currentTab.value;
  }

  return finalFilters;
};

export const convertSearchParamToFilters = (search: Record<string, string>): Record<string, string> => {
  const keys = Object.keys(search).filter((key: string) => key !== 'tab');
  const newFilters: Record<string, string> = keys.reduce((acc: Record<string, any>, key: string) => {
    acc[key] = search[key];
    return acc;
  }, {});

  return newFilters;
};

/**
 * check if the url has search params ?tab=recycleBin
 * @param searchParamsTab
 * @returns
 */
export const isCurrentTab = (
  searchParamsTab: string | undefined,
  type = 'recycleBin'
): boolean => {
  if (!searchParamsTab) return false;

  if (type === 'news') {
    return searchParamsTab === i18n.t('route:tabs.news');
  }

  return searchParamsTab === i18n.t('route:tabs.recycleBin');
};

/**
 * parse data base fields to translated form fields name to data base field
 * ex: { "fr": { "title" : "my-title-fr" }} to { "title+fr": "my-title-fr" }
 * @param values
 * @returns
 */
export const parseSavedTranslatedValuesToForm = (
  parseObject: Parse.Object,
  fields: string[] | Set<string>,
  dest: Record<string, any> = {}
): Record<string, any> => {
  fields.forEach((field: string) => {
    const value: unknown = parseObject.get(field);

    if (value != null) {
      if (field === 'translated') {
        const translated = value as Record<string, Record<string, any>>;

        Object.keys(translated).forEach((subKey) => {
          const locale = subKey; // fr, en, ...

          // article['translated']['fr']
          Object.keys(translated[locale]).forEach((field: string) => {
          // article['fr:title'] = 'Bonjour'
            const translatedValue = (value as Record<string, Record<string, any>>)[locale][field];

            dest[locale + ':' + field] = translatedValue;
          });
        });
      }
      // other fields
      else {
        dest[field] = value;
      }
    }
  });

  return dest;
};

export const getAppMainImagesEditionInitialValues = async (app: IApp): Promise<IAppInput> => {
  const images = await Promise.all(['image', 'imageForDarkMode'].map((key: string) => {
    const file = app.get(key as any) as { url?: string } | null;
    const url = file?.url;

    return url
      ? getFileFromUrl(url)
      : null;
  }));

  return {
    // image should be an array even if it's a single file
    image: images[0]
      ? [images[0]]
      : [],
    imageForDarkMode: images[1]
      ? [images[1]]
      : [],
  };
};

export const validateTabSearch = (search: string) => z.object({ tab: z.string().optional() }).parse(search);

/**
 * The report queue's own URL shape: the tab strip, plus the thing the queue may be scoped to when
 * another screen linked here with a subject already in hand. It lives in the URL rather than in
 * the filter panel so the scoped queue can be reloaded, bookmarked and left again.
 * @param search the raw search params
 * @returns the parsed params
 */
export const validateReportSearch = (search: string) => z.object({
  tab: z.string().optional(),
  targetId: z.string().optional(),
}).parse(search);

/**
 * The list a page must show once rows have been marked seen or unseen, without refetching it.
 *
 * Rebuilt rather than patched in place: the rows are the very objects held by the Redux store, so
 * setting `seen` on one of them mutates state a reducer is supposed to own.
 *
 * On the "Nouveautés" tab a row that has just been marked seen no longer belongs to what the tab
 * shows, so it leaves; everywhere else it stays and only its state changes — which is what lets an
 * operator work through the "Tous" tab, where the unseen rows are the marked ones, without the
 * line disappearing from under the cursor.
 */
export const applySeenToItems = <I extends { id?: string }>(
  items: I[],
  toggledIds: string[],
  value: boolean,
  isUnseenTab = false
): I[] => {
  if (toggledIds.length === 0) return items;

  const toggled = new Set(toggledIds);

  if (value && isUnseenTab) {
    return items.filter((item: I): boolean => !toggled.has(item.id!));
  }

  return items.map((item: I): I => (toggled.has(item.id!)
    ? { ...item, seen: value }
    : item));
};
