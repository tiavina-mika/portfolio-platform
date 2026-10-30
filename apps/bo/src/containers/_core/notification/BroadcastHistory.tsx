import {
  Box, Card, CardHeader, Chip, Skeleton, Typography, type Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
  BROADCAST_HISTORY_AUDIENCE_GAP, BROADCAST_HISTORY_ROW_GAP, BROADCAST_HISTORY_ROW_PADDING_X,
  BROADCAST_HISTORY_ROW_PADDING_Y, BROADCAST_HISTORY_SKELETON_META_WIDTH,
  BROADCAST_HISTORY_SKELETON_ROWS, BROADCAST_HISTORY_SKELETON_TITLE_WIDTH,
  BROADCAST_HISTORY_TEXT_GAP,
} from '@/constants/_core/ui/broadcast.constants';
import { BroadcastHistoryEntry, BroadcastSegmentEnum } from '@/types/_core/notification.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // the rules between the rows are drawn by the list, so the last row does not close on a second line
  rows: (theme: Theme) => ({
    '& > *:not(:last-child)': { borderBottom: `1px solid ${getDesignTokens(theme).borderLight}` },
  }),
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: `${BROADCAST_HISTORY_ROW_GAP}px ${BROADCAST_HISTORY_ROW_PADDING_X}px`,
    padding: `${BROADCAST_HISTORY_ROW_PADDING_Y}px ${BROADCAST_HISTORY_ROW_PADDING_X}px`,
  },
  text: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${BROADCAST_HISTORY_TEXT_GAP}px`,
    minWidth: 0,
  },
  audience: {
    display: 'flex',
    alignItems: 'center',
    flex: 'none',
    gap: `${BROADCAST_HISTORY_AUDIENCE_GAP}px`,
  },
};

type Props = {
  entries: BroadcastHistoryEntry[];
  /** true while the list is on its way — it holds its place instead of saying nothing was sent */
  loading?: boolean;
};

/**
 * The announcements already sent, newest first: what each one said, who sent it and when, and who
 * it went to. It is what answers "did we already tell them?" before a second one is written.
 */
const BroadcastHistory = ({ entries, loading = false }: Props) => {
  const { t, i18n } = useTranslation(['user']);

  const renderBody = () => {
    if (loading && !entries.length) {
      return Array.from({ length: BROADCAST_HISTORY_SKELETON_ROWS }, (_, index) => (
        <Box css={classes.row} key={index}>
          <Box css={classes.text}>
            <Skeleton height={20} width={BROADCAST_HISTORY_SKELETON_TITLE_WIDTH} />
            <Skeleton height={18} width={BROADCAST_HISTORY_SKELETON_META_WIDTH} />
          </Box>
        </Box>
      ));
    }

    if (!entries.length) {
      return (
        <Box css={classes.row}>
          <Typography color="text.secondary" variant="body2">
            {t('user:notifications.broadcast.noHistory')}
          </Typography>
        </Box>
      );
    }

    return entries.map((entry) => {
      const sentOn = displayDate(entry.sentAt, false, true, true);
      const isCity = entry.segment === BroadcastSegmentEnum.CITY && !!entry.city;

      return (
        <Box css={classes.row} key={entry.id}>
          <Box css={classes.text}>
            <Typography variant="subtitle2">
              {entry.title[i18n.language] || entry.title.fr}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {entry.sentBy
                ? `${t('user:notifications.broadcast.sentBy')} ${entry.sentBy} · ${sentOn}`
                : sentOn}
            </Typography>
          </Box>
          <Box css={classes.audience}>
            <Typography color="text.secondary" variant="caption">
              {isCity
                ? entry.city
                : t('user:notifications.broadcast.segments.all')}
            </Typography>
            <Chip
              label={t('user:notifications.broadcast.audienceCount', { count: entry.recipientCount })}
              size="small"
            />
          </Box>
        </Box>
      );
    });
  };

  return (
    <Card>
      <CardHeader title={t('user:notifications.broadcast.history')} />
      <Box css={classes.rows}>{renderBody()}</Box>
    </Card>
  );
};

export default BroadcastHistory;
