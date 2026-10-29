import Typography from '@mui/material/Typography';
import { PaymentStatusEnum } from '@shared/types';

import { IPayment } from '@/types/_core/payment.type';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

type Props = {
  payment: IPayment;
};

/**
 * What the movement is worth. A failed payment states its amount in the error tone: the column is
 * scanned for the figures that did not go through, and a failure of 500 Ar and one of 500 000 Ar
 * are the same word in the status column and two different mornings here.
 */
const PaymentAmountCell = ({ payment }: Props) => (
  <Typography
    noWrap
    variant="subtitle1"
    sx={{
      color: payment.status === PaymentStatusEnum.FAILED
        ? 'error.main'
        : 'text.primary',
    }}
  >
    {formatPriceWithCurrency(payment.amount, payment.currency)}
  </Typography>
);

export default PaymentAmountCell;
