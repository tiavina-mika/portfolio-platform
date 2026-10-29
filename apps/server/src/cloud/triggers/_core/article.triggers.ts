import dayjs from 'dayjs';

import {
  CMS_COUNTER_FIELDS,
  PAGE_SINGLE_IMAGE_FIELDS,
} from '@/constants/_core/cms.constants';
import { type IUploadedFile } from '@/types/file.type';
import { logger } from '@/utils/_core/logger';
import { revalidateWebCacheTag } from '@/utils/_core/revalidate.utils';

import { decrementCategoryItemCount, updateLinkedCategoryItemCount } from '../../services/_core/category.service.cloud';
import { beforeSave } from '../../services/_core/cms.service.cloud';
import { createContentVersion, shouldSnapshotContentVersion } from '../../services/_core/contentVersion.service.cloud';
import { deleteEditorFilesAfterUpdate, destroyOldFilesAfterUpdate, moveCMSImagesToRecycleBin } from '../../utils/_core/cms.utils.cloud';
import { destroyFilesAfterObjectDestroyed } from '../../utils/_core/file.utils.cloud';
import { runJob } from '../../utils/_core/job.utils.cloud';
import { parseFunction } from '../../utils/_core/utils.cloud';

export const Article = Parse.Object.extend('Article');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Article',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    await beforeSave(request);
  })
);

Parse.Cloud.afterSave(
  'Article',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const article = request.object;
    const prevArticle = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    /*
     * a save that only bumps an audience counter (a visitor's view or share) changes nothing the
     * website renders, so it must not drop the articles cache — on a popular article that would
     * mean a full revalidation on every visit
     */
    const isAudienceCounterSave = dirtyKeys.length > 0 &&
      dirtyKeys.every((key: string) => CMS_COUNTER_FIELDS.includes(key));

    // keep the public site's cache in sync — it otherwise relies solely on a TTL (cacheLife)
    if (!isAudienceCounterSave) {
      await revalidateWebCacheTag('articles');
    }

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

    // snapshot the previous content before it's overwritten, for history/undo — see contentVersion.service.cloud.ts
    if (shouldSnapshotContentVersion('Article', dirtyKeys)) {
      await createContentVersion('Article', prevArticle, user);
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

    await revalidateWebCacheTag('articles');

    const result = await destroyFilesAfterObjectDestroyed(article, PAGE_SINGLE_IMAGE_FIELDS);

    return !!result;
  })
);
