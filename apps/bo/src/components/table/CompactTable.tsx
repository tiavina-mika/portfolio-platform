import {
  Box, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { ReactNode } from 'react';

import EmptyData from '@/components/EmptyData';
import ListCardsView from '@/components/table/ListCardsView';
import { ITableHeadCell } from '@/types/_core/app.type';

export type CompactTableColumn<TRow> = {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  // a date or an amount reads on one line; a sentence is left to wrap
  nowrap?: boolean;
  render: (row: TRow) => ReactNode;
};

type Props<TRow extends { id: string }> = {
  columns: CompactTableColumn<TRow>[];
  rows: TRow[];
  // what the block states in place of its rows when there are none
  emptyTitle: string;
  emptyDescription?: string;
  // opens the row's own page; left out, the rows are read-only
  onRowClick?: (row: TRow) => void;
};

const classes = {
  clickableRow: {
    cursor: 'pointer',
  },
};

/**
 * A short list read inside one block of a detail page — the latest few rows of something the record
 * holds more of, with the way to the full list standing under it. A table from the tablet up, and
 * the list of cards every list turns into on a phone, where the columns no longer fit a row.
 *
 * Unlike a list page it neither sorts, nor pages, nor selects: it is read, and a row opens the
 * record it names.
 */
const CompactTable = <TRow extends { id: string }>({
  columns, rows, emptyTitle, emptyDescription, onRowClick,
}: Props<TRow>) => {
  if (rows.length === 0) {
    return <EmptyData description={emptyDescription} title={emptyTitle} />;
  }

  const isClickable = !!onRowClick;

  const headCells: ITableHeadCell<string>[] = columns.map((column) => ({
    id: column.id,
    label: column.label,
    align: column.align,
  }));

  // the card view reads one field per head cell, in the order of the columns
  const cards = rows.map((row) => columns.reduce<Record<string, ReactNode>>(
    (card, column) => ({ ...card, [column.id]: column.render(row) }),
    { id: row.id }
  ));

  return (
    <>
      {/* ------------- tablet and up ------------- */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell align={column.align} key={column.id}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                css={isClickable ? classes.clickableRow : undefined}
                hover={isClickable}
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <TableCell
                    align={column.align}
                    key={column.id}
                    sx={column.nowrap ? { whiteSpace: 'nowrap' } : undefined}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* ------------- phone ------------- */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <ListCardsView
          canMultipleSelect={false}
          disableRowClickEvent={!onRowClick}
          headCells={headCells}
          isItemSelected={() => false}
          items={cards}
          loading={false}
          onCheckedRow={() => undefined}
          onSelectAll={() => undefined}
          selectedIds={[]}
          stopCheckboxPropagation={() => undefined}
          onRowClick={(card) => {
            const row = rows.find((item) => item.id === card.id);

            if (row) onRowClick?.(row);
          }}
        />
      </Box>
    </>
  );
};

export default CompactTable;
