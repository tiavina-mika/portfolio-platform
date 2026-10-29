import { z } from 'zod';

import i18n from '@/config/i18n';
import {
  IApp, IAppInput, IListTabValue, IToFilters,
} from '@/types/app.type';

import { getFileFromUrl } from './file.utils';

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
    finalFilters[currentTab.key] = currentTab.value as boolean;
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
