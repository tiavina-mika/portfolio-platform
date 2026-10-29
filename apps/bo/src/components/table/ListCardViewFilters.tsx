import {
  Checkbox, FormControlLabel, IconButton, Stack, Tooltip,
} from '@mui/material';
import {
  ChangeEvent, MouseEvent, ReactNode, useCallback, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineSwap } from 'react-icons/ai';

import SelectInput from '@/components/form/inputs/SelectInput';
import { StyledCheckbox, StyledCheckedCheckbox } from '@/components/form/inputs/styled/StyeldCheckbox';
import { orderSelectOptions } from '@/constants/app.constants';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ISelectOption, ITableHeadCell } from '@/types/app.type';
import { TOOLBAR_SMALL_SCREEN_HEIGHT } from '@/utils/constants';

/**
 * we get the options based on the column field (key)
 * @param headCells
 * @param updatedAtLabel
 * @returns
 */
const getOrderByOptions = (headCells: Record<string, any>[], updatedAtLabel: string): ISelectOption[] => {
  // check if there is updateAt column to the list
  const withUpdatedAtCell = headCells.find((headCell: Record<string, any>) => headCell.id === 'updatedAt');
  // remove actions column to the option (because it not a data)
  const cellsWithoutActions = headCells.filter((headCell: Record<string, any>) => headCell.id !== 'actions');

  // get all options with updatedAt
  if (withUpdatedAtCell) {
    return cellsWithoutActions.map((headCell: Record<string, any>) => ({
      value: headCell.id,
      label: headCell.label,
    }));
  }

  // add updated at to the options if there is no updatedAt column in the list
  const cells = cellsWithoutActions.map((headCell: Record<string, any>) => ({
    value: headCell.id,
    label: headCell.label,
  }));

  cells.unshift({ value: 'updatedAt', label: updatedAtLabel });
  return cells;
};

const selectStyles = { control: { padding: 0 } };

type Props<IDataTable> = {
  numSelected: number;
  onRequestSort: (event: MouseEvent<unknown> | null, property: any) => void;
  onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
  orderBy?: string;
  rowCount: number;
  headCells: ITableHeadCell<keyof IDataTable>[];
  canMultipleSelect?: boolean;
  onOrder: (order: 'asc' | 'desc') => void;
  order: 'asc' | 'desc';
  viewsComponent: ReactNode;
};

const ListCardViewFilters = <IDataTable,>({
  onSelectAllClick,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  headCells,
  onOrder,
  order,
  viewsComponent,
  canMultipleSelect,
}: Props<IDataTable>) => {
  const {
    t,
  } = useTranslation();

  const [open, setOpen] = useState<boolean>(false);

  const toggle = useCallback(() => setOpen(!open), [open]);

  const isTabletDown = useBreakpoint();

  useEffect(() => {
    if (isTabletDown) return;
    // open by default in desktop
    setOpen(true);
  }, [isTabletDown, toggle]);

  const handleSortBy = (property: any) => {
    onRequestSort(null, property);
  };

  const handleSort = (value: any) => {
    onOrder(value);
  };

  return (
    <>
      {isTabletDown && (
        <Tooltip title={t('sort')}>
          <IconButton
            sx={{
              position: 'absolute',
              right: 0,
              transform: 'rotate(90deg)',
              top: { xs: TOOLBAR_SMALL_SCREEN_HEIGHT, sm: TOOLBAR_SMALL_SCREEN_HEIGHT + 6 },
            }}
            onClick={toggle}
          >
            <AiOutlineSwap />
          </IconButton>
        </Tooltip>
      )}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
        <Stack
          alignItems="center"
          alignSelf="stretch"
          direction="row"
          sx={{ order: { xs: 1, md: 0 }, pl: { xs: 0.5, sm: 0 } }}
        >
          {canMultipleSelect && (
            <FormControlLabel
              label={t('selectAll')}
              control={(
                <Checkbox
                  checked={rowCount > 0 && numSelected === rowCount}
                  checkedIcon={<StyledCheckedCheckbox size={18} />}
                  color="primary"
                  icon={<StyledCheckbox size={18} />}
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  inputProps={{ 'aria-label': 'select all data' }}
                  onChange={onSelectAllClick}
                />
              )}
            />
          )}
        </Stack>
        {open && (
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="flex-end" spacing={{ xs: 1, xl: 3 }}>
            <SelectInput
              direction="row"
              isMulti={false}
              isSearchable={false}
              label={t('orderBy') + ' : '}
              options={getOrderByOptions(headCells, t('updatedAt'))}
              styles={selectStyles}
              value={orderBy}
              width={250}
              onChange={handleSortBy}
            />
            <SelectInput
              direction="row"
              isMulti={false}
              isSearchable={false}
              label={t('orderSort') + ' : '}
              options={orderSelectOptions}
              styles={selectStyles}
              value={order}
              width={160}
              onChange={handleSort}
            />
            {viewsComponent}
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default ListCardViewFilters;
