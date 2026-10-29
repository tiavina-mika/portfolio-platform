
import { USE_MASTER_KEY } from '@/utils/constants';
import { escapeText, isBoolean } from '@/utils/util';
import { articleForClientSchema } from '@/validations/article.validation';

import { Article } from '../triggers/article.triggers';
import {
  convertIdToPointer, convertIdsToPointer, filtersDatesQuery, multiBooleanQuery,
} from '../utils/parse.utils.cloud';
import { fromBO, parseFunction, parseFunctionValidation } from '../utils/utils.cloud';

Parse.Cloud.define(
  'getArticles',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
      include = [],
    } = request.params;
    let query = new Parse.Query(Article);

    if (search) {
      // search by translated texts
      if (search.text) {
        const text = escapeText(search.text);
        const or: any[] = [];

        locales.forEach((locale: string) => {
          or.push(
            // ex: translated.fr.title = "Bonjour"
            new Parse.Query(Article).matches('translated.' + locale + '.title', text),
            new Parse.Query(Article).matches('translated.' + locale + '.description', text),
            new Parse.Query(Article).matches('translated.' + locale + '.content', text)
          );
        });

        query = Parse.Query.or(...or);
      }

      // search by translated fields
      ['title', 'metaTitle', 'metaDescription', 'slug', 'tags', 'content'].forEach((field: string) => {
        if (search[field]) {
          const or: any[] = [];

          locales.forEach((locale: string) => {
            const key = `translated.${locale}.${search[field]}`;

            or.push(
              new Parse.Query(Article).matches(key, escapeText(search[field]))
            );
          });

          query = Parse.Query.or(...or);
        }
      });

      // search by a category
      if (search.category) {
        query.equalTo('categories', convertIdToPointer('Category', search.category));
      }

      // query dates
      filtersDatesQuery(query, search);

      // [true, false] query
      multiBooleanQuery(query, search.active, 'active');
    }

    query.limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
      .exists('user')
      .include(['user', 'updatedBy', ...include]);

    if (filters) {
      // override the deleted query below
      if (isBoolean(filters?.deleted)) {
        query.equalTo('deleted', filters.deleted);
      }

      if (filters.categories) {
        query.containedIn('categories', convertIdsToPointer('Category', filters.categories));
      }

      if (filters.category) {
        query.equalTo('categories', convertIdToPointer('Category', filters.category));
      }
    }

    if (order === 'desc') {
      query.descending(orderBy);
    }
    else {
      query.ascending(orderBy);
    }

    const result: Record<string, any> = await query.withCount().find(USE_MASTER_KEY);

    return result;
  })
);

Parse.Cloud.define(
  'getArticle',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;
    const article = await new Parse.Query(Article)
      .equalTo('objectId', id)
      .notEqualTo('deleted', true)
      .include(['createdBy', ...include])
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!article) return false;

    return article;
  })
);

Parse.Cloud.define(
  'getArticleForClient',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { slug, locale, defaultLocale } = request.params;
    let query = new Parse.Query(Article);

    query = Parse.Query.or(
      // query the current locale
      new Parse.Query(Article).equalTo('translated.' + locale + '.slug', slug),
      // query the default locale if not translated
      new Parse.Query(Article).equalTo('translated.' + defaultLocale + '.slug', slug)
    );

    const article = await query
      .equalTo('deleted', false)
      .equalTo('active', true)
      .include(['categories', 'user'])
      .select([
        'translated.' + locale,
        'categories.translated.' + locale,
        'previewImage',
        'image',
        'images',
        'user',
        'updatedAt',
        'totalMediaShare',
      ])
      .first(USE_MASTER_KEY);

    if (!article) return false;

    return article;
  }),
  // -------- validation -------- //
  parseFunctionValidation(articleForClientSchema)
);
