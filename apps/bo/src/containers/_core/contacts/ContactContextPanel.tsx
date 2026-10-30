import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import type { SelectChangeEvent } from '@mui/material/Select';
import type { Theme } from '@mui/material/styles';

import {
  INBOX_CONTEXT_CARD_PADDING, INBOX_CONTEXT_GAP, INBOX_CONTEXT_ROW_GAP, INBOX_CONTEXT_ROW_PADDING_Y,
  INBOX_CONTEXT_TITLE_GAP,
} from '@/constants/_core/ui/inbox.constants';
import {
  RESPONSIVE_BREAKPOINT, SKELETON_ENTRY_COUNT, SKELETON_ENTRY_HEIGHT,
} from '@/constants/_core/ui/ui.constants';
import ContactDetailsCard from '@/containers/_core/contacts/ContactDetailsCard';
import ContactObjectsCard from '@/containers/_core/contacts/ContactObjectsCard';
import ContactReportCard from '@/containers/_core/contacts/ContactReportCard';
import TicketPrioritySelect from '@/containers/_core/tickets/TicketPrioritySelect';
import TicketStatusChip from '@/containers/_core/tickets/TicketStatusChip';
import TicketStatusSelect from '@/containers/_core/tickets/TicketStatusSelect';
import { IContact, ITicketContext } from '@/types/_core/contact.type';
import { TicketPriority, TicketStatus } from '@/types/_core/ticket-message.type';
import { IUser } from '@/types/_core/user.type';
import { getContactSosExtension } from '@/utils/_core/contact.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

/** what an unassigned ticket is worth as a select value — a pointer that is not set has no id */
const UNASSIGNED_VALUE = '';

const classes = {
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${INBOX_CONTEXT_GAP}px`,
    // the column scrolls on its own so a long history never stretches the two panels beside it
    height: '100%',
    overflowY: 'auto' as const,
  },
  card: { padding: `${INBOX_CONTEXT_CARD_PADDING}px` },
  title: { display: 'block', marginBottom: `${INBOX_CONTEXT_TITLE_GAP}px` },
  // a past ticket is a row closed by a rule above it, the status lining up down the trailing edge
  row: (theme: Theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: `${INBOX_CONTEXT_ROW_GAP}px`,
    padding: `${INBOX_CONTEXT_ROW_PADDING_Y}px 0`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  // under the breakpoint the SOS is pinned over the thread instead, where it is seen first
  sos: (theme: Theme) => ({
    [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { display: 'none' },
  }),
  handlingFields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${INBOX_CONTEXT_ROW_GAP}px`,
  },
};

type Props = {
  contact: IContact;
  context: ITicketContext | null;
  agents: IUser[];
  loading: boolean;
  canUpdate: boolean;
  onAssign: (agentId: string | null) => void;
  onChangeStatus: (status: TicketStatus) => void;
  onChangePriority: (priority: TicketPriority) => void;
  onSelectTicket: (id: string) => void;
};

/**
 * What stands beside the thread: the SOS that opened the ticket, if one did, the facts of the
 * ticket, the report it comes from if it came from one, what this person has already asked, and how
 * the ticket is being handled. The history is what tells an agent whether they are reading a first complaint or the
 * fourth chapter of one, which is the difference between answering and escalating. Who the person
 * is on the platform opens from their name in the thread header instead.
 */
const ContactContextPanel = ({
  contact, context, agents, loading, canUpdate, onAssign, onChangeStatus, onChangePriority,
  onSelectTicket,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const sos = getContactSosExtension();

  const handleAssign = (event: SelectChangeEvent) => {
    const value = event.target.value;

    onAssign(value === UNASSIGNED_VALUE ? null : value);
  };

  return (
    <Box css={classes.column}>
      {/* first in the column: an SOS is read before anything else the ticket says */}
      {!loading && sos && context?.sosAlert && (
        <Box css={classes.sos}>
          <sos.Card sosAlert={context.sosAlert} />
        </Box>
      )}

      {/* what the ticket is comes first, then the ride it points at, then what was asked before */}
      <ContactDetailsCard contact={contact} />
      <ContactObjectsCard contact={contact} />
      {!loading && context?.report && <ContactReportCard report={context.report} />}

      <Card css={classes.card}>
        <Typography css={classes.title} variant="overline">
          {t('user:contacts.previousTickets')}
        </Typography>
        {loading && Array.from({ length: SKELETON_ENTRY_COUNT }).map((_, index: number) => (
          <Skeleton
            height={SKELETON_ENTRY_HEIGHT}
            key={index}
            sx={{ mb: 1 }}
            variant="rounded"
          />
        ))}
        {!loading && !context?.previousTickets.length && (
          <Typography variant="body2">{t('user:contacts.noPreviousTicket')}</Typography>
        )}
        {!loading && context?.previousTickets.map((previousTicket: IContact) => (
          <Box css={classes.row} key={previousTicket.id}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {/* the past ticket opens in place: it is the same queue, read at another date */}
              <Typography
                noWrap
                onClick={() => onSelectTicket(previousTicket.id)}
                sx={{ cursor: 'pointer' }}
                variant="body2"
              >
                {previousTicket.message}
              </Typography>
              <Typography variant="caption">
                {displayDate(previousTicket.lastMessageAt ?? previousTicket.createdAt)}
              </Typography>
            </Box>
            <TicketStatusChip status={previousTicket.status} />
          </Box>
        ))}
      </Card>

      {/*
        how the ticket is being handled rather than what it says: where it stands, how urgent it is
        and who owes the answer are three settings of the same decision, so they share one card
      */}
      <Card css={classes.card}>
        <Typography css={classes.title} variant="overline">
          {t('user:contacts.handling')}
        </Typography>
        <Box css={classes.handlingFields}>
          <TicketStatusSelect
            fullWidth
            disabled={!canUpdate}
            onChange={onChangeStatus}
            status={contact.status}
          />
          <TicketPrioritySelect
            fullWidth
            disabled={!canUpdate}
            onChange={onChangePriority}
            priority={contact.priority}
          />
          <Select
            displayEmpty
            fullWidth
            disabled={!canUpdate}
            onChange={handleAssign}
            size="small"
            value={contact.assignedTo?.objectId ?? UNASSIGNED_VALUE}
          >
            <MenuItem value={UNASSIGNED_VALUE}>{t('user:contacts.unassigned')}</MenuItem>
            {agents.map((agent: IUser) => (
              <MenuItem key={agent.objectId} value={agent.objectId}>
                {getUserFullName(agent)}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Card>
    </Box>
  );
};

export default ContactContextPanel;
