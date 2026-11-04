import i18n from '@/config/i18n';
import { actionWithLoader } from '@/redux/actions/_core/util.action';
import { setErrorSlice, setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { AppDispatch } from '@/redux/store';
import { sendInvitation } from '@/services/_core/invitation.service';
import { ISendInvitationInput } from '@/types/_core/invitation.type';

export const sendBOInvitation = (values: ISendInvitationInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const isSent = await sendInvitation(values);

    if (!isSent) {
      dispatch(setErrorSlice(i18n.t('user:invitation.emailNotSent', { email: values.email })));
      return;
    }

    dispatch(setMessageSlice(i18n.t('user:invitation.invitationSentTo', { email: values.email })));
  }, {
    collection: '_User',
    action: 'create',
  });
};
