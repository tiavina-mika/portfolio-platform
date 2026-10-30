import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SectionFooter from '@/components/SectionFooter';
import CompactTable, { CompactTableColumn } from '@/components/table/CompactTable';
import TicketPriorityChip from '@/containers/_core/tickets/TicketPriorityChip';
import TicketStatusChip from '@/containers/_core/tickets/TicketStatusChip';
import { IContact } from '@/types/_core/contact.type';
import { displayDate } from '@/utils/_core/date.utils';
import { cutText } from '@/utils/_core/utils';

import UserTicketThread from './UserTicketThread';

// how much of the first message a row shows as its subject
const TICKET_SUBJECT_MAX_LENGTH = 80;

type Props = {
  tickets: IContact[];
  userId: string;
  onOpen: (ticket: IContact) => void;
};

/**
 * The member's latest support tickets. A row unfolds its thread in place — support usually opens a
 * member's record to see what was already said to them — and the latest ticket is unfolded from the
 * start, since it is the one the reader most likely came for.
 */
const UserTicketsTable = ({ tickets, userId, onOpen }: Props) => {
  const { t } = useTranslation(['user']);

  const columns: CompactTableColumn<IContact>[] = [
    {
      id: 'message',
      label: t('user:detail.tickets.message'),
      render: (ticket) => (
        <Stack>
          <span>{cutText(ticket.message, TICKET_SUBJECT_MAX_LENGTH)}</span>
          <Typography color="textSecondary" variant="caption">
            {[
              ticket.reference && t('user:detail.tickets.reference', { reference: ticket.reference }),
              displayDate(ticket.createdAt, false),
            ].filter(Boolean).join(' · ')}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'status',
      label: t('user:detail.tickets.status'),
      render: (ticket) => <TicketStatusChip status={ticket.status} />,
    },
    {
      id: 'priority',
      label: t('user:detail.tickets.priority'),
      render: (ticket) => <TicketPriorityChip priority={ticket.priority} />,
    },
    {
      id: 'lastActivity',
      label: t('user:detail.tickets.lastActivity'),
      nowrap: true,
      render: (ticket) => displayDate(ticket.lastMessageAt ?? ticket.updatedAt),
    },
  ];

  return (
    <CompactTable
      columns={columns}
      defaultExpandedIds={tickets[0] ? [tickets[0].id] : []}
      emptyTitle={t('user:detail.tickets.empty')}
      rows={tickets}
      renderRowDetail={(ticket) => (
        <Stack>
          <UserTicketThread ticketId={ticket.id} userId={userId} />
          <SectionFooter actionLabel={t('user:detail.tickets.open')} onAction={() => onOpen(ticket)} />
        </Stack>
      )}
    />
  );
};

export default UserTicketsTable;
