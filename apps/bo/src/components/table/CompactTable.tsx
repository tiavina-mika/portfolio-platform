import {
  Box, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { Fragment, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import EmptyData from '@/components/EmptyData';
import ListCardsView from '@/components/table/ListCardsView';
import { COMPACT_TABLE_EXPAND_CELL_WIDTH } from '@/constants/_core/ui/list.constants';
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
  /*
   * what a row holds under it once opened (a ticket's thread). The row then carries a chevron of its
   * own instead of opening a page — the reader wants to read it here, not to leave the record
   */
  renderRowDetail?: (row: TRow) => ReactNode;
  // the rows opened when the table is first drawn
  defaultExpandedIds?: string[];
  onRowExpand?: (row: TRow) => void;
};

const classes = {
  clickableRow: {
    cursor: 'pointer',
  },
  chevron: (expanded: boolean) => (theme: Theme) => ({
    transform: expanded
      ? 'rotate(180deg)'
      : 'none',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }),
  detailCell: {
    paddingTop: 0,
    paddingBottom: 0,
  },
};

/**
 * A short list read inside one block of a detail page — the latest few rows of something the record
 * holds more of, with the way to the full list standing under it. A table from the tablet up, and
 * the list of cards every list turns into on a phone, where the columns no longer fit a row.
 *
 * Unlike a list page it neither sorts, nor pages, nor selects: it is read, and a row opens the
 * record it names (or unfolds what it holds, for a row that has something to show inline).
 */
const CompactTable = <TRow extends { id: string }>({
  columns, rows, emptyTitle, emptyDescription, onRowClick, renderRowDetail, defaultExpandedIds = [],
  onRowExpand,
}: Props<TRow>) => {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  if (rows.length === 0) {
    return <EmptyData description={emptyDescription} title={emptyTitle} />;
  }

  const toggleRow = (row: TRow) => {
    const isExpanded = expandedIds.includes(row.id);

    setExpandedIds(isExpanded
      ? expandedIds.filter((id) => id !== row.id)
      : [...expandedIds, row.id]);

    if (!isExpanded) onRowExpand?.(row);
  };

  const handleRowClick = (row: TRow) => {
    if (renderRowDetail) {
      toggleRow(row);
      return;
    }

    onRowClick?.(row);
  };

  const isClickable = !!onRowClick || !!renderRowDetail;
  const columnCount = columns.length + (renderRowDetail ? 1 : 0);

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
              {renderRowDetail && <TableCell width={COMPACT_TABLE_EXPAND_CELL_WIDTH} />}
              {columns.map((column) => (
                <TableCell align={column.align} key={column.id}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isExpanded = expandedIds.includes(row.id);

              return (
                <Fragment key={row.id}>
                  <TableRow
                    css={isClickable ? classes.clickableRow : undefined}
                    hover={isClickable}
                    onClick={isClickable ? () => handleRowClick(row) : undefined}
                  >
                    {renderRowDetail && (
                      <TableCell>
                        <IconButton
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? t('collapseRow') : t('expandRow')}
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleRow(row);
                          }}
                        >
                          <Box
                            component="span"
                            css={classes.chevron(isExpanded)}
                            sx={{ display: 'inline-flex' }}
                          >
                            <FiChevronDown />
                          </Box>
                        </IconButton>
                      </TableCell>
                    )}
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
                  {renderRowDetail && (
                    <TableRow>
                      <TableCell colSpan={columnCount} css={classes.detailCell}>
                        <Collapse unmountOnExit in={isExpanded}>
                          {renderRowDetail(row)}
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
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
          renderRowDetail={renderRowDetail
            ? (card) => {
              const row = rows.find((item) => item.id === card.id);

              return row ? renderRowDetail(row) : null;
            }
            : undefined}
        />
      </Box>
    </>
  );
};

export default CompactTable;
