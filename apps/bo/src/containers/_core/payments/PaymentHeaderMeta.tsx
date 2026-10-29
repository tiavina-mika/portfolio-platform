import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Link as RouterLink } from '@tanstack/react-router';
import { Fragment, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PAGE_HEAD_META_GAP } from '@/constants/_core/ui/page.constants';
import { IPayment } from '@/types/_core/payment.type';
import { displayDate } from '@/utils/_core/date.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getPaymentCounterparty, getPaymentServiceLabel } from '@/utils/_core/payment.utils';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${PAGE_HEAD_META_GAP}px`,
  },
  separator: {
    color: 'text.disabled',
  },
  nowrap: {
    whiteSpace: 'nowrap' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  person: {
    fontWeight: 500,
  },
};

type Props = {
  payment: IPayment;
};

/**
 * The line under a payment's heading: the operator it went through, when it last moved, and the
 * person on the other side of the platform with the account the money reached them at — what
 * support asks for first when a passenger or a driver calls about it.
 */
const PaymentHeaderMeta = ({ payment }: Props) => {
  const { t } = useTranslation(['user']);

  const counterparty = getPaymentCounterparty(payment);
  const counterpartyId = counterparty.user?.id ?? counterparty.user?.objectId;
  const counterpartyName = getUserFullName(counterparty.user);
  const refundOfId = payment.refundOf?.objectId;

  const facts: ReactNode[] = [
    getPaymentServiceLabel(payment.service) || undefined,
    <Box component="span" css={classes.nowrap} key="date">{displayDate(payment.updatedAt, true)}</Box>,
    counterpartyName && counterpartyId
      ? (
        <Link
          component={RouterLink as any}
          key="person"
          params={{ id: counterpartyId }}
          sx={classes.person}
          to={`${PATH_NAMES.users}/$id`}
        >
          {counterpartyName}
        </Link>
      )
      : counterpartyName,
    counterparty.phone
      ? <Box component="span" css={classes.nowrap} key="phone">{getFullPhoneNumber(counterparty.phone)}</Box>
      : undefined,
    refundOfId
      ? (
        <Box component="span" css={classes.nowrap} key="refundOf">
          {t('user:payments.refundsPayment')}
          {' '}
          <Link component={RouterLink as any} params={{ id: refundOfId }} to={`${PATH_NAMES.payments}/$id`}>
            {refundOfId}
          </Link>
        </Box>
      )
      : undefined,
  ].filter(Boolean);

  return (
    <Box component="span" css={classes.root}>
      {facts.map((fact, index) => (
        <Fragment key={index}>
          {index > 0 && <Box aria-hidden component="span" sx={classes.separator}>·</Box>}
          {fact}
        </Fragment>
      ))}
    </Box>
  );
};

export default PaymentHeaderMeta;
