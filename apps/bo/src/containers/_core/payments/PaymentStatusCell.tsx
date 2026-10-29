import StatusDot from '@/components/StatusDot';
import { PaymentStatus } from '@/types/_core/payment.type';
import { getPaymentStatusColor, getPaymentStatusLabel } from '@/utils/_core/payment.utils';

type Props = {
  status: PaymentStatus;
};

/**
 * The state of one payment, as a tinted dot rather than a chip: the ledger shows twenty rows at a
 * time, and a column of filled pills turns into a wall of color that the row's own amount and
 * reference then have to compete with.
 */
const PaymentStatusCell = ({ status }: Props) => (
  <StatusDot color={getPaymentStatusColor(status)} label={getPaymentStatusLabel(status)} />
);

export default PaymentStatusCell;
