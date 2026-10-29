/* eslint-disable @typescript-eslint/require-await */
import dayjs from 'dayjs';

import FileService from '@/services/files.service';
import { LOCALES } from '@/utils/constants';
import { slugify } from '@/utils/util';

import { destroyCategoryFromLinkedItems, moveCategoryFromLinkedItems } from '../services/category.service.cloud';
import { parseFunction } from '../utils/utils.cloud';

export const Category = Parse.Object.extend('Category');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Category',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const category = request.object;
    const prevCategory = request.original;
    const user = request.user;
    const dirtyKeys = category.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;
    if (!user) return;

    /*
     * --------- creation and update --------- //
     * translated slug generation
     */
    const translated = category.get('translated');

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
        const slug = translatedLocaleValues.slug || translatedLocaleValues.name;
        const translatedSlug = slugify(slug);

        translated[local] = { ...translatedLocaleValues, slug: translatedSlug };
      }
    }
    category.set('translated', translated);

    // ----------- creation ----------- //
    if (!category.existed() || !prevCategory) {
      category.set('deleted', false);
      category.set('user', user);
      return;
    }

    // updatedBy should be different from deletedBy
    if (dirtyKeys.includes('deleted') && category.get('deleted')) return;

    // ----------- update ----------- //
    category.set('updatedBy', user);
  })
);

Parse.Cloud.afterSave(
  'Category',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const category = request.object;
    const prevCategory = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    if (!user) return;

    // ----------- creation ----------- //
    if (!category.existed() || !prevCategory) {
      return;
    }

    // ----------- update ----------- //
    const fileService = new FileService();

    if (dirtyKeys.includes('image') && category.has('image')) {
      // destroy previous image
      await fileService.destroyFile(prevCategory.get('image').publicId);
    }

    if (dirtyKeys.includes('deleted') && category.get('deleted')) {
      category.set('deletedBy', user);
      category.set('deletedAt', dayjs().toDate());

      // move image to recycle bin
      if (category.has('image')) {
        const file = await fileService.moveFileToRecycleBin(category.get('image').publicId);

        // update the database object
        category.set('image', file);
      }

      await moveCategoryFromLinkedItems(category);
      await category.save();
    }
  })
);

// after delete
Parse.Cloud.afterDelete(
  'Category',
  parseFunction(async (request: Parse.Cloud.AfterDeleteRequest): Promise<void> => {
    const category = request.object;
    const fileService = new FileService();

    // destroy image
    if (category.has('image')) {
      await fileService.destroyFile(category.get('image').publicId);
    }

    await destroyCategoryFromLinkedItems(category);
  })
);
