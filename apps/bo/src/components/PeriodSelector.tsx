import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { DEFAULT_STATISTICS_PERIOD, STATISTICS_PERIODS } from '@/constants/_core/statistics.constants';
import {
  SEGMENTED_CONTROL_GAP, SEGMENTED_CONTROL_ITEM_HEIGHT, SEGMENTED_CONTROL_ITEM_PADDING_X,
  SEGMENTED_CONTROL_PADDING, SEGMENTED_CONTROL_SELECTED_OPACITY,
} from '@/constants/_core/ui/chart.constants';
import {
  BUTTON_TOUCH_HEIGHT, FONT_SIZE_META, RADIUS, RADIUS_SM,
} from '@/constants/_core/ui/ui.constants';
import { StatisticsPeriod } from '@/types/_core/statistics.type';
import { getAccentTextColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // on a phone the track takes the width and its options share it, each a full touch target
  track: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'inline-flex',
      flexShrink: 0,
      gap: SEGMENTED_CONTROL_GAP,
      padding: SEGMENTED_CONTROL_PADDING,
      borderRadius: RADIUS,
      border: `1px solid ${tokens.border}`,
      backgroundColor: tokens.surfaceSecondary,
      [theme.breakpoints.down('sm')]: { display: 'flex', width: '100%' },
    };
  },
  option: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      height: SEGMENTED_CONTROL_ITEM_HEIGHT,
      padding: `0 ${SEGMENTED_CONTROL_ITEM_PADDING_X}px`,
      borderRadius: RADIUS_SM,
      fontSize: FONT_SIZE_META,
      fontWeight: theme.typography.fontWeightMedium,
      color: tokens.textSecondary,
      whiteSpace: 'nowrap' as const,
      transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': { color: tokens.text },
      // the picked period is tinted rather than raised: it is a state the page is in, not a pressed button
      '&[aria-checked="true"]': {
        color: getAccentTextColor(theme),
        backgroundColor: alpha(theme.palette.primary.main, SEGMENTED_CONTROL_SELECTED_OPACITY),
      },
      '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
      [theme.breakpoints.down('sm')]: { flex: 1, height: BUTTON_TOUCH_HEIGHT },
    };
  },
};

type Props = {
  period?: StatisticsPeriod;
  // the comparison with the previous period stays on while the period changes
  isComparing?: boolean;
};

/**
 * The period a statistics page is read over, kept in the address (`?period=`) so a view can be
 * reloaded or shared as it is. All four values stay in sight rather than behind a select: seeing
 * the three that were not picked is what tells the reader which window the figures cover.
 */
const PeriodSelector = ({ period, isComparing }: Props) => {
  const { t } = useTranslation(['statistics']);
  const navigate = useNavigate();
  const router = useRouterState();

  const currentPeriod = period ?? DEFAULT_STATISTICS_PERIOD;

  const handleChange = (value: StatisticsPeriod) => (): void => {
    if (value === currentPeriod) return;

    navigate({
      to: router.location.pathname,
      search: isComparing ? { period: value, isComparing } : { period: value },
    });
  };

  return (
    <div aria-label={t('statistics:periodLabel')} css={classes.track} role="radiogroup">
      {STATISTICS_PERIODS.map((value) => (
        <ButtonBase
          aria-checked={value === currentPeriod}
          css={classes.option}
          key={value}
          onClick={handleChange(value)}
          role="radio"
        >
          {t(`statistics:period.${value}`)}
        </ButtonBase>
      ))}
    </div>
  );
};

export default PeriodSelector;
