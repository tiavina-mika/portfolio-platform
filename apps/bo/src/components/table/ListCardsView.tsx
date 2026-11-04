import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import {
  ChangeEvent, Fragment, MouseEvent, ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import EmptyData from '@/components/EmptyData';
import { ROW_META_FIELDS } from '@/constants/_core/app.constants';
import {
  LIST_CARDS_GAP, LIST_CARDS_PADDING, LIST_CARDS_TOUCH_GAP, LIST_CARDS_TOUCH_PADDING_Y,
  LIST_CARD_FOOT_PADDING_Y, LIST_CARD_HEAD_PADDING_Y, LIST_CARD_ITEM_PADDING_X,
  LIST_CARD_KEY_COLUMN_WIDTH, LIST_CARD_ROW_GAP,
} from '@/constants/_core/ui/list.constants';
import { ITableHeadCell } from '@/types/_core/app.type';
import { getUnseenCardStyles } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getSoftTintedBackground } from '@/utils/_core/theme/tokens.utils';
import { isString } from '@/utils/_core/utils';

import ListCardSkeleton from './ListCardSkeleton';

/**
 * get all columns except id or actions
 * @param data
 * @param removeAction
 * @returns
 */
const getFilteredData = (data: Record<string, any>, removeAction = false): string[] => {
  // the row's own bookkeeping (its id, whether it is unseen) titles no column of the card
  const keys = Object.keys(data).filter((key: string): boolean => !ROW_META_FIELDS.includes(key));

  if (!removeAction) {
    return keys;
  }

  return keys.filter((key: string): boolean => key !== 'actions');
};

/**
 * get only action column
 * @param data
 * @returns
 */
const getActionsColumn = (data: Record<string, any>) => {
  const keys: string[] = Object.keys(data);

  if (keys[keys.length - 1] === 'actions') {
    return data.actions;
  }
};

/*
 * the grid sits on the recessed ground so the cards read as items held by the list card rather
 * than as a second set of panels floating on it, and each card states its values as a two-column
 * key/value block: the label column is bounded so every card in a row aligns its values on the
 * same edge whatever the label lengths are.
 */
const classes = {
  band: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: LIST_CARDS_GAP,
    padding: LIST_CARDS_PADDING,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    /*
     * on a phone the grid is a single column, so a side inset only narrows cards that are already
     * as wide as the screen — the band drops it and lets them run edge to edge
     */
    [theme.breakpoints.down('sm')]: {
      gap: LIST_CARDS_TOUCH_GAP,
      padding: `${LIST_CARDS_TOUCH_PADDING_Y}px 0`,
    },
  }),
  card: (isSelected: boolean, isUnseen: boolean) => (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    // the ticked state wins over the unseen mark — see the same rule on the table row
    ...(isUnseen && !isSelected
      ? getUnseenCardStyles(theme)
      : {}),
    ...(isSelected
      ? { backgroundColor: getSoftTintedBackground(theme, theme.palette.primary.main) }
      : {}),
    /*
     * running the full width of the screen, a card is closed by the rule above and below it rather
     * than by a border of its own: a rounded box whose sides touch both screen edges reads as a
     * broken frame, where two rules read as the row of a list — which is what it is here
     */
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
      borderLeft: 'none',
      borderRight: 'none',
    },
  }),
  head: {
    padding: `${LIST_CARD_HEAD_PADDING_Y}px ${LIST_CARD_ITEM_PADDING_X}px`,
  },
  keyValues: {
    display: 'grid',
    gridTemplateColumns: `minmax(0, ${LIST_CARD_KEY_COLUMN_WIDTH}px) 1fr`,
    gap: `${LIST_CARD_ROW_GAP}px ${LIST_CARDS_GAP}px`,
    padding: `0 ${LIST_CARD_ITEM_PADDING_X}px ${LIST_CARD_HEAD_PADDING_Y}px`,
  },
  detail: (theme: Theme) => ({
    padding: `${LIST_CARD_HEAD_PADDING_Y}px ${LIST_CARD_ITEM_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  foot: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: LIST_CARDS_GAP,
    // pushed to the bottom so cards of unequal height still end on one line
    marginTop: 'auto',
    padding: `${LIST_CARD_FOOT_PADDING_Y}px ${LIST_CARD_ITEM_PADDING_X}px`,
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
  }),
};

type Props<IDataTable> = {
  items: IDataTable[];
  headCells: ITableHeadCell<keyof IDataTable>[];
  disabledRowId?: string;
  selectedIds: string[];
  onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
  canMultipleSelect: boolean;
  onRowClick: (data: Record<string, any>) => void;
  isItemSelected: (id: string) => boolean;
  stopCheckboxPropagation: (event: MouseEvent<HTMLElement>) => void;
  onCheckedRow: (objectId: string) => void;
  disableRowClickEvent: boolean;
  loading: boolean;
  // what the grid says in place of the cards when there are none — generic "no data" when left out
  emptyState?: ReactNode;
  /*
   * what a card states once opened. A card has room the table row does not, so the band is drawn
   * inline above the foot rather than behind a caret of its own — the reader is already inside one
   * item, not scanning twenty.
   */
  renderRowDetail?: (data: IDataTable) => ReactNode;
};

const ListCardsView = <IDataTable extends Record<string, any>>({
  items,
  headCells,
  disabledRowId,
  selectedIds,
  onSelectAll,
  canMultipleSelect,
  onRowClick,
  stopCheckboxPropagation,
  onCheckedRow,
  isItemSelected,
  disableRowClickEvent,
  loading,
  emptyState,
  renderRowDetail,
}: Props<IDataTable>) => {
  const {
    t,
  } = useTranslation();

  const numSelected = selectedIds.length;
  const rowCount = disabledRowId
    ? items.length - 1
    : items.length;

  return (
    <Box css={classes.band}>
      {/* the grid has no head row to hold it, so "select all" gets its own line above the cards */}
      {canMultipleSelect && items.length > 0 && (
        <FormControlLabel
          label={t('selectAll')}
          // the cards it heads run edge to edge on a phone, but a line of text still needs its inset
          sx={{ alignSelf: 'flex-start', px: { xs: `${LIST_CARD_ITEM_PADDING_X}px`, sm: 0 } }}
          control={(
            <Checkbox
              checked={rowCount > 0 && numSelected === rowCount}
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              onChange={onSelectAll}
              slotProps={{ input: { 'aria-label': 'select all data' } }}
            />
          )}
        />
      )}
      <Box
        sx={{
          display: 'grid',
          alignItems: 'start',
          gap: {
            xs: `${LIST_CARDS_TOUCH_GAP}px`,
            sm: `${LIST_CARDS_GAP}px`,
          },
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
        }}
      >
        {items.length > 0
          ? items.map((data: IDataTable, index: number): ReactNode => {
            const isSelected = isItemSelected(data.id);
            const columns = getFilteredData(data, true);
            // the identity column titles the card, the way it opens the row in the table view
            const [titleField, ...valueFields] = columns;

            return (
              <Card
                css={classes.card(isSelected, !!(data as Record<string, any>).unseen)}
                key={data.id + index}
                onClick={() => onRowClick(data)}
                sx={{ cursor: disableRowClickEvent ? 'inherit' : 'pointer' }}
              >
                <div css={classes.head}>
                  <Typography component="div" variant="h5">{(data)[titleField]}</Typography>
                </div>
                <div css={classes.keyValues}>
                  {valueFields.map((key: string, cellIndex: number) => (
                    <Fragment key={key}>
                      <Typography component="span" sx={{ color: 'text.secondary' }} variant="body2">
                        {headCells[cellIndex + 1]?.label}
                      </Typography>
                      {isString((data)[key])
                        ? (
                          <Typography component="span" sx={{ textAlign: 'right' }} variant="body1">
                            {(data)[key]}
                          </Typography>
                        )
                        : (
                          <div css={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {(data)[key]}
                          </div>
                        )}
                    </Fragment>
                  ))}
                </div>
                {renderRowDetail && (
                  <div css={classes.detail}>{renderRowDetail(data)}</div>
                )}
                <div css={classes.foot}>
                  {canMultipleSelect && (
                    // a container of its own, so ticking the card does not also open the row
                    <Box onClick={stopCheckboxPropagation}>
                      <FormControlLabel
                        label={t('select')}
                        sx={{ m: 0 }}
                        control={(
                          <Checkbox
                            checked={isSelected}
                            color="primary"
                            onChange={() => onCheckedRow(data.id)}
                            slotProps={{ input: { 'aria-labelledby': 'list-card-view-' + data.id } }}
                          />
                        )}
                      />
                    </Box>
                  )}
                  {getActionsColumn(data)}
                </div>
              </Card>
            );
          })
          : loading
            ? <ListCardSkeleton />
            : emptyState ?? <EmptyData sx={{ gridColumn: '1 / -1' }} />}
      </Box>
    </Box>
  );
};

export default ListCardsView;
