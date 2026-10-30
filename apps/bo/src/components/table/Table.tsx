import MUITable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import {
  ChangeEvent, MouseEvent, ReactNode,
} from 'react';

import EmptyTableRow from '@/components/table/EmptyTableRow';
import { TABLE_CELL_PADDING_Y_COMFORTABLE } from '@/constants/_core/ui/list.constants';
import { IPagination, ITableHeadCell, TableDensity } from '@/types/_core/app.type';

import TableBodyRow from './TableBodyRow';
import TableHead from './TableHead';
import TableSkeletonRows from './TableSkeletonRows';


const classes = {
  /*
   * the comfortable row is the same grid with more air between its lines, so only the vertical
   * inset of a body cell moves: leaving the head row and the column insets alone is what keeps
   * every column edge in place when the reader switches density
   */
  comfortableRows: {
    '& .MuiTableCell-body': {
      paddingTop: TABLE_CELL_PADDING_Y_COMFORTABLE,
      paddingBottom: TABLE_CELL_PADDING_Y_COMFORTABLE,
    },
  },
};

type Props<IDataTable> = {
  items: IDataTable[];
  headCells: ITableHeadCell<keyof IDataTable>[];
  disabledRowId?: string;
  pagination: IPagination;
  selectedIds: string[];
  onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
  onSort: (_: MouseEvent<unknown> | null, property: any) => void;
  canMultipleSelect: boolean;
  onRowClick: (data: IDataTable, event: MouseEvent<HTMLElement>) => void;
  isItemSelected: (id: string) => boolean;
  /*
   * stop the propagation of the checkbox click event
   * ex: when clicking the row
   */
  stopCheckboxPropagation: (event: MouseEvent<HTMLElement>) => void;
  onCheckedRow: (objectId: string) => void;
  loading: boolean;
  disableRowClickEvent: boolean;
  // how much air each row is given — picked from the toolbar's view switcher
  density: TableDensity;
  // what the band says in place of the rows when there are none — generic "no data" when left out
  emptyState?: ReactNode;
  /*
   * what a row states when it is opened, drawn in a band under it. Passing it gives every row a
   * caret gutter — leave it out and the table has no expandable rows at all.
   */
  renderRowDetail?: (data: IDataTable) => ReactNode;
  expandedIds?: string[];
  onToggleRowDetail?: (id: string) => void;
  // width under which the grid stops shrinking and scrolls sideways instead
  tableMinWidth?: number;
};

/**
 * The grid band of the list card — rows only. The card, the toolbar above and the pager below are
 * owned by List, so this renders no surface of its own: it would draw a second border inside the
 * one the card already closes the band with.
 */
const Table = <IDataTable extends Record<string, any>>({
  items,
  headCells,
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
  loading = false,
  disableRowClickEvent,
  density,
  emptyState,
  renderRowDetail,
  expandedIds = [],
  onToggleRowDetail,
  tableMinWidth,
}: Props<IDataTable>) => {
  const hasRowDetail = !!renderRowDetail;

  // the empty and loading states span every column, the tick and caret gutters included
  const columnCount = headCells.length +
    (canMultipleSelect ? 1 : 0) +
    (hasRowDetail ? 1 : 0);

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <MUITable
        aria-labelledby="tableTitle"
        sx={{ minWidth: tableMinWidth }}
        css={density === 'comfortable'
          ? classes.comfortableRows
          : null}
      >
        <TableHead
          canMultipleSelect={canMultipleSelect}
          hasRowDetail={hasRowDetail}
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
              items.map((data: IDataTable, index: number): ReactNode => (
                /*
                 * keyed by the row's id, not its position: after a sort, a page change or a row
                 * leaving the "new" tab, React keeps each row's own DOM (and its open detail band)
                 * instead of rewriting every row from the one that moved
                 */
                <TableBodyRow<IDataTable>
                  canMultipleSelect={canMultipleSelect}
                  columnCount={columnCount}
                  data={data}
                  disableRowClickEvent={disableRowClickEvent}
                  headCells={headCells}
                  isExpanded={expandedIds.includes(data.id)}
                  isSelected={isItemSelected(data.id)}
                  key={data.id ?? index}
                  labelId={`enhanced-table-checkbox-${index}`}
                  onCheckedRow={onCheckedRow}
                  onRowClick={onRowClick}
                  onToggleRowDetail={onToggleRowDetail}
                  renderRowDetail={renderRowDetail}
                  stopCheckboxPropagation={stopCheckboxPropagation}
                />
              ))
            ) : loading ? (
              <TableSkeletonRows
                columnCount={headCells.length + (hasRowDetail ? 1 : 0)}
                withCheckbox={canMultipleSelect}
              />
            ) : (
              <EmptyTableRow columnCount={columnCount} emptyState={emptyState} />
            )}
        </TableBody>
      </MUITable>
    </TableContainer>
  );
};

export default Table;
