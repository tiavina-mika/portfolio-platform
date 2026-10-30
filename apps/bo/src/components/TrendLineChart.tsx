import { useTheme } from '@mui/material/styles';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { LineChart } from '@mui/x-charts/LineChart';
import omit from 'lodash/omit';
import { useTranslation } from 'react-i18next';


import ChartLegend from '@/components/ChartLegend';
import {
  CHART_GAP, CHART_HEIGHT, CHART_MARGIN_RIGHT, CHART_MARGIN_TOP, CHART_PREVIOUS_LINE_DASH,
  CHART_PREVIOUS_LINE_OPACITY, CHART_PREVIOUS_LINE_WIDTH, CHART_PREVIOUS_SERIES_ID_PREFIX,
  CHART_REFERENCE_LINE_DASH, CHART_Y_AXIS_WIDTH, CHART_Y_TICK_COUNT,
} from '@/constants/_core/ui/chart.constants';
import { getChartStyles } from '@/utils/_core/chart.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

export type TrendLineChartSeries = {
  data: (number | null)[];
  label: string;
  color: string;
  // the same measure one period earlier — drawn behind the series when `showPrevious` is on
  previousData?: (number | null)[];
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
  series: TrendLineChartSeries[];
  yAxisMin?: number;
  yAxisMax?: number;
  /** horizontal target line — makes the curve answer "is this bad?", not only "is this rising?" */
  referenceValue?: number;
  referenceLabel?: string;
  // how a figure is written on the axis and in the tooltip: with its unit, or as a compact amount
  valueFormatter?: (value: number) => string;
  // overlays each series' previous period, dashed, and adds it to the key
  showPrevious?: boolean;
};

const TrendLineChart = ({
  height = CHART_HEIGHT, labels, series, yAxisMin, yAxisMax, referenceValue, referenceLabel,
  valueFormatter, showPrevious = false,
}: Props) => {
  const theme = useTheme();
  const { t } = useTranslation(['statistics']);

  const formatValue = (value: number | null): string => {
    if (value === null) return '';

    return valueFormatter ? valueFormatter(value) : String(value);
  };

  const previousSeries = showPrevious
    ? series.flatMap((oneSeries, index) => (
      oneSeries.previousData
        ? [{
          id: `${CHART_PREVIOUS_SERIES_ID_PREFIX}${index}`,
          data: oneSeries.previousData,
          label: oneSeries.label,
          color: oneSeries.color,
        }]
        : []
    ))
    : [];
  const legendItems = previousSeries.length > 0
    ? [...series, { label: t('statistics:previousPeriod'), color: getDesignTokens(theme).textDisabled }]
    : series;

  return (
    <div css={classes.chart}>
      <LineChart
        hideLegend
        grid={{ horizontal: true }}
        height={height}
        margin={{ top: CHART_MARGIN_TOP, right: CHART_MARGIN_RIGHT, bottom: 0, left: 0 }}
        xAxis={[{ data: labels, scaleType: 'point', disableLine: true, disableTicks: true }]}
        // a bucket with no data is a gap in the measure, not a zero — the line is drawn across it
        series={[...previousSeries, ...series.map((oneSeries) => omit(oneSeries, 'previousData'))].map(
          (oneSeries) => ({
            ...oneSeries, connectNulls: true, showMark: false, valueFormatter: formatValue,
          })
        )}
        sx={{
          ...getChartStyles(theme),
          [`& [class*="MuiLineElement-series-${CHART_PREVIOUS_SERIES_ID_PREFIX}"]`]: {
            strokeDasharray: CHART_PREVIOUS_LINE_DASH,
            strokeWidth: CHART_PREVIOUS_LINE_WIDTH,
            opacity: CHART_PREVIOUS_LINE_OPACITY,
          },
        }}
        yAxis={[{
          min: yAxisMin,
          max: yAxisMax,
          width: CHART_Y_AXIS_WIDTH,
          tickNumber: CHART_Y_TICK_COUNT,
          disableLine: true,
          disableTicks: true,
          valueFormatter: formatValue,
        }]}
      >
        {referenceValue !== undefined && (
          <ChartsReferenceLine
            label={referenceLabel}
            labelAlign="end"
            lineStyle={{ stroke: theme.palette.error.main, strokeDasharray: CHART_REFERENCE_LINE_DASH }}
            y={referenceValue}
          />
        )}
      </LineChart>
      <ChartLegend inset={CHART_Y_AXIS_WIDTH} items={legendItems} />
    </div>
  );
};

export default TrendLineChart;
