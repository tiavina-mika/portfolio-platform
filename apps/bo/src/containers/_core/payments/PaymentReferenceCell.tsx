import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TABLE_CELL_LINE_GAP } from '@/constants/_core/ui/list.constants';
import { FONT_FAMILY_MONO } from '@/constants/_core/ui/ui.constants';
import { IPayment } from '@/types/_core/payment.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getPaymentReference } from '@/utils/_core/payment.utils';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${TABLE_CELL_LINE_GAP}px`,
    minWidth: 0,
  },
  /*
   * a reference is copied into an operator's own back-office or pasted into a ticket, so it is set
   * in a monospaced face: a proportional one makes the reader compare it character by character
   */
  reference: {
    fontFamily: FONT_FAMILY_MONO,
  },
};

type Props = {
  payment: IPayment;
};

/**
 * What identifies one movement of money and when it happened — the pair an operator quotes when
 * they take a payment up with the mobile money provider, so they are read together as one cell
 * rather than as a reference at one end of the row and a date at the other.
 */
const PaymentReferenceCell = ({ payment }: Props) => (
  <Box css={classes.root}>
    <Typography noWrap css={classes.reference} variant="subtitle1">
      {getPaymentReference(payment)}
    </Typography>
    <Typography noWrap variant="body2">{displayDate(payment.createdAt, true, true)}</Typography>
  </Box>
);

export default PaymentReferenceCell;
