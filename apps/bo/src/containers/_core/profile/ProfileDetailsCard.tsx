import {
  Box, Button, Card, CardHeader, type Theme,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import { RowEditIcon } from '@/components/icons/RowActionIcons';
import { PAGE_HEAD_ACTION_ICON_SIZE } from '@/constants/_core/ui/page.constants';
import ProfileInlineField from '@/containers/_core/profile/ProfileInlineField';
import ProfileUserInfoForm from '@/containers/_core/profile/ProfileUserInfoForm';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { updateProfileUserInfo } from '@/redux/actions/_core/user.action';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ProfileUserInfoInput } from '@/types/_core/user.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const USER_INFO_FORM_ID = 'user-info-form-id';

const classes = {
  /*
   * the rules between the fields are drawn by the card rather than by each field: a field does not
   * know whether it is the last one, and a border carried by every one of them would close the card
   * with a second line on top of its own edge
   */
  fields: (theme: Theme) => ({
    '& > *:not(:last-child)': { borderBottom: `1px solid ${getDesignTokens(theme).borderLight}` },
  }),
};

/**
 * What the back-office records about the reader themselves. Each field is rewritten in place on a
 * pointer device; the header's action opens the same two fields as one form, which is also the way
 * in on a touch screen, where a row has no space for an input and its two buttons.
 */
const ProfileDetailsCard = () => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(getAppCurrentUserSelector);
  const loading = useSelector(getUserLoadingSelector);
  const isTouchScreen = useBreakpoint('md');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const toggleDialog = () => setIsDialogOpen((isOpen: boolean) => !isOpen);

  const handleSubmit = (values: ProfileUserInfoInput) => {
    dispatch(updateProfileUserInfo(values));
    toggleDialog();
  };

  /*
   * the endpoint takes the whole pair, so a field saved on its own sends the value of the other one
   * back unchanged rather than clearing it
   */
  const handleSaveLastName = (lastName: string) => {
    dispatch(updateProfileUserInfo({ lastName, firstName: user.firstName }));
  };

  const handleSaveFirstName = (firstName: string) => {
    dispatch(updateProfileUserInfo({ lastName: user.lastName, firstName }));
  };

  return (
    <Card>
      <CardHeader
        title={t('user:detailsAboutYou')}
        action={(
          <Button
            onClick={toggleDialog}
            size="small"
            startIcon={<RowEditIcon size={PAGE_HEAD_ACTION_ICON_SIZE} />}
            variant="outlined"
          >
            {t('edit')}
          </Button>
        )}
      />
      <Box css={classes.fields}>
        <ProfileInlineField
          isTouchScreen={isTouchScreen}
          label={t('user:lastName')}
          loading={loading}
          onOpenDialog={toggleDialog}
          onSave={handleSaveLastName}
          value={user.lastName}
        />
        <ProfileInlineField
          isTouchScreen={isTouchScreen}
          label={t('user:firstName')}
          loading={loading}
          onOpenDialog={toggleDialog}
          onSave={handleSaveFirstName}
          value={user.firstName}
        />
      </Box>
      <Dialog
        fullWidth
        formId={USER_INFO_FORM_ID}
        maxWidth="sm"
        open={isDialogOpen}
        title={t('user:updateAboutMe')}
        toggle={toggleDialog}
      >
        <ProfileUserInfoForm formId={USER_INFO_FORM_ID} onSubmit={handleSubmit} />
      </Dialog>
    </Card>
  );
};

export default ProfileDetailsCard;
