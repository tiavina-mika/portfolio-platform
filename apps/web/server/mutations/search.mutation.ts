'use server';

import { z } from 'zod';

import { locales } from '@/i18n/config';
import { ISearchResult } from '@/types/app.type';
import { goToItemBySlug } from '@/utils/app.utils';
import { escapeText } from '@/utils/utils';
import { localeSchemaField } from '@/validations/app.validations';
import { getParseServer } from '@/config/parse-server.config';
import { IArticle } from '@/types/article.type';
import { IPage } from '@/types/cms.type';

type SearchOptions = {
  search: string;
  locale: string;
  fieldsToSearch?: string[];
};
const searchItems = (
  collection: string,
  {
    search,
    locale,
    fieldsToSearch = ['title', 'tags', 'description', 'content'],
  }: SearchOptions
) => {
  const Parse = getParseServer();

  let query = new Parse.Query(collection);

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

  query = Parse.Query.or(...or);

  return query
    .equalTo('deleted', false)
    .equalTo('active', true)
    .limit(10)
    .find();
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
  const projectOptions = {
    ...options,
    fieldsToSearch: [
      'title',
      'tags',
      'description',
      'content',
      'society',
      'name',
      'societyDescription',
    ],
  };
  const searchResults = await Promise.all([
    searchItems('Article', options),
    searchItems('Project', projectOptions),
  ]);

  const length = searchResults.reduce((acc, result) => acc + result.length, 0);

  // no results
  if (!length) {
    return [
      {
        id: 'empty',
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
