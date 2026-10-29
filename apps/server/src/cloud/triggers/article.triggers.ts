/* eslint-disable @typescript-eslint/require-await */
import dayjs from 'dayjs';

import type { IUploadedFile } from '@/types/file.type';

import {
  deleteEditorFilesAfterUpdate,
  destroyOldFilesAfterUpdate,
  moveCMSImagesToRecycleBin,
  PAGE_SINGLE_IMAGE_FIELDS,
} from '@/utils/cms.utils';
import { destroyFilesAfterObjectDestroyed } from '@/utils/file.utils';
import { logger } from '@/utils/logger';

import { decrementCategoryItemCount, updateLinkedCategoryItemCount } from '../services/category.service.cloud';
import { beforeSave } from '../services/cms.service.cloud';
import { runJob } from '../utils/job.utils.cloud';
import { parseFunction } from '../utils/utils.cloud';

export const Article = Parse.Object.extend('Article');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Article',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    beforeSave(request);
  })
);

Parse.Cloud.afterSave(
  'Article',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const article = request.object;
    const prevArticle = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    if (!user) return;

    // ----------- creation and update ----------- //
    if (!article.get('deleted')) {
      // update category linked to article count
      await updateLinkedCategoryItemCount('Article', article, prevArticle);
    }

    // ----------- creation ----------- //
    if (!article.existed() || !prevArticle) {
      await runJob('sendArticleToNewsletterJob', { id: article.id });

      return;
    }

    // ----------- update ----------- //
    let hasChanged = false;

    // after delete
    if (dirtyKeys.includes('deleted') && article.get('deleted')) {
      article.set('deletedBy', user);
      article.set('deletedAt', dayjs().toDate());

      hasChanged = true;
      // remove files to recycle bin
      await moveCMSImagesToRecycleBin(article);
      await decrementCategoryItemCount('Article', article);
    }

    // delete files after update
    const [, publicIds] = await Promise.all([
      destroyOldFilesAfterUpdate(article, prevArticle),
      deleteEditorFilesAfterUpdate(article, prevArticle),
    ]);

    // remove files from the database (editorFiles field)
    if (publicIds && publicIds.length > 0) {
      const newEditorFiles = (article.get('editorFiles') || []).filter((file: IUploadedFile) => !publicIds.includes(file.publicId));

      article.set('editorFiles', newEditorFiles);
      hasChanged = true;
    }

    if (!hasChanged) return;
    await article.save();
  })
);

Parse.Cloud.afterDelete(
  'Article',
  parseFunction<Parse.Cloud.AfterDeleteRequest>(async (request): Promise<void | boolean> => {
    const article = request.object;
    const user = request.user;

    logger.info(`Article ${article.id} deleted from the database at ${dayjs().format()} by ${user?.get('username')}`);

    const result = await destroyFilesAfterObjectDestroyed(article, PAGE_SINGLE_IMAGE_FIELDS);

    return !!result;
  })
);
