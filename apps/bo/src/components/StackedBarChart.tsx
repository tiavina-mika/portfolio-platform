import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';

import ChartLegend from '@/components/ChartLegend';
import {
  CHART_BAR_CATEGORY_GAP_RATIO_GROUPED, CHART_BAR_CATEGORY_GAP_RATIO_STACKED, CHART_BAR_GAP_RATIO,
  CHART_BAR_RADIUS, CHART_GAP, CHART_HEIGHT, CHART_MARGIN_RIGHT, CHART_MARGIN_TOP,
  CHART_Y_AXIS_WIDTH, CHART_Y_TICK_COUNT,
} from '@/constants/_core/ui/chart.constants';
import { getChartStyles } from '@/utils/_core/chart.utils';

export type StackedBarChartSeries = {
  // null leaves the bar out, for an average with nothing to measure in that bucket
  data: (number | null)[];
  label: string;
  color: string;
};

const classes = {
  chart: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: CHART_GAP,
    minWidth: 0,
  },
};

type Props = {
  height?: number;
  labels: string[];
  series: StackedBarChartSeries[];
  /*
   * parts of one whole stand on top of each other; two measures compared with each other (rides
   * published against requests accepted) stand side by side, since a stack would add them up
   */
  stacked?: boolean;
  // how a figure is written on the axis and in the tooltip
  valueFormatter?: (value: number) => string;
};

const StackedBarChart = ({
  height = CHART_HEIGHT, labels, series, stacked = true, valueFormatter,
}: Props) => {
  const theme = useTheme();

  const formatValue = (value: number | null): string => {
    if (value === null) return '';

    return valueFormatter ? valueFormatter(value) : String(value);
  };

  return (
    <div css={classes.chart}>
      <BarChart
        hideLegend
        borderRadius={CHART_BAR_RADIUS}
        grid={{ horizontal: true }}
        height={height}
        margin={{ top: CHART_MARGIN_TOP, right: CHART_MARGIN_RIGHT, bottom: 0, left: 0 }}
        sx={getChartStyles(theme)}
        series={series.map((oneSeries) => ({
          ...oneSeries,
          stack: stacked ? 'total' : undefined,
          valueFormatter: formatValue,
        }))}
        xAxis={[{
          data: labels,
          scaleType: 'band',
          categoryGapRatio: stacked
            ? CHART_BAR_CATEGORY_GAP_RATIO_STACKED
            : CHART_BAR_CATEGORY_GAP_RATIO_GROUPED,
          barGapRatio: CHART_BAR_GAP_RATIO,
          disableLine: true,
          disableTicks: true,
        }]}
        yAxis={[{
          width: CHART_Y_AXIS_WIDTH,
          tickNumber: CHART_Y_TICK_COUNT,
          disableLine: true,
          disableTicks: true,
          valueFormatter: formatValue,
        }]}
      />
      <ChartLegend inset={CHART_Y_AXIS_WIDTH} items={series} />
    </div>
  );
};

export default StackedBarChart;
