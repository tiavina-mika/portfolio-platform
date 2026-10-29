import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';

import PeriodCompareToggle from '@/components/PeriodCompareToggle';
import PeriodSelector from '@/components/PeriodSelector';
import {
  STATISTICS_STICKY_OFFSET, STATISTICS_STICKY_Z_INDEX, STATISTICS_TOOLBAR_GAP,
  STATISTICS_TOOLBAR_GAP_MOBILE, STATISTICS_TOOLBAR_PADDING_X, STATISTICS_TOOLBAR_PADDING_X_COMPACT,
  STATISTICS_TOOLBAR_PADDING_Y, STATISTICS_TOOLBAR_PADDING_Y_COMPACT,
} from '@/constants/_core/ui/chart.constants';
import { CONTENT_PADDING_X_MOBILE } from '@/constants/_core/ui/page.constants';
import { RADIUS_LG, TOOLBAR_HEIGHT } from '@/constants/_core/ui/ui.constants';
import { StatisticsPeriod } from '@/types/_core/statistics.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  title: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: STATISTICS_TOOLBAR_GAP,
  },
  bar: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: STATISTICS_TOOLBAR_GAP,
      padding: `${STATISTICS_TOOLBAR_PADDING_Y}px ${STATISTICS_TOOLBAR_PADDING_X}px`,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadow,
      /*
       * pinned under the app bar on a wide screen only, where the charts under it run a dozen cards
       * long: on a tablet or a phone a pinned bar would take a fifth of the screen off every chart
       */
      [theme.breakpoints.up('lg')]: {
        position: 'sticky' as const,
        top: TOOLBAR_HEIGHT + STATISTICS_STICKY_OFFSET,
        zIndex: STATISTICS_STICKY_Z_INDEX,
      },
      [theme.breakpoints.down('lg')]: {
        padding: `${STATISTICS_TOOLBAR_PADDING_Y_COMPACT}px ${STATISTICS_TOOLBAR_PADDING_X_COMPACT}px`,
        boxShadow: 'none',
      },
      // on a phone the period switch drops under the title and takes the width, edge to edge like the cards
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column' as const,
        alignItems: 'stretch',
        gap: STATISTICS_TOOLBAR_GAP_MOBILE,
        marginInline: -CONTENT_PADDING_X_MOBILE,
        padding: STATISTICS_TOOLBAR_PADDING_Y,
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
      },
    };
  },
};

type Props = {
  title: string;
  period?: StatisticsPeriod;
  isComparing?: boolean;
  // the overview always reads the last twelve months, so it has no period to switch
  withPeriod?: boolean;
};

/** The band naming the open view, with the period its figures are read over. */
const StatisticsToolbar = ({
  title, period, isComparing, withPeriod = false,
}: Props) => (
  <div css={classes.bar}>
    <div css={classes.title}>
      <Typography component="h2" variant="h3">{title}</Typography>
      <PeriodCompareToggle isComparing={isComparing} />
    </div>
    {withPeriod && <PeriodSelector isComparing={isComparing} period={period} />}
  </div>
);

export default StatisticsToolbar;
