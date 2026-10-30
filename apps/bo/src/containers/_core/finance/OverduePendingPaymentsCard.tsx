import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { PENDING_PAYMENT_TIMEOUT_MINUTES } from '@shared/domain-constants';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiClock } from 'react-icons/fi';

import { DASHBOARD_CARD_ICON_SIZE } from '@/constants/_core/ui/chart.constants';
import {
  FINANCE_QUEUE_ROW_SIDE_GAP, FINANCE_QUEUE_ROW_TITLE_GAP,
} from '@/constants/_core/ui.constants';
import DashboardListCard, { DashboardAlertRow } from '@/containers/_core/dashboard/DashboardListCard';
import PaymentTypeChip from '@/containers/_core/payments/PaymentTypeChip';
import { IOverduePendingPayment } from '@/types/_core/finance.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getOverduePaymentParties } from '@/utils/_core/finance.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const classes = {
  title: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${FINANCE_QUEUE_ROW_TITLE_GAP}px`,
  },
  side: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: `${FINANCE_QUEUE_ROW_SIDE_GAP}px`,
    flexShrink: 0,
  },
  amount: {
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
};

type Props = {
  payments: IOverduePendingPayment[];
  // the real count of the backlog: the rows are only the latest page of it
  count: number;
  // payments the operator was already asked about again during this visit
  recheckedIds: string[];
  // an answer is being waited for — no second question while it is
  loading?: boolean;
  onRecheck: (paymentId: string) => void;
};

/**
 * The payments stuck with the mobile money operator past its own timeout, each with the means to
 * ask the operator about it again without waiting for the next scheduled check. A payment asked
 * about stays listed, marked as such, until the operator's answer settles it and a new read drops
 * it from the list.
 */
const OverduePendingPaymentsCard = ({
  payments, count, recheckedIds, loading = false, onRecheck,
}: Props) => {
  const { t } = useTranslation(['finance']);

  return (
    <DashboardListCard
      count={count}
      emptyDescription={t('finance:noOverduePayments')}
      icon={<FiClock size={DASHBOARD_CARD_ICON_SIZE} />}
      isEmpty={payments.length === 0}
      subtitle={t('finance:pendingOverdueDescription', { minutes: PENDING_PAYMENT_TIMEOUT_MINUTES })}
      title={t('finance:overduePaymentsList')}
      tone="error"
      variant="alert"
    >
      {payments.map((payment) => {
        const { payer, receiver } = getOverduePaymentParties(payment, t);
        const isRechecked = recheckedIds.includes(payment.objectId);

        return (
          <DashboardAlertRow
            key={payment.objectId}
            meta={`→ ${receiver} · ${displayDate(payment.createdAt)}`}
            title={(
              <span css={classes.title}>
                {payer}
                <PaymentTypeChip type={payment.type} />
              </span>
            )}
          >
            <div css={classes.side}>
              <Typography css={classes.amount} variant="body1">
                {formatPriceWithCurrency(payment.amount, payment.currency)}
              </Typography>
              <Button
                aria-label={`${t('finance:recheck.action')} — ${payer}`}
                disabled={isRechecked || loading}
                onClick={() => onRecheck(payment.objectId)}
                size="small"
                startIcon={isRechecked ? <FiCheck size={DASHBOARD_CARD_ICON_SIZE} /> : undefined}
                variant="outlined"
              >
                {isRechecked ? t('finance:recheck.done') : t('finance:recheck.action')}
              </Button>
            </div>
          </DashboardAlertRow>
        );
      })}
    </DashboardListCard>
  );
};

export default OverduePendingPaymentsCard;
