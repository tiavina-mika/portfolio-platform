import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import Link from '@/components/Link';
import {
  INBOX_CONTEXT_CARD_PADDING, INBOX_CONTEXT_ROW_GAP, INBOX_CONTEXT_ROW_PADDING_Y, INBOX_CONTEXT_TITLE_GAP,
} from '@/constants/_core/ui/inbox.constants';
import { IContact } from '@/types/_core/contact.type';
import { IAddress } from '@/types/_core/user.type';
import { displayDate, getParseDateValue } from '@/utils/_core/date.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const classes = {
  card: { padding: `${INBOX_CONTEXT_CARD_PADDING}px` },
  title: { display: 'block', marginBottom: `${INBOX_CONTEXT_TITLE_GAP}px` },
  row: (theme: Theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: `${INBOX_CONTEXT_ROW_GAP}px`,
    padding: `${INBOX_CONTEXT_ROW_PADDING_Y}px 0`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  value: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    minWidth: 0,
    textAlign: 'right' as const,
  },
};

type Props = {
  contact: IContact;
};

/** A place named by its town, or by its name when the address has no town. */
const getPlaceLabel = (address?: IAddress): string => address?.city || address?.name || '';

/**
 * The ride and the payment the requester attached to the request, each one a link to its own page.
 * They were checked against the requester when the ticket was filed, so an agent can act on them
 * without asking which ride was meant. The booking and the person reported sit with the other facts
 * of the ticket.
 */
const ContactObjectsCard = ({ contact }: Props) => {
  const { t } = useTranslation(['user']);
  const { ride, payment } = contact;

  if (!ride && !payment) return null;

  const renderRow = (label: string, value: ReactNode, sub?: ReactNode) => (
    <Box css={classes.row} key={label}>
      <Typography variant="caption">{label}</Typography>
      <Box css={classes.value}>
        <Typography sx={{ fontWeight: 500 }} variant="body2">{value}</Typography>
        {sub}
      </Box>
    </Box>
  );

  return (
    <Card css={classes.card}>
      <Typography css={classes.title} variant="overline">
        {t('user:contacts.objects.title')}
      </Typography>

      {ride && renderRow(
        t('user:contacts.objects.ride'),
        <Link params={{ id: ride.objectId }} to={`${PATH_NAMES.rides}/$id`}>
          {`${getPlaceLabel(ride.departure)} → ${getPlaceLabel(ride.destination)}`}
        </Link>,
        ride.date && <Typography variant="caption">{displayDate(getParseDateValue(ride.date))}</Typography>
      )}

      {payment && renderRow(
        t('user:contacts.objects.payment'),
        <Link params={{ id: payment.objectId }} to={`${PATH_NAMES.payments}/$id`}>
          {formatPriceWithCurrency(payment.amount, payment.currency)}
        </Link>
      )}

    </Card>
  );
};

export default ContactObjectsCard;
