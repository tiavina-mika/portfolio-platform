import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import ProfileUserPasswordForm from '@/containers/_core/profile/ProfileUserPasswordForm';
import { changePassword } from '@/redux/actions/_core/auth.action';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { IChangePasswordInput } from '@/types/_core/auth.type';

const USER_PASSWORD_FORM_ID = 'user-password-form-id';

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * The dialog the profile's password row opens: the current password, the new one, and its
 * confirmation. It is opened by its row rather than owning a trigger of its own, so the same row
 * can be the target on a touch screen, where the button beside it has no room to stand.
 */
const ProfilePasswordDialog = ({
  open, onClose,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const loading = useSelector(getUserLoadingSelector);

  const handleSubmit = (values: IChangePasswordInput) => {
    dispatch(changePassword(values));
    onClose();
  };

  return (
    <Dialog
      fullWidth
      formId={USER_PASSWORD_FORM_ID}
      loading={loading}
      maxWidth="sm"
      open={open}
      primaryButtonText={t('user:changePassword')}
      title={t('user:changePassword')}
      toggle={onClose}
    >
      <ProfileUserPasswordForm formId={USER_PASSWORD_FORM_ID} onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default ProfilePasswordDialog;
