import { Box, Skeleton } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyData from '@/components/EmptyData';
import SectionLoadError from '@/components/SectionLoadError';
import {
  USER_TICKET_THREAD_GAP, USER_TICKET_THREAD_PADDING_X, USER_TICKET_THREAD_PADDING_Y,
} from '@/constants/_core/ui/entity.constants';
import { SKELETON_SECTION_HEIGHT } from '@/constants/_core/ui/ui.constants';
import TicketMessageThread from '@/containers/_core/tickets/TicketMessageThread';
import { useUserBlock } from '@/hooks/_core/useUserBlock';
import { fetchTicketThread } from '@/services/_core/userBlock.service';
import { ITicketMessage } from '@/types/_core/ticket-message.type';

type Props = {
  ticketId: string;
  // the member the page is about — the thread is kept with the rest of that member's blocks
  userId: string;
};

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: USER_TICKET_THREAD_GAP,
    padding: `${USER_TICKET_THREAD_PADDING_Y}px ${USER_TICKET_THREAD_PADDING_X}px`,
  },
};

/**
 * One ticket's thread, read the first time its row is unfolded: the member's messages, the support
 * answers, the internal notes and the events the platform wrote into it — what support needs to
 * pick the conversation up without leaving the member's record.
 */
const UserTicketThread = ({ ticketId, userId }: Props) => {
  const { t } = useTranslation(['user']);
  // stable per ticket, so the thread is read once when unfolded and not again on every render
  const fetch = useCallback(() => fetchTicketThread(ticketId), [ticketId]);
  const thread = useUserBlock<ITicketMessage>(`ticketThread:${ticketId}`, userId, fetch);

  const renderThread = () => {
    if (thread.status === 'loading') return <Skeleton height={SKELETON_SECTION_HEIGHT} variant="rounded" />;
    if (thread.status === 'error') return <SectionLoadError onRetry={thread.retry} />;
    if (thread.items.length === 0) return <EmptyData title={t('user:detail.tickets.threadEmpty')} />;

    return <TicketMessageThread messages={thread.items} />;
  };

  return <Box css={classes.root}>{renderThread()}</Box>;
};

export default UserTicketThread;
