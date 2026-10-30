import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import TextFieldInput from '@/components/form/inputs/TextFieldInput';
import { TABLE_ROW_DETAIL_GAP } from '@/constants/_core/ui/list.constants';
import { settleChargedPendingBookingById } from '@/redux/actions/_core/payment.action';
import { getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import { AppDispatch } from '@/redux/store';
import { ChargedPendingDecision, IChargedPendingBooking } from '@/types/_core/payment.type';
import { getUserFullName } from '@/utils/_core/user.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const classes = {
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_ROW_DETAIL_GAP}px`,
  },
};

type Props = {
  booking: IChargedPendingBooking;
  decision: ChargedPendingDecision;
  open: boolean;
  toggle: () => void;
};

/**
 * Confirms how a charged booking left pending is settled: the seat is kept for the passenger, or
 * the whole collection goes back to them and the booking is closed.
 *
 * Both ways ask for a reason. A settled booking cannot be reconstructed afterwards from its status
 * alone — nothing says whether the seat was still free or had been resold — and the refund moves
 * real money that cannot be taken back, so the copy states the amount and who it goes to.
 */
const SettleChargedBookingDialog = ({
  booking, decision, open, toggle,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(getAppLoadingSelector);
  const [reason, setReason] = useState('');

  // a reason belongs to one decision: carrying the last one over would file it under the wrong booking
  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const isReasonValid = reason.trim().length > 0;
  const isRefund = decision === 'refund';

  const handleSettle = () => {
    if (!isReasonValid) return;
    dispatch(settleChargedPendingBookingById(booking.objectId, decision, reason.trim()));
    toggle();
  };

  const values = {
    name: getUserFullName(booking.passenger),
    amount: formatPriceWithCurrency(booking.payment?.amount ?? 0, booking.payment?.currency),
  };

  return (
    <Dialog
      loading={loading}
      maxWidth="xs"
      onPrimaryButtonAction={handleSettle}
      open={open}
      primaryButtonDisabled={!isReasonValid}
      toggle={toggle}
      buttonColor={isRefund
        ? 'error'
        : 'primary'}
      description={t(isRefund
        ? 'user:payments.chargedPending.refundDescription'
        : 'user:payments.chargedPending.confirmDescription', values)}
      primaryButtonText={t(isRefund
        ? 'user:payments.chargedPending.refund'
        : 'user:payments.chargedPending.confirm')}
      title={t(isRefund
        ? 'user:payments.chargedPending.refundTitle'
        : 'user:payments.chargedPending.confirmTitle', values)}
    >
      <Box css={classes.content}>
        <TextFieldInput
          fixedLabel
          fullWidth
          multiline
          error={!isReasonValid}
          helperText={t('user:payments.chargedPending.reasonHelper')}
          label={t('user:payments.manualReason')}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          value={reason}
        />
      </Box>
    </Dialog>
  );
};

export default SettleChargedBookingDialog;
