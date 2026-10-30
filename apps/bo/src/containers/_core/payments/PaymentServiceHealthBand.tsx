import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';

import StatusDot from '@/components/StatusDot';
import { PAYMENT_SERVICE_BAR_STATUSES } from '@/constants/_core/payment.constants';
import {
  HEALTH_BAND_CHANNEL_GAP, HEALTH_BAND_PADDING_X, HEALTH_BAND_PADDING_Y, HEALTH_BAND_TOTALS_GAP,
  HEALTH_BAND_TOTALS_WIDTH, HEALTH_BAR_HEIGHT, HEALTH_BAR_RADIUS,
} from '@/constants/_core/ui/chart.constants';
import { CARD_STAT_SKELETON_VALUE_HEIGHT } from '@/constants/_core/ui/page.constants';
import { getPaymentLedgerSummarySelector } from '@/redux/reducers/_core/payment.reducer';
import { IPaymentServiceHealth } from '@/types/_core/payment.type';
import {
  getPaymentServiceHealthColor, getPaymentServiceLabel, getPaymentServiceSuccessRate,
  getPaymentStatusColor,
} from '@/utils/_core/payment.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { formatPriceWithCurrency } from '@/utils/_core/utils';

const HEALTH_BAND_LINE_GAP = 8;
const HEALTH_BAND_SKELETON_CHANNELS = [0, 1, 2];

const classes = {
  band: {
    display: 'flex',
    alignItems: 'stretch',
    /*
     * the strip wraps rather than scrolling: under a certain width the blocks stop fitting on one
     * line, and a figure the reader has to scroll sideways to reach is a figure they never see
     */
    flexWrap: 'wrap' as const,
    overflow: 'hidden',
  },
  totals: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    gap: `${HEALTH_BAND_TOTALS_GAP}px`,
    padding: `${HEALTH_BAND_PADDING_Y}px ${HEALTH_BAND_PADDING_X}px`,
    // fixed rather than sharing the width with the channels: it is read once, not scanned
    flex: `0 0 ${HEALTH_BAND_TOTALS_WIDTH}px`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    borderRight: `1px solid ${getDesignTokens(theme).border}`,
  }),
  channels: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    flexWrap: 'wrap' as const,
  },
  channel: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${HEALTH_BAND_CHANNEL_GAP}px`,
    flex: 1,
    minWidth: 0,
    padding: `${HEALTH_BAND_PADDING_Y}px ${HEALTH_BAND_PADDING_X}px`,
    borderLeft: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  channelLine: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: `${HEALTH_BAND_LINE_GAP}px`,
    minWidth: 0,
  },
  bar: {
    display: 'flex',
    height: HEALTH_BAR_HEIGHT,
    borderRadius: `${HEALTH_BAR_RADIUS}px`,
    overflow: 'hidden',
  },
};

type ServiceHealthBarProps = {
  health: IPaymentServiceHealth;
};

/**
 * The share of one operator's traffic that settled, is still going through, and failed, drawn as
 * one segmented rule. The three shares are what tells a low success rate that is an operator
 * refusing payments from one that is merely slow to confirm them — the same figure in a success
 * rate alone, and two completely different things to do about it.
 */
const ServiceHealthBar = ({ health }: ServiceHealthBarProps) => {
  const theme = useTheme();
  const tokens = getDesignTokens(theme);

  const counts: Record<string, number> = {
    success: health.success,
    pending: health.pending,
    failed: health.failed,
  };

  const share = (count: number): string => (health.total > 0
    ? `${(count / health.total) * 100}%`
    : '0%');

  return (
    <Box css={classes.bar} sx={{ backgroundColor: tokens.surfaceSecondary }}>
      {PAYMENT_SERVICE_BAR_STATUSES.map((status) => {
        const color = getPaymentStatusColor(status);

        return (
          <Box
            component="span"
            key={status}
            sx={{
              width: share(counts[status] ?? 0),
              backgroundColor: color === 'default'
                ? tokens.textMuted
                : theme.palette[color][color === 'warning'
                  ? 'dark'
                  : 'main'],
            }}
          />
        );
      })}
    </Box>
  );
};

const PaymentServiceHealthBandSkeleton = () => (
  <Card css={classes.band}>
    <Box css={classes.totals}>
      <Skeleton variant="text" width="60%" />
      <Skeleton height={CARD_STAT_SKELETON_VALUE_HEIGHT} variant="text" width="80%" />
    </Box>
    <Box css={classes.channels}>
      {HEALTH_BAND_SKELETON_CHANNELS.map((index: number) => (
        <Box css={classes.channel} key={index}>
          <Skeleton variant="text" width="55%" />
          <Skeleton height={HEALTH_BAR_HEIGHT} variant="rectangular" />
          <Skeleton variant="text" width="70%" />
        </Box>
      ))}
    </Box>
  </Card>
);

/**
 * What the ledger is worth on the left, and how each mobile money operator is behaving on the
 * right — one strip rather than a row of counter cards, and half as tall as one. The two halves
 * belong on the same line: the amount that did not go through is only actionable once you know
 * which operator is holding it.
 *
 * The amount per operator is labelled "succeeded" and not "collected" on purpose — it sums both
 * directions, what passengers paid in and what was paid out to drivers through that operator.
 */
const PaymentServiceHealthBand = () => {
  const summary = useSelector(getPaymentLedgerSummarySelector);
  const { t } = useTranslation(['user']);

  if (!summary) return <PaymentServiceHealthBandSkeleton />;

  const blockedLabel = [
    t('user:payments.blockedAmount', { amount: formatPriceWithCurrency(summary.failedAmount, summary.currency) }),
    t('user:payments.failuresWithCount', { count: summary.byStatus.failed ?? 0 }),
  ].join(' · ');

  return (
    <Card css={classes.band}>
      <Box css={classes.totals}>
        <Typography component="p" variant="caption">{t('user:payments.netCollected')}</Typography>
        <Typography component="p" variant="h2">
          {formatPriceWithCurrency(summary.netAmount, summary.currency)}
        </Typography>
        <Typography component="p" sx={{ color: 'error.main' }} variant="caption">
          {blockedLabel}
        </Typography>
      </Box>
      <Box css={classes.channels}>
        {summary.byService.map((health: IPaymentServiceHealth) => (
          <Box css={classes.channel} key={health.service}>
            <Box css={classes.channelLine}>
              <Typography noWrap component="span" variant="subtitle1">
                <StatusDot
                  color={getPaymentServiceHealthColor(health)}
                  label={getPaymentServiceLabel(health.service)}
                />
              </Typography>
              <Typography component="span" variant="subtitle2">
                {t('user:payments.successRate', { value: getPaymentServiceSuccessRate(health) })}
              </Typography>
            </Box>
            <ServiceHealthBar health={health} />
            <Box css={classes.channelLine}>
              <Typography noWrap component="span" variant="body2">
                {health.total > 0
                  ? `${formatPriceWithCurrency(health.successAmount, summary.currency)} ${t('user:payments.succeeded')}`
                  : t('user:payments.noOperatorTraffic')}
              </Typography>
              {/*
                * what is still to be sent again is drawn in the error tone only when there is
                * something to send — a zero in red says an operator is failing when it is not
                */}
              <Typography
                noWrap
                component="span"
                variant="body2"
                sx={{
                  color: health.failed > 0
                    ? 'error.main'
                    : 'text.secondary',
                }}
              >
                {t('user:payments.toRetry', { count: health.failed })}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default PaymentServiceHealthBand;
