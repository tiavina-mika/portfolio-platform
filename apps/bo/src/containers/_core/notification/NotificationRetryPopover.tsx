import {
  Box, Button, Popover, Typography,
} from '@mui/material';
import { NotificationChannelEnum } from '@shared/types';
import { useTranslation } from 'react-i18next';

import type { NotificationChannel } from '@shared/types';

import {
  NOTIFICATION_RETRY_POPOVER_GAP, NOTIFICATION_RETRY_POPOVER_WIDTH,
} from '@/constants/_core/ui/inbox.constants';

const classes = {
  panel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${NOTIFICATION_RETRY_POPOVER_GAP}px`,
    width: NOTIFICATION_RETRY_POPOVER_WIDTH,
    padding: `${NOTIFICATION_RETRY_POPOVER_GAP}px`,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${NOTIFICATION_RETRY_POPOVER_GAP}px`,
  },
};

type Props = {
  /** The control the retry was asked from; the popover is closed while there is none. */
  anchorEl: HTMLElement | null;
  /** What is about to be sent again — "Hery Randria · SMS". */
  title: string;
  /** Why it failed: the provider's own answer when it gave one. */
  explanation: string;
  channel?: NotificationChannel;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * The step between a refused send and its retry: what failed, why its provider said it failed, and —
 * for an SMS — that sending it again is billed. A provider that rejected a number as unreachable will
 * reject it again, so the operator reads why before deciding rather than after.
 */
const NotificationRetryPopover = ({
  anchorEl, title, explanation, channel, confirmLabel, onConfirm, onClose,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);

  return (
    <Popover
      anchorEl={anchorEl}
      onClose={onClose}
      open={!!anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box css={classes.panel}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2">{explanation}</Typography>
        {channel === NotificationChannelEnum.SMS && (
          <Typography variant="body2">{t('user:notifications.smsCostNotice')}</Typography>
        )}
        <Box css={classes.actions}>
          <Button onClick={onConfirm} variant="contained">{confirmLabel}</Button>
          <Button onClick={onClose} variant="outlined">{t('common:close')}</Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default NotificationRetryPopover;
