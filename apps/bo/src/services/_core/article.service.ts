import { ARTICLE_SINGLE_IMAGE_FIELDS } from '@shared/validations';
import Parse from 'parse';

import { locales } from '@/config/i18n';
import { ALL_PAGE_FIELDS } from '@/constants/_core/cms.constants';
import { IArticle, IArticleInput } from '@/types/_core/article.type';
import { Locale } from '@/types/_core/setting.type';
import { getCategoryPointersFromIds } from '@/utils/_core/cms.utils';
import { uploadFormFiles, uploadUpdatedFormFiles } from '@/utils/_core/file.utils';
import { setValues, toJSONWithId } from '@/utils/_core/parse.utils';
import { articleCodec } from '@/validations/_core/article.validations';

const collection = 'Article';
const Article = Parse.Object.extend(collection);

export const ARTICLE_PROPERTIES = new Set(['translated', 'categories', 'viewsGoal', ...ALL_PAGE_FIELDS]);

export const fetchArticle = async (id: string, include: string[] = []): Promise<IArticle | undefined> => {
  const article = await Parse.Cloud.run('getArticle', { id, include });

  return article?.toJSON ? toJSONWithId<IArticle>(article) : article;
};

const toParseArticle = (article: IArticle): Parse.Object =>
  Parse.Object.fromJSON({ ...article, className: collection });

export const fetchArticles = async ({
  limit, skip, orderBy, order, filters, search, include,
}: {
  limit: number;
  skip: number;
  orderBy: string;
  order: string;
  filters?: Record<string, any>;
  search?: Record<string, any>;
  include: string[];
}): Promise<{ results: IArticle[]; count: number }> => {
  /*
   * result with count
   * we make it server side because we need to get user infos
   */
  const result: Record<string, any> = await Parse.Cloud.run('getArticles', {
    limit, skip, orderBy, order, filters, search, locales, include,
  });

  return {
    results: result.results.map((article: Parse.Object) => toJSONWithId<IArticle>(article)),
    count: result.count,
  };
};

export const fetchArticlesForExport = async (
  queries: Record<string, any>,
  maxRows: number
): Promise<{ results: IArticle[]; count: number }> => {
  const result: Record<string, any> = await Parse.Cloud.run('getArticles', {
    ...queries,
    limit: maxRows,
    skip: 0,
    locales,
    include: ['categories'],
  });

  return {
    results: result.results.map((article: Parse.Object) => toJSONWithId<IArticle>(article)),
    count: result.count,
  };
};

export const saveArticle = async ({
  id, existingArticle, values, sessionToken, locale, editorTempFiles,
}: {
  id: string | null | undefined;
  existingArticle?: IArticle;
  values: IArticleInput;
  sessionToken: string;
  locale: Locale;
  editorTempFiles: number;
}): Promise<IArticle> => {
  const type: 'create' | 'update' = id ? 'update' : 'create';
  let parseArticle: Parse.Object;

  if (type === 'update' && existingArticle) {
    parseArticle = toParseArticle(existingArticle);
  } else {
    parseArticle = new Article();
  }

  let uploadValues: Record<string, any> = {};

  if (type === 'create') {
    uploadValues = await uploadFormFiles<IArticleInput>({
      folder: 'articles',
      sessionToken,
      values,
      locale,
    });
  } else {
    uploadValues = await uploadUpdatedFormFiles<IArticleInput>({
      parseObj: parseArticle,
      folder: 'articles',
      sessionToken,
      values,
      singleUploadFields: ARTICLE_SINGLE_IMAGE_FIELDS,
      locale,
    });
  }

  const newValues: Record<string, any> = {
    ...values,
    ...uploadValues,
    editorFiles: editorTempFiles,
    translated: articleCodec.decode(values),
  };

  if (values.categories) {
    newValues.categories = getCategoryPointersFromIds(values.categories as string[]);
  }

  setValues(parseArticle, newValues, ARTICLE_PROPERTIES);

  const savedArticle = await parseArticle.save();

  return toJSONWithId<IArticle>(savedArticle);
};

export const restoreArticleSnapshot = async (
  existingArticle: IArticle,
  snapshot: Record<string, any>
): Promise<IArticle> => {
  const parseArticle = toParseArticle(existingArticle);

  setValues(parseArticle, snapshot, ARTICLE_PROPERTIES);
  const savedArticle = await parseArticle.save();

  return toJSONWithId<IArticle>(savedArticle);
};

/**
 * Publishes or unpublishes one article. `active` is what decides whether the public website shows
 * it at all — the detail page's own "Publier / Ne pas publier" action used to call the
 * mark-notification-as-seen action instead, so it changed nothing whatsoever.
 */
export const setArticleActive = async (article: IArticle, value: boolean): Promise<IArticle> => {
  const parseArticle = toParseArticle(article);

  parseArticle.set('active', value);

  const savedArticle = await parseArticle.save();

  return toJSONWithId<IArticle>(savedArticle);
};

export const toggleArticlesFieldByIds = async (
  ids: string[],
  field: string,
  value: boolean
): Promise<void> => {
  await new Parse.Query(Article)
    .containedIn('objectId', ids)
    .each(async (article) => {
      article.set(field, value);
      await article.save();
    });
};
