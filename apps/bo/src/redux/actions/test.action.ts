import Parse from 'parse';

import i18n from '@/config/i18n';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { UIRoleEnum } from '@/types/role.type';

import { setMessageSlice } from '../reducers/app.reducer';
import { AppThunkAction } from '../store';


/**
 * change browser and stored language
 * @returns
 */
export const createBatchTest = (limit: number): any => {
  return actionWithLoader(async (): Promise<void> => {
    await Parse.Cloud.run('createBatchTest', { limit });
  });
};

export const deleteBatchTest = (): any => {
  return actionWithLoader(async (): Promise<void> => {
    await Parse.Cloud.run('destroyBatchTest');
  });
};

/**
 * NOTE: before lunching this function, make
 * in Parse.Cloud.define('sendVerificationCode')
 * make sure to comment the "verified" user field condition for it to work
 */
export const sendCodeToEmailTest = (functionName: string): any => {
  return actionWithLoader(async (dispatch): Promise<void> => {
    const sent = await Parse.Cloud.run(functionName, {
    // use a real email to test
      email: 'ralainirinamichael@gmail.com',
      locale: 'fr',
    });

    if (!sent) {
      throw new Error(i18n.t('user:errors.sendVerificationEmailFail'));
    }

    dispatch(setMessageSlice(i18n.t('user:messages.sendVerificationEmailSuccess')));
  });
};

/**
 * just check if the user is allowed to enter
 * @returns
 */
export const onTestEnter = (): AppThunkAction => {
  return onEnterActionWithLoader(null, { uiRight: UIRoleEnum.TESTS });
};
