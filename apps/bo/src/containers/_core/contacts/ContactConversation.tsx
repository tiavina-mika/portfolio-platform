import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Popover from '@mui/material/Popover';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import ActionsMenu from '@/components/ActionsMenu';
import EmptyData from '@/components/EmptyData';
import {
  INBOX_AVATAR_FONT_SIZE, INBOX_AVATAR_SIZE, INBOX_ITEM_HEAD_GAP, INBOX_REQUESTER_POPOVER_OFFSET_Y,
  INBOX_REQUESTER_POPOVER_WIDTH, INBOX_REQUESTER_TRIGGER_PADDING_X,
  INBOX_REQUESTER_TRIGGER_PADDING_Y, INBOX_REQUESTER_TRIGGER_UNDERLINE_OFFSET,
  INBOX_REQUESTER_TRIGGER_UNDERLINE_OPACITY, INBOX_THREAD_GAP, INBOX_THREAD_PADDING_X,
  INBOX_THREAD_PADDING_Y,
} from '@/constants/_core/ui/inbox.constants';
import { PAGE_HEAD_ACTION_ICON_SIZE } from '@/constants/_core/ui/page.constants';
import {
  RADIUS_SM, RESPONSIVE_BREAKPOINT, SKELETON_ENTRY_COUNT, SKELETON_ENTRY_HEIGHT,
} from '@/constants/_core/ui/ui.constants';
import ContactComposer from '@/containers/_core/contacts/ContactComposer';
import ContactRequesterCard from '@/containers/_core/contacts/ContactRequesterCard';
import TicketMessageThread from '@/containers/_core/tickets/TicketMessageThread';
import TicketPriorityChip from '@/containers/_core/tickets/TicketPriorityChip';
import TicketSourceChip from '@/containers/_core/tickets/TicketSourceChip';
import TicketStatusChip from '@/containers/_core/tickets/TicketStatusChip';
import { IContact, ITicketRequesterContext, ITicketSosContext } from '@/types/_core/contact.type';
import { ITicketMessage, TicketSourceEnum, TicketStatusEnum } from '@/types/_core/ticket-message.type';
import { getContactSosExtension } from '@/utils/_core/contact.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';
import {
  getTicketReplyChannel, getTicketRequesterInitials, getTicketRequesterName, getTicketSubjectLabel,
  isOneWayTicket,
} from '@/utils/_core/ticket.utils';

const classes = {
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    overflow: 'hidden',
  },
  head: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${INBOX_ITEM_HEAD_GAP}px`,
    padding: `${INBOX_THREAD_PADDING_X}px`,
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  /*
   * the header carries four facts about one ticket — who, how urgent, where it stands, where it
   * came from. They wrap onto a second line rather than shrinking: a truncated status is worse
   * than a taller header
   */
  identity: {
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_ITEM_HEAD_GAP}px ${INBOX_ITEM_HEAD_GAP + 2}px`,
    minWidth: 0,
    flexWrap: 'wrap' as const,
  },
  /*
   * the name is the way into what is known about the requester, so it is a button — pulled back
   * by its own padding so it lines up with the header edge as plain text would, and marked only
   * by a light rule under the name rather than by a border that would weigh as much as the chips
   */
  requester: (theme: Theme, isOpen: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: `${INBOX_ITEM_HEAD_GAP}px`,
    minWidth: 0,
    margin: `-${INBOX_REQUESTER_TRIGGER_PADDING_Y}px -${INBOX_REQUESTER_TRIGGER_PADDING_X}px`,
    padding: `${INBOX_REQUESTER_TRIGGER_PADDING_Y}px ${INBOX_REQUESTER_TRIGGER_PADDING_X}px`,
    borderRadius: RADIUS_SM,
    textAlign: 'left' as const,
    backgroundColor: isOpen ? getTintedBackground(theme, theme.palette.primary.main) : 'transparent',
    '&:hover, &.Mui-focusVisible': {
      backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
    },
  }),
  requesterName: (theme: Theme) => ({
    whiteSpace: 'nowrap' as const,
    textDecoration: 'underline',
    textDecorationColor: alpha(theme.palette.primary.main, INBOX_REQUESTER_TRIGGER_UNDERLINE_OPACITY),
    textUnderlineOffset: INBOX_REQUESTER_TRIGGER_UNDERLINE_OFFSET,
  }),
  popover: {
    width: INBOX_REQUESTER_POPOVER_WIDTH,
    maxWidth: 'calc(100vw - 32px)',
    marginTop: `${INBOX_REQUESTER_POPOVER_OFFSET_Y}px`,
  },
  avatar: (theme: Theme) => ({
    width: INBOX_AVATAR_SIZE,
    height: INBOX_AVATAR_SIZE,
    fontSize: INBOX_AVATAR_FONT_SIZE,
    fontWeight: theme.typography.fontWeightMedium,
    backgroundColor: theme.palette.primary.main,
  }),
  /*
   * the thread stands on the recessed ground so the bubbles inside it read as raised, and it is
   * the only band of the card that scrolls — the header above and the composer below stay put
   */
  thread: (theme: Theme) => ({
    flex: 1,
    overflowY: 'auto' as const,
    padding: `${INBOX_THREAD_PADDING_Y}px ${INBOX_THREAD_PADDING_X}px`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
  }),
  /*
   * the SOS band only exists where the context column has dropped below the thread: beside it, the
   * SOS card at the head of that column already says everything the band would
   */
  sosBar: (theme: Theme) => ({
    [theme.breakpoints.up(RESPONSIVE_BREAKPOINT)]: { display: 'none' },
  }),
  composer: (theme: Theme) => ({
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
};

type Props = {
  contact: IContact | null;
  // what the platform knows about the ticket author — null when the ticket carries no account
  requester: ITicketRequesterContext | null;
  // the SOS that opened the ticket — null on every other one
  sosAlert: ITicketSosContext | null;
  isRequesterLoading: boolean;
  messages: ITicketMessage[];
  loading: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canDestroy: boolean;
  onResolve: () => void;
  onSendMessage: (message: string, isInternal: boolean, files: File[]) => void;
  onDelete: () => void;
  onDestroy: () => void;
};

/**
 * The ticket being worked on: who it is from and where it stands, everything said on it, and the
 * field the answer is written in. Resolving is the one action that lives up here rather than in
 * the panel beside it — it is what closes the conversation the agent is reading, not a property
 * of the requester. What is known about the requester opens from their name, over the thread,
 * rather than taking a card of the column beside it.
 */
const ContactConversation = ({
  contact, requester, sosAlert, isRequesterLoading, messages, loading, canUpdate, canDelete, canDestroy,
  onResolve, onSendMessage, onDelete, onDestroy,
}: Props) => {
  const sos = getContactSosExtension();
  const { t } = useTranslation(['common', 'user']);
  const requesterRef = useRef<HTMLButtonElement>(null);
  const [isRequesterOpen, setIsRequesterOpen] = useState(false);

  if (!contact) {
    return (
      <Card css={classes.card}>
        <EmptyData
          description={t('user:contacts.selectTicketDescription')}
          sx={{ margin: 'auto' }}
          title={t('user:contacts.selectTicket')}
        />
      </Card>
    );
  }

  const isClosed = contact.status === TicketStatusEnum.RESOLVED ||
    contact.status === TicketStatusEnum.CLOSED;
  const isDeleted = !!contact.deleted;

  return (
    <Card css={classes.card}>
      <Box css={classes.head}>
        <Box css={classes.identity}>
          <ButtonBase
            aria-expanded={isRequesterOpen}
            aria-haspopup="dialog"
            css={(theme: Theme) => classes.requester(theme, isRequesterOpen)}
            onClick={() => setIsRequesterOpen(!isRequesterOpen)}
            ref={requesterRef}
          >
            <Avatar css={classes.avatar}>{getTicketRequesterInitials(contact)}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography css={classes.requesterName} variant="h5">
                {getTicketRequesterName(contact)}
              </Typography>
              {/*
                * the number first: it is what the requester quotes, so it is what is looked for
                * here — then what the request is about, then the address (an account created by
                * phone has none)
                */}
              <Typography noWrap component="div" variant="caption">
                {[
                  contact.reference ? t('user:contacts.referenceLabel', { reference: contact.reference }) : '',
                  getTicketSubjectLabel(contact, t),
                  contact.email ?? contact.phone,
                ].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
          </ButtonBase>
          {/* an SOS is always urgent: its badge says so and more, in place of the priority */}
          {sos && contact.source === TicketSourceEnum.SOS
            ? <sos.Badge isClosed={contact.status === TicketStatusEnum.CLOSED} variant="chip" />
            : <TicketPriorityChip priority={contact.priority} />}
          <TicketStatusChip status={contact.status} />
          <TicketSourceChip contact={contact} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {canUpdate && !isClosed && (
            <Button
              onClick={onResolve}
              size="small"
              startIcon={<FiCheck size={PAGE_HEAD_ACTION_ICON_SIZE} />}
              variant="outlined"
            >
              {t('user:contacts.resolve')}
            </Button>
          )}
          {/*
            what is done to the ticket rather than said in it — binning it, or destroying one
            already in the bin — folds into the overflow menu so it never competes with the action
            that closes the conversation
          */}
          {(canDelete || canDestroy) && (
            <ActionsMenu
              label={contact.email ?? contact.phone ?? ''}
              onDelete={canDelete && !isDeleted ? onDelete : undefined}
              onDestroy={canDestroy && isDeleted ? onDestroy : undefined}
              type="icon"
            />
          )}
        </Box>
      </Box>
      <Popover
        anchorEl={requesterRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={() => setIsRequesterOpen(false)}
        open={isRequesterOpen}
        slotProps={{ paper: { sx: classes.popover } }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <ContactRequesterCard
          contact={contact}
          loading={isRequesterLoading}
          onClose={() => setIsRequesterOpen(false)}
          requester={requester}
        />
      </Popover>
      {sos && sosAlert && (
        <Box css={classes.sosBar}>
          <sos.Bar sosAlert={sosAlert} />
        </Box>
      )}
      <Box css={classes.thread}>
        {loading
          ? (
            <Stack spacing={`${INBOX_THREAD_GAP}px`}>
              {Array.from({ length: SKELETON_ENTRY_COUNT }).map((_, index: number) => (
                <Skeleton height={SKELETON_ENTRY_HEIGHT} key={index} variant="rounded" />
              ))}
            </Stack>
          )
          : <TicketMessageThread messages={messages} />}
      </Box>
      {canUpdate && (
        <Box css={classes.composer}>
          <ContactComposer
            disabled={loading}
            isOneWay={isOneWayTicket(contact)}
            onSubmit={onSendMessage}
            replyChannel={getTicketReplyChannel(contact)}
          />
        </Box>
      )}
    </Card>
  );
};

export default ContactConversation;
