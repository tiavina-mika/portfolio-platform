import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import TextFieldInput from '@/components/form/inputs/TextFieldInput';
import { TABLE_ROW_DETAIL_GAP } from '@/constants/_core/ui/list.constants';
import { retryPaymentById } from '@/redux/actions/_core/payment.action';
import { getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import { AppDispatch } from '@/redux/store';
import { IPayment } from '@/types/_core/payment.type';
import {
  getPaymentCounterparty, getPaymentReference, getPaymentServiceLabel,
} from '@/utils/_core/payment.utils';
import { getFullPhoneNumber } from '@/utils/_core/user.utils';
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
 * Confirms sending a failed payout to the operator again.
 *
 * It moves real money out of the merchant account and cannot be undone, so the amount, the account
 * it goes to and the reference it is recorded under are stated in the copy: that is what an
 * operator checks before they are sure they are retrying the right transaction.
 *
 * The reason is required, for the same reason it is on a refund: the row this mutates is the only
 * record of who decided to send the money again and why — "the driver's number was wrong and has
 * been corrected" is the difference between a retry and a double payment. The server refuses one
 * sent without it.
 *
 * Shared by the ledger row and the payment's own page rather than written on each: they offer the
 * same action under the same rules.
 */
const RetryPaymentDialog = ({ payment, open, toggle }: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(getAppLoadingSelector);

  const [reason, setReason] = useState('');

  // a reason belongs to one attempt: carrying the last one over would file it under the wrong move
  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const isReasonValid = reason.trim().length > 0;

  /* the account the money is being sent to — the one recorded on the payment, not a current profile */
  const account = [
    getPaymentServiceLabel(payment.service),
    getFullPhoneNumber(getPaymentCounterparty(payment).phone),
  ].filter(Boolean).join(' ');

  const handleRetry = () => {
    if (!isReasonValid) return;
    dispatch(retryPaymentById(payment.id, reason.trim()));
  };

  return (
    <Dialog
      buttonColor="primary"
      loading={loading}
      maxWidth="xs"
      onPrimaryButtonAction={handleRetry}
      open={open}
      primaryButtonDisabled={!isReasonValid}
      primaryButtonText={t('user:payments.retryPayout')}
      title={t('user:payments.retryPayoutConfirmTitle')}
      toggle={toggle}
      description={t('user:payments.retryPayoutConfirmDescription', {
        amount: formatPriceWithCurrency(payment.amount, payment.currency),
        account,
        reference: getPaymentReference(payment),
      })}
    >
      <Box css={classes.content}>
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

export default RetryPaymentDialog;
