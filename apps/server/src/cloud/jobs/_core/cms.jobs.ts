import dayjs from 'dayjs';
import chunk from 'lodash/chunk.js';


import { destroyFiles, listFilesByFolder, type ICloudinaryFile } from '@/api/_core/cloudinary.api';
import { logger } from '@/utils/_core/logger';

import { getArticleEditorContentHaystack, getPageEditorContentHaystack } from '../../services/_core/cms.service.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

type PurgeOrphanedEditorFilesParams = {
  /** only consider files uploaded at least this long ago, to leave in-progress edits alone (default: 24) */
  olderThanHours?: number;
};

const EDITOR_UPLOAD_FOLDERS = [
  { folder: 'pages/editor/', getContentHaystack: getPageEditorContentHaystack },
  { folder: 'articles/editor/', getContentHaystack: getArticleEditorContentHaystack },
];

// cloudinary.api.delete_resources accepts at most 100 public_ids per call
const CLOUDINARY_DELETE_BATCH_SIZE = 100;

const listAllFilesInFolder = async (folder: string): Promise<ICloudinaryFile[]> => {
  const files: ICloudinaryFile[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await listFilesByFolder(folder, { nextCursor });

    files.push(...result.files);
    nextCursor = result.nextCursor;
  } while (nextCursor);

  return files;
};

/**
 * Deletes Cloudinary images inserted via the TipTap editor (`pages/editor/`, `articles/editor/`)
 * that ended up orphaned: `useUploadEditorImage` uploads to Cloudinary immediately on drop, but if
 * the admin abandons the Page/Article form without saving, no document ever references the file —
 *
 * A file is only deleted once it is both:
 * - older than `olderThanHours` (safety window for an edit still in progress), and
 * - not found in the content (`translated.<locale>.content`) of any
 *   non-deleted Page/Article — mirrors the "is this URL still in the content" check already used
 *   by `deleteEditorFilesAfterUpdate`, just widened from "this one page's diff" to "any document".
 */
defineJob(
  'purgeOrphanedEditorFilesJob',
  async (request: Parse.Cloud.JobRequest<PurgeOrphanedEditorFilesParams>): Promise<void> => {
    const { olderThanHours = 24 } = request.params;
    const cutoffDate = dayjs().subtract(olderThanHours, 'hour');

    let totalDeleted = 0;

    for (const { folder, getContentHaystack } of EDITOR_UPLOAD_FOLDERS) {
      const files = await listAllFilesInFolder(folder);
      const candidates = files.filter((file) => dayjs(file.createdAt).isBefore(cutoffDate));

      if (candidates.length === 0) continue;

      const haystack = await getContentHaystack();
      const orphanedPublicIds = candidates
        .filter((file) => !haystack.includes(file.url))
        .map((file) => file.publicId);

      if (orphanedPublicIds.length === 0) continue;

      for (const batch of chunk(orphanedPublicIds, CLOUDINARY_DELETE_BATCH_SIZE)) {
        await destroyFiles(batch);
      }

      totalDeleted += orphanedPublicIds.length;
      logger.info(`purgeOrphanedEditorFilesJob: deleted ${orphanedPublicIds.length} file(s) from ${folder}`);
    }

    logger.info(`purgeOrphanedEditorFilesJob: done, ${totalDeleted} orphaned file(s) deleted in total`);
  }
);
