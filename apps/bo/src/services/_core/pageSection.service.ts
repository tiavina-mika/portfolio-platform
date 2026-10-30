import Parse from 'parse';
import { v4 as uuidv4 } from 'uuid';

import { locales } from '@/config/i18n';
import { IPage, IPageSection, PageSectionInput } from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { isUpdatedFileChanged, uploadFilesAPI } from '@/utils/_core/file.utils';
import { convertIdToPointer, setValues, toJSONWithId } from '@/utils/_core/parse.utils';
import { eachSectionBlockCodec, pageSectionCodec } from '@/validations/_core/page.validations';

const collection = 'PageSection';
const PageSection = Parse.Object.extend(collection);

const SECTION_PROPERTIES = new Set(['active', 'translated', 'blocks', 'pages']);

const toParsePageSection = (section: IPageSection): Parse.Object =>
  Parse.Object.fromJSON({ ...section, className: collection });

const SECTION_SELECT_FIELDS = [
  'active', 'translated', 'blocks', 'pages', 'deleted', 'deletedAt', 'user', 'updatedBy', 'deletedBy',
];

export const fetchPageSection = async (
  id: string,
  pageId?: string,
  include: string[] = []
): Promise<{ page: IPage | undefined; section: IPageSection | undefined }> => {
  const parseSection = await new Parse.Query(PageSection)
    .select([...SECTION_SELECT_FIELDS, ...include])
    .include(['blocks', ...include])
    .get(id)
    .catch(() => undefined);

  if (!parseSection) {
    return { page: undefined, section: undefined };
  }

  const section = toJSONWithId<IPageSection>(parseSection);
  const page = (section.pages || []).find((p: IPage) => (pageId ? p.id === pageId : true));

  return { page, section };
};

export const fetchPageSections = async ({
  limit, skip, orderBy, order, filters, search, include,
}: {
  limit: number;
  skip: number;
  orderBy: string;
  order: string;
  filters?: Record<string, any>;
  search?: Record<string, any>;
  include: string[];
}): Promise<{ results: IPageSection[]; count: number }> => {
  /*
   * result with count
   * we make it server side because we need to get user infos
   */
  const result: Record<string, any> = await Parse.Cloud.run('getPageSections', {
    limit, skip, orderBy, order, filters, search, locales, include,
  });

  return {
    results: result.results.map((section: Parse.Object) => toJSONWithId<IPageSection>(section)),
    count: result.count,
  };
};

export const saveOrUpdatePageSection = async ({
  pageId, defaultSection, values, sessionToken, locale,
}: {
  pageId: string;
  defaultSection: IPageSection | undefined | null;
  values: PageSectionInput;
  sessionToken: string;
  locale: Locale;
}): Promise<IPageSection> => {
  const isEdition = Boolean(defaultSection);

  const parseSection = defaultSection ? toParsePageSection(defaultSection) : new PageSection();

  const newValues: Record<string, any> = {
    ...values,
    translated: pageSectionCodec.decode(values),
    pages: isEdition ? defaultSection!.pages : [convertIdToPointer('Page', pageId)],
  };

  const newBlocks = [];

  if (isEdition) {
    // Update
    for (const blockObj of (newValues.blocks || [])) {
      const newBlockObj: Record<string, any> = {};

      if (!blockObj.id) {
        newBlockObj.id = uuidv4();
      }
      const existingBlock = defaultSection!
        .blocks
        ?.find((b) => b.id === blockObj.id);

      const isNew = isUpdatedFileChanged(existingBlock?.image, blockObj.image);

      if (!isNew) {
        if (blockObj.image) {
          const uploadInput = {
            folder: 'pages',
            sessionToken,
            files: [blockObj.image] as File[],
            locale,
          };
          const files = await uploadFilesAPI(uploadInput);

          [newBlockObj.image] = files;
        }
      } else {
        newBlockObj.image = existingBlock?.image;
      }

      if (blockObj.imagePosition) newBlockObj.imagePosition = blockObj.imagePosition;
      newBlockObj.translated = eachSectionBlockCodec.decode(blockObj);

      newBlocks.push(newBlockObj);
    }
  // Creation
  } else {
    for (const blockObj of (newValues.blocks || [])) {
      const newBlockObj: Record<string, any> = {};

      newBlockObj.id = uuidv4();

      if (blockObj.image) {
        const uploadInput = {
          folder: 'pages',
          sessionToken,
          files: [blockObj.image] as File[],
          locale,
        };
        const files = await uploadFilesAPI(uploadInput);

        [newBlockObj.image] = files;
      }

      if (blockObj.imagePosition) newBlockObj.imagePosition = blockObj.imagePosition;
      newBlockObj.translated = eachSectionBlockCodec.decode(blockObj);

      newBlocks.push(newBlockObj);
    }
  }
  newValues.blocks = newBlocks;
  setValues(parseSection, newValues, SECTION_PROPERTIES);

  const savedSection = await parseSection.save();

  return toJSONWithId<IPageSection>(savedSection);
};

export const deletePageSectionEntity = async (section: IPageSection): Promise<string> => {
  const parseSection = toParsePageSection(section);

  parseSection.set('deleted', true);
  const deletedPageSection = await parseSection.save();

  return deletedPageSection.id!;
};

export const setPageSectionActive = async (section: IPageSection, value: boolean): Promise<IPageSection> => {
  const parseSection = toParsePageSection(section);

  parseSection.set('active', value);
  const updatedSection = await parseSection.save();

  return toJSONWithId<IPageSection>(updatedSection);
};
