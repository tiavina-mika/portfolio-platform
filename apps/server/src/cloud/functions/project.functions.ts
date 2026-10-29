
import { USE_MASTER_KEY } from '@/utils/constants';
import { escapeText, isBoolean } from '@/utils/util';
import { articleForClientSchema } from '@/validations/article.validation';

import { Project } from '../triggers/project.triggers';
import { filtersDatesQuery, multiBooleanQuery } from '../utils/parse.utils.cloud';
import { fromBO, parseFunction, parseFunctionValidation } from '../utils/utils.cloud';

Parse.Cloud.define(
  'getProjects',
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
    let query = new Parse.Query(Project);

    if (search) {
      // search by translated texts
      if (search.text) {
        const text = escapeText(search.text);
        const or: any[] = [];

        locales.forEach((locale: string) => {
          or.push(
            // ex: translated.fr.title = "Bonjour"
            new Parse.Query(Project).matches('translated.' + locale + '.title', text),
            new Parse.Query(Project).matches('translated.' + locale + '.description', text),
            new Parse.Query(Project).matches('translated.' + locale + '.content', text)
          );
        });

        query = Parse.Query.or(...or);
      }

      // search by translated fields
      ['title', 'metaTitle', 'metaDescription', 'slug', 'tags', 'content', 'societyDescription'].forEach((field: string) => {
        if (search[field]) {
          const or: any[] = [];

          locales.forEach((locale: string) => {
            const key = `translated.${locale}.${search[field]}`;

            or.push(
              new Parse.Query(Project).matches(key, escapeText(search[field]))
            );
          });

          query = Parse.Query.or(...or);
        }
      });

      if (search.types && !filters?.types) {
        query.containedIn('types', search.types);
      }


      if (search.technologies) {
        query.containedIn('technologies', search.technologies);
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
      .include(['user', ...include]);

    if (filters) {
      // override the deleted query below
      if (isBoolean(filters?.deleted)) {
        query.equalTo('deleted', filters.deleted);
      }

      // filters is priority over search if both are defined
      if ((filters.types && !search?.types) || (filters.types && search?.types)) {
        query.equalTo('types', filters.types);
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
  }, ['find'])
);

Parse.Cloud.define(
  'getProject',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;
    const project = await new Parse.Query(Project)
      .equalTo('objectId', id)
      .notEqualTo('deleted', true)
      .include(include)
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!project) return false;

    return project;
  }, ['get'])
);

Parse.Cloud.define(
  'getProjectForClient',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { slug, locale, defaultLocale } = request.params;
    let query = new Parse.Query(Project);

    query = Parse.Query.or(
      // query the current locale
      new Parse.Query(Project).equalTo('translated.' + locale + '.slug', slug),
      // query the default locale if not translated
      new Parse.Query(Project).equalTo('translated.' + defaultLocale + '.slug', slug)
    );

    const project = await query
      .equalTo('deleted', false)
      .equalTo('active', true)
      .select([
        'translated.' + locale,
        'previewImage',
        'image',
        'logo',
        'images',
        'updatedAt',
        'technologies',
        'types',
        'links',
        'repositories',
        'youtube',
        'npm',
        'website',
        'society',
        'codesandbox',
        'platforms',
        'totalMediaShare',
      ])
      .first(USE_MASTER_KEY);

    if (!project) return false;

    return project;
  }),
  // -------- validation -------- //
  parseFunctionValidation(articleForClientSchema)
);
