import Parse from 'parse';

import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { UIRoleEnum } from '@/types/role.type';

import { AppThunkAction } from '../store';

export const onMiscEnter = (): AppThunkAction => {
  return onEnterActionWithLoader(null, { uiRight: UIRoleEnum.MISCELLANEOUS });
};

/**
 * clear recycle bin in cloud
 * @returns
 */
export const clearRecycleBinInCloud = (limit: number): any => {
  return actionWithLoader(async (): Promise<void> => {
    await Parse.Cloud.run('clearRecycleBinInCloud', { limit });
  });
};

/**
 * migrate data
 * hard coded change database data
 * the migration can be here or in the server side
 * @NOTE used only for temporary migration, the content should be removed after migration
 */
export const migrate = (): any => {
  return actionWithLoader(async (): Promise<void> => {
  // maybe add some params if needed
    await Parse.Cloud.run('migrate');
  });
};
