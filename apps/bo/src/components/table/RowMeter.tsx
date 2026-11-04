import Box from '@mui/material/Box';

import { ROW_METER_HEIGHT, ROW_METER_RADIUS, ROW_METER_WIDTH } from '@/constants/_core/ui/list.constants';

const classes = {
  track: {
    display: 'block',
    /*
     * fixed rather than sized by the cell: bars of different lengths in the same column cannot be
     * compared to one another, which is the only thing the bar is there for
     */
    width: ROW_METER_WIDTH,
    height: ROW_METER_HEIGHT,
    borderRadius: `${ROW_METER_RADIUS}px`,
    overflow: 'hidden',
  },
  fill: {
    display: 'block',
    height: '100%',
    borderRadius: `${ROW_METER_RADIUS}px`,
  },
};

type Props = {
  // 0 to 1 — anything above 1 draws a full bar, the figures above it carry "by how much"
  ratio: number;
  color: string;
};

/**
 * A ratio drawn as a hairline bar inside a table row, under the figures that state it. What it
 * buys is scanning: a screen of rows can be read for the ones that are behind without any of their
 * fractions being read, which a column of numbers alone never allows.
 */
const RowMeter = ({
  ratio, color,
}: Props) => (
  <Box component="span" css={classes.track} sx={{ backgroundColor: 'divider' }}>
    <Box
      component="span"
      css={classes.fill}
      sx={{ width: `${Math.min(Math.round(ratio * 100), 100)}%`, backgroundColor: color }}
    />
  </Box>
);

export default RowMeter;
