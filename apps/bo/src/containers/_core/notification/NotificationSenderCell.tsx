import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { IDENTITY_TEXT_GAP } from '@/constants/_core/ui/entity.constants';
import {
  TABLE_CELL_AVATAR_FONT_SIZE, TABLE_CELL_AVATAR_FONT_WEIGHT, TABLE_CELL_AVATAR_GAP,
  TABLE_CELL_AVATAR_SIZE,
} from '@/constants/_core/ui/list.constants';
import UserIdentityCell from '@/containers/_core/users/UserIdentityCell';
import { INotification } from '@/types/_core/notification.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${TABLE_CELL_AVATAR_GAP}px`,
    minWidth: 0,
  },
  /*
   * the platform's own sends get a neutral disc rather than the tinted one a person's initials sit
   * on: nobody is behind them, and a coloured face down the column would invite an operator to
   * click through to an account that does not exist
   */
  avatar: (theme: Theme) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: TABLE_CELL_AVATAR_SIZE,
    height: TABLE_CELL_AVATAR_SIZE,
    borderRadius: '50%',
    fontSize: TABLE_CELL_AVATAR_FONT_SIZE,
    fontWeight: TABLE_CELL_AVATAR_FONT_WEIGHT,
    color: getDesignTokens(theme).textSecondary,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    border: `1px solid ${getDesignTokens(theme).border}`,
  }),
  identity: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${IDENTITY_TEXT_GAP}px`,
    minWidth: 0,
  },
};

type Props = {
  notification: Pick<INotification, 'from'>;
};

/**
 * Who raised the send. Most notifications have no author at all — a job noticed a departure was
 * due, a status change fired a trigger — and the column has to say so rather than leave a blank
 * where every other row shows a name: "nobody sent this, the platform did" is the answer to a
 * whole class of support questions about who contacted a user.
 */
const NotificationSenderCell = ({ notification }: Props) => {
  const { t } = useTranslation(['user']);

  if (notification.from) return <UserIdentityCell user={notification.from} />;

  return (
    <Box css={classes.root}>
      <Box component="span" css={classes.avatar}>{t('user:notifications.systemInitials')}</Box>
      <Box css={classes.identity}>
        <Typography noWrap variant="subtitle1">{t('user:notifications.system')}</Typography>
        <Typography noWrap variant="body2">{t('user:notifications.automatedSend')}</Typography>
      </Box>
    </Box>
  );
};

export default NotificationSenderCell;
