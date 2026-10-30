import type { Theme } from '@mui/material/styles';

import i18n from '@/config/i18n';
import { FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const PERCENT = 100;
const DEFAULT_FRACTION_DIGITS = 1;

/**
 * A figure written the way the reader's language writes it, with at most one decimal — "14,2" in
 * French, where "14.2" reads as a thousands separator gone wrong.
 */
export const formatChartNumber = (value: number, maximumFractionDigits = DEFAULT_FRACTION_DIGITS): string => (
  new Intl.NumberFormat(i18n.language, { maximumFractionDigits }).format(value)
);

/**
 * An axis figure for a large amount — "18,5 M" rather than "18 500 000": an axis gutter holds a few
 * characters, and at that scale the magnitude is what is read, not the last thousand.
 */
export const formatCompactChartNumber = (value: number): string => (
  new Intl.NumberFormat(i18n.language, {
    notation: 'compact',
    maximumFractionDigits: DEFAULT_FRACTION_DIGITS,
  }).format(value)
);

/**
 * A percentage (0-100) written the way the reader's language writes one — "14,2 %" in French,
 * "14.2%" in English — rather than a figure with a hardcoded sign glued to it.
 */
export const formatChartPercent = (
  value: number,
  maximumFractionDigits = DEFAULT_FRACTION_DIGITS
): string => (
  new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits }).format(value / PERCENT)
);

// a part's share of the whole as a whole percentage — 0 when there is nothing to share out
export const getShareOfTotal = (value: number, total: number): number => (
  total > 0 ? Math.round((value / total) * PERCENT) : 0
);

/**
 * The tones a chart hands out to parts that carry no meaning of their own (vehicle types, payment
 * operators): the brand tone first, then the palette's other hues, then grey for the long tail. A
 * series that does carry a meaning (a failure rate, a cancellation) picks its tone by name instead.
 */
export const getChartPalette = (theme: Theme): string[] => [
  theme.palette.primary.main,
  theme.palette.info.main,
  theme.palette.warning.main,
  theme.palette.secondary.main,
  theme.palette.success.main,
  theme.palette.error.main,
  getDesignTokens(theme).textDisabled,
];

/**
 * What every chart shares on top of MUI X's own drawing: grid lines in the faint border tone, so
 * they stay behind the series, and axis figures in the muted tone at the smallest type rung.
 */
export const getChartStyles = (theme: Theme) => {
  const tokens = getDesignTokens(theme);

  return {
    '& .MuiChartsGrid-line': { stroke: tokens.borderLight },
    '& .MuiChartsAxis-tickLabel': { fill: tokens.textMuted, fontSize: FONT_SIZE_OVERLINE },
    '& .MuiChartsReferenceLine-label': { fill: theme.palette.error.main, fontSize: FONT_SIZE_OVERLINE },
  };
};
