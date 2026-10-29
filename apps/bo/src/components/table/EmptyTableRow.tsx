import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import EmptyData from '@/components/EmptyData';

type Props = {
  columnCount: number;
  loading?: boolean;
};

const EmptyTableRow = ({
  columnCount, loading = false,
}: Props) => {
  return (
    <TableRow
      style={{ height: 200 }}
    >
      {!loading && (
        <TableCell colSpan={columnCount} sx={{ justifyContent: 'center' }}>
          <EmptyData />
        </TableCell>
      )}
    </TableRow>
  );
};

export default EmptyTableRow;
