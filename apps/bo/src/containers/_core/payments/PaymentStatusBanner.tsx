import Alert, { type AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { PaymentStatusEnum } from '@shared/types';
import { Link as RouterLink } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PREVIEW_TOOLBAR_GAP } from '@/constants/_core/ui/page.constants';
import { IPayment } from '@/types/_core/payment.type';
import { displayDate } from '@/utils/_core/date.utils';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import {
  getPaymentAttemptsCount, getPaymentRefundState, isPaymentCollection,
} from '@/utils/_core/payment.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const classes = {
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${PREVIEW_TOOLBAR_GAP}px`,
  },
};

type Banner = {
  severity: AlertColor;
  label: string;
  text: ReactNode;
};

type Props = {
  payment: IPayment;
};

/**
 * What is true of the whole payment before any of its blocks is opened, when there is something to
 * say: that it is still with the operator, why it failed and whether the back-office can do anything
 * about it, what a refund gives back, or that a refund was voided. A settled payment nobody has
 * refunded says nothing — its heading already does.
 */
const PaymentStatusBanner = ({ payment }: Props) => {
  const { t } = useTranslation(['user']);

  const getFailedText = (): string => {
    const attempts = getPaymentAttemptsCount(payment);
    const attemptsLabel = payment.retriedAt
      ? t('user:payments.banner.attemptsWithLast', {
        count: attempts, time: displayDate(payment.retriedAt, true, true),
      })
      : t('user:payments.attemptsWithCount', { count: attempts });

    /*
     * a collection is debited from the passenger's own account and needs their PIN: the operator
     * reading this has to know it is not theirs to relaunch before looking for a button
     */
    return [
      attemptsLabel,
      isPaymentCollection(payment)
        ? t('user:payments.collectionCannotBeRetried')
        : t('user:payments.banner.reasonFromOperator'),
    ].join(' · ');
  };

  /*
   * The operator answers a payment asynchronously, so "pending" is a wait with a shape: the
   * reconciliation job asks again until the deadline, then fails it for good. Saying how far that
   * wait has gone is what keeps an operator from relaunching a payment that is still on its way.
   */
  const getPendingText = (): string => {
    const facts = [t('user:payments.pendingNote')];

    if (payment.checkCount) {
      facts.push(t('user:payments.checksWithCount', { count: payment.checkCount }));
    }

    if (payment.expiresAt) {
      facts.push(t('user:payments.banner.pendingDeadline', {
        date: displayDate(payment.expiresAt, true, true),
      }));
    }

    return facts.join(' · ');
  };

  const getBanner = (): Banner | undefined => {
    switch (payment.status) {
      case PaymentStatusEnum.PENDING:
        return {
          severity: 'info',
          label: t('user:payments.pending'),
          text: getPendingText(),
        };
      case PaymentStatusEnum.FAILED:
        return {
          severity: 'error',
          label: payment.failureReason || t('user:payments.banner.failed'),
          text: getFailedText(),
        };
      default:
        break;
    }

    // a refund names the collection it gives back — the page an operator needs next
    if (payment.refundOf?.objectId) {
      return {
        severity: 'info',
        label: t('user:payments.banner.refund'),
        text: (
          <>
            {t('user:payments.banner.refundOf')}
            {' '}
            <Link
              component={RouterLink as any}
              params={{ id: payment.refundOf.objectId }}
              to={`${PATH_NAMES.payments}/$id`}
            >
              {payment.refundOf.objectId}
            </Link>
          </>
        ),
      };
    }

    const refundState = getPaymentRefundState(payment);

    if (!refundState) return undefined;

    return {
      severity: 'info',
      label: t('user:payments.banner.refund'),
      text: refundState === 'partial'
        ? t('user:payments.alreadyRefundedAmount', {
          refunded: formatPriceWithCurrency(payment.refundedAmount ?? 0, payment.currency),
          total: formatPriceWithCurrency(payment.amount, payment.currency),
        })
        : t('user:payments.alreadyRefunded'),
    };
  };

  const banner = getBanner();

  if (!banner) return null;

  return (
    <Alert icon={false} severity={banner.severity}>
      <Box css={classes.root}>
        <Typography sx={{ fontWeight: 600 }} variant="body2">{banner.label}</Typography>
        <Typography color="text.secondary" component="span" variant="body2">{banner.text}</Typography>
      </Box>
    </Alert>
  );
};

export default PaymentStatusBanner;
