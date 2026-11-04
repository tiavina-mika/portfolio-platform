import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import Avatar from '@/components/Avatar';
import StatusDot from '@/components/StatusDot';
import { NOTIFICATION_ROW_RECIPIENTS_SHOWN } from '@/constants/_core/notification.constants';
import {
  NOTIFICATION_CARD_ROW_GAP, NOTIFICATION_RECIPIENT_AVATAR_FONT_SIZE,
  NOTIFICATION_RECIPIENT_AVATAR_OVERLAP, NOTIFICATION_RECIPIENT_AVATAR_RING,
  NOTIFICATION_RECIPIENT_AVATAR_SIZE, NOTIFICATION_RECIPIENT_LABEL_FONT_SIZE,
  NOTIFICATION_RECIPIENTS_CARD_WIDTH,
} from '@/constants/_core/ui/inbox.constants';
import { TABLE_CELL_AVATAR_GAP, TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { FONT_SIZE_BODY, RADIUS } from '@/constants/_core/ui/ui.constants';
import { INotification } from '@/types/_core/notification.type';
import { IUser } from '@/types/_core/user.type';
import {
  getNotificationRecipientId, getNotificationRecipientReadLabel, isNotificationSeenByRecipient,
} from '@/utils/_core/notification.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${TABLE_CELL_AVATAR_GAP}px`,
    minWidth: 0,
  },
  stack: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  /*
   * the faces overlap so the stack reads as one object — "these people" — rather than as a row of
   * separate cells. Each carries a ring in the surface colour, without which the one behind it
   * disappears into the one in front at this size.
   */
  avatar: (isFirst: boolean) => (theme: Theme) => ({
    fontSize: NOTIFICATION_RECIPIENT_AVATAR_FONT_SIZE,
    marginLeft: isFirst
      ? 0
      : NOTIFICATION_RECIPIENT_AVATAR_OVERLAP,
    boxShadow: `0 0 0 ${NOTIFICATION_RECIPIENT_AVATAR_RING}px ${getDesignTokens(theme).surface}`,
  }),
  // the same face inside the card the stack opens onto, without the ring that separates a stack
  cardAvatar: {
    fontSize: NOTIFICATION_RECIPIENT_AVATAR_FONT_SIZE,
  },
  // through `sx`, not `css`: it overrides the font size the `body2` variant brings with it
  label: {
    fontSize: NOTIFICATION_RECIPIENT_LABEL_FONT_SIZE,
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    width: NOTIFICATION_RECIPIENTS_CARD_WIDTH,
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${NOTIFICATION_CARD_ROW_GAP}px`,
    minWidth: 0,
  },
  cardName: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${TABLE_CELL_AVATAR_GAP}px`,
    minWidth: 0,
  },
};

/*
 * the list reads as a surface of the page rather than as MUI's dark text tooltip: it holds a row
 * per person with a state beside it, which is a small table and not a caption
 */
const recipientsTooltipStyles = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  fontSize: FONT_SIZE_BODY,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${RADIUS}px`,
  boxShadow: getDesignTokens(theme).shadowPopover,
  maxWidth: 'none',
});

type Props = {
  notification: INotification;
};

/**
 * Who the send went to, and which of them have opened it.
 *
 * One recipient is named; several are counted. A departure reminder goes to every passenger of a
 * ride, and forty names would be the widest thing on screen for a fact nobody reads name by name —
 * but a send to a single person is the common case, and there the count says nothing the row did
 * not already say. The faces say roughly how many, the label says exactly who or how many, and the
 * per-person answer — which is the one support actually needs — is one hover away.
 */
const NotificationRecipientsCell = ({ notification }: Props) => {
  const { t } = useTranslation(['user']);

  const recipients = notification.to ?? [];
  const total = notification.toCount ?? recipients.length;

  if (total === 0) return <Typography variant="body2">—</Typography>;

  const shown = recipients.slice(0, NOTIFICATION_ROW_RECIPIENTS_SHOWN);
  const remaining = total - shown.length;

  /*
   * a send to one person is named rather than counted: "1 destinataire" is the one count that says
   * nothing an operator did not already know from the row, where the name is the answer to who it
   * went to. The count takes over as soon as there are several — forty names is not a cell.
   */
  const label = total === 1 && recipients[0]
    ? getUserFullName(recipients[0])
    : remaining > 0
      ? t('user:notifications.recipientsWithRemaining', { count: total, remaining })
      : t('user:notifications.recipientsWithCount', { count: total });

  return (
    <Tooltip
      placement="bottom-start"
      slotProps={{ tooltip: { sx: recipientsTooltipStyles } }}
      title={(
        <Box css={classes.card}>
          {recipients.map((user: IUser) => (
            <Box css={classes.cardRow} key={getNotificationRecipientId(user)}>
              <Box css={classes.cardName}>
                <Avatar
                  isNameShown
                  size={NOTIFICATION_RECIPIENT_AVATAR_SIZE}
                  sx={classes.cardAvatar}
                  user={user}
                />
                <Typography noWrap variant="body2">{getUserFullName(user)}</Typography>
              </Box>
              <StatusDot
                color={isNotificationSeenByRecipient(notification, getNotificationRecipientId(user))
                  ? 'success'
                  : 'error'}
                label={(
                  <Typography component="span" variant="body2">
                    {getNotificationRecipientReadLabel(notification, getNotificationRecipientId(user))}
                  </Typography>
                )}
              />
            </Box>
          ))}
          {/*
            * the list only holds the recipients the row loaded; a fan-out wider than that says so
            * rather than looking like the whole audience
            */}
          {total > recipients.length && (
            <Typography variant="caption">
              {t('user:notifications.moreRecipients', { count: total - recipients.length })}
            </Typography>
          )}
        </Box>
      )}
    >
      <Box css={classes.root} tabIndex={0}>
        <Box css={classes.stack}>
          {shown.map((user: IUser, index: number) => (
            <Avatar
              /* with a single recipient the label beside the stack is that person's name */
              isNameShown={total === 1}
              key={getNotificationRecipientId(user)}
              size={NOTIFICATION_RECIPIENT_AVATAR_SIZE}
              sx={classes.avatar(index === 0)}
              user={user}
            />
          ))}
        </Box>
        <Typography noWrap sx={classes.label} variant="body2">
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default NotificationRecipientsCell;
