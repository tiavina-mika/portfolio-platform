import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/_core/util.action';
import { clearRecycleBin, purgeOrphanedEditorFiles } from '@/services/_core/misc.service';
import { UIRoleEnum } from '@/types/_core/role.type';

import { AppThunkAction } from '../../store';

export const onMiscEnter = (): AppThunkAction => {
  // the page itself just needs access to ANY of its tabs — each tab is re-gated individually in the UI
  return onEnterActionWithLoader(null, {
    uiRight: [UIRoleEnum.MIGRATIONS, UIRoleEnum.CRON, UIRoleEnum.TESTS],
  });
};

/**
 * clear recycle bin in cloud
 * @returns
 */
export const clearRecycleBinInCloud = (limit: number): any => {
  return actionWithLoader(async (): Promise<void> => {
    await clearRecycleBin(limit);
  });
};

/**
 * purge orphaned CMS editor files in cloud (Page/Article TipTap uploads abandoned without saving)
 * @returns
 */
export const purgeOrphanedEditorFilesInCloud = (olderThanHours: number): any => {
  return actionWithLoader(async (): Promise<void> => {
    await purgeOrphanedEditorFiles(olderThanHours);
  });
};
