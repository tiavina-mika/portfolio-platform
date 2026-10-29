/* eslint-disable @typescript-eslint/require-await */
import dayjs from 'dayjs';

import type { IUploadedFile } from '@/types/file.type';

import FileService from '@/services/files.service';
import {
  deleteEditorFilesAfterUpdate,
  destroyOldFilesAfterUpdate,
  moveCMSImagesToRecycleBin,
  PAGE_SINGLE_IMAGE_FIELDS,
} from '@/utils/cms.utils';
import { destroyFilesAfterObjectDestroyed } from '@/utils/file.utils';
import { logger } from '@/utils/logger';

import { decrementCategoryItemCount, updateLinkedCategoryItemCount } from '../services/category.service.cloud';
import { beforeSave, removePageInSectionAfterPageDeleted } from '../services/cms.service.cloud';
import { parseFunction } from '../utils/utils.cloud';

export const Page = Parse.Object.extend('Page');
export const PageSection = Parse.Object.extend('PageSection');

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'Page',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    beforeSave(request);
  })
);

Parse.Cloud.afterSave(
  'Page',
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const page = request.object;
    const prevPage = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

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

    /*
     * ----------- update ----------- //
     * delete related blocks for each update (and regenerate a new one)
     */
    // const prevBlocks = prevPage.get('blocks') || [];

    /*
     * await Promise.all(prevBlocks.map(async (block: Parse.Object) => {
     *   await block.destroy();
     * }));
     */

    let hasChanged = false;

    // after delete
    if (dirtyKeys.includes('deleted') && page.get('deleted')) {
      page.set('deletedBy', user);
      page.set('deletedAt', dayjs().toDate());

      // delete the list of related blocks
      const unsavedUpdatedBlocks: Parse.Object[] = [];
      const blocks: Parse.Object[] = page.get('blocks') || [];

      for (const block of blocks) {
        block.set('deleted', true);
        unsavedUpdatedBlocks.push(block);
      }
      await Parse.Object.saveAll(unsavedUpdatedBlocks);

      hasChanged = true;
      // remove files to recycle bin
      await decrementCategoryItemCount('Page', page);
      await moveCMSImagesToRecycleBin(page);
    }

    // No other changes than sections array
    if (dirtyKeys.includes('sections')) return;

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
  parseFunction<Parse.Cloud.AfterDeleteRequest>(async (request): Promise<void> => {
    const page = request.object;

    const destroyedSectionsIds = await removePageInSectionAfterPageDeleted(page);

    console.log('🚀 ~ destroyedSectionsIds:', destroyedSectionsIds);

    logger.info(`Destroyed PageSections after Page ${page.id} deleted: ${destroyedSectionsIds.join(', ')}`);

    const deletedFilesMessage = await destroyFilesAfterObjectDestroyed(page, PAGE_SINGLE_IMAGE_FIELDS);

    console.log('🚀 ~ deletedFilesMessage:', deletedFilesMessage);

    if (!deletedFilesMessage) return;
    logger.info(
      `Deleted files after Page ${page.id} deleted: ${deletedFilesMessage}`
    );
  })
);

Parse.Cloud.beforeSave(
  'PageSection',
  parseFunction<Parse.Cloud.BeforeSaveRequest>(async (request): Promise<void | boolean> => {
    const section = request.object;

    const prevSection = request.original;
    const user = request.user;
    const dirtyKeys: string[] = section.dirtyKeys() || [];

    request.context.dirtyKeys = dirtyKeys;

    if (!user) return;

    // ----------- creation ----------- //
    if (!section.existed() || !prevSection) {
      section.set('deleted', false);
      section.set('user', user);
      return;
    }

    // ----------- update ----------- //
    section.set('updatedBy', user);
  })
);

Parse.Cloud.afterSave(
  'PageSection',
  parseFunction<Parse.Cloud.AfterSaveRequest>(async (request): Promise<void | boolean> => {
    const section = request.object;

    const prevSection = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    if (!user) return;

    // ----------- creation ----------- //
    if (!section.existed() || !prevSection) {
      section.set('deleted', false);
      section.set('user', user);

      return;
    }

    // ----------- update ----------- //
    section.set('updatedBy', user);
    const fileService = new FileService();

    if (dirtyKeys.includes('deleted') && section.get('deleted')) {
      section.set('deletedBy', user);
      section.set('deletedAt', dayjs().toDate());
      const blocks = section.get('blocks') || [];

      const deletedFiles = [];

      for (const block of blocks) {
        if (block.image) {
          const deletedFile = await fileService.moveFileToRecycleBin(block.image.publicId);

          logger.info(
            `Moved file to recycle bin: ${block.image.publicId} for deleted PageSection ${section.id}`
          );

          deletedFiles.push(deletedFile);
        }
      }
    }

    // Delete images from blocks that were removed or changed
    if (dirtyKeys.includes('blocks') && section.has('blocks')) {
      const prevBlocks = prevSection.get('blocks') || [];
      const currentBlocks = section.get('blocks') || [];
      const blocksToDeleteImage: string[] = [];

      // Delete image if block's image changed
      for (const block of currentBlocks) {
        const prevBlock = prevBlocks.find((pb: Parse.Object) => pb.id === block.id);

        if (prevBlock) {
          if (prevBlock.image && prevBlock.image.publicId !== block.image?.publicId) {
            blocksToDeleteImage.push(prevBlock.image.publicId);
          }
        }
      }

      // Delete image if block no longer exists
      for (const prevBlock of prevBlocks) {
        const stillExists = currentBlocks.some((block: Parse.Object) => block.id === prevBlock.id);

        if (!stillExists && prevBlock.image) {
          blocksToDeleteImage.push(prevBlock.image.publicId);
        }
      }

      if (blocksToDeleteImage.length > 0) {
        const deletedBlockFiles = await fileService.destroyFiles(blocksToDeleteImage);

        if (deletedBlockFiles) {
          logger.info(
            `Deleted block images for updated PageSection ${section.id}: ${deletedBlockFiles}`
          );
        }
        logger.info(
          `Deleted block images for updated PageSection ${section.id}: ${blocksToDeleteImage.join(',')}`
        );
      }
    }
  })
);

Parse.Cloud.afterDelete(
  'PageSection',
  parseFunction(async (request: Parse.Cloud.AfterDeleteRequest): Promise<void> => {
    const section = request.object;
    const blocks = section.get('blocks') || [];
    const publicIds = blocks.map((block: Record<string, any>) => block.image?.publicId).filter(Boolean) || [];

    if (publicIds.length === 0) return;

    const fileService = new FileService();

    const destroyedFile = await fileService.destroyFiles(
      publicIds
    );

    if (destroyedFile) {
      logger.info(
        `Deleted block images for deleted PageSection ${section.id}: ${publicIds.join(', ')}`
      );
    }
  })
);
