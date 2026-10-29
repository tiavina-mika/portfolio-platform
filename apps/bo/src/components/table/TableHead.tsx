
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import MUITableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import { ChangeEvent, MouseEvent } from 'react';

import { OrderType } from '@/types/app.type';

type Props = {
  numSelected: number;
  onRequestSort: (event: MouseEvent<unknown>, property: any) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  order?: OrderType;
  orderBy?: string;
  rowCount: number;
  headCells: any;
  canMultipleSelect?: boolean;
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
}: Props) => {
  const createSortHandler = (property: any) => (event: MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <MUITableHead>
      <TableRow>
        {canMultipleSelect && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={rowCount > 0 && numSelected === rowCount}
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              inputProps={{ 'aria-label': 'select all data' }}
              onChange={onSelectAllClick}
            />
          </TableCell>
        )}
        {headCells.map((headCell: any) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || (headCell.numeric
              ? 'right'
              : 'left')}
            padding={headCell.disablePadding
              ? 'none'
              : 'normal'}
            sortDirection={orderBy === headCell.id
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
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id
                    ? order
                    : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id
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
