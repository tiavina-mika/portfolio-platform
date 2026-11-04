import dayjs from 'dayjs';

import type { Locale } from '@/types/app.type';

import { destroyFile, moveFileToRecycleBin } from '@/api/_core/cloudinary.api';
import { DEFAULT_LANGUAGE } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { revalidateWebCacheTag } from '@/utils/_core/revalidate.utils';

import {
  decrementParentCategoryItemCount, destroyCategoryFromLinkedItems, moveCategoryFromLinkedItems,
  refreshParentCategoryItemCount, updateParentHasSubcategories,
} from '../../services/_core/category.service.cloud';
import { assertTechnicalCodeIsAvailable } from '../../services/_core/cms.service.cloud';
import { getCategoryTranslatedDefaultValues } from '../../utils/_core/cms.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

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

    // before the `user` guard: a category saved by a script or a seed must not duplicate a code either
    if (dirtyKeys.includes('code')) {
      await assertTechnicalCodeIsAvailable(category, (request.context.locale as Locale) ?? DEFAULT_LANGUAGE);
    }

    if (!user) return;

    /*
     * --------- creation and update --------- //
     * translated slug, meta title and meta description generation
     */
    category.set('translated', getCategoryTranslatedDefaultValues(category.get('translated')));

    /*
     * --------- parent category validation --------- //
     * limited to 3 levels deep (category -> subcategory -> sub-subcategory, no great-grandchild)
     */
    const parentCategory = category.get('parentCategory');

    if (parentCategory) {
      if (category.id && parentCategory.id === category.id) {
        throw new Error('A category cannot be set as its own parent category.');
      }

      const parent = await new Parse.Query(Category)
        .select(['parentCategory'])
        .get(parentCategory.id, USE_MASTER_KEY);

      const grandParentCategory = parent.get('parentCategory');

      if (grandParentCategory) {
        const grandParent = await new Parse.Query(Category)
          .select(['parentCategory'])
          .get(grandParentCategory.id, USE_MASTER_KEY);

        if (grandParent.get('parentCategory')) {
          throw new Error('A category cannot be nested more than 3 levels deep.');
        }
      }
    }

    // ----------- creation ----------- //
    if (!category.existed() || !prevCategory) {
      category.set('deleted', false);
      category.set('user', user);
      return;
    }

    // updatedBy should be different from deletedBy
    if (dirtyKeys.includes('deleted')) return;

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

    // keep the public site's cache in sync — it otherwise relies solely on a TTL (cacheLife)
    await revalidateWebCacheTag('categories');

    if (!user) return;

    /*
     * --------- maintain hasSubcategories on the parent category --------- //
     * recompute whenever a subcategory is attached, detached, reparented, or its
     * active/deleted state changes — same recompute-on-write pattern as itemCount
     */
    const parentCategory = category.get('parentCategory');
    const prevParentCategory = prevCategory?.get('parentCategory');
    const isBeingTrashed = dirtyKeys.includes('deleted') && category.get('deleted');

    if (parentCategory) {
      await updateParentHasSubcategories(parentCategory.id);

      /*
       * skip the full itemCount recompute when this save is the trash event itself —
       * it's handled below via decrementParentCategoryItemCount (known -1 delta),
       * same split as updateLinkedCategoryItemCount / decrementCategoryItemCount for Article/Page
       */
      if (!isBeingTrashed) {
        await refreshParentCategoryItemCount(parentCategory.id);
      }
    }

    if (prevParentCategory && (!parentCategory || prevParentCategory.id !== parentCategory.id)) {
      await updateParentHasSubcategories(prevParentCategory.id);
      await refreshParentCategoryItemCount(prevParentCategory.id);
    }

    // ----------- creation ----------- //
    if (!category.existed() || !prevCategory) {
      return;
    }

    // ----------- update ----------- //
    if (dirtyKeys.includes('image') && category.has('image')) {
      // destroy previous image
      await destroyFile(prevCategory.get('image').publicId);
    }

    if (isBeingTrashed) {
      category.set('deletedBy', user);
      category.set('deletedAt', dayjs().toDate());

      // move image to recycle bin
      if (category.has('image')) {
        const file = await moveFileToRecycleBin(category.get('image').publicId);

        // update the database object
        category.set('image', file);
      }

      await moveCategoryFromLinkedItems(category);
      await category.save();

      if (parentCategory) {
        await decrementParentCategoryItemCount(parentCategory.id);
      }
    }
  })
);

// after delete
Parse.Cloud.afterDelete(
  'Category',
  parseFunction(async (request: Parse.Cloud.AfterDeleteRequest): Promise<void> => {
    const category = request.object;

    await revalidateWebCacheTag('categories');

    if (category.has('image')) {
      await destroyFile(category.get('image').publicId);
    }

    const parentCategory = category.get('parentCategory');

    if (parentCategory) {
      await updateParentHasSubcategories(parentCategory.id);
    }

    await destroyCategoryFromLinkedItems(category);
  })
);
