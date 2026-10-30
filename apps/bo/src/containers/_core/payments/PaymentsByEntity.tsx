import {
  Box, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import TableSkeletonRows from '@/components/table/TableSkeletonRows';
import PaymentStatusChip from '@/containers/_core/payments/PaymentStatus';
import PaymentTypeChip from '@/containers/_core/payments/PaymentTypeChip';
import { IPayment } from '@/types/_core/payment.type';
import { getPaymentReference } from '@/utils/_core/payment.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

type Props = {
  payments: IPayment[];
  // the payments are read after the page is drawn: placeholder rows hold the table's shape meanwhile
  loading?: boolean;
};

// reference, amount, type, status
const PAYMENTS_TABLE_COLUMN_COUNT = 4;

/**
 * Every movement of money one record generated, in the order they happened.
 *
 * The two parties are not columns here: the record the table stands on already names them, and
 * the direction — who paid whom — is what the type says. What is left is what an operator needs
 * to quote when chasing a payment with the gateway: the reference, the amount, and where it got to.
 */
const PaymentsByEntity = ({ payments = [], loading = false }: Props) => {
  const { t } = useTranslation(['common', 'user']);

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('user:payments.reference')}</TableCell>
            <TableCell align="right">{t('user:payments.amount')}</TableCell>
            <TableCell>{t('user:payments.type')}</TableCell>
            <TableCell>{t('common:status')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && <TableSkeletonRows columnCount={PAYMENTS_TABLE_COLUMN_COUNT} />}
          {!loading && payments.map((payment: IPayment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <Typography variant="body2">{getPaymentReference(payment)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1">
                  {formatPriceWithCurrency(payment.amount, payment.currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <PaymentTypeChip type={payment.type} />
              </TableCell>
              <TableCell>
                <PaymentStatusChip status={payment.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default PaymentsByEntity;
