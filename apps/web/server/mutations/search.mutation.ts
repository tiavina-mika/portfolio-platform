'use server';

import { z } from 'zod';

import { locales } from '@/i18n/config';
import { ISearchResult } from '@/types/app.type';
import { goToItemBySlug } from '@/utils/app.utils';
import { collections, SEARCH_EMPTY_RESULT_ID } from '@/utils/constants';
import { escapeText } from '@/utils/utils';
import { localeSchemaField } from '@/validations/app.validations';
import { getParseServer } from '@/config/parse-server.config';

type SearchOptions = {
  search: string;
  locale: string;
  fieldsToSearch?: string[];
};
const searchItems = async (
  collection: string,
  {
    search,
    locale,
    fieldsToSearch = ['title', 'tags', 'description', 'content'],
  }: SearchOptions
) => {
  const Parse = getParseServer();

  // search by translated fields
  const or: any[] = [];

  locales.forEach((defaultLocale: string) => {
    or.push(
      ...fieldsToSearch.map((field: string) => {
        return new Parse.Query(collection).matches(
          `translated.${defaultLocale || locale}.${field}`,
          escapeText(search)
        );
      })
    );
  });

  try {
    return await Parse.Query.or(...or)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .limit(10)
      .find();
  }
  catch (error) {
    console.log(`searchItems (${collection}) error: `, error);
    return [];
  }
};

/**
 * Search data by search term and locale
 */
const searchSchema = z.object({
  search: z.string().min(2),
  locale: localeSchemaField,
  tNoResults: z.string(),
});

export const searchData = async (values: z.infer<typeof searchSchema>) => {
  const validation = searchSchema.safeParse(values);

  if (!validation.success) {
    return [];
  }

  const { search, locale } = values;
  const options = { search, locale };
  const searchResults = await Promise.all([
    searchItems(collections.Article, options),
    searchItems(collections.Project, options),
  ]);

  const length = searchResults.reduce((acc, result) => acc + result.length, 0);

  // no results
  if (!length) {
    return [
      {
        id: SEARCH_EMPTY_RESULT_ID,
        title: values.tNoResults,
        url: '',
      },
    ];
  }

  const searchResultsOptions = [
    { pathname: 'articles', items: searchResults[0] },
    { pathname: 'projects', items: searchResults[1] },
  ];

  const result: ISearchResult[] = [];

  for (const { pathname, items } of searchResultsOptions) {
    if (items.length) {
      const formattedItems = items.map((item: any): ISearchResult => {
        const translated = (item as any).get ? item.get('translated') : item.translated;

        return {
          id: item.id,
          title: translated[locale].title,
          url: goToItemBySlug(translated, locale, pathname),
        };
      });

      result.push(...formattedItems);
    }
  }

  return result;
};
