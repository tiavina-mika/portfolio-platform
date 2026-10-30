import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';

import type { Theme } from '@mui/material/styles';

import {
  CHART_HEIGHT, CHART_LEGEND_SWATCH_RADIUS, CHART_LEGEND_SWATCH_SIZE, DONUT_CHART_GAP,
  DONUT_CHART_INNER_RADIUS, DONUT_CHART_LEGEND_GAP, DONUT_CHART_LEGEND_MIN_WIDTH,
  DONUT_CHART_OUTER_RADIUS, DONUT_CHART_SIZE,
} from '@/constants/_core/ui/chart.constants';
import { FONT_SIZE_BODY } from '@/constants/_core/ui/ui.constants';
import { formatChartPercent, getShareOfTotal } from '@/utils/_core/chart.utils';

export type DonutChartSlice = {
  id: string;
  value: number;
  label: string;
  // required: the legend next to the ring has to draw the very tone the slice is painted in
  color: string;
};

const classes = {
  // the legend drops under the ring rather than squeezing it once the card is too narrow for both
  chart: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: DONUT_CHART_GAP,
    minHeight: CHART_HEIGHT,
  },
  ring: { flex: 'none' },
  legend: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: DONUT_CHART_LEGEND_GAP,
    minWidth: DONUT_CHART_LEGEND_MIN_WIDTH,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: DONUT_CHART_LEGEND_GAP,
    fontSize: FONT_SIZE_BODY,
  },
  swatch: (color: string) => ({
    width: CHART_LEGEND_SWATCH_SIZE,
    height: CHART_LEGEND_SWATCH_SIZE,
    borderRadius: CHART_LEGEND_SWATCH_RADIUS,
    backgroundColor: color,
    flex: 'none',
  }),
  name: (theme: Theme) => ({ flex: 1, color: theme.palette.text.primary }),
  share: (theme: Theme) => ({
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
  }),
};

type Props = {
  data: DonutChartSlice[];
  size?: number;
};

/**
 * How a whole splits into a few parts: a ring, and next to it the parts with their share of the
 * whole. The shares are written out in the legend rather than on the ring — a label on a slice of
 * five percent has nowhere to sit.
 */
const DonutChart = ({ data, size = DONUT_CHART_SIZE }: Props) => {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  const formatShare = (value: number): string => formatChartPercent(getShareOfTotal(value, total));

  return (
    <div css={classes.chart}>
      <div css={classes.ring}>
        <PieChart
          hideLegend
          height={size}
          margin={0}
          width={size}
          series={[{
            data,
            innerRadius: DONUT_CHART_INNER_RADIUS,
            outerRadius: DONUT_CHART_OUTER_RADIUS,
            valueFormatter: ({ value }) => formatShare(value),
          }]}
        />
      </div>
      <ul css={classes.legend}>
        {data.map((slice) => (
          <li css={classes.item} key={slice.id}>
            <span aria-hidden css={classes.swatch(slice.color)} />
            <Typography component="span" css={classes.name}>{slice.label}</Typography>
            <Typography component="span" css={classes.share}>{formatShare(slice.value)}</Typography>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DonutChart;
