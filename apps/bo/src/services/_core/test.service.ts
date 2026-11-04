import Parse from 'parse';

import { TestEmailInput } from '@/types/_core/testEmail.type';
import { TestSmsInput } from '@/types/_core/testSms.type';

export const createBatchTestData = async (limit: number): Promise<void> => {
  await Parse.Cloud.run('createBatchTest', { limit });
};

export const destroyBatchTestData = async (): Promise<void> => {
  await Parse.Cloud.run('destroyBatchTest');
};

export const sendTestEmail = async ({
  template, to, firstName, sender, locale,
}: TestEmailInput): Promise<boolean> => {
  return Parse.Cloud.run(template, {
    email: to,
    firstName,
    sender,
    locale,
  });
};

export const fetchTestEmailSenders = async (): Promise<string[]> => {
  return Parse.Cloud.run('getTestEmailSendersOptions');
};

export const sendTestSms = async ({ to, locale }: TestSmsInput): Promise<boolean> => {
  return Parse.Cloud.run('sendVerificationCodeSmsTest', { phoneNumber: to, locale });
};
