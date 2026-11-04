import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { type ReactNode } from 'react';

import EmptyData from '@/components/EmptyData';

type Props = {
  columnCount: number;
  // what the band says when the list is empty — the generic "no data" state when left out
  emptyState?: ReactNode;
};

/**
 * The empty state takes the whole grid rather than sitting in one cell: the space the rows would
 * have occupied is what carries the explanation. The cell keeps no padding and no bottom rule of
 * its own — the state block owns its inset, and the card edge closes the band.
 */
const EmptyTableRow = ({
  columnCount,
  emptyState,
}: Props) => {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} sx={{ p: 0, borderBottom: 'none' }}>
        {emptyState ?? <EmptyData />}
      </TableCell>
    </TableRow>
  );
};

export default EmptyTableRow;
