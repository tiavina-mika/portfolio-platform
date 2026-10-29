import { Box, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { STATUS_DOT_GAP, STATUS_DOT_SIZE } from '@/constants/_core/ui/ui.constants';
import { getStatusSolidColor, StatusTone } from '@/utils/_core/theme/styles.utils';

export type StatusDotColor = StatusTone;

type Props = {
  label: ReactNode;
  color?: StatusDotColor;
};

/**
 * Status shown as a tinted dot followed by its label — the dense-table counterpart of a status
 * chip. A column of pills turns into a wall of color once a table shows twenty rows at a time,
 * whereas the dot carries the same state in the width of a bullet and leaves the label reading as
 * ordinary cell text.
 */
const StatusDot = ({
  label, color = 'default',
}: Props) => {
  const theme = useTheme();

  /*
   * the neutral state has no palette color of its own, and warning's `main` is a bright amber that
   * disappears at 6px — both fall back the same way the tinted chips do
   */
  const dotColor = getStatusSolidColor(theme, color);

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${STATUS_DOT_GAP}px`,
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        component="span"
        sx={{
          flexShrink: 0,
          width: STATUS_DOT_SIZE,
          height: STATUS_DOT_SIZE,
          borderRadius: '50%',
          backgroundColor: dotColor,
        }}
      />
      {label}
    </Box>
  );
};

export default StatusDot;
