import i18n from '@/config/i18n';
import { actionWithLoader } from '@/redux/actions/_core/util.action';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  createBatchTestData, destroyBatchTestData, sendTestEmail, sendTestSms,
} from '@/services/_core/test.service';
import { TestEmailInput } from '@/types/_core/testEmail.type';
import { TestSmsInput } from '@/types/_core/testSms.type';


/**
 * change browser and stored language
 * @returns
 */
export const createBatchTest = (limit: number): any => {
  return actionWithLoader(async (): Promise<void> => {
    await createBatchTestData(limit);
  });
};

export const deleteBatchTest = (): any => {
  return actionWithLoader(async (): Promise<void> => {
    await destroyBatchTestData();
  });
};

/**
 * NOTE: before lunching this function
 * in Parse.Cloud.define('sendVerificationCode')
 * make sure to comment the "emailVerified" user field condition for it to work
 */
export const sendCodeToEmailTest = (values: TestEmailInput): any => {
  return actionWithLoader(async (dispatch): Promise<void> => {
    const isSent = await sendTestEmail(values);

    if (!isSent) {
      throw new Error(i18n.t('user:errors.sendVerificationEmailFail'));
    }

    dispatch(setMessageSlice(i18n.t('user:messages.sendVerificationEmailSuccess')));
  });
};

/**
 * NOTE: before lunching this function
 * in Parse.Cloud.define('sendVerificationCode')
 * make sure to comment the "phoneVerified" user field condition for it to work
 */
export const sendCodeToSmsTest = (values: TestSmsInput): any => {
  return actionWithLoader(async (dispatch): Promise<void> => {
    const isSent = await sendTestSms(values);

    if (!isSent) {
      throw new Error(i18n.t('user:errors.sendVerificationSmsFail'));
    }

    dispatch(setMessageSlice(i18n.t('user:messages.sendVerificationSmsSuccess')));
  });
};
