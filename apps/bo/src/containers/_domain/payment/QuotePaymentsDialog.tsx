import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PaymentKindEnum, PaymentStatusEnum } from '@shared/domain-types';
import { computeQuoteRemainingAmount, isPaymentOpen } from '@shared/domain-utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Dialog from '@/components/Dialog';
import LabelValue from '@/components/LabelValue';
import StatusDot from '@/components/StatusDot';
import CompactTable, { type CompactTableColumn } from '@/components/table/CompactTable';
import { MENU_ITEM_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import { PAYMENT_COLLECTION, PAYMENT_STATUS_TONES } from '@/constants/_domain/payment.constants';
import { useProtect } from '@/hooks/_core/useProtect';
import {
  cancelQuotePayment, createQuotePaymentSchedule, loadQuotePayments, payQuotePayment, setQuotePaymentDueDate,
} from '@/redux/actions/_domain/payment.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { getPaymentPaymentsSelector } from '@/redux/reducers/_domain/payment.reducer';
import { IPayment } from '@/types/_domain/payment.type';
import { IQuote } from '@/types/_domain/quote.type';
import { displayDate } from '@/utils/_core/date.utils';
import { formatQuoteAmount } from '@/utils/_domain/quote.utils';
import { PaymentDueDateFormValues, PaymentPaidFormValues } from '@/validations/_domain/payment.validation';

import PaymentCancelDialog from './PaymentCancelDialog';
import PaymentDueDateDialog from './PaymentDueDateDialog';
import PaymentPayDialog from './PaymentPayDialog';

type Props = {
  // the accepted quote whose payments are shown; the dialog is closed while there is none
  quote: IQuote | null;
  onClose: () => void;
};

// the deposit falls due on the day of the acceptance: only the milestone and the balance are dated by hand
const DATED_BY_HAND_KINDS = [PaymentKindEnum.MILESTONE, PaymentKindEnum.BALANCE];

/**
 * The payments of an accepted quote, 30 / 40 / 30: what is paid, what is left, and for each payment where
 * it stands. A payment is recorded as paid by hand, the milestone and the balance are dated once known,
 * and a mistake is corrected by cancelling the payment, a new one then taking its place. Nothing is
 * deleted: the cancelled payments stay as history.
 */
const QuotePaymentsDialog = ({ quote, onClose }: Props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['project', 'common']);
  const payments = useSelector(getPaymentPaymentsSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const { canCreate, canEdit } = useProtect(PAYMENT_COLLECTION);
  const [payingPayment, setPayingPayment] = useState<IPayment | null>(null);
  const [datingPayment, setDatingPayment] = useState<IPayment | null>(null);
  const [cancellingPayment, setCancellingPayment] = useState<IPayment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /*
   * read on the quote's id: the quote itself is read again after each payment (its paid amount changed),
   * which must not reload the payments just updated
   */
  const quoteId = quote?.id;

  useEffect(() => {
    if (quoteId) dispatch(loadQuotePayments(quoteId));
  }, [quoteId, dispatch]);

  const formatAmount = (amount: number): string => formatQuoteAmount(amount, quote?.currency ?? '', locale);
  const formatDate = (date: string): string => displayDate(date, false, true);

  // closed once saved only: a refusal keeps what was typed on screen
  const handlePay = async (values: PaymentPaidFormValues): Promise<void> => {
    if (!payingPayment) return;

    setIsSaving(true);
    const error = await dispatch(payQuotePayment(payingPayment, values));

    setIsSaving(false);
    if (!error) setPayingPayment(null);
  };

  const handleDueDate = async ({ dueDate }: PaymentDueDateFormValues): Promise<void> => {
    if (!datingPayment) return;

    setIsSaving(true);
    const error = await dispatch(setQuotePaymentDueDate(datingPayment, dueDate ?? null));

    setIsSaving(false);
    if (!error) setDatingPayment(null);
  };

  const handleCreateSchedule = async (): Promise<void> => {
    if (!quote) return;

    setIsSaving(true);
    await dispatch(createQuotePaymentSchedule(quote));
    setIsSaving(false);
  };

  const columns: CompactTableColumn<IPayment>[] = [
    {
      id: 'kind',
      label: t('project:payment.kind'),
      render: (payment) => t('project:payment.kindWithPercent', {
        kind: t(`project:payment.kinds.${payment.kind}`), percent: payment.percent,
      }),
    },
    {
      id: 'amount',
      label: t('project:payment.amount'),
      align: 'right',
      nowrap: true,
      render: (payment) => formatAmount(payment.amount),
    },
    {
      id: 'dueDate',
      label: t('project:payment.dueDate'),
      nowrap: true,
      render: (payment) => (payment.dueDate ? formatDate(payment.dueDate) : t('project:payment.notSet')),
    },
    {
      id: 'status',
      label: t('common:status'),
      render: (payment) => (
        <StatusDot
          color={PAYMENT_STATUS_TONES[payment.status]}
          label={t(`project:payment.statuses.${payment.status}`)}
        />
      ),
    },
    {
      id: 'paid',
      label: t('project:payment.paidOn'),
      render: (payment) => (payment.paidAt
        ? (
          <Stack spacing={0.25}>
            <Typography component="span" variant="body2">{formatDate(payment.paidAt)}</Typography>
            <Typography color="text.secondary" component="span" variant="caption">
              {[payment.method && t(`project:payment.methods.${payment.method}`), payment.reference]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Stack>
        )
        : t('project:payment.notPaid')),
    },
    {
      id: 'actions',
      label: t('common:actions'),
      align: 'right',
      render: (payment) => (
        <ActionsMenu
          label={t(`project:payment.kinds.${payment.kind}`)}
          // the row variant hides its trigger when nothing is left to do (a cancelled payment)
          type="row"
          menus={[
            {
              onClick: () => setPayingPayment(payment),
              display: canEdit && isPaymentOpen(payment.status),
              label: t('project:payment.actions.markAsPaid'),
              icon: <FiCheckCircle aria-hidden size={MENU_ITEM_ICON_SIZE} />,
            },
            {
              onClick: () => setDatingPayment(payment),
              display: canEdit && isPaymentOpen(payment.status) && DATED_BY_HAND_KINDS.includes(payment.kind),
              label: t('project:payment.actions.setDueDate'),
              icon: <FiCalendar aria-hidden size={MENU_ITEM_ICON_SIZE} />,
            },
            {
              // a cancelled payment stays as it is; any other one is corrected by a new one
              onClick: () => setCancellingPayment(payment),
              display: canCreate && canEdit && payment.status !== PaymentStatusEnum.CANCELLED,
              label: t('project:payment.actions.cancel'),
              icon: <FiRotateCcw aria-hidden size={MENU_ITEM_ICON_SIZE} />,
            },
          ]}
        />
      ),
    },
  ];

  const totalAmount = quote?.totalAmount ?? 0;
  const paidAmount = quote?.paidAmount ?? 0;

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open={!!quote}
        title={t('project:payment.dialogTitle', { number: quote?.number ?? '' })}
        toggle={onClose}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <LabelValue label={t('project:payment.total')} value={formatAmount(totalAmount)} />
            <LabelValue label={t('project:payment.paid')} value={formatAmount(paidAmount)} />
            <LabelValue
              label={t('project:payment.remaining')}
              value={formatAmount(computeQuoteRemainingAmount(totalAmount, paidAmount))}
            />
          </Stack>
          <CompactTable
            columns={columns}
            emptyDescription={t('project:payment.emptyDescription')}
            emptyTitle={t('project:payment.empty')}
            rows={payments}
          />
          {/* an accepted quote with no payment: accepted before the payments existed */}
          {payments.length === 0 && canCreate && (
            <Stack sx={{ alignItems: 'flex-start' }}>
              <Button disabled={isSaving} onClick={handleCreateSchedule} variant="outlined">
                {t('project:payment.actions.createSchedule')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Dialog>
      {/* keyed on the payment, so what was typed for one payment is never carried to the next */}
      <PaymentPayDialog
        amountLabel={payingPayment ? formatAmount(payingPayment.amount) : ''}
        key={`pay-${payingPayment?.id ?? 'none'}`}
        loading={isSaving}
        onClose={() => setPayingPayment(null)}
        onSubmit={handlePay}
        payment={payingPayment}
      />
      <PaymentDueDateDialog
        key={`due-${datingPayment?.id ?? 'none'}`}
        loading={isSaving}
        onClose={() => setDatingPayment(null)}
        onSubmit={handleDueDate}
        payment={datingPayment}
      />
      <PaymentCancelDialog
        onClose={() => setCancellingPayment(null)}
        onConfirm={(payment) => dispatch(cancelQuotePayment(payment))}
        payment={cancellingPayment}
      />
    </>
  );
};

export default QuotePaymentsDialog;
