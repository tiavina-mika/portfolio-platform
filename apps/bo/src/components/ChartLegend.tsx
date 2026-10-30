import Typography from '@mui/material/Typography';

import {
  CHART_LEGEND_GAP_X, CHART_LEGEND_GAP_Y, CHART_LEGEND_ITEM_GAP, CHART_LEGEND_SWATCH_RADIUS,
  CHART_LEGEND_SWATCH_SIZE,
} from '@/constants/_core/ui/chart.constants';
import { FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';

export type ChartLegendItem = {
  label: string;
  color: string;
};

const classes = {
  legend: (inset: number) => ({
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: `${CHART_LEGEND_GAP_Y}px ${CHART_LEGEND_GAP_X}px`,
    margin: 0,
    padding: 0,
    paddingLeft: inset,
    listStyle: 'none',
  }),
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: CHART_LEGEND_ITEM_GAP,
  },
  swatch: (color: string) => ({
    width: CHART_LEGEND_SWATCH_SIZE,
    height: CHART_LEGEND_SWATCH_SIZE,
    borderRadius: CHART_LEGEND_SWATCH_RADIUS,
    backgroundColor: color,
    flexShrink: 0,
  }),
  label: { fontSize: FONT_SIZE_OVERLINE },
};

type Props = {
  items: ChartLegendItem[];
  // how far the legend is pushed right — a plot's y-axis gutter, so the key starts where the plot does
  inset?: number;
};

/**
 * The key of a chart, drawn under the plot rather than over it: a plot twelve buckets wide has no
 * corner free of data, and a key standing on the series hides the very points it names.
 */
const ChartLegend = ({ items, inset = 0 }: Props) => (
  <ul css={classes.legend(inset)}>
    {items.map((item) => (
      <li css={classes.item} key={item.label}>
        <span aria-hidden css={classes.swatch(item.color)} />
        <Typography component="span" css={classes.label} variant="caption">{item.label}</Typography>
      </li>
    ))}
  </ul>
);

export default ChartLegend;
