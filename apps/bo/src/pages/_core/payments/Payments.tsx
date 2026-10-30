import Skeleton from '@mui/material/Skeleton';
import { useNavigate } from '@tanstack/react-router';
import {
  ReactNode, Suspense, useCallback, useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import ListScopeAlert from '@/components/ListScopeAlert';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { COLLECTIONS } from '@/constants/_core/app.constants';
import { paymentsTabOptions } from '@/constants/_core/payment.constants';
import { SKELETON_LINE_HEIGHT, SKELETON_PRIMARY_LINE_WIDTH } from '@/constants/_core/ui/ui.constants';
import ChargedPendingBookingsBand from '@/containers/_core/payments/ChargedPendingBookingsBand';
import PaymentAmountCell from '@/containers/_core/payments/PaymentAmountCell';
import PaymentPersonCell from '@/containers/_core/payments/PaymentPersonCell';
import PaymentReferenceCell from '@/containers/_core/payments/PaymentReferenceCell';
import PaymentRowDetail from '@/containers/_core/payments/PaymentRowDetail';
import PaymentServiceHealthBand from '@/containers/_core/payments/PaymentServiceHealthBand';
import PaymentStatusCell from '@/containers/_core/payments/PaymentStatusCell';
import PaymentTypeChip from '@/containers/_core/payments/PaymentTypeChip';
import SearchPayments from '@/containers/_core/payments/SearchPayments';
import { useProtect } from '@/hooks/_core/useProtect';
import { markAllAsSeen, toggleMultiMarkAsSeen } from '@/redux/actions/_core/app.action';
import {
  exportPayments,
  loadPayments,
} from '@/redux/actions/_core/payment.action';
import { goToPreview } from '@/redux/actions/_core/util.action';
import {
  getPaymentCountSelector, getPaymentLedgerSummarySelector, getPaymentPaymentsSelector,
  getPaymentTabCountsSelector, loadPaymentsSlice,
} from '@/redux/reducers/_core/payment.reducer';
import { paymentsRoute } from '@/routes/protected/_core/payment.routes';
import {
  ExportFormat, IQueriesInput, IRenderSearchProps, ITableHeadCell,
} from '@/types/_core/app.type';
import {
  IPayment,
} from '@/types/_core/payment.type';
import { isCurrentTab } from '@/utils/_core/app.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getPaymentListColumns } from '@/utils/_core/payment.utils';
import { getUserFullName } from '@/utils/_core/user.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';
import { PaymentsRouteSearchParams } from '@/validations/_core/payment.validations';

interface IData {
  reference: ReactNode;
  type: ReactNode;
  person: ReactNode;
  status: ReactNode;
  amount: ReactNode;
  // extra columns contributed by domains via `registerPaymentListColumn` (e.g. the trip)
  [key: string]: unknown;
}

/*
 * The columns answer, in order, the questions an operator asks of a movement of money: which one it
 * is and when it happened, which way it went, who it was with and through which operator, what it
 * settles, where it stands, and what it is worth. Everything else a decision needs — the failure
 * message, the two accounts, the booking behind it — is in the band the row opens onto: it is read
 * on one row at a time, and eight columns of it would be read on none.
 *
 * Payer and receiver are not columns: one of the two is always the platform's own merchant account,
 * so a column per side spends a third of the ledger's width repeating the same words down every row.
 */
const headCells: ITableHeadCell<string>[] = [
  {
    id: 'reference',
    label: i18n.t('user:payments.reference'),
    sortFields: [
      { id: 'createdAt', label: i18n.t('common:createdAt') },
      { id: 'paymentIntentId', label: i18n.t('user:payments.reference') },
    ],
  },
  {
    id: 'type',
    label: i18n.t('user:payments.type'),
  },
  {
    id: 'person',
    label: i18n.t('user:payments.person'),
    sortFields: [{ id: 'service', label: i18n.t('user:payments.operator') }],
  },
  ...getPaymentListColumns().map((column) => column.headCell),
  {
    id: 'status',
    label: i18n.t('common:status'),
  },
  {
    id: 'amount',
    label: i18n.t('user:payments.amount'),
    align: 'right',
  },
];

const collection = 'Payment';

const Payments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const payments = useSelector(getPaymentPaymentsSelector);

  const { t } = useTranslation(['user']);

  const searchParams: PaymentsRouteSearchParams = paymentsRoute.useSearch();

  const count = useSelector(getPaymentCountSelector);
  const tabCounts = useSelector(getPaymentTabCountsSelector);
  const ledgerSummary = useSelector(getPaymentLedgerSummarySelector);

  /*
   * `canEdit` (the `update` right) is what gates the actions that move money — sending a payment
   * again, giving one back — not `canDelete`. The two rights are granted apart, and a role allowed
   * to delete a row is not thereby allowed to pay a driver a second time; the server checks the
   * same right on both Cloud Functions.
   */
  const {
    canEdit,
    canDelete,
    canDestroy,
  } = useProtect(collection);

  // a row marked seen leaves this tab and stays on every other one
  const isUnseenTab = isCurrentTab(searchParams?.tab, 'news');

  const handleRowClick = useCallback((id: string) => {
    navigate(goToPreview('payments', id));
  }, [navigate]);

  // table data
  const dataTable = useMemo((): IData[] => {
    const paymentsData = payments.map((payment: IPayment) => {
      // default data
      const data: Record<string, any> = {
        id: payment.id, // required even if not displayed(props)
        unseen: !payment.seen,
        reference: <PaymentReferenceCell payment={payment} />,
        type: <PaymentTypeChip type={payment.type} />,
        person: <PaymentPersonCell payment={payment} />,
        ...Object.fromEntries(
          getPaymentListColumns().map((column) => {
            const { Component } = column;

            // registered cells are lazy: a line skeleton holds the cell while its chunk loads
            return [
              column.headCell.id,
              <Suspense
                fallback={<Skeleton height={SKELETON_LINE_HEIGHT} width={SKELETON_PRIMARY_LINE_WIDTH} />}
                key={column.headCell.id}
              >
                <Component payment={payment} />
              </Suspense>,
            ];
          })
        ),
        status: <PaymentStatusCell status={payment.status} />,
        amount: <PaymentAmountCell payment={payment} />,
      };

      return data as IData;
    });

    return paymentsData;
  }, [
    payments,
  ]);

  const handleSelectedAsSeen = (ids: string[], value: boolean) => {
    dispatch(toggleMultiMarkAsSeen<IPayment>({
      collection: COLLECTIONS.payment,
      items: payments,
      value,
      ids,
      isUnseenTab,
      callback: loadPaymentsSlice,
    }));
  };

  const handleMarkAllAsSeen = () => {
    dispatch(markAllAsSeen<IPayment>({
      collection: COLLECTIONS.payment,
      items: payments,
      isUnseenTab,
      callback: loadPaymentsSlice,
    }));
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadPayments(queries));
  };

  const handleExport = (format: ExportFormat, queries: IQueriesInput) => {
    dispatch(exportPayments(queries, format));
  };

  /*
   * how much the ledger holds and how much of it actually went through — the two figures that say
   * whether the list in front of the operator is a normal day before they have read a single row
   */
  const description = ledgerSummary
    ? t('user:payments.ledgerSummary', {
      total: t('user:payments.paymentsWithCount', { count: ledgerSummary.total }),
      collected: formatPriceWithCurrency(ledgerSummary.netAmount, ledgerSummary.currency),
    })
    : undefined;

  const renderRowDetail = useCallback((data: IData) => {
    const payment = payments.find((item: IPayment) => item.id === data.id);

    if (!payment) return null;

    return <PaymentRowDetail canUpdate={canEdit} payment={payment} />;
  }, [payments, canEdit]);

  const handleClearScope = () => {
    navigate({ to: PATH_NAMES.payments, search: { tab: searchParams.tab } } as any);
  };

  /*
   * reached from one account's page, the ledger holds the movements that account was on either side
   * of. The totals above it still describe the whole ledger, so the band has to say what the rows
   * were narrowed to — otherwise the page reads as if the platform had collected three payments in
   * total. The account is read off the first row, on whichever side of it it stands.
   */
  const scopedPayment = searchParams.user
    ? payments[0]
    : undefined;
  /*
   * reached through the payment's pointer, an account is plain JSON carrying `objectId` — only a
   * user fetched as the row itself goes through `toJSONWithId` and gains an `id`
   */
  const scopedUser = [scopedPayment?.payer, scopedPayment?.receiver]
    .find((person) => (person?.id ?? person?.objectId) === searchParams.user);
  const scopedUserName = getUserFullName(scopedUser);

  return (
    <>
      <Head title={t('user:payments.payments')} />
      <PageHeader description={description} title={t('user:payments.payments')} />
      {!!searchParams.user && (
        <ListScopeAlert
          clearLabel={t('user:payments.seeAllPayments')}
          onClear={handleClearScope}
          message={scopedUserName
            ? t('user:payments.scopedToUserWithName', { value: scopedUserName })
            : t('user:payments.scopedToUser')}
        />
      )}
      <ChargedPendingBookingsBand />
      <PaymentServiceHealthBand />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        headCells={headCells}
        items={dataTable}
        listId="payments"
        onExport={handleExport}
        onMarkAllAsSeen={handleMarkAllAsSeen}
        onMarkAsSeenSelected={handleSelectedAsSeen}
        onRowClick={handleRowClick}
        onUpdateData={handleUpdateData}
        renderFilter={(prop: IRenderSearchProps) => <SearchPayments {...prop} />}
        renderRowDetail={renderRowDetail}
        tabCounts={tabCounts}
        tabs={paymentsTabOptions}
      />
    </>
  );
};

export default Payments;
