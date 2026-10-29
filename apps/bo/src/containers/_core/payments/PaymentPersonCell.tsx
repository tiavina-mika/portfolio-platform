import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { IPayment } from '@/types/_core/payment.type';
import { getPaymentCounterparty, getPaymentServiceLabel } from '@/utils/_core/payment.utils';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    minWidth: 0,
  },
};

type Props = {
  payment: IPayment;
};

/**
 * Who the platform is dealing with on this row, and through which mobile money account. The two
 * belong together: the same person can pay through one operator and be paid back through another,
 * and it is the operator's account that a failure has to be taken up against.
 */
const PaymentPersonCell = ({ payment }: Props) => {
  const { t } = useTranslation(['user']);

  const counterparty = getPaymentCounterparty(payment);
  const phone = getFullPhoneNumber(counterparty.phone);
  const serviceLabel = getPaymentServiceLabel(payment.service);
  const account = [serviceLabel, phone].filter(Boolean).join(' · ');

  return (
    <Box css={classes.root}>
      <Typography noWrap variant="subtitle1">
        {getUserFullName(counterparty.user) || t('user:payments.merchantAccount')}
      </Typography>
      <Typography noWrap variant="body2">{account || '—'}</Typography>
    </Box>
  );
};

export default PaymentPersonCell;
