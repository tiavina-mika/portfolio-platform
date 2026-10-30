import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import SettleChargedBookingDialog from '@/containers/_core/payments/SettleChargedBookingDialog';
import { getPaymentChargedPendingBookingsSelector } from '@/redux/reducers/_core/payment.reducer';
import { ChargedPendingDecision, IChargedPendingBooking } from '@/types/_core/payment.type';
import { getUserFullName } from '@/utils/_core/user.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const BAND_GAP = 8;

const classes = {
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${BAND_GAP}px`,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
    gap: `${BAND_GAP}px`,
  },
  actions: {
    display: 'flex',
    gap: `${BAND_GAP}px`,
  },
};

type Settling = { booking: IChargedPendingBooking; decision: ChargedPendingDecision };

/**
 * The bookings whose passenger was charged but whose seat was never confirmed, listed above the
 * payments ledger with the two ways to settle each: keep the seat, or give the money back.
 *
 * Oldest first and stated with their age, because the one thing that makes a charged passenger
 * worse off is waiting. Drawn only while there is something to settle, and only for a role that may
 * update bookings — the server refuses the action to anyone else regardless.
 */
const ChargedPendingBookingsBand = () => {
  const { t } = useTranslation(['user']);
  const bookings = useSelector(getPaymentChargedPendingBookingsSelector);
  const [settling, setSettling] = useState<Settling | undefined>();

  if (!bookings.length) return null;

  const handleClose = () => setSettling(undefined);

  return (
    <Alert severity="warning">
      <AlertTitle>{t('user:payments.chargedPending.title', { count: bookings.length })}</AlertTitle>
      <Typography variant="body2">{t('user:payments.chargedPending.description')}</Typography>
      <Box component="ul" css={classes.content} sx={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {bookings.map((booking) => (
          <Box component="li" css={classes.row} key={booking.objectId}>
            <Typography component="span" variant="body2">
              {t('user:payments.chargedPending.row', {
                name: getUserFullName(booking.passenger),
                amount: formatPriceWithCurrency(booking.payment?.amount ?? 0, booking.payment?.currency),
                age: dayjs(booking.createdAt as string).fromNow(true),
              })}
            </Typography>
            <Box css={classes.actions}>
              <Button
                onClick={() => setSettling({ booking, decision: 'confirm' })}
                size="small"
                variant="contained"
              >
                {t('user:payments.chargedPending.confirm')}
              </Button>
              <Button
                color="error"
                onClick={() => setSettling({ booking, decision: 'refund' })}
                size="small"
                variant="outlined"
              >
                {t('user:payments.chargedPending.refund')}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      {settling && (
        <SettleChargedBookingDialog
          open
          booking={settling.booking}
          decision={settling.decision}
          toggle={handleClose}
        />
      )}
    </Alert>
  );
};

export default ChargedPendingBookingsBand;
