import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit } from 'react-icons/fi';
import { useDispatch } from 'react-redux';

import Dialog from '@/components/Dialog';
import { changePassword } from '@/redux/actions/auth.action';
import { IChangePasswordInput } from '@/types/auth.type';

import ProfileUserPasswordForm from './ProfileUserPasswordForm';

const USER_PASSWORD_FORM_ID = 'user-password-form-id';

const ProfileEditUserPassword = () => {
  const [isOpenEditUserPasswordDialog, setIsOpenEditUserPasswordDialog] = useState<boolean>(false);
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  const toggleOpenEditUserPasswordFormDialog = () => {
    setIsOpenEditUserPasswordDialog(!isOpenEditUserPasswordDialog);
  };

  const onUSerPasswordFormSubmit = (values: IChangePasswordInput) => {
    dispatch(changePassword(values));
    toggleOpenEditUserPasswordFormDialog();
  };

  return (
    <>
      <IconButton onClick={toggleOpenEditUserPasswordFormDialog} size="small">
        <FiEdit />
      </IconButton>
      <Dialog
        fullWidth
        formId={USER_PASSWORD_FORM_ID}
        maxWidth="sm"
        open={isOpenEditUserPasswordDialog}
        title={t('user:changePassword')}
        toggle={toggleOpenEditUserPasswordFormDialog}
      >
        <ProfileUserPasswordForm formId={USER_PASSWORD_FORM_ID} onSubmit={onUSerPasswordFormSubmit} />
      </Dialog>
    </>
  );
};

export default ProfileEditUserPassword;
