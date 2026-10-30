import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import { SortDirectionIcon, SortIcon } from '@/components/icons/ListToolbarIcons';
import { MenuHead } from '@/components/MenuBands';
import ToolbarIconButton from '@/components/ToolbarIconButton';
import {
  SORT_MENU_ARROW_SIZE, SORT_MENU_DIRECTION_GAP, SORT_MENU_WIDTH,
} from '@/constants/_core/ui/list.constants';
import { FONT_SIZE_META, TOOLBAR_ICON_BUTTON_GLYPH_SIZE } from '@/constants/_core/ui/ui.constants';
import {
  ISelectOption, ITableHeadCell, ITableSortField, OrderType,
} from '@/types/_core/app.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

/**
 * only columns that are actually sortable server-side can be offered here
 * @param headCells
 * @returns
 */
const getSortableFieldOptions = <IDataTable,>(
  headCells: ITableHeadCell<keyof IDataTable>[]
): ISelectOption[] => headCells
  .filter((headCell) => headCell.id !== 'actions' && !headCell.disableSorting)
  .flatMap((headCell) => headCell.sortFields?.map((field) => ({ value: field.id, label: field.label })) ??
    [{ value: headCell.id as string, label: headCell.label }]);

/*
 * The order the list is read in, as one control: which column it is sorted by and which way, picked
 * from the same row. The two used to be separate — a select for the column, an arrow button for the
 * direction — but a direction has no meaning apart from the column it applies to, so the picked row
 * carries its own direction and clicking it again turns it over.
 *
 * The trigger stays marked as holding a value: a list is always ordered by something, so unlike the
 * export next to it there is no state in which this control is doing nothing.
 */
const classes = {
  menu: { width: SORT_MENU_WIDTH },
  item: { justifyContent: 'space-between' },
  direction: {
    display: 'flex',
    alignItems: 'center',
    gap: SORT_MENU_DIRECTION_GAP,
    fontSize: FONT_SIZE_META,
  },
  /*
   * one glyph for both directions, turned over for the descending one: two different arrows read as
   * two different marks, where the reader is looking at a single value that flipped. On the rows
   * that are not picked it drops to the disabled tone — it marks where the direction would appear,
   * it is not a second value competing with the column names.
   */
  arrow: (isSelected: boolean, isDescending: boolean) => (theme: Theme) => ({
    display: 'flex',
    color: isSelected
      ? 'inherit'
      : getDesignTokens(theme).textDisabled,
    transform: isDescending
      ? 'rotate(180deg)'
      : 'none',
    transition: theme.transitions.create('transform', { duration: 150 }),
  }),
};

type Props<IDataTable> = {
  headCells: ITableHeadCell<keyof IDataTable>[];
  /*
   * orderings the list offers that no column stands for. A table can be worth reading in an order
   * whose value it does not print — a fleet read newest-first, or by the row that moved last —
   * and dropping the column is not a reason to drop the order with it.
   */
  extraSortFields?: ITableSortField[];
  orderBy?: string;
  order: OrderType;
  onOrderByChange: (property: any) => void;
  // back to the order the list opens on, whatever the reader has picked since
  onReset: () => void;
};

const SortMenu = <IDataTable,>({
  headCells, extraSortFields = [], orderBy, order, onOrderByChange, onReset,
}: Props<IDataTable>) => {
  const {
    t,
  } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const columnOptions = getSortableFieldOptions<IDataTable>(headCells);
  /*
   * appended rather than merged in place: they come last in the menu because they are not what the
   * reader is looking at, and a field a column already offers is never listed twice
   */
  const fieldOptions: ISelectOption[] = [
    ...columnOptions,
    ...extraSortFields
      .filter((field) => !columnOptions.some((option) => option.value === field.id))
      .map((field) => ({ value: field.id, label: field.label })),
  ];

  // no sortable column on this list — nothing to offer
  if (fieldOptions.length === 0) return null;

  const handleOpen = (event: MouseEvent<HTMLElement>): void => setAnchorEl(event.currentTarget);
  const handleClose = (): void => setAnchorEl(null);

  /*
   * the list itself turns the direction over when the column that is already picked is picked
   * again, so the menu only ever states which column the reader clicked
   */
  const handleSelect = (value: string) => (): void => onOrderByChange(value);

  const handleReset = (): void => {
    onReset();
    handleClose();
  };

  return (
    <>
      {/*
        * the trigger states that an order is applied rather than that one can be picked: a list
        * always carries exactly one criterion, so the counter reads 1 for as long as it holds one
        */}
      <ToolbarIconButton
        active={!!orderBy}
        icon={<SortIcon size={TOOLBAR_ICON_BUTTON_GLYPH_SIZE} />}
        isMenuOpen={!!anchorEl}
        label={t('sort')}
        onClick={handleOpen}
        badge={orderBy
          ? 1
          : undefined}
      />
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={handleClose}
        open={!!anchorEl}
        slotProps={{ paper: { sx: classes.menu } }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuHead
          title={t('orderBy')}
          action={(
            <Button onClick={handleReset} size="small" variant="text">
              {t('defaultOrder')}
            </Button>
          )}
        />
        {fieldOptions.map((option) => {
          const isSelected = option.value === orderBy;

          return (
            <MenuItem
              css={classes.item}
              key={option.value}
              onClick={handleSelect(option.value)}
              selected={isSelected}
            >
              <span>{option.label}</span>
              <Box component="span" css={classes.direction}>
                {isSelected && (
                  <span>
                    {order === 'asc'
                      ? t('ascending')
                      : t('descending')}
                  </span>
                )}
                <Box component="span" css={classes.arrow(isSelected, isSelected && order === 'desc')}>
                  <SortDirectionIcon size={SORT_MENU_ARROW_SIZE} />
                </Box>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default SortMenu;
