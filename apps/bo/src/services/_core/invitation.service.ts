import Parse from 'parse';

import { ISendInvitationInput } from '@/types/_core/invitation.type';

export const sendInvitation = async (values: ISendInvitationInput): Promise<boolean> => {
  return Parse.Cloud.run('sendBOInvitation', values);
};
