import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { TICKET_SOURCE_LABEL_KEYS } from '@/constants/_core/ticket.constants';
import {
  INBOX_AVATAR_FONT_SIZE, INBOX_AVATAR_SIZE, INBOX_ITEM_GAP, INBOX_ITEM_HEAD_GAP,
  INBOX_ITEM_PADDING, INBOX_ITEM_RAIL_WIDTH, INBOX_PRIORITY_DOT_SIZE, INBOX_SOURCE_ICON_SIZE,
} from '@/constants/_core/ui/inbox.constants';
import { FONT_SIZE_META } from '@/constants/_core/ui/ui.constants';
import TicketSourceIcon from '@/containers/_core/tickets/TicketSourceIcon';
import TicketStatusChip from '@/containers/_core/tickets/TicketStatusChip';
import { IContact } from '@/types/_core/contact.type';
import {
  TicketPriority, TicketPriorityEnum, TicketSource, TicketSourceEnum, TicketStatusEnum,
} from '@/types/_core/ticket-message.type';
import { getContactSosExtension } from '@/utils/_core/contact.utils';
import { fromNow } from '@/utils/_core/date.utils';
import { getDesignTokens, getSosTones, getTintedBackground } from '@/utils/_core/theme/tokens.utils';
import {
  getTicketRequesterInitials, getTicketRequesterName, getTicketSource, getTicketSubjectLabel, isLiveSosTicket,
} from '@/utils/_core/ticket.utils';

/*
 * priority is a dot here rather than the pill the open ticket's header carries: the row already
 * states one status, and a second pill beside it would make the two compete for the same glance.
 * The tone is the same one the pill uses, so the dot and the pill still name the same thing.
 */
const getPriorityColor = (theme: Theme, priority: TicketPriority): string => {
  switch (priority) {
    case TicketPriorityEnum.URGENT:
      return theme.palette.error.main;
    case TicketPriorityEnum.HIGH:
      return theme.palette.warning.main;
    case TicketPriorityEnum.MEDIUM:
      return theme.palette.primary.main;
    default:
      return getDesignTokens(theme).textDisabled;
  }
};

const classes = {
  item: (theme: Theme, isSelected: boolean, isLiveSos: boolean, isUnread: boolean) => {
    const tokens = getDesignTokens(theme);
    const sosTones = getSosTones(theme);
    const railColor = isLiveSos ? theme.palette.error.main : 'transparent';
    // an SOS nobody has opened yet keeps a red wash until an agent does
    const restingBackground = isLiveSos && isUnread ? sosTones.background : 'transparent';

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      gap: `${INBOX_ITEM_GAP}px`,
      width: '100%',
      padding: `${INBOX_ITEM_PADDING}px`,
      textAlign: 'left' as const,
      borderBottom: `1px solid ${tokens.borderLight}`,
      /*
       * the open row is marked by a rail on its leading edge, drawn on every row so the list does
       * not shift sideways by three pixels each time the reader picks a different ticket. A live
       * SOS keeps a red rail of its own, so it stays found once the agent has moved on to another
       */
      borderLeft: `${INBOX_ITEM_RAIL_WIDTH}px solid ${isSelected ? theme.palette.primary.main : railColor}`,
      backgroundColor: isSelected
        ? getTintedBackground(theme, theme.palette.primary.main)
        : restingBackground,
      '&:hover': { backgroundColor: isSelected ? undefined : tokens.tabHover },
    };
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_ITEM_HEAD_GAP}px`,
    width: '100%',
  },
  avatar: (theme: Theme) => ({
    width: INBOX_AVATAR_SIZE,
    height: INBOX_AVATAR_SIZE,
    fontSize: INBOX_AVATAR_FONT_SIZE,
    fontWeight: theme.typography.fontWeightMedium,
    backgroundColor: theme.palette.primary.main,
  }),
  dot: (theme: Theme, priority: TicketPriority) => ({
    width: INBOX_PRIORITY_DOT_SIZE,
    height: INBOX_PRIORITY_DOT_SIZE,
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: getPriorityColor(theme, priority),
  }),
  /*
   * in the queue the origin is a glyph, not a chip: the row already carries one pill for status,
   * and where a ticket came from is read while scanning rather than looked up
   */
  sourceIcon: (theme: Theme, source: TicketSource) => ({
    flexShrink: 0,
    display: 'flex',
    color: {
      [TicketSourceEnum.SOS]: theme.palette.error.main,
      [TicketSourceEnum.APP]: theme.palette.primary.main,
      [TicketSourceEnum.WEB]: getDesignTokens(theme).textMuted,
    }[source],
  }),
  // one line, whatever was written: the queue says what the ticket is about, the thread says it all
  excerpt: {
    display: 'block',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  contact: IContact;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

/**
 * One ticket in the queue: who wrote, how urgent it is, when it last moved, what it says and where
 * it stands. A ticket carrying activity no agent has opened yet states its author in the strong
 * weight — the same signal an unread mail thread uses, and the only thing separating the two
 * states, since a row that also changed colour would compete with the rail marking the open one.
 */
const ContactInboxItem = ({ contact, isSelected, onSelect }: Props) => {
  const { t } = useTranslation(['user']);
  const sos = getContactSosExtension();
  const source = getTicketSource(contact);
  const isSos = !!sos && source === TicketSourceEnum.SOS;
  const isLiveSos = isLiveSosTicket(contact);

  return (
    <ButtonBase
      css={(theme: Theme) => classes.item(theme, isSelected, isLiveSos, !!contact.unreadByAdmin)}
      onClick={() => onSelect(contact.id)}
    >
      <Box css={classes.head}>
        <Avatar css={classes.avatar}>{getTicketRequesterInitials(contact)}</Avatar>
        <Typography
          noWrap
          sx={{ fontWeight: contact.unreadByAdmin ? 600 : 500, minWidth: 0 }}
          variant="body1"
        >
          {getTicketRequesterName(contact)}
        </Typography>
        <Tooltip title={t(TICKET_SOURCE_LABEL_KEYS[source].hint)}>
          <Box css={(theme: Theme) => classes.sourceIcon(theme, source)}>
            <TicketSourceIcon size={INBOX_SOURCE_ICON_SIZE} source={source} />
          </Box>
        </Tooltip>
        {/* an SOS says what kind of urgent it is, in place of the dot every urgent ticket shares */}
        {isSos
          ? <sos.Badge isClosed={contact.status === TicketStatusEnum.CLOSED} />
          : <Box css={(theme: Theme) => classes.dot(theme, contact.priority)} />}
        <Typography
          sx={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontSize: FONT_SIZE_META }}
          variant="caption"
        >
          {fromNow(contact.lastMessageAt ?? contact.createdAt)}
        </Typography>
      </Box>
      {/* what the request is about, above what it says — the first thing an agent sorts the queue by */}
      {!!contact.subject && (
        <Typography noWrap sx={{ fontWeight: 600, fontSize: FONT_SIZE_META, maxWidth: '100%' }} variant="caption">
          {getTicketSubjectLabel(contact, t)}
        </Typography>
      )}
      <Typography css={classes.excerpt} variant="body2">
        {contact.message}
      </Typography>
      <TicketStatusChip status={contact.status} />
    </ButtonBase>
  );
};

export default ContactInboxItem;
