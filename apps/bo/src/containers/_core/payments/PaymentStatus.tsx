import Chip from '@mui/material/Chip';
import { PaymentStatusEnum } from '@shared/types';


import { PaymentStatus } from '@/types/_core/payment.type';
import { getPaymentStatusLabel } from '@/utils/_core/payment.utils';

const getChipColorByStatus = (status: PaymentStatus): 'error' | 'success' | 'warning' | 'info' => {
  switch (status) {
    case PaymentStatusEnum.SUCCESS:
      return 'success';
    case PaymentStatusEnum.FAILED:
      return 'error';
    case PaymentStatusEnum.PENDING:
      return 'warning';
    default:
      return 'warning';
  }
};

type Props = {
  status: PaymentStatus;
};
const PaymentStatusChip = ({ status }: Props) => {
  return (
    <Chip
      color={getChipColorByStatus(status)}
      label={getPaymentStatusLabel(status)}
    />
  );
};

export default PaymentStatusChip;
