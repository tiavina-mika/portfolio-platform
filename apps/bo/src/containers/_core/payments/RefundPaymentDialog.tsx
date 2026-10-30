import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import TextFieldInput from '@/components/form/inputs/TextFieldInput';
import { TABLE_ROW_DETAIL_GAP } from '@/constants/_core/ui/list.constants';
import { refundPaymentById } from '@/redux/actions/_core/payment.action';
import { getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import { AppDispatch } from '@/redux/store';
import { IPayment } from '@/types/_core/payment.type';
import {
  getPaymentCounterparty, getPaymentReference, getPaymentServiceLabel, getRefundableAmount,
  isPartiallyRefunded,
} from '@/utils/_core/payment.utils';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const classes = {
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_ROW_DETAIL_GAP}px`,
  },
};

type Props = {
  payment: IPayment;
  open: boolean;
  toggle: () => void;
};

/**
 * Confirms giving a collection back, in whole or in part.
 *
 * It moves real money and cannot be undone, so the two things an operator has to check before they
 * are sure they are refunding the right transaction are stated in the copy: the account it is going
 * to, and the reference it will be recorded under.
 *
 * The amount opens on everything still owed, which is the whole collection the first time and the
 * remainder afterwards — a partial refund is the exception, so the common case takes no typing. It
 * cannot be raised past that remainder here, and the server refuses one that would overshoot
 * regardless: this field is a convenience, not the guard.
 *
 * The reason is required. A manual refund cannot be reconstructed afterwards from the amounts
 * alone — nothing says whether it settled a complaint, a journey cut short or a mistake of the
 * platform's own — and the server refuses one sent without it.
 *
 * Shared by the ledger row and the payment's own page rather than written on each: they offer the
 * same action under the same rules, and two copies of that is how the two start disagreeing about
 * what a refund is allowed to do.
 */
const RefundPaymentDialog = ({
  payment, open, toggle,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(getAppLoadingSelector);

  const refundable = getRefundableAmount(payment);
  const [amount, setAmount] = useState<string>(String(refundable));
  const [reason, setReason] = useState('');

  /*
   * reset on each opening: the remainder changes as refunds are made, and a field still holding
   * what was typed the last time would open on an amount that is no longer available
   */
  useEffect(() => {
    if (open) {
      setAmount(String(refundable));
      // a reason belongs to one refund: carrying the last one over would file it under the wrong move
      setReason('');
    }
  }, [open, refundable]);

  const parsedAmount = Number(amount);
  const isAmountValid = Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= refundable;

  /*
   * the account the money goes back to: the one the collection was taken from, not whichever
   * number the passenger has on their profile today
   */
  const account = [
    getPaymentServiceLabel(payment.service),
    getFullPhoneNumber(getPaymentCounterparty(payment).phone),
  ].filter(Boolean).join(' ');

  const isReasonValid = reason.trim().length > 0;

  const handleRefund = () => {
    if (!isAmountValid || !isReasonValid) return;
    dispatch(refundPaymentById(payment, parsedAmount, reason.trim()));
  };

  return (
    <Dialog
      buttonColor="error"
      loading={loading}
      maxWidth="xs"
      onPrimaryButtonAction={handleRefund}
      open={open}
      primaryButtonDisabled={!isAmountValid || !isReasonValid}
      primaryButtonText={t('user:payments.refund')}
      toggle={toggle}
      description={t('user:payments.refundConfirmDescription', {
        account,
        reference: getPaymentReference(payment),
      })}
      title={t('user:payments.refundConfirmTitle', {
        name: getUserFullName(payment.payer) || t('user:payments.merchantAccount'),
      })}
    >
      <Box css={classes.content}>
        {/*
          * what is left, stated whenever part of it has already gone back — the field opens on that
          * figure, and an operator who does not know a refund was already made would read the
          * smaller default as the platform having lost track of the rest
          */}
        {/*
          * a refund of a booking still standing also comes off the driver's payout, and is refused
          * once that payout is sent: said up front, so the operator is not surprised by the refusal
          */}
        <Typography variant="caption">{t('user:payments.refundReducesDriverPayout')}</Typography>
        {isPartiallyRefunded(payment) && (
          <Typography variant="caption">
            {t('user:payments.alreadyRefundedAmount', {
              refunded: formatPriceWithCurrency(payment.refundedAmount ?? 0, payment.currency),
              total: formatPriceWithCurrency(payment.amount, payment.currency),
            })}
          </Typography>
        )}
        {/*
          * the label sits above the field rather than floating in its outline: the amount arrives
          * already filled in, and a floating label on a field that is never empty is only ever
          * read in its shrunk state
          */}
        <TextFieldInput
          fixedLabel
          fullWidth
          error={!isAmountValid}
          label={t('user:payments.refundAmount')}
          onChange={(event) => setAmount(event.target.value)}
          slotProps={{ htmlInput: { min: 0, max: refundable } }}
          type="number"
          value={amount}
          helperText={t('user:payments.refundableAmount', {
            amount: formatPriceWithCurrency(refundable, payment.currency),
          })}
        />
        {/*
          * required: the amounts alone never say why the platform gave money back, and this row is
          * the only record of the decision
          */}
        <TextFieldInput
          fixedLabel
          fullWidth
          multiline
          error={!isReasonValid}
          helperText={t('user:payments.manualReasonHelper')}
          label={t('user:payments.manualReason')}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          value={reason}
        />
      </Box>
    </Dialog>
  );
};

export default RefundPaymentDialog;
