
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import MUITableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import { ChangeEvent, MouseEvent } from 'react';

import { TABLE_ROW_DETAIL_TOGGLE_WIDTH } from '@/constants/_core/ui/list.constants';
import { OrderType } from '@/types/_core/app.type';
import { getTableCellAlign } from '@/utils/_core/app.utils';

type Props = {
  numSelected: number;
  onRequestSort: (event: MouseEvent<unknown>, property: any) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  order?: OrderType;
  orderBy?: string;
  rowCount: number;
  headCells: any;
  canMultipleSelect?: boolean;
  /*
   * whether the rows under this head open onto a detail band. The head has no column of its own
   * for the caret that opens them, but it still has to leave its gutter — a head row one cell
   * short of its body puts every column label over the wrong column.
   */
  hasRowDetail?: boolean;
};

const TableHead = ({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  headCells,
  canMultipleSelect,
  hasRowDetail,
}: Props) => {
  const createSortHandler = (property: any) => (event: MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  /*
   * A column whose cell combines several values ("total / driver's share", a route and its length)
   * has no field of its own to order on, so it names the ones it stands for and the header acts on
   * the first of them. Without this the click sends the column's own key as the sort field, which
   * no collection has — the list comes back in whatever order the database happened to hold, and
   * the arrow the reader just clicked never lights up because nothing matches it either.
   */
  const getSortField = (headCell: any): string => headCell.sortFields?.[0]?.id ?? headCell.id;

  return (
    <MUITableHead>
      <TableRow>
        {canMultipleSelect && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={rowCount > 0 && numSelected === rowCount}
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              onChange={onSelectAllClick}
              slotProps={{ input: { 'aria-label': 'select all data' } }}
            />
          </TableCell>
        )}
        {hasRowDetail && <TableCell sx={{ width: TABLE_ROW_DETAIL_TOGGLE_WIDTH }} />}
        {headCells.map((headCell: any) => (
          <TableCell
            align={getTableCellAlign(headCell)}
            key={headCell.id}
            padding={headCell.disablePadding
              ? 'none'
              : 'normal'}
            sortDirection={orderBy === getSortField(headCell)
              ? order
              : false}
            sx={headCell.width
              ? { width: headCell.width }
              : undefined}
          >
            {headCell.disableSorting
              ? headCell.label
              : (
                <TableSortLabel
                  active={orderBy === getSortField(headCell)}
                  onClick={createSortHandler(getSortField(headCell))}
                  direction={orderBy === getSortField(headCell)
                    ? order
                    : 'asc'}
                >
                  {headCell.label}
                  {orderBy === getSortField(headCell)
                    ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc'
                          ? 'sorted descending'
                          : 'sorted ascending'}
                      </Box>
                    )
                    : null}
                </TableSortLabel>
              )}
          </TableCell>
        ))}
      </TableRow>
    </MUITableHead>
  );
};

export default TableHead;
