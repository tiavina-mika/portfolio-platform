import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit } from 'react-icons/fi';
import { useDispatch } from 'react-redux';

import Dialog from '@/components/Dialog';
import { updateProfileUserInfo } from '@/redux/actions/user.action';
import { ProfileUserInfoInput } from '@/types/user.type';

import ProfileUserInfoForm from './ProfileUserInfoForm';

const USER_INFO_FORM_ID = 'user-info-form-id';

const ProfileEditUserInfo = () => {
  const {
    t,
  } = useTranslation();
  const [isOpenEditUserInfoDialog, setIsOpenEditUserInfoDialog] = useState<boolean>(false);
  const dispatch = useDispatch();

  const toggleOpenEditUserInfoFormDialog = () => {
    setIsOpenEditUserInfoDialog(!isOpenEditUserInfoDialog);
  };

  const onUserInfoFormSubmit = (values: ProfileUserInfoInput) => {
    dispatch(updateProfileUserInfo(values));
    toggleOpenEditUserInfoFormDialog();
  };

  return (
    <>
      <IconButton size="small" onClick={toggleOpenEditUserInfoFormDialog}>
        <FiEdit />
      </IconButton>
      <Dialog
        fullWidth
        formId={USER_INFO_FORM_ID}
        maxWidth="sm"
        open={isOpenEditUserInfoDialog}
        title={t('user:updateMyProfileInfos')}
        toggle={toggleOpenEditUserInfoFormDialog}
      >
        <ProfileUserInfoForm formId={USER_INFO_FORM_ID} onSubmit={onUserInfoFormSubmit} />
      </Dialog>
    </>
  );
};

export default ProfileEditUserInfo;
