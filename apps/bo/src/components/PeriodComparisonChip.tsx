import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import {
  DELTA_CHIP_BORDER_OPACITY, DELTA_CHIP_HEIGHT, DELTA_CHIP_PADDING_X,
} from '@/constants/_core/ui/chart.constants';
import { CHIP_FONT_SIZE } from '@/constants/_core/ui/ui.constants';
import { INullablePeriodComparison, StatisticsComparisonFormat } from '@/types/_core/statistics.type';
import { formatChartNumber, formatChartPercent } from '@/utils/_core/chart.utils';
import { getComparisonChange } from '@/utils/_core/statistics.utils';
import { getAccentTextColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

type Tone = 'good' | 'bad' | 'neutral';

const getToneStyles = (theme: Theme, tone: Tone) => {
  if (tone === 'neutral') {
    const tokens = getDesignTokens(theme);

    return {
      color: tokens.textSecondary,
      backgroundColor: tokens.surfaceSecondary,
      borderColor: tokens.border,
    };
  }

  const main = tone === 'good' ? theme.palette.primary.main : theme.palette.error.main;

  return {
    // the text takes the darker step of its tone: the main one is too light to read on its own tint
    color: tone === 'good' ? getAccentTextColor(theme) : theme.palette.error.dark,
    backgroundColor: getTintedBackground(theme, main),
    borderColor: alpha(main, DELTA_CHIP_BORDER_OPACITY),
  };
};

const classes = {
  chip: (tone: Tone) => (theme: Theme) => ({
    display: 'inline-flex',
    alignItems: 'center',
    height: DELTA_CHIP_HEIGHT,
    padding: `0 ${DELTA_CHIP_PADDING_X}px`,
    fontSize: CHIP_FONT_SIZE,
    fontWeight: theme.typography.fontWeightMedium,
    border: '1px solid',
    borderRadius: DELTA_CHIP_HEIGHT / 2,
    whiteSpace: 'nowrap' as const,
    ...getToneStyles(theme, tone),
  }),
};

const getSign = (change: number): string => {
  if (change > 0) return '+';
  if (change < 0) return '-';

  return '';
};

type Props = {
  comparison: INullablePeriodComparison | null;
  // a relative change for a count or an amount, a plain difference for a rate or a duration
  format?: StatisticsComparisonFormat;
  // the unit a difference is stated in — "pt" for a rate, "min" for a delay
  unit?: string;
  // false for what the platform wants to see fall: failures, cancellations, delays
  higherIsBetter?: boolean;
  // writes out what the change is measured against, where no tooltip is there to say it
  withContext?: boolean;
};

/**
 * How a figure moved against the previous period of the same length. The tint says whether that is
 * good news rather than which way it went: a failure rate that fell is drawn in the brand tone, a
 * cancellation count that rose in the error one.
 */
const PeriodComparisonChip = ({
  comparison, format = 'percent', unit = '', higherIsBetter = true, withContext = false,
}: Props) => {
  const { t } = useTranslation(['statistics']);

  if (!comparison) return null;
  // a figure with nothing to measure over the period has no change to state either
  if (comparison.currentTotal === null) return null;

  const change = getComparisonChange(comparison, format);

  if (change === null) {
    return <span css={classes.chip('neutral')}>{t('statistics:newActivity')}</span>;
  }

  let tone: Tone = 'neutral';

  if (change !== 0) {
    tone = (change > 0) === higherIsBetter ? 'good' : 'bad';
  }

  const magnitude = format === 'percent'
    ? formatChartPercent(Math.abs(change))
    : `${formatChartNumber(Math.abs(change))} ${unit}`.trim();
  const figure = `${getSign(change)}${magnitude}`;

  if (withContext) {
    return <span css={classes.chip(tone)}>{`${figure} ${t('statistics:vsPreviousPeriod')}`}</span>;
  }

  return (
    <Tooltip title={t('statistics:vsPreviousPeriod')}>
      <span css={classes.chip(tone)}>{figure}</span>
    </Tooltip>
  );
};

export default PeriodComparisonChip;
