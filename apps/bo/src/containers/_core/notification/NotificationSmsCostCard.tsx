import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import CompactTable, { CompactTableColumn } from '@/components/table/CompactTable';
import { NOTIFICATION_SMS_DAYS_LIST_MAX_HEIGHT } from '@/constants/_core/ui/inbox.constants';
import { CARD_STAT_SKELETON_VALUE_HEIGHT } from '@/constants/_core/ui/page.constants';
import { NotificationSmsDailyCount } from '@/types/_core/notification.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getNotificationSmsTotals } from '@/utils/_core/notification.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

type Props = {
  // the days that had at least one SMS, newest first
  counts: NotificationSmsDailyCount[];
  loading: boolean;
  // how far back the counts reach, as the title states it
  days: number;
};

type DayRow = NotificationSmsDailyCount & { id: string };

const TOTALS_PLACEHOLDERS = [0, 1, 2, 3];

// four figures in a row on a wide screen, two by two under it
const totalsGridSx = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
};

type FigureProps = {
  label: string;
  value: string;
  // a refusal is drawn in the error tone only when there is one — a red zero would cry wolf
  isAlert?: boolean;
};

const Figure = ({ label, value, isAlert }: FigureProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    <Typography component="p" variant="caption">{label}</Typography>
    <Typography component="p" sx={{ color: isAlert ? 'error.main' : 'text.primary' }} variant="h3">
      {value}
    </Typography>
  </Box>
);

/**
 * What the fallback SMS cost over the last month, and day by day how many went out, how many the
 * provider refused and how many were held back by the daily allowance. It is the measure the list of
 * events that may be texted is judged on before it is widened — every accepted SMS is paid for.
 *
 * Read-only: the figures come from the SMS channel of the notifications, so a day with no SMS has no
 * row rather than a row of zeros.
 */
const NotificationSmsCostCard = ({ counts, loading, days }: Props) => {
  const { t } = useTranslation(['user']);
  const totals = getNotificationSmsTotals(counts);

  const rows: DayRow[] = counts.map((day) => ({ ...day, id: day.date }));

  const columns: CompactTableColumn<DayRow>[] = [
    {
      id: 'date',
      label: t('user:notifications.smsCost.date'),
      nowrap: true,
      render: (row) => displayDate(row.date, false),
    },
    {
      id: 'sent',
      label: t('user:notifications.smsCost.sent'),
      align: 'right',
      render: (row) => row.sentCount,
    },
    {
      id: 'rateLimited',
      label: t('user:notifications.smsCost.rateLimited'),
      align: 'right',
      render: (row) => row.rateLimitedCount,
    },
    {
      id: 'failed',
      label: t('user:notifications.smsCost.failed'),
      align: 'right',
      render: (row) => row.failedCount,
    },
    {
      id: 'cost',
      label: t('user:notifications.smsCost.cost'),
      align: 'right',
      nowrap: true,
      render: (row) => formatPriceWithCurrency(row.estimatedCostAr),
    },
  ];

  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography component="h2" variant="h6">
            {t('user:notifications.smsCost.title', { days })}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }} variant="body2">
            {t('user:notifications.smsCost.description')}
          </Typography>
        </Box>

        {loading
          ? (
            <Box sx={totalsGridSx}>
              {TOTALS_PLACEHOLDERS.map((index) => (
                <Skeleton height={CARD_STAT_SKELETON_VALUE_HEIGHT} key={index} variant="rounded" />
              ))}
            </Box>
          )
          : (
            <>
              {counts.length > 0 && (
                <Box sx={totalsGridSx}>
                  <Figure
                    label={t('user:notifications.smsCost.totalSent')}
                    value={totals.sentCount.toLocaleString()}
                  />
                  <Figure
                    label={t('user:notifications.smsCost.totalCost')}
                    value={formatPriceWithCurrency(totals.estimatedCostAr)}
                  />
                  <Figure
                    label={t('user:notifications.smsCost.totalRateLimited')}
                    value={totals.rateLimitedCount.toLocaleString()}
                  />
                  <Figure
                    isAlert={totals.failedCount > 0}
                    label={t('user:notifications.smsCost.totalFailed')}
                    value={totals.failedCount.toLocaleString()}
                  />
                </Box>
              )}
              <Box sx={{ maxHeight: NOTIFICATION_SMS_DAYS_LIST_MAX_HEIGHT, overflowY: 'auto' }}>
                <CompactTable<DayRow>
                  columns={columns}
                  emptyDescription={t('user:notifications.smsCost.emptyDescription')}
                  emptyTitle={t('user:notifications.smsCost.empty')}
                  rows={rows}
                />
              </Box>
            </>
          )}
      </CardContent>
    </Card>
  );
};

export default NotificationSmsCostCard;
