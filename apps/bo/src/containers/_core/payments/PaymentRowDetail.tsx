import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { PaymentStatusEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { AlertRefundIcon } from '@/components/icons/AlertIcons';
import RowDetailFacts, { RowDetailFact } from '@/components/table/RowDetailFacts';
import { TABLE_ROW_DETAIL_GAP } from '@/constants/_core/ui/list.constants';
import {
  FONT_FAMILY_MONO, SKELETON_LINE_HEIGHT, SKELETON_PRIMARY_LINE_WIDTH,
} from '@/constants/_core/ui/ui.constants';
import RefundPaymentDialog from '@/containers/_core/payments/RefundPaymentDialog';
import RetryPaymentDialog from '@/containers/_core/payments/RetryPaymentDialog';
import { useToggle } from '@/hooks/_core/useToggle';
import { goToList } from '@/redux/actions/_core/util.action';
import { IPayment } from '@/types/_core/payment.type';
import { displayDate } from '@/utils/_core/date.utils';
import {
  canRefundPayment, canRetryPayment, getPaymentReference, getPaymentRowDetailActions,
  getPaymentRowDetailFacts, getPaymentServiceLabel, getRefundableAmount, isPartiallyRefunded,
  isPaymentCollection,
} from '@/utils/_core/payment.utils';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_ROW_DETAIL_GAP}px`,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${TABLE_ROW_DETAIL_GAP}px`,
  },
  monospace: {
    fontFamily: FONT_FAMILY_MONO,
  },
};

type Props = {
  payment: IPayment;
  canUpdate?: boolean;
};

/**
 * Everything a payment states once its row is opened: why it failed if it did, the two accounts
 * the money moved between, and what can still be done about it. An operator decides here rather
 * than opening a page per row — with a screen of failures to work through, a round trip into each
 * one is the whole task.
 *
 * The actions are deliberately asymmetric between the two directions money moves in, because the
 * two are not symmetric operations:
 *
 * - **Retrying** is offered on a payout only. A payout is an order the back-office itself issued
 *   against the merchant account, so sending it again is legitimate. A collection is debited from
 *   the passenger's own mobile money account behind their PIN, which the back-office has no way of
 *   supplying — so no retry is offered on those rows at all, and the band says why instead of
 *   showing a button that could only ever fail.
 * - **Refunding** is offered on a settled collection only. The money is on the merchant account and
 *   can be sent back to the account it came from. On a payout that has already reached a driver the
 *   operator gives the platform no way to debit them back; the real remedy there is an adjustment
 *   on their next payout, which is a different operation on a different object.
 */
const PaymentRowDetail = ({
  payment, canUpdate,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const navigate = useNavigate();
  const {
    open: isRetryDialogOpen, toggle: toggleRetryDialog,
  } = useToggle();
  const {
    open: isRefundDialogOpen, toggle: toggleRefundDialog,
  } = useToggle();

  const isCollection = isPaymentCollection(payment);
  const canRetry = canUpdate && canRetryPayment(payment);
  const canRefund = canUpdate && canRefundPayment(payment);

  /*
   * the account is the member on the movement: the platform's own merchant account is on the other
   * side of every row, so it is never the one the ledger can be narrowed to
   */
  const account = isCollection ? payment.payer : payment.receiver;
  const accountId = account?.id ?? (account as { objectId?: string } | undefined)?.objectId;

  const handleGoToAccountPayments = () => {
    if (accountId) navigate(goToList('payments', { user: accountId }));
  };

  const handleCopyReference = () => {
    navigator.clipboard?.writeText(getPaymentReference(payment));
  };

  return (
    <Box css={classes.root}>
      {/* what went wrong, before anything else — it is why the row was opened */}
      {payment.failureReason && (
        <Alert severity="error">{payment.failureReason}</Alert>
      )}
      {/* why an operator sent this payment again, or gave it back by hand */}
      {payment.manualReason && (
        <Alert severity="info">
          {t('user:payments.manualReasonNote', { reason: payment.manualReason })}
        </Alert>
      )}
      {payment.status === PaymentStatusEnum.PENDING && (
        <Alert severity="warning">{t('user:payments.pendingNote')}</Alert>
      )}
      {/*
        * a collection that has been given back still shows as settled, because it was — the row has
        * to say what happened to it afterwards, or the changed button is the only trace of it. What
        * it says depends on whether anything is still owed: a partial refund names both figures, so
        * the operator can see what is left before deciding to send the rest; a complete one states
        * that there is nothing left, which is also why no button is offered next to it.
        */}
      {isPartiallyRefunded(payment) && (
        <Alert icon={<AlertRefundIcon />} severity="info">
          {getRefundableAmount(payment) > 0
            ? t('user:payments.alreadyRefundedAmount', {
              refunded: formatPriceWithCurrency(payment.refundedAmount ?? 0, payment.currency),
              total: formatPriceWithCurrency(payment.amount, payment.currency),
            })
            : t('user:payments.alreadyRefunded')}
        </Alert>
      )}
      {payment.refundOf?.objectId && (
        <Alert severity="info">
          {t('user:payments.isRefundOf', { reference: payment.refundOf.objectId })}
        </Alert>
      )}
      <RowDetailFacts>
        <RowDetailFact label={t('user:payments.reference')}>
          <Typography css={classes.monospace} variant="subtitle2">
            {getPaymentReference(payment)}
          </Typography>
        </RowDetailFact>
        <RowDetailFact label={t('user:payments.timestamp')}>
          <Typography variant="body2">{displayDate(payment.createdAt, true, true)}</Typography>
        </RowDetailFact>
        <RowDetailFact label={t('user:payments.payer')}>
          <Typography variant="body2">
            {getUserFullName(payment.payer) || t('user:payments.merchantAccount')}
          </Typography>
        </RowDetailFact>
        <RowDetailFact label={t('user:payments.receiver')}>
          <Typography variant="body2">
            {getUserFullName(payment.receiver) || t('user:payments.merchantAccount')}
          </Typography>
        </RowDetailFact>
        <RowDetailFact label={t('user:payments.source')}>
          <Typography css={classes.monospace} variant="body2">
            {getFullPhoneNumber(payment.source) || '—'}
          </Typography>
        </RowDetailFact>
        <RowDetailFact label={t('user:payments.destination')}>
          <Typography css={classes.monospace} variant="body2">
            {getFullPhoneNumber(payment.destination) || '—'}
          </Typography>
        </RowDetailFact>
        <RowDetailFact label={t('user:payments.operator')}>
          <Typography variant="body2">
            {getPaymentServiceLabel(payment.service) || '—'}
          </Typography>
        </RowDetailFact>
        {payment.retriedBy && (
          <RowDetailFact label={t('user:payments.retryRequestedBy')}>
            <Typography variant="body2">{getUserFullName(payment.retriedBy)}</Typography>
          </RowDetailFact>
        )}
        {payment.commissionMultiplier !== undefined && payment.commissionMultiplier !== 1 && (
          <RowDetailFact label={t('user:payments.commissionMultiplier')}>
            <Typography variant="body2">
              {t('user:payments.commissionMultiplierValue', { multiplier: payment.commissionMultiplier })}
            </Typography>
          </RowDetailFact>
        )}
        {/* what this payment settles — contributed by whichever domain the movement belongs to */}
        {getPaymentRowDetailFacts().map((fact) => {
          const { Component } = fact;

          return (
            <RowDetailFact key={fact.label} label={fact.label}>
              {/* registered facts are lazy: a line skeleton holds the value while its chunk loads */}
              <Suspense
                fallback={<Skeleton height={SKELETON_LINE_HEIGHT} width={SKELETON_PRIMARY_LINE_WIDTH} />}
              >
                <Component payment={payment} />
              </Suspense>
            </RowDetailFact>
          );
        })}
      </RowDetailFacts>
      <Box css={classes.actions}>
        {canRetry && (
          <Button color="primary" onClick={toggleRetryDialog} variant="contained">
            {t('user:payments.retryPayout')}
          </Button>
        )}
        <Button onClick={handleCopyReference} variant="outlined">
          {t('user:payments.copyReference')}
        </Button>
        {getPaymentRowDetailActions().map((action, index: number) => {
          const { Component } = action;

          /*
           * no placeholder while a lazy action loads: an action only shows on the rows it applies
           * to, so a skeleton would flash on every other one
           */
          return (
            <Suspense fallback={null} key={index}>
              <Component payment={payment} />
            </Suspense>
          );
        })}
        {accountId && (
          <Button onClick={handleGoToAccountPayments} variant="outlined">
            {t('user:payments.thisAccountPayments')}
          </Button>
        )}
        {/*
          * last of the row, after the actions that only read the payment: it is the one that moves
          * money and cannot be undone, so it is not what the pointer lands on while an operator is
          * still working out which transaction they are looking at
          */}
        {canRefund && (
          <Button color="error" onClick={toggleRefundDialog} variant="outlined">
            {/*
              * the button says how much is on offer once part of it has gone back: "Refund" alone
              * on a collection already half returned reads as offering the whole of it again
              */}
            {isPartiallyRefunded(payment)
              ? t('user:payments.refundRemaining', {
                amount: formatPriceWithCurrency(getRefundableAmount(payment), payment.currency),
              })
              : t('user:payments.refund')}
          </Button>
        )}
        {/*
          * said rather than left unexplained: an operator who has just retried a payout will look
          * for the same button on a failed collection, and its absence has to answer them
          */}
        {isCollection && payment.status === PaymentStatusEnum.FAILED && (
          <Typography variant="body2">{t('user:payments.collectionCannotBeRetried')}</Typography>
        )}
      </Box>
      <RefundPaymentDialog
        open={isRefundDialogOpen}
        payment={payment}
        toggle={toggleRefundDialog}
      />
      <RetryPaymentDialog
        open={isRetryDialogOpen}
        payment={payment}
        toggle={toggleRetryDialog}
      />
    </Box>
  );
};

export default PaymentRowDetail;
