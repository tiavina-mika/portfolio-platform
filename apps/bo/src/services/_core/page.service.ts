import { PAGE_IMAGES_FIELDS } from '@shared/validations';
import Parse from 'parse';

import { locales } from '@/config/i18n';
import { ALL_TAB_COUNT_KEY } from '@/constants/_core/app.constants';
import { ALL_PAGE_FIELDS, PAGE_SECTIONS_BY_PAGE_LIMIT } from '@/constants/_core/cms.constants';
import { IListTabCounts } from '@/types/_core/app.type';
import {
  IPage, IPageInput, IPageSection,
} from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { getCategoryPointersFromIds } from '@/utils/_core/cms.utils';
import { uploadFormFiles, uploadUpdatedFormFiles } from '@/utils/_core/file.utils';
import { setValues, toJSONWithId } from '@/utils/_core/parse.utils';
import { pageCodec } from '@/validations/_core/page.validations';

const collection = 'Page';
const Page = Parse.Object.extend(collection);

export const PAGE_PROPERTIES = new Set([
  'translated',
  'categories',
  'linkLocations',
  ...ALL_PAGE_FIELDS,
]);

export const fetchPage = async (id: string, include: string[] = []): Promise<IPage | undefined> => {
  const page = await Parse.Cloud.run('getPage', { id, include });

  return page?.toJSON ? toJSONWithId<IPage>(page) : page;
};

const toParsePage = (page: IPage): Parse.Object =>
  Parse.Object.fromJSON({ ...page, className: collection });

export const fetchPages = async ({
  limit, skip, orderBy, order, filters, search, include,
}: {
  limit: number;
  skip: number;
  orderBy: string;
  order: string;
  filters?: Record<string, any>;
  search?: Record<string, any>;
  include: string[];
}): Promise<{ results: IPage[]; count: number; tabCounts: IListTabCounts }> => {
  /*
   * result with count
   * we make it server side because we need to get user infos
   */
  const result: Record<string, any> = await Parse.Cloud.run('getPages', {
    limit, skip, orderBy, order, filters, search, locales, include,
  });

  return {
    results: result.results.map((page: Parse.Object) => toJSONWithId<IPage>(page)),
    count: result.count,
    /*
     * how many pages each tab holds — keyed by the tab's database field, which is what the strip
     * looks a count up by (`all` standing for the unscoped tab it opens on)
     */
    tabCounts: {
      [ALL_TAB_COUNT_KEY]: result.tabCounts?.all,
      deleted: result.tabCounts?.deleted,
    },
  };
};

export const fetchPagesForExport = async (
  queries: Record<string, any>,
  maxRows: number
): Promise<{ results: IPage[]; count: number }> => {
  const result: Record<string, any> = await Parse.Cloud.run('getPages', {
    ...queries,
    limit: maxRows,
    skip: 0,
    locales,
    // the export names the author of every row, and the author is a pointer that has to be resolved
    include: ['categories', 'user'],
  });

  return {
    results: result.results.map((page: Parse.Object) => toJSONWithId<IPage>(page)),
    count: result.count,
  };
};

export const savePage = async ({
  id, existingPage, values, sessionToken, locale, editorTempFiles,
}: {
  id: string | null;
  existingPage?: IPage;
  values: IPageInput;
  sessionToken: string;
  locale: Locale;
  editorTempFiles: number;
}): Promise<IPage> => {
  const type: 'create' | 'update' = id ? 'update' : 'create';
  let parsePage: Parse.Object;

  if (type === 'update' && existingPage) {
    parsePage = toParsePage(existingPage);
  } else {
    parsePage = new Page();
  }

  let uploadValues: Record<string, any> = {};

  if (type === 'create') {
    uploadValues = await uploadFormFiles<IPageInput>({
      folder: 'pages',
      sessionToken,
      values,
      multipleUploadFields: PAGE_IMAGES_FIELDS,
      locale,
    });
  } else {
    uploadValues = await uploadUpdatedFormFiles<IPageInput>({
      parseObj: parsePage,
      folder: 'pages',
      sessionToken,
      values,
      multipleUploadFields: PAGE_IMAGES_FIELDS,
      locale,
    });
  }

  const newValues: Record<string, any> = {
    ...values,
    ...uploadValues,
    editorFiles: editorTempFiles,
    translated: pageCodec.decode(values),
  };

  if (values.categories) {
    newValues.categories = getCategoryPointersFromIds(values.categories as string[]);
  }

  setValues(parsePage, newValues, PAGE_PROPERTIES);

  const savedPage = await parsePage.save();

  return toJSONWithId<IPage>(savedPage);
};

export const restorePageSnapshot = async (
  existingPage: IPage,
  snapshot: Record<string, any>
): Promise<IPage> => {
  const parsePage = toParsePage(existingPage);

  setValues(parsePage, snapshot, PAGE_PROPERTIES);
  const savedPage = await parsePage.save();

  return toJSONWithId<IPage>(savedPage);
};

export const togglePagesFieldByIds = async (ids: string[], field: string, value: boolean): Promise<void> => {
  const pages = await new Parse.Query(Page)
    .containedIn('objectId', ids)
    .select([field])
    .limit(ids.length)
    .find();

  pages.forEach((page) => page.set(field, value));
  await Parse.Object.saveAll(pages);
};

export const setPageActive = async (page: IPage, value: boolean): Promise<IPage> => {
  const parsePage = toParsePage(page);

  parsePage.set('active', value);
  const updatedPage = await parsePage.save();

  return toJSONWithId<IPage>(updatedPage);
};

/**
 * the sections a page is made of. Built from the page id alone — a pointer is all the relation
 * needs — so it can be read at the same time as the page itself rather than after it
 * @param pageId the page whose sections to list
 */
export const fetchPageSections = async (pageId: string): Promise<IPageSection[]> => {
  const sections = (await new Parse.Query('PageSection')
    .equalTo('pages', Page.createWithoutData(pageId))
    .select(['translated', 'blocks', 'active', 'imagePosition'])
    .limit(PAGE_SECTIONS_BY_PAGE_LIMIT)
    .find()) || [];

  return sections.map((section) => toJSONWithId<IPageSection>(section));
};
