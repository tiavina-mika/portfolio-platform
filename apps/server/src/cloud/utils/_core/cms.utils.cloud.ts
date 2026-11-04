import differenceBy from 'lodash/differenceBy.js';

import type { IUploadedFile } from '@/types/file.type';

import { destroyFiles, moveFileToRecycleBin } from '@/api/_core/cloudinary.api';
import { locales } from '@/config/i18n';
import { PAGE_FILES_FIELDS, PAGE_SINGLE_IMAGE_FIELDS } from '@/constants/_core/cms.constants';
import { LOCALES } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';
import { cutMetaDescription, cutMetaTitle, slugify } from '@/utils/_core/utils';

import { isFieldChanged, isSubFieldChanged } from './parse.utils.cloud';

/**
 * add default values to translated fields if not defined
 * @param translated
 * @returns
 */
export const getPageTranslatedDefaultValues = (translated: Record<string, any>) => {
  // create slug for translated title fields
  for (const local of LOCALES) {
    if (translated[local]) {
      // locale field, ex: fr, en, ...
      const translatedLocaleValues = translated[local];

      /*
       * fields inside the locale field
       * ---------- slug ---------- //
       * slug defined manually (via form) or automatically (by name field)
       */
      const slug = translatedLocaleValues.slug || translatedLocaleValues.title;
      const translatedSlug = slugify(slug);

      // title default value if not defined
      if (!translatedLocaleValues.title && translatedLocaleValues.name) {
        translatedLocaleValues.title = translatedLocaleValues.name;
      }

      // metaTitle default value if not defined
      if (!translatedLocaleValues.metaTitle) {
        const metaTitle = translatedLocaleValues.title || translatedLocaleValues.name || '';

        if (metaTitle) {
          translatedLocaleValues.metaTitle = cutMetaTitle(metaTitle);
        }
      }

      // metaDescription default value if not defined
      if (!translatedLocaleValues.metaDescription) {
        let metaDescription;

        if (translatedLocaleValues.description) {
          metaDescription = cutMetaDescription(translatedLocaleValues.description);
        }
        else {
          metaDescription = translatedLocaleValues.title || '';
        }

        translatedLocaleValues.metaDescription = metaDescription;
      }

      translated[local] = { ...translatedLocaleValues, slug: translatedSlug || '' };
    }
  }

  return translated;
};


/**
 * add default values to translated fields if not defined
 * @param translated
 * @returns
 */
export const getArticleTranslatedDefaultValues = (translated: Record<string, any>) => {
  /*
   * create slug for translated title fields
   * create slug for translated title fields
   */
  for (const local of LOCALES) {
    if (translated[local]) {
      // locale field, ex: fr, en, ...
      const translatedLocaleValues = translated[local];
      /*
       * fields inside the locale field
       * ---------- slug ---------- //
       * slug defined manually (via form) or automatically (by name field)
       */
      const slug = translatedLocaleValues.slug || translatedLocaleValues.title;
      const translatedSlug = slugify(slug);

      if (!translatedLocaleValues.metaTitle && translatedLocaleValues.title) {
        translatedLocaleValues.metaTitle = cutMetaTitle(translatedLocaleValues.title);
      }


      if (!translatedLocaleValues.metaDescription && translatedLocaleValues.title) {
        translatedLocaleValues.metaDescription = translatedLocaleValues.title;
      }

      translated[local] = { ...translatedLocaleValues, slug: translatedSlug || '' };
    }
  }

  return translated;
};


/**
 * add default values to the translated fields of a category if not defined: the slug, the meta
 * title and the meta description all fall back to the category name. A category has no
 * description of its own, so its name is the only text search engines can be given.
 * @param translated
 * @returns
 */
export const getCategoryTranslatedDefaultValues = (translated: Record<string, any>) => {
  for (const local of LOCALES) {
    if (translated[local]) {
      const translatedLocaleValues = translated[local];
      const name = translatedLocaleValues.name || '';

      // slug defined manually (via form) or automatically (by name field)
      const translatedSlug = slugify(translatedLocaleValues.slug || name);

      if (!translatedLocaleValues.metaTitle && name) {
        translatedLocaleValues.metaTitle = cutMetaTitle(name);
      }

      if (!translatedLocaleValues.metaDescription && name) {
        translatedLocaleValues.metaDescription = cutMetaDescription(name);
      }

      translated[local] = { ...translatedLocaleValues, slug: translatedSlug };
    }
  }

  return translated;
};

type MoveToRecycleBinOptions = {
  singleFileFields: string[];
  multipleFilesFields: string[];
};
/**
 * move images to recycle bin after article or page is deleted
 * !important: the object should be saved after calling this function
 * @param parseObj
 */
export const moveCMSImagesToRecycleBin = async (
  parseObj: Parse.Object, options?: MoveToRecycleBinOptions): Promise<void> => {
  try {
    // remove file to recycle bin
    const singleFileFields = options?.singleFileFields || PAGE_SINGLE_IMAGE_FIELDS;
    const multipleFilesFields = options?.multipleFilesFields || PAGE_FILES_FIELDS;

    // ----------- singe file fields ----------- //
    await Promise.all(singleFileFields.map(async (field: string) => {
      if (parseObj.has(field)) {
        // remove the file from the cloud
        const file = await moveFileToRecycleBin(parseObj.get(field).publicId);

        // update the database object
        parseObj.set(field, file);
      }
    }));

    // ----------- multiple files fields ----------- //
    for (const field of multipleFilesFields) {
      if (parseObj.has(field)) {
        const files = parseObj.get(field) || [];

        // remove the file from the cloud
        const newFiles = await Promise.all(files.map(async (file: IUploadedFile) => {
          const uploadedFile = await moveFileToRecycleBin(file.publicId);

          return uploadedFile;
        }));


        // update the database object
        parseObj.set(field, newFiles);
      }
    }

    logger.info({
      messages: 'Fields moved to recycle bin',
      id: parseObj.id,
    });
  }
  catch (error) {
    logger.error(
      `[src/utils/cms.utils.ts:movePageImagesToRecycleBin] error: ${(error as Error).message} ` +
      `for ${parseObj.id}`
    );
  }
};

/**
 * if the field is changed
 * delete the old files since we don't need them anymore
 * @param parseObj
 * @param prevParseObj
 */
type DeleteOldFilesAfterUpdateOptions = {
  singleFileFields: string[];
  multipleFilesFields: string[];
};
export const destroyOldFilesAfterUpdate = async (
  parseObj: Parse.Object,
  prevParseObj: Parse.Object | undefined,
  options?: DeleteOldFilesAfterUpdateOptions
): Promise<void> => {
  try {
    const singleFileFields = options?.singleFileFields || PAGE_SINGLE_IMAGE_FIELDS;
    const multipleFilesFields = options?.multipleFilesFields || PAGE_FILES_FIELDS;
    const publicIdsToDelete = [];

    // ----------- singe file fields deletion ----------- //
    for (const field of singleFileFields) {
      // check first if the field is changed
      if (isFieldChanged(parseObj, prevParseObj, field)) {
        const prevField = prevParseObj?.get(field);
        const newField = parseObj.get(field);

        // delete old files if there is new one
        if (prevField?.publicId !== newField?.publicId) {
          publicIdsToDelete.push(prevField.publicId);
        }
      }
    }

    // ----------- multiple files fields deletion ----------- //
    for (const field of multipleFilesFields) {
      // check first if the field is changed
      if (isFieldChanged(parseObj, prevParseObj, field)) {
        const prevField: IUploadedFile[] = prevParseObj?.get(field) || [];
        const newField: IUploadedFile[] = parseObj.get(field) || [];

        const oldFilesToDelete: IUploadedFile[] = differenceBy(prevField, newField, 'publicId');

        const publicIds = oldFilesToDelete.map((file: IUploadedFile): string => file.publicId);

        publicIdsToDelete.push(...publicIds);
      }
    }

    if (publicIdsToDelete.length === 0) return;
    // delete all files in a single request
    await destroyFiles(publicIdsToDelete);
  }
  catch (error) {
    logger.error(
      `[src/utils/cms.utils.ts:deleteOldFilesAfterUpdate] error: ${(error as Error).message} ` +
      `for ${parseObj.id}`
    );
  }
};

/**
 * In the client side, there are no ways to know if the editor files are changed or not used anymore
 * so we need to check if the content is changed and delete the old files
 * by using the files in the editorFiles field
 * @param parseObj
 * @param prevParseObj
 * @param field
 * @returns
 */
export const deleteEditorFilesAfterUpdate = async (
  parseObj: Parse.Object,
  prevParseObj: Parse.Object | undefined,
  subfield = 'content',
  field = 'translated'
): Promise<string[] | void | undefined> => {
  try {
    // check if level 1 field is changed (ex: translated)
    if (!isFieldChanged(parseObj, prevParseObj, field)) return;
    const publicIdsToDelete = [];

    for (const locale of locales) {
      // check if level 2 field is changed (ex: translated.fr)
      const isLevel1Changed = isSubFieldChanged({
        newObject: parseObj,
        oldObject: prevParseObj,
        field,
        level2Field: locale,
      });

      if (isLevel1Changed) {
        const content = parseObj.get(field)[locale][subfield];
        const prevEditorFiles = prevParseObj?.get('editorFiles') || [];
        const prevTranslatedFiles = prevEditorFiles.filter((file: IUploadedFile) => file.locale === locale);
        // const prevContent = prevParseObj.get(field)[locale][subfield];

        const isLevel2Changed = isSubFieldChanged({
          newObject: parseObj,
          oldObject: prevParseObj,
          field,
          level2Field: locale,
          level3Field: subfield,
        });

        // check if level 3 field is changed (ex: translated.fr.content)
        if (isLevel2Changed) {
          for (const prevFile of prevTranslatedFiles) {
            // if the old file is not used anymore
            if (!content.includes(prevFile.url)) {
              publicIdsToDelete.push(prevFile.publicId);
            }
          }
        }
      }
    }

    logger.info('Ids to delete ', publicIdsToDelete.join(', '));
    if (publicIdsToDelete.length === 0) return;

    await destroyFiles(publicIdsToDelete);
    return publicIdsToDelete;
  }
  catch (error) {
    logger.error(
      `[src/utils/cms.utils.ts:deleteEditorFilesAfterUpdate] error: ${(error as Error).message} ` +
      `for ${parseObj.id}`
    );
  }
};
