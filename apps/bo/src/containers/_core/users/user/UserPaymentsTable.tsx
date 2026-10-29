import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SectionFooter from '@/components/SectionFooter';
import CompactTable, { CompactTableColumn } from '@/components/table/CompactTable';
import PaymentAmountCell from '@/containers/_core/payments/PaymentAmountCell';
import PaymentReferenceCell from '@/containers/_core/payments/PaymentReferenceCell';
import PaymentStatusChip from '@/containers/_core/payments/PaymentStatus';
import PaymentTypeChip from '@/containers/_core/payments/PaymentTypeChip';
import { IPayment } from '@/types/_core/payment.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getPaymentServiceLabel } from '@/utils/_core/payment.utils';

type Props = {
  payments: IPayment[];
  // how many movements of money the account has in all — the block only shows the latest
  count: number;
  onOpen: (payment: IPayment) => void;
  onViewAll: () => void;
};

/**
 * The latest movements of money the member stood on either side of — what they paid for a seat,
 * what they were paid for a ride. A row opens the payment, where it can be retried or refunded.
 */
const UserPaymentsTable = ({
  payments, count, onOpen, onViewAll,
}: Props) => {
  const { t } = useTranslation(['user']);

  const columns: CompactTableColumn<IPayment>[] = [
    {
      id: 'reference',
      label: t('user:detail.payments.reference'),
      render: (payment) => <PaymentReferenceCell payment={payment} />,
    },
    {
      id: 'date',
      label: t('user:detail.payments.date'),
      nowrap: true,
      render: (payment) => displayDate(payment.createdAt, false),
    },
    {
      id: 'type',
      label: t('user:detail.payments.type'),
      render: (payment) => <PaymentTypeChip type={payment.type} />,
    },
    {
      id: 'method',
      label: t('user:detail.payments.method'),
      render: (payment) => getPaymentServiceLabel(payment.service) || '—',
    },
    {
      id: 'status',
      label: t('user:detail.payments.status'),
      render: (payment) => <PaymentStatusChip status={payment.status} />,
    },
    {
      id: 'amount',
      label: t('user:detail.payments.amount'),
      align: 'right',
      nowrap: true,
      render: (payment) => <PaymentAmountCell payment={payment} />,
    },
  ];

  return (
    <Stack>
      <CompactTable
        columns={columns}
        emptyTitle={t('user:detail.payments.empty')}
        onRowClick={onOpen}
        rows={payments}
      />
      {count > payments.length && (
        <SectionFooter actionLabel={t('user:detail.viewAll')} onAction={onViewAll} />
      )}
    </Stack>
  );
};

export default UserPaymentsTable;
