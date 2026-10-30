import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { Theme } from '@mui/material/styles';

import {
  HEATMAP_CELL_HEIGHT, HEATMAP_CELL_RADIUS, HEATMAP_DAY_LABEL_WIDTH, HEATMAP_GAP,
  HEATMAP_MIN_OPACITY,
} from '@/constants/_core/ui/chart.constants';
import { FONT_SIZE_OVERLINE } from '@/constants/_core/ui/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

export type HeatmapCell = {
  day: number;
  hour: number;
  value: number;
};

const HOURS_PER_DAY = 24;
const HOUR_LABEL_DIGITS = 2;
// on a phone every other hour label is dropped: twelve of them do not fit under a 300px grid
const COMPACT_HOUR_LABEL_STEP = 2;

const formatHour = (hour: number): string => String(hour).padStart(HOUR_LABEL_DIGITS, '0');

const classes = {
  chart: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: HEATMAP_GAP,
    minWidth: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: HEATMAP_GAP,
  },
  axisLabel: (theme: Theme) => ({
    fontSize: FONT_SIZE_OVERLINE,
    color: getDesignTokens(theme).textMuted,
  }),
  dayLabel: { width: HEATMAP_DAY_LABEL_WIDTH, flex: 'none' },
  grid: (columns: number) => ({
    flex: 1,
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: HEATMAP_GAP,
  }),
  hourLabel: { textAlign: 'center' as const },
  cell: (theme: Theme, value: number, intensity: number) => {
    const tokens = getDesignTokens(theme);

    return {
      height: HEATMAP_CELL_HEIGHT,
      borderRadius: HEATMAP_CELL_RADIUS,
      border: `1px solid ${tokens.borderLight}`,
      // an empty slot keeps the recessed ground: a faint tint on it would read as a little activity
      backgroundColor: value === 0
        ? tokens.surfaceSecondary
        : alpha(theme.palette.primary.main, HEATMAP_MIN_OPACITY + (intensity * (1 - HEATMAP_MIN_OPACITY))),
    };
  },
};

type Props = {
  data: HeatmapCell[];
  // one label per day, in the order of the `day` index the cells carry
  dayLabels: string[];
  // how many hours one column adds up — 1 draws the day hour by hour
  hoursPerColumn?: number;
};

/**
 * When something happens across the week: a row per day, a column per slot of the day, each cell
 * tinted by how much falls in it relative to the busiest cell. The exact figure is in the tooltip —
 * the chart is read for the shape the peaks draw, not cell by cell.
 */
const HeatmapChart = ({ data, dayLabels, hoursPerColumn = 1 }: Props) => {
  const isCompact = useBreakpoint('sm');

  const columnStarts = Array.from(
    { length: Math.ceil(HOURS_PER_DAY / hoursPerColumn) },
    (_, column) => column * hoursPerColumn
  );

  const valueByCell = new Map<string, number>();

  data.forEach((cell) => {
    const key = `${cell.day}-${Math.floor(cell.hour / hoursPerColumn)}`;

    valueByCell.set(key, (valueByCell.get(key) ?? 0) + cell.value);
  });

  const maxValue = Math.max(1, ...valueByCell.values());

  return (
    <div css={classes.chart}>
      {dayLabels.map((dayLabel, day) => (
        <div css={classes.row} key={dayLabel}>
          <Typography component="span" css={[classes.axisLabel, classes.dayLabel]}>{dayLabel}</Typography>
          <div css={classes.grid(columnStarts.length)}>
            {columnStarts.map((start, column) => {
              const value = valueByCell.get(`${day}-${column}`) ?? 0;
              const slot = `${formatHour(start)}h–${formatHour(start + hoursPerColumn)}h`;

              return (
                /*
                 * the tooltip names the cell it wraps (`aria-label`), which only a role that takes a
                 * name may carry: a cell states one figure through its shade, so it reads as an image
                 */
                <Tooltip key={start} title={`${dayLabel} ${slot} · ${value}`}>
                  <div css={(theme: Theme) => classes.cell(theme, value, value / maxValue)} role="img" />
                </Tooltip>
              );
            })}
          </div>
        </div>
      ))}
      <div css={classes.row}>
        <span aria-hidden css={classes.dayLabel} />
        <div css={classes.grid(columnStarts.length)}>
          {columnStarts.map((start, column) => (
            <Typography component="span" css={[classes.axisLabel, classes.hourLabel]} key={start}>
              {isCompact && column % COMPACT_HOUR_LABEL_STEP ? '' : formatHour(start)}
            </Typography>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
