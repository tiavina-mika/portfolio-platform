import { Box, Button, Stack } from '@mui/material';
import { PaymentStatusEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiActivity, FiAlertTriangle, FiClock, FiEye, FiEyeOff, FiFileText, FiLink,
  FiToggleRight, FiUserMinus, FiUserPlus,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import BooleanIcons from '@/components/BooleanIcons';
import Dialog from '@/components/Dialog';
import Head from '@/components/Head';
import Items from '@/components/Items';
import ItemsStatus from '@/components/ItemsStatus';
import Layout from '@/components/layouts/Layout';
import PreviewSections from '@/components/layouts/PreviewSections';
import { defaultUserEventFields, USER_EVENT_COLORS } from '@/constants/_core/app.constants';
import { PAYMENT_HISTORY_COLORS, PAYMENT_HISTORY_FIELDS } from '@/constants/_core/payment.constants';
import { PREVIEW_SECTIONS_GAP } from '@/constants/_core/ui/page.constants';
import { MENU_ITEM_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import History from '@/containers/_core/History';
import PaymentFlowTitle from '@/containers/_core/payments/PaymentFlowTitle';
import PaymentHeaderMeta from '@/containers/_core/payments/PaymentHeaderMeta';
import PaymentPartyRow from '@/containers/_core/payments/PaymentPartyRow';
import PaymentReferencePretitle from '@/containers/_core/payments/PaymentReferencePretitle';
import PaymentStatusBanner from '@/containers/_core/payments/PaymentStatusBanner';
import PaymentTypeChip from '@/containers/_core/payments/PaymentTypeChip';
import RefundPaymentDialog from '@/containers/_core/payments/RefundPaymentDialog';
import RetryPaymentDialog from '@/containers/_core/payments/RetryPaymentDialog';
import { usePaymentPageExtension } from '@/hooks/_core/usePaymentPageExtension';
import { useToggle } from '@/hooks/_core/useToggle';
import { toggleEntitySeen } from '@/redux/actions/_core/app.action';
import { resendReceiptById } from '@/redux/actions/_core/payment.action';
import { goToList } from '@/redux/actions/_core/util.action';
import { getAppLoadingSelector, setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import { getPaymentPaymentSelector, loadPaymentSlice } from '@/redux/reducers/_core/payment.reducer';
import { AppDispatch } from '@/redux/store';
import { IMenu, IPreviewSection, ISelectOption } from '@/types/_core/app.type';
import { IPayment } from '@/types/_core/payment.type';
import { displayDate } from '@/utils/_core/date.utils';
import {
  canRefundPayment, canRetryPayment, getCommissionRateLabel, getPaymentAttemptsCount,
  getPaymentReference, getPaymentRefundState, getPaymentServiceLabel, getRefundableAmount,
  isPaymentCollection,
} from '@/utils/_core/payment.utils';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const collection = 'Payment';

const Payment = () => {
  const { t } = useTranslation(['common', 'project', 'user']);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const payment = useSelector(getPaymentPaymentSelector);
  const loading = useSelector(getAppLoadingSelector);
  const extension = usePaymentPageExtension(payment);
  const {
    open: isOpenRetryDialog, toggle: toggleRetryDialog,
  } = useToggle();
  const {
    open: isOpenResendReceiptDialog, toggle: toggleResendReceiptDialog,
  } = useToggle();
  const {
    open: isOpenRefundDialog, toggle: toggleRefundDialog,
  } = useToggle();

  if (!payment) return null;

  const isFailed = payment.status === PaymentStatusEnum.FAILED;
  const isSuccess = payment.status === PaymentStatusEnum.SUCCESS;
  const isPending = payment.status === PaymentStatusEnum.PENDING;
  const reference = getPaymentReference(payment);
  const refundState = getPaymentRefundState(payment);
  /*
   * the receipt is an email to its payer (the receiver when there is none): a member who signed up
   * by phone has no address, so the button is not offered rather than announcing a send that
   * cannot happen
   */
  const receiptRecipient = payment.payer ?? payment.receiver;
  const canResendReceipt = isSuccess && !!receiptRecipient?.email;

  const commissionRateLabel = getCommissionRateLabel(payment);

  const detailsItems: ISelectOption<string | ReactNode>[] = [
    { label: t('common:createdAt'), value: displayDate(payment.createdAt) },
    { label: t('common:updatedAt'), value: displayDate(payment.updatedAt) },
    // what an operator typed before moving this money by hand — the only record of the decision
    ...(payment.manualReason
      ? [{ label: t('user:payments.manualActionReason'), value: payment.manualReason }]
      : []),
    /*
     * a retry nobody asked for was sent by the reconciliation itself, so its author is absent rather
     * than unknown: it reads "Automatic" instead of an empty cell
     */
    ...(payment.retriedAt
      ? [{
        label: t('user:payments.retriedBy'),
        value: payment.retriedBy
          ? getUserFullName(payment.retriedBy)
          : t('user:payments.retriedAutomatically'),
      }]
      : []),
    { label: t('user:payments.amount'), value: formatPriceWithCurrency(payment.amount, payment.currency) },
    { label: t('user:payments.type'), value: <PaymentTypeChip type={payment.type} /> },
    ...(payment.commission !== undefined
      ? [{
        label: t('user:payments.commission'),
        /*
         * the rate carries its surcharge: the stored rate is the driver's tier rate, while the
         * amount is that rate multiplied by what their cancellations add — printed alone, the two
         * read as an arithmetic error
         */
        value: [
          formatPriceWithCurrency(payment.commission, payment.currency),
          commissionRateLabel && `(${commissionRateLabel})`,
        ].filter(Boolean).join(' '),
      }]
      : []),
    // how much has gone back already — a partial refund leaves money still owed
    ...(refundState
      ? [{
        label: t('user:payments.refunded'),
        value: t('user:payments.alreadyRefundedAmount', {
          refunded: formatPriceWithCurrency(payment.refundedAmount ?? 0, payment.currency),
          total: formatPriceWithCurrency(payment.amount, payment.currency),
        }),
      }]
      : []),
  ];

  /*
   * A payment its operator has not answered yet. Nothing to do about it here — the reconciliation
   * job asks the operator again until the deadline, then fails it — so the block states where it
   * stands: the reference to quote to the operator, when the wait ends, and how many times it has
   * already been asked. The banner above says it in a sentence.
   */
  const pendingItems: ISelectOption<string | ReactNode>[] = [
    { label: t('user:payments.operatorReference'), value: payment.providerReference },
    {
      label: t('user:payments.expiresAt'),
      value: payment.expiresAt ? displayDate(payment.expiresAt, true) : '',
    },
    {
      label: t('user:payments.checks'),
      value: t('user:payments.checksWithCount', { count: payment.checkCount ?? 0 }),
    },
    { label: t('user:payments.service'), value: getPaymentServiceLabel(payment.service) },
  ];

  const failureItems: ISelectOption<string | ReactNode>[] = [
    { label: t('user:payments.failureReason'), value: payment.failureReason },
    { label: t('user:payments.service'), value: getPaymentServiceLabel(payment.service) },
    {
      label: t('user:payments.source'),
      // the platform's own side of a payout is its merchant account, not a person's number
      value: isPaymentCollection(payment) && payment.source
        ? getFullPhoneNumber(payment.source)
        : t('user:payments.merchantAccountName'),
    },
    {
      label: t('user:payments.destination'),
      value: !isPaymentCollection(payment) && payment.destination
        ? getFullPhoneNumber(payment.destination)
        : t('user:payments.merchantAccountName'),
    },
    {
      label: t('user:payments.attempts'),
      value: t('user:payments.attemptsWithCount', { count: getPaymentAttemptsCount(payment) }),
    },
  ];

  const statusItems: ISelectOption<string | ReactNode>[] = [
    { label: t('user:payments.paid'), value: <BooleanIcons value={isSuccess} /> },
  ];

  const handleGoToList = () => {
    navigate(goToList('payments'));
  };

  const handleResendReceipt = () => {
    dispatch(resendReceiptById(payment.id));
  };

  const handleCopyReference = () => {
    navigator.clipboard?.writeText(reference);
    dispatch(setMessageSlice(t('user:payments.referenceCopied', { reference })));
  };

  /*
   * a row is marked seen the moment it is opened, for the whole team — so a page opened by
   * mistake needs a way back into the queue from the page itself, which until now only the
   * user detail page had
   */
  const handleToggleSeen = () => {
    dispatch(toggleEntitySeen<IPayment>(collection, payment, !payment.seen, loadPaymentSlice));
  };

  const seenMenus: IMenu[] = [
    {
      onClick: handleToggleSeen,
      display: true,
      label: payment.seen
        ? t('common:markAsUnseen')
        : t('common:markAsSeen'),
      icon: payment.seen
        ? <FiEyeOff size={MENU_ITEM_ICON_SIZE} />
        : <FiEye size={MENU_ITEM_ICON_SIZE} />,
    },
  ];

  /*
   * what can be done to the payment stands on its heading, in the order it is most often needed:
   * a failed payout is sent again, a settled collection is refunded, a settled payment's receipt
   * is sent again. Nothing is offered on a pending or voided one — there is nothing to do yet, or
   * anymore.
   */
  const headerActions = (
    <>
      {canRetryPayment(payment) && (
        <Button color="primary" onClick={toggleRetryDialog} variant="contained">
          {t('user:payments.retryPayout')}
        </Button>
      )}
      {canRefundPayment(payment) && (
        <Button onClick={toggleRefundDialog} variant="outlined">
          {refundState === 'partial'
            ? t('user:payments.refundRemaining', {
              amount: formatPriceWithCurrency(getRefundableAmount(payment), payment.currency),
            })
            : t('user:payments.refund')}
        </Button>
      )}
      {canResendReceipt && (
        <Button onClick={toggleResendReceiptDialog} variant="outlined">
          {t('user:payments.resendReceipt')}
        </Button>
      )}
      <ActionsMenu
        goToList={handleGoToList}
        label={payment.id}
        menus={seenMenus}
        type="preview"
      />
    </>
  );

  const sections: IPreviewSection[] = [
    {
      id: 'details',
      label: t('common:details'),
      icon: <FiFileText />,
      content: <Items className="flex1" items={detailsItems} />,
    },
    {
      // only shown while the operator has not answered
      id: 'pending',
      label: t('user:payments.pendingDetails'),
      icon: <FiClock />,
      hide: !isPending,
      content: <Items items={pendingItems} />,
    },
    {
      id: 'failure',
      label: t('user:payments.failureDetails'),
      icon: <FiAlertTriangle />,
      hide: !isFailed,
      content: <Items items={failureItems} />,
    },
    {
      /*
       * what the payment settles, contributed by whichever domain registered itself: the core page
       * cannot name those blocks, so they share one entry and draw their own titles
       */
      id: 'linked',
      label: t('common:relatedRecords'),
      icon: <FiLink />,
      disableCard: true,
      hide: !extension.linked?.length,
      content: (
        <Stack sx={{ gap: `${PREVIEW_SECTIONS_GAP}px` }}>
          {extension.linked}
        </Stack>
      ),
    },
    ...(extension.sections ?? []),
    {
      id: 'payer',
      label: t('user:payments.payer'),
      icon: <FiUserMinus />,
      content: (
        <PaymentPartyRow phone={payment.source} service={payment.service} user={payment.payer} />
      ),
    },
    {
      id: 'receiver',
      label: t('user:payments.receiver'),
      icon: <FiUserPlus />,
      content: (
        <PaymentPartyRow phone={payment.destination} service={payment.service} user={payment.receiver} />
      ),
    },
    {
      id: 'status',
      label: t('common:status'),
      icon: <FiToggleRight />,
      content: <ItemsStatus entity={payment} items={statusItems} />,
    },
    {
      id: 'history',
      label: t('common:history'),
      icon: <FiClock />,
      content: (
        <History<IPayment>
          colors={PAYMENT_HISTORY_COLORS}
          fields={PAYMENT_HISTORY_FIELDS}
          parseObj={payment}
          translationKey="user:payments.history"
        />
      ),
    },
    {
      id: 'eventHistory',
      label: t('project:eventHistory'),
      icon: <FiActivity />,
      content: (
        <History<IPayment>
          colors={USER_EVENT_COLORS}
          fields={defaultUserEventFields}
          parseObj={payment}
          translationKey="project:eventsHistory"
        />
      ),
    },
  ];

  const banners = [
    <PaymentStatusBanner key="status" payment={payment} />,
    ...(extension.banners ?? []),
  ];

  return (
    <Layout
      actions={headerActions}
      description={<PaymentHeaderMeta payment={payment} />}
      isCard={false}
      pretitle={<PaymentReferencePretitle onCopy={handleCopyReference} reference={reference} />}
      title={<PaymentFlowTitle payment={payment} />}
    >
      <Head title={`${t('user:payments.payment')} - ${formatPriceWithCurrency(payment.amount, payment.currency)}`} />
      <PreviewSections
        sections={sections}
        header={(
          <Stack sx={{ gap: `${PREVIEW_SECTIONS_GAP}px` }}>
            {banners}
            {extension.summary && <Box>{extension.summary}</Box>}
          </Stack>
        )}
      />
      <RetryPaymentDialog
        open={isOpenRetryDialog}
        payment={payment}
        toggle={toggleRetryDialog}
      />
      <RefundPaymentDialog
        open={isOpenRefundDialog}
        payment={payment}
        toggle={toggleRefundDialog}
      />
      <Dialog
        buttonColor="primary"
        description={t('user:payments.resendReceiptConfirmDescription')}
        loading={loading}
        onPrimaryButtonAction={handleResendReceipt}
        open={isOpenResendReceiptDialog}
        primaryButtonText={t('user:payments.resendReceipt')}
        title={t('user:payments.resendReceiptConfirmTitle')}
        toggle={toggleResendReceiptDialog}
      />
    </Layout>
  );
};

export default Payment;
