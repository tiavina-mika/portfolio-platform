import Chip from '@mui/material/Chip';
import { PaymentTypeEnum } from '@shared/types';


import { PaymentType } from '@/types/_core/payment.type';
import { getPaymentTypeLabel } from '@/utils/_core/payment.utils';

const getChipColorByStatus = (status: PaymentType): 'error' | 'success' | 'warning' | 'info' | 'secondary' => {
  switch (status) {
    case PaymentTypeEnum.PASSENGER_TO_APP:
      return 'info';
    case PaymentTypeEnum.APP_TO_DRIVER:
      return 'success';
    case PaymentTypeEnum.DRIVER_TO_APP:
      return 'warning';
    case PaymentTypeEnum.APP_TO_PASSENGER:
    default:
      return 'secondary';
  }
};

type Props = {
  type: PaymentType;
};
const PaymentTypeChip = ({ type }: Props) => {
  return (
    <Chip
      color={getChipColorByStatus(type)}
      label={getPaymentTypeLabel(type)}
    />
  );
};

export default PaymentTypeChip;
