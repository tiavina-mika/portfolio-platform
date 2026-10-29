import { Paper } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import MUITable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {
  ChangeEvent, isValidElement, MouseEvent, ReactNode,
} from 'react';

import EmptyTableRow from '@/components/table/EmptyTableRow';
import { IPagination, ITableHeadCell } from '@/types/app.type';
import { PAGINATION } from '@/utils/constants';

import TableHead from './TableHead';


const classes = {
  rowCellComponent: (align: 'left' | 'right' | 'center') => ({
    justifyContent: align,
  }),
};

type TableRowCellProps<IDataTable> = {
  cellIndex: number;
  labelId: string;
  data: Record<string, any>;
  headCells: ITableHeadCell<keyof IDataTable>[];
  field: string;
};
const TableRowCell = <IDataTable,>({
  cellIndex, labelId, data, headCells, field,
}: TableRowCellProps<IDataTable>) => {
  const cellAlign = headCells[cellIndex]?.align;

  if (cellIndex === 0) {
    return (
      <TableCell
        align={cellAlign ?? 'left'}
        component="th"
        id={labelId}
        scope="row"
      >
        {(data as any)[field]}
      </TableCell>
    );
  }

  const align = cellAlign ?? 'right';

  return (
    <TableCell
      align={align}
      // add a class to the cell if the cell is a component
      css={isValidElement((data as any)[field])
        ? classes.rowCellComponent(align)
        : null}
    >
      {(data as any)[field]}
    </TableCell>
  );
};

type Props<IDataTable> = {
  items: IDataTable[];
  headCells: ITableHeadCell<keyof IDataTable>[];
  count: number;
  disabledRowId?: string;
  border?: boolean;
  pagination: IPagination;
  selectedIds: string[];
  onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
  onSort: (_: MouseEvent<unknown> | null, property: any) => void;
  canMultipleSelect: boolean;
  onRowClick: (data: Record<string, any>) => (event: MouseEvent<HTMLElement>) => void;
  isItemSelected: (id: string) => boolean;
  /*
   * stop the propagation of the checkbox click event
   * ex: when clicking the row
   */
  stopCheckboxPropagation: (event: MouseEvent<HTMLElement>) => void;
  onCheckedRow: (objectId: string) => void;
  onChangePage: (_: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  disableRowClickEvent: boolean;
};

const Table = <IDataTable extends Record<string, any>>({
  items,
  headCells,
  count,
  disabledRowId,
  selectedIds,
  pagination,
  onSelectAll,
  onSort,
  canMultipleSelect,
  onRowClick,
  stopCheckboxPropagation,
  onCheckedRow,
  isItemSelected,
  onChangePage,
  onChangeRowsPerPage,
  border = false,
  loading = false,
  disableRowClickEvent,
}: Props<IDataTable>) => {
  return (
    (
      <Paper>
        <TableContainer sx={border
          ? { border: '2px solid #F5F5F5' }
          : null}
        >
          <MUITable aria-labelledby="tableTitle">
            <TableHead
              canMultipleSelect={canMultipleSelect}
              headCells={headCells}
              numSelected={selectedIds.length}
              onRequestSort={onSort}
              onSelectAllClick={onSelectAll}
              order={pagination.order}
              orderBy={pagination.orderBy}
              rowCount={disabledRowId
                ? items.length - 1
                : items.length}
            />
            <TableBody>
              {items.length > 0
                ? (
                  items.map((data: IDataTable, index: number): ReactNode => {
                    const isSelected = isItemSelected(data.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        aria-checked={isSelected}
                        key={index}
                        onClick={onRowClick(data)}
                        role="checkbox"
                        selected={isSelected}
                        sx={{ cursor: disableRowClickEvent ? 'inherit' : 'pointer' }}
                        tabIndex={-1}
                      >
                        {/* checkbox column */}
                        {canMultipleSelect && (
                          <TableCell onClick={stopCheckboxPropagation} padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              color="primary"
                              onChange={() => onCheckedRow(data.id)}
                              slotProps={{ input: { 'aria-labelledby': labelId } }}
                            />
                          </TableCell>
                        )}
                        {Object.keys(data)
                          .filter((key: string) => key !== 'id') // do not display the id in the table row
                          .map((key: string, cellIndex: number) => (
                            <TableRowCell<IDataTable>
                              cellIndex={cellIndex}
                              data={data}
                              field={key}
                              headCells={headCells}
                              key={cellIndex + key}
                              labelId={labelId}
                            />
                          ))}
                      </TableRow>
                    );
                  })
                ) : (
              // center the cell with the cell (column) number (with the checkbox column)
                  (<EmptyTableRow columnCount={headCells.length + 1} loading={loading} />)
                )}
            </TableBody>
          </MUITable>
        </TableContainer>
        {count > 0 && (
          <TablePagination
            component="div"
            count={count}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            page={pagination.currentPage}
            rowsPerPage={(pagination as any).rowsPerPage}
            rowsPerPageOptions={PAGINATION.rowsPerPageOptions}
          />
        )}
      </Paper>
    )
  );
};

export default Table;
