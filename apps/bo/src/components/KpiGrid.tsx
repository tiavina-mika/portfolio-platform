import Box from '@mui/material/Box';

import type { ReactNode } from 'react';

import {
  KPI_GRID_COLUMNS, KPI_GRID_FOLDED_COLUMNS, KPI_GRID_GAP,
} from '@/constants/_core/ui/chart.constants';

type Props = {
  children: ReactNode;
  // how many figures stand on one row on a wide screen — the row halves, then stacks, under it
  columns?: number;
};

/**
 * The row of figures a page opens on. Every card in it takes the same width whatever number it
 * holds, so the row is read across rather than card by card, and it folds by halving before it
 * stacks — two figures side by side still compare, a single column of them is a list.
 */
const KpiGrid = ({
  children, columns = KPI_GRID_COLUMNS,
}: Props) => (
  <Box
    sx={{
      display: 'grid',
      gap: `${KPI_GRID_GAP}px`,
      gridTemplateColumns: {
        xs: '1fr',
        sm: `repeat(${Math.min(columns, KPI_GRID_FOLDED_COLUMNS)}, 1fr)`,
        md: `repeat(${columns}, 1fr)`,
      },
    }}
  >
    {children}
  </Box>
);

export default KpiGrid;
