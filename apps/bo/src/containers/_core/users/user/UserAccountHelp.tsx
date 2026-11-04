import {
  Box, Button, Stack, Typography,
} from '@mui/material';
import { getCountry } from '@shared/utils';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { IUser } from '@/types/_core/user.type';
import { getCountryName } from '@/utils/_core/country.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getFullPhoneNumber } from '@/utils/_core/user.utils';

type Props = {
  user: IUser;
  onResendCode: () => void;
  onChangeContact: () => void;
  onChangeCountry: () => void;
  onResetPassword: () => void;
};

// below this width the description would wrap to a sliver, so the button drops under it instead
const ACTION_TEXT_MIN_WIDTH = 260;

const classes = {
  /*
   * one action per row: what it does on the left, the button on the right — the button wraps under
   * the text once the text column cannot keep its minimum width
   */
  action: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
    gap: theme.spacing(1.5, 3),
    paddingBlock: theme.spacing(1.75),
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  text: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    gap: theme.spacing(0.375),
    minWidth: ACTION_TEXT_MIN_WIDTH,
  }),
};

/**
 * What support can do for a member who can no longer get into their account — above all one who
 * signed up by phone and has no email to recover through. Four actions, each asking for a reason
 * in a dialog of its own: send the sign-up code again, replace a lost phone number or email, move
 * the account to another country, send the password-reset code. An action that cannot apply to this member stays on the list, disabled,
 * with the reason — its absence would read as a missing feature.
 */
const UserAccountHelp = ({
  user, onResendCode, onChangeContact, onChangeCountry, onResetPassword,
}: Props) => {
  const { t } = useTranslation(['user']);

  const hasPhone = !!user.phone?.number;
  // a code can only go to a number the member has not confirmed yet
  const canResendCode = hasPhone && !user.phoneVerified;
  // the reset reaches the member by their confirmed number, or by their email when there is none
  const canResetPassword = (hasPhone && !!user.phoneVerified) || !!user.email;

  const actions = [
    {
      key: 'resendCode',
      isAvailable: canResendCode,
      // nothing to press when there is no code to send: the sentence beside it says why
      hasButtonWhenUnavailable: false,
      description: t('user:detail.accountHelp.resendCode.description', { phone: getFullPhoneNumber(user.phone) }),
      onClick: onResendCode,
    },
    {
      key: 'changeContact',
      isAvailable: true,
      hasButtonWhenUnavailable: true,
      description: t('user:detail.accountHelp.changeContact.description'),
      onClick: onChangeContact,
    },
    {
      key: 'changeCountry',
      isAvailable: true,
      hasButtonWhenUnavailable: true,
      description: t('user:detail.accountHelp.changeCountry.description', {
        country: getCountryName(getCountry(user.country).code),
      }),
      onClick: onChangeCountry,
    },
    {
      key: 'resetPassword',
      isAvailable: canResetPassword,
      hasButtonWhenUnavailable: true,
      description: t('user:detail.accountHelp.resetPassword.description'),
      onClick: onResetPassword,
    },
  ];

  return (
    <Stack>
      <Typography color="textSecondary" sx={{ paddingBottom: 1.5 }} variant="body2">
        {t('user:detail.accountHelp.intro')}
      </Typography>
      {actions.map((action) => (
        <Box key={action.key} sx={classes.action}>
          <Box sx={classes.text}>
            <Typography variant="subtitle2">{t(`user:detail.accountHelp.${action.key}.title`)}</Typography>
            <Typography color="textSecondary" variant="body2">
              {action.isAvailable
                ? action.description
                : t(`user:detail.accountHelp.${action.key}.unavailable`)}
            </Typography>
          </Box>
          {(action.isAvailable || action.hasButtonWhenUnavailable) && (
            <Button
              disabled={!action.isAvailable}
              onClick={action.onClick}
              variant="outlined"
            >
              {t(`user:detail.accountHelp.${action.key}.action`)}
            </Button>
          )}
        </Box>
      ))}
    </Stack>
  );
};

export default UserAccountHelp;
