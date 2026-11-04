import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import {
  NOTIFICATION_MESSAGE_CODE_FONT_SIZE, NOTIFICATION_MESSAGE_CODE_LETTER_SPACING,
  NOTIFICATION_MESSAGE_LINE_GAP, NOTIFICATION_MESSAGE_LINE_HEIGHT,
} from '@/constants/_core/ui/inbox.constants';
import { TABLE_CELL_TEXT_MAX_WIDTH } from '@/constants/_core/ui/list.constants';
import { FONT_FAMILY_MONO } from '@/constants/_core/ui/ui.constants';
import { INotification } from '@/types/_core/notification.type';
import { getNotificationMessage } from '@/utils/_core/notification.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${NOTIFICATION_MESSAGE_LINE_GAP}px`,
    maxWidth: TABLE_CELL_TEXT_MAX_WIDTH,
    minWidth: 0,
  },
  /*
   * the leading is set on the lines rather than left to the type scale: a subtitle is led for
   * running prose, and at that height the sentence and the code under it drift apart far enough to
   * read as two cells stacked in one column instead of one cell with a caption.
   *
   * Both lines take it through `sx` rather than the `css` prop the rest of the file uses: these
   * are the variant's own properties being overridden, and only `sx` is applied after the styles
   * the variant brings.
   */
  message: {
    lineHeight: NOTIFICATION_MESSAGE_LINE_HEIGHT,
  },
  /*
   * the raw status is set in the code face rather than translated: it is the string support quotes
   * into a bug report and greps the logs for, so it has to be the value itself, not a rendering of
   * it — the chip on the same row is what says it in words. It is set under the caption scale
   * because it is not read down the column, only picked out of the row once it has been found.
   */
  code: {
    fontFamily: FONT_FAMILY_MONO,
    fontSize: NOTIFICATION_MESSAGE_CODE_FONT_SIZE,
    letterSpacing: NOTIFICATION_MESSAGE_CODE_LETTER_SPACING,
    lineHeight: NOTIFICATION_MESSAGE_LINE_HEIGHT,
  },
};

type Props = {
  notification: INotification;
};

/**
 * What the recipient actually read, with the technical status under it. The message is the one
 * thing in the row a person outside the team can be quoted back — "you were told the ride was
 * cancelled" — and having it in the list is what lets support answer without opening the row.
 */
const NotificationMessageCell = ({ notification }: Props) => {
  const { t } = useTranslation(['user']);

  const message = getNotificationMessage(notification);

  return (
    <Box css={classes.root}>
      <Typography noWrap sx={classes.message} variant="subtitle1">
        {message || t('user:notifications.noMessage')}
      </Typography>
      <Typography noWrap sx={classes.code} variant="caption">
        {notification.status}
      </Typography>
    </Box>
  );
};

export default NotificationMessageCell;
