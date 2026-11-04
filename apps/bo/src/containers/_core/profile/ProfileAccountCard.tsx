import {
  Box, Button, Card, CardHeader, Chip, Typography, type Theme,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { PROFILE_PASSWORD_MASK } from '@/constants/_core/ui/entity.constants';
import ProfileAccountRow from '@/containers/_core/profile/ProfileAccountRow';
import ProfileMfaDialog from '@/containers/_core/profile/ProfileMfaDialog';
import ProfilePasswordDialog from '@/containers/_core/profile/ProfilePasswordDialog';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type ProfileAccountDialog = 'password' | 'mfa';

const classes = {
  /*
   * the rules between the rows are drawn by the card rather than by each row: a row does not know
   * whether it is the last one, and a border carried by every one of them would close the card with
   * a second line on top of its own edge
   */
  rows: (theme: Theme) => ({
    '& > *:not(:last-child)': { borderBottom: `1px solid ${getDesignTokens(theme).borderLight}` },
  }),
};

/**
 * What identifies the account and what protects it: the address it is reached at, the password, and
 * the second factor — each one row, each row closing on the single action that changes it.
 */
const ProfileAccountCard = () => {
  const {
    t,
  } = useTranslation();
  const user = useSelector(getAppCurrentUserSelector);
  /*
   * only the narrowest screen turns a row into its own action: down to `sm` there is still room for
   * the button to stand beside the sentence explaining the setting, and a real button says what it
   * does where a chevron only says that something will open
   */
  const isTouchScreen = useBreakpoint('sm');
  const [openDialog, setOpenDialog] = useState<ProfileAccountDialog | null>(null);

  const isMfaEnabled = !!user.mfa?.enabled;

  const handleCloseDialog = () => setOpenDialog(null);
  const handleOpenPasswordDialog = () => setOpenDialog('password');
  const handleOpenMfaDialog = () => setOpenDialog('mfa');

  return (
    <Card>
      <CardHeader title={t('user:accountInformation')} />
      <Box css={classes.rows}>
        {/* the address the account is reached at is what identifies it — it is not ours to rewrite */}
        <ProfileAccountRow
          description={user.email}
          isTouchScreen={isTouchScreen}
          label={t('user:email')}
          action={(
            <Typography sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }} variant="caption">
              {t('user:notEditable')}
            </Typography>
          )}
        />
        <ProfileAccountRow
          description={PROFILE_PASSWORD_MASK}
          isTouchScreen={isTouchScreen}
          label={t('user:password')}
          onClick={handleOpenPasswordDialog}
          action={(
            <Button onClick={handleOpenPasswordDialog} variant="outlined">
              {t('user:changePassword')}
            </Button>
          )}
        />
        <ProfileAccountRow
          isTouchScreen={isTouchScreen}
          label={t('user:mfa.label')}
          onClick={handleOpenMfaDialog}
          action={(
            <Button
              onClick={handleOpenMfaDialog}
              // turning the second factor off weakens the account: the action states it in its own color
              color={isMfaEnabled
                ? 'error'
                : 'primary'}
              variant={isMfaEnabled
                ? 'outlined'
                : 'contained'}
            >
              {isMfaEnabled
                ? t('user:mfa.disable')
                : t('user:mfa.activate')}
            </Button>
          )}
          chip={(
            <Chip
              color={isMfaEnabled
                ? 'primary'
                : 'warning'}
              label={isMfaEnabled
                ? t('user:mfa.enabled')
                : t('user:mfa.disabled')}
            />
          )}
          description={isMfaEnabled
            ? t('user:mfa.enabledHint')
            : t('user:mfa.disabledHint')}
        />
      </Box>
      <ProfilePasswordDialog onClose={handleCloseDialog} open={openDialog === 'password'} />
      <ProfileMfaDialog
        enabled={isMfaEnabled}
        onClose={handleCloseDialog}
        open={openDialog === 'mfa'}
      />
    </Card>
  );
};

export default ProfileAccountCard;
