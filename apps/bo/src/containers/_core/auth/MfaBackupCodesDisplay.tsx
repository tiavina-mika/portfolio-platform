import {
  Alert, Box, Button, Stack, Typography, type Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { ProfileCopyIcon } from '@/components/icons/ProfileIcons';
import {
  PROFILE_BACKUP_CODE_LETTER_SPACING, PROFILE_BACKUP_CODE_PADDING_X, PROFILE_BACKUP_CODE_PADDING_Y,
  PROFILE_BACKUP_CODES_COLUMNS, PROFILE_BACKUP_CODES_GAP,
} from '@/constants/_core/ui/entity.constants';
import { FONT_FAMILY_MONO, RADIUS } from '@/constants/_core/ui/ui.constants';
import { setMessageSlice, getAppMfaBackupCodesSelector } from '@/redux/reducers/_core/app.reducer';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  /*
   * the codes are read off the screen and written down, so they are a block of even tiles rather
   * than a list: two columns keep each code short enough to be transcribed without losing the place
   */
  codes: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${PROFILE_BACKUP_CODES_COLUMNS}, minmax(0, 1fr))`,
    gap: `${PROFILE_BACKUP_CODES_GAP}px`,
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  }),
  code: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      padding: `${PROFILE_BACKUP_CODE_PADDING_Y}px ${PROFILE_BACKUP_CODE_PADDING_X}px`,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS,
      backgroundColor: tokens.surfaceSecondary,
      fontFamily: FONT_FAMILY_MONO,
      letterSpacing: PROFILE_BACKUP_CODE_LETTER_SPACING,
      textAlign: 'center' as const,
    };
  },
  // the copy action belongs to the block above it, not to the dialog's own row of actions
  copyButton: { alignSelf: 'flex-start' },
};

/**
 * The backup codes of a finished enrollment, shown once. Acknowledging them is what closes the
 * dialog holding this block, so the only action here is the one that puts them on the clipboard.
 */
const MfaBackupCodesDisplay = () => {
  const {
    t,
  } = useTranslation(['user']);
  const dispatch = useDispatch();
  const backupCodes = useSelector(getAppMfaBackupCodesSelector);

  const handleCopyAll = () => {
    if (!backupCodes) return;

    navigator.clipboard.writeText(backupCodes.join('\n'));
    dispatch(setMessageSlice(t('user:mfa.backupCodesCopied')));
  };

  return (
    <Stack spacing={2}>
      <Alert severity="warning">{t('user:mfa.backupCodesWarning')}</Alert>
      <Box css={classes.codes}>
        {backupCodes?.map((code: string) => (
          <Typography css={classes.code} key={code}>{code}</Typography>
        ))}
      </Box>
      <Button
        css={classes.copyButton}
        onClick={handleCopyAll}
        startIcon={<ProfileCopyIcon />}
        variant="outlined"
      >
        {t('user:mfa.copyBackupCodes')}
      </Button>
    </Stack>
  );
};

export default MfaBackupCodesDisplay;
