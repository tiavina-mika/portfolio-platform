import dayjs from 'dayjs';

import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE } from '@/config/i18n';
import {
  PAGE_SINGLE_IMAGE_FIELDS,
} from '@/constants/_core/cms.constants';
import { type IUploadedFile } from '@/types/file.type';
import { revalidateWebCacheTag } from '@/utils/_core/revalidate.utils';

import { decrementCategoryItemCount, updateLinkedCategoryItemCount } from '../../services/_core/category.service.cloud';
import { assertTechnicalCodeIsAvailable, beforeSave } from '../../services/_core/cms.service.cloud';
import { createContentVersion, shouldSnapshotContentVersion } from '../../services/_core/contentVersion.service.cloud';
import { deleteEditorFilesAfterUpdate, destroyOldFilesAfterUpdate, moveCMSImagesToRecycleBin } from '../../utils/_core/cms.utils.cloud';
import { destroyFilesAfterObjectDestroyed } from '../../utils/_core/file.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

export const Page = Parse.Object.extend('Page');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Page',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    // before the shared CMS logic, which stops at saves made without a user (scripts, seeds)
    if (request.object.dirtyKeys().includes('code')) {
      const locale = (request.context.locale as Locale) ?? DEFAULT_LANGUAGE;

      await assertTechnicalCodeIsAvailable(request.object, locale);
    }

    await beforeSave(request);
  })
);

Parse.Cloud.afterSave(
  'Page',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const page = request.object;
    const prevPage = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    // keep the public site's cache in sync — it otherwise relies solely on a TTL (cacheLife)
    await revalidateWebCacheTag('pages');

    // ----------- creation and update ----------- //
    if (!page.get('deleted')) {
      // update category linked to page count
      await updateLinkedCategoryItemCount('Page', page, prevPage);
    }

    if (!user) return;

    // ----------- creation ----------- //
    if (!page.existed() || !prevPage) {
      return;
    }

    // snapshot the previous content before it's overwritten, for history/undo — see contentVersion.service.cloud.ts
    if (shouldSnapshotContentVersion('Page', dirtyKeys)) {
      await createContentVersion('Page', prevPage, user);
    }

    let hasChanged = false;

    // after delete
    if (dirtyKeys.includes('deleted') && page.get('deleted')) {
      page.set('deletedBy', user);
      page.set('deletedAt', dayjs().toDate());

      hasChanged = true;
      // remove files to recycle bin
      await decrementCategoryItemCount('Page', page);
      await moveCMSImagesToRecycleBin(page);
    }


    // delete files after update
    const [, publicIds] = await Promise.all([
      destroyOldFilesAfterUpdate(page, prevPage),
      deleteEditorFilesAfterUpdate(page, prevPage),
    ]);

    // remove files from the database (editorFiles field)
    if (publicIds && publicIds.length > 0) {
      const newEditorFiles = (page.get('editorFiles') || []).filter((file: IUploadedFile) => !publicIds.includes(file.publicId));

      page.set('editorFiles', newEditorFiles);
      hasChanged = true;
    }

    if (!hasChanged) return;
    await page.save();
  })
);

Parse.Cloud.afterDelete(
  'Page',
  parseFunction<Parse.Cloud.AfterDeleteRequest>(async (request): Promise<void | boolean> => {
    const page = request.object;

    await revalidateWebCacheTag('pages');

    const result = await destroyFilesAfterObjectDestroyed(page, PAGE_SINGLE_IMAGE_FIELDS);

    return !!result;
  })
);
