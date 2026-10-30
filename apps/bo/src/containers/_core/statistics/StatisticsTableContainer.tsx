import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { STATISTICS_TABLE_MIN_WIDTH_MOBILE } from '@/constants/_core/ui/chart.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // a table inside a card is framed by a border of its own rather than by a second card and its shadow
  container: (theme: Theme) => ({
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: RADIUS,
    overflowX: 'auto' as const,
  }),
  // on a phone the columns keep a readable width and the table scrolls sideways inside its frame
  table: (theme: Theme) => ({
    [theme.breakpoints.down('sm')]: { minWidth: STATISTICS_TABLE_MIN_WIDTH_MOBILE },
  }),
};

type Props = {
  children: ReactNode;
};

/** The frame of a short table standing in a statistics card: reasons, suspended users, payouts, documents. */
const StatisticsTableContainer = ({ children }: Props) => (
  <TableContainer css={classes.container}>
    <Table css={classes.table} size="small">
      {children}
    </Table>
  </TableContainer>
);

export default StatisticsTableContainer;
