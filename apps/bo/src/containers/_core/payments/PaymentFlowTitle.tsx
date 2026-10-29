import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';

import { PAGE_HEAD_TITLE_GAP } from '@/constants/_core/ui/page.constants';
import PaymentStatusChip from '@/containers/_core/payments/PaymentStatus';
import { IPayment } from '@/types/_core/payment.type';
import { getPaymentFlow, getPaymentRefundState } from '@/utils/_core/payment.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const classes = {
  flow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${PAGE_HEAD_TITLE_GAP}px`,
    whiteSpace: 'nowrap' as const,
  },
  // the arrow and the separator are punctuation of the heading, not words of it
  punctuation: {
    fontWeight: 400,
    color: 'text.secondary',
  },
  amount: {
    whiteSpace: 'nowrap' as const,
    fontVariantNumeric: 'tabular-nums',
  },
};

type Props = {
  payment: IPayment;
};

/**
 * The heading of a payment: which way the money went, how much, and where it stands. The direction
 * comes first because it is what decides everything else an operator can do with the row — a
 * collection is refunded, a payout is retried.
 */
const PaymentFlowTitle = ({ payment }: Props) => {
  const { t } = useTranslation(['user']);

  const { from, to } = getPaymentFlow(payment);
  const refundState = getPaymentRefundState(payment);

  return (
    <>
      <Box component="span" css={classes.flow}>
        {from}
        <Box component="span" sx={classes.punctuation}>→</Box>
        {to}
      </Box>
      <Box aria-hidden component="span" sx={classes.punctuation}>·</Box>
      <Box component="span" css={classes.amount}>{formatPriceWithCurrency(payment.amount, payment.currency)}</Box>
      <PaymentStatusChip status={payment.status} />
      {refundState && (
        <Chip
          color="info"
          label={refundState === 'partial'
            ? t('user:payments.refundedPartially')
            : t('user:payments.refundedFully')}
        />
      )}
    </>
  );
};

export default PaymentFlowTitle;
