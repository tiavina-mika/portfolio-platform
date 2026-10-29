/* eslint-disable @typescript-eslint/require-await */
import dayjs from 'dayjs';

import type { IUploadedFile } from '@/types/file.type';

import { destroyFiles, moveFileToRecycleBin } from '@/api/_core/cloudinary.api';
import { revalidateWebCacheTag } from '@/utils/_core/revalidate.utils';

import { parseFunction } from '../../utils/_core/utils.cloud';

export const PageSection = Parse.Object.extend('PageSection');

interface ISectionBlock {
  id: string;
  image?: IUploadedFile;
}

/**
 * moves every block's image to the Cloudinary recycle bin — mirrors `moveCMSImagesToRecycleBin`
 * (Page/Article) but the images live inside the `blocks` embedded JSON array, not on top-level
 * single/multiple file fields, so the shared helper can't be reused as-is
 * @param section
 */
const moveSectionBlockImagesToRecycleBin = async (section: Parse.Object): Promise<void> => {
  const blocks: ISectionBlock[] = section.get('blocks') || [];

  const newBlocks = await Promise.all(blocks.map(async (block) => {
    if (!block.image) return block;

    const file = await moveFileToRecycleBin(block.image.publicId);

    return { ...block, image: file };
  }));

  section.set('blocks', newBlocks);
};

/**
 * permanently destroys the images of blocks that were removed or had their image replaced on
 * this save — the `blocks` array is rewritten in full on every save (see
 * `saveOrUpdatePageSection`), so a block present in `prevSection` but missing (or pointing to a
 * different image) in `section` means its previous image is now orphaned
 * @param section
 * @param prevSection
 */
const destroyStaleBlockImages = async (
  section: Parse.Object,
  prevSection: Parse.Object
): Promise<void> => {
  const prevBlocks: ISectionBlock[] = prevSection.get('blocks') || [];
  const newBlocks: ISectionBlock[] = section.get('blocks') || [];
  const newPublicIds = new Set(
    newBlocks.filter((block) => block.image).map((block) => block.image!.publicId)
  );

  const publicIdsToDelete = prevBlocks
    .filter((block) => block.image && !newPublicIds.has(block.image.publicId))
    .map((block) => block.image!.publicId);

  if (publicIdsToDelete.length === 0) return;
  await destroyFiles(publicIdsToDelete);
};

/*
 * ----------------------------------------------------- //
 * -------------------- before save -------------------- //
 * ----------------------------------------------------- //
 */
Parse.Cloud.beforeSave(
  'PageSection',
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const section = request.object;
    const prevSection = request.original;
    const user = request.user;

    const dirtyKeys = section.dirtyKeys();

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
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const section = request.object;
    const prevSection = request.original;
    const user = request.user;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys) ? request.context.dirtyKeys : [];

    // page sections render as part of a page — keep the public site's cache in sync
    await revalidateWebCacheTag('pages');

    if (!user) return;

    // ----------- creation ----------- //
    if (!section.existed() || !prevSection) return;

    let hasChanged = false;

    // ----------- soft delete ----------- //
    if (dirtyKeys.includes('deleted') && section.get('deleted')) {
      section.set('deletedBy', user);
      section.set('deletedAt', dayjs().toDate());
      hasChanged = true;

      await moveSectionBlockImagesToRecycleBin(section);
    }
    else if (dirtyKeys.includes('blocks')) {
      // section stays alive — purge images of blocks that were removed/replaced on this save
      await destroyStaleBlockImages(section, prevSection);
    }

    if (!hasChanged) return;
    await section.save();
  })
);

Parse.Cloud.afterDelete(
  'PageSection',
  parseFunction<Parse.Cloud.AfterDeleteRequest>(async (request): Promise<void> => {
    const section = request.object;
    const blocks: ISectionBlock[] = section.get('blocks') || [];
    const publicIds = blocks.filter((block) => block.image).map((block) => block.image!.publicId);

    await revalidateWebCacheTag('pages');

    if (publicIds.length === 0) return;
    await destroyFiles(publicIds);
  })
);
