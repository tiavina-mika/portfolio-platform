import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import {
  Fragment, isValidElement, memo, MouseEvent, ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronRight } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import { ROW_META_FIELDS } from '@/constants/_core/app.constants';
import {
  TABLE_ROW_DETAIL_ICON_SIZE, TABLE_ROW_DETAIL_PADDING_X, TABLE_ROW_DETAIL_PADDING_Y,
  TABLE_ROW_DETAIL_TOGGLE_WIDTH,
} from '@/constants/_core/ui/list.constants';
import { ITableHeadCell } from '@/types/_core/app.type';
import { getTableCellAlign } from '@/utils/_core/app.utils';
import { getUnseenRowStyles } from '@/utils/_core/theme/styles.utils';

const classes = {
  rowCellComponent: (align: 'left' | 'right' | 'center') => ({
    justifyContent: align,
  }),
  /*
   * the caret turns rather than being swapped for a second glyph: the reader watches the same mark
   * move, which is what says the band below belongs to this row and not that a new control appeared
   */
  detailToggle: (isOpen: boolean) => ({
    transform: `rotate(${isOpen ? 90 : 0}deg)`,
    transition: 'transform .15s',
  }),
  // the band closes under the row it belongs to, so its cell contributes no inset of its own
  detailCell: {
    paddingTop: 0,
    paddingBottom: 0,
    borderBottom: 'none',
  },
  detailContent: {
    padding: `${TABLE_ROW_DETAIL_PADDING_Y}px ${TABLE_ROW_DETAIL_PADDING_X}px`,
  },
  /*
   * a row nobody has opened yet. Left to the selected state to win: a row the reader has just
   * ticked is what they are acting on, and having the two marks fight over the same background
   * would leave neither readable.
   */
  unseenRow: (theme: Theme) => ({
    '&:not(.Mui-selected)': getUnseenRowStyles(theme),
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
  const align = getTableCellAlign(headCells[cellIndex]);

  if (cellIndex === 0) {
    return (
      <TableCell
        align={align}
        component="th"
        id={labelId}
        scope="row"
      >
        {(data as any)[field]}
      </TableCell>
    );
  }

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
  data: IDataTable;
  // ties the row's checkbox to the cell that names the row, for screen readers
  labelId: string;
  headCells: ITableHeadCell<keyof IDataTable>[];
  isSelected: boolean;
  isExpanded: boolean;
  canMultipleSelect: boolean;
  disableRowClickEvent: boolean;
  // every column the detail band spans, the tick and caret gutters included
  columnCount: number;
  onRowClick: (data: IDataTable, event: MouseEvent<HTMLElement>) => void;
  onCheckedRow: (objectId: string) => void;
  stopCheckboxPropagation: (event: MouseEvent<HTMLElement>) => void;
  renderRowDetail?: (data: IDataTable) => ReactNode;
  onToggleRowDetail?: (id: string) => void;
};

/**
 * One row of the list table, with its detail band when the list has one.
 *
 * Memoized: every prop is either a plain value or a callback the list keeps stable, and each row's
 * `data` keeps its identity as long as the page's rows do. So ticking a row, opening one band, or
 * the global loader flipping re-renders the row that changed, not the whole page of rows — each
 * of which rebuilds its cells, chips and action menus.
 */
const TableBodyRow = <IDataTable extends Record<string, any>>({
  data,
  labelId,
  headCells,
  isSelected,
  isExpanded,
  canMultipleSelect,
  disableRowClickEvent,
  columnCount,
  onRowClick,
  onCheckedRow,
  stopCheckboxPropagation,
  renderRowDetail,
  onToggleRowDetail,
}: Props<IDataTable>) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      {/*
        * no `role="checkbox"` on the row: the box in the first cell is the real control, and a row
        * announced as a checkbox while holding one — plus the actions at its end — reads as a control
        * nested inside a control
        */}
      <TableRow
        hover
        css={data.unseen ? classes.unseenRow : null}
        onClick={(event: MouseEvent<HTMLElement>) => onRowClick(data, event)}
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
        {/*
          * opening a row is not what clicking it does — a list whose rows lead somewhere keeps
          * leading there, and the caret is the one target that opens the band instead
          */}
        {renderRowDetail && (
          <TableCell
            onClick={stopCheckboxPropagation}
            sx={{ width: TABLE_ROW_DETAIL_TOGGLE_WIDTH }}
          >
            <IconButton
              aria-expanded={isExpanded}
              // a caret with no word in it: the name says what the band it opens holds
              aria-label={t('details')}
              css={classes.detailToggle(isExpanded)}
              onClick={() => onToggleRowDetail?.(data.id)}
              size="small"
            >
              <FiChevronRight size={TABLE_ROW_DETAIL_ICON_SIZE} />
            </IconButton>
          </TableCell>
        )}
        {Object.keys(data)
          // the row's own bookkeeping (its id, whether it is unseen) is not a column
          .filter((key: string) => !ROW_META_FIELDS.includes(key))
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
      {renderRowDetail && (
        <TableRow selected={isSelected}>
          <TableCell colSpan={columnCount} css={classes.detailCell}>
            {/*
              * mounted collapsed rather than added on open: the band animates out of the row it
              * belongs to instead of the table jumping by its height
              */}
            <Collapse unmountOnExit in={isExpanded} timeout="auto">
              <div css={classes.detailContent}>{renderRowDetail(data)}</div>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

// `memo` drops the generic parameter; the cast gives callers back the typed row
export default memo(TableBodyRow) as typeof TableBodyRow;
