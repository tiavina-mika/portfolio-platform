import {
  Box,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Divider,
  Grid,
  Stack,
  TablePagination,
  type Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { ChangeEvent, MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyData from '@/components/EmptyData';
import { StyledCheckbox, StyledCheckedCheckbox } from '@/components/form/inputs/styled/StyeldCheckbox';
import { IPagination, ITableHeadCell } from '@/types/app.type';
import { PAGINATION } from '@/utils/constants';
import { isString } from '@/utils/utils';

import ListCardViewFilters from './ListCardViewFilters';

/**
 * get all columns except id or actions
 * @param data
 * @param removeAction
 * @returns
 */
const getFilteredData = (data: Record<string, any>, removeAction = false): string[] => {
  const keys = Object.keys(data);

  if (!removeAction) {
    return keys.filter((key: string): boolean => key !== 'id');
  }

  return keys.filter((key: string): boolean => key !== 'id' && key !== 'actions');
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

type Props<IDataTable> = {
  items: IDataTable[];
  headCells: ITableHeadCell<keyof IDataTable>[];
  count: number;
  disabledRowId?: string;
  pagination: IPagination;
  selectedIds: string[];
  onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
  onSort: (_: MouseEvent<unknown> | null, property: any) => void;
  canMultipleSelect: boolean;
  onRowClick: (data: Record<string, any>) => void;
  isItemSelected: (id: string) => boolean;
  stopCheckboxPropagation: (event: MouseEvent<HTMLElement>) => void;
  onCheckedRow: (objectId: string) => void;
  onChangePage: (_: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  onOrder: (order: 'asc' | 'desc') => void;
  viewsComponent: ReactNode;
  disableRowClickEvent: boolean;
};

const ListCardsView = <IDataTable extends Record<string, any>>({
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
  onChangePage,
  onChangeRowsPerPage,
  isItemSelected,
  onOrder,
  viewsComponent,
  disableRowClickEvent,
}: Props<IDataTable>) => {
  const {
    t,
  } = useTranslation();

  return (
    <Stack spacing={3}>
      <div>
        <Box sx={{ mb: { xs: 0, lg: 2 }, my: { xs: 2, lg: 0 } }}>
          <ListCardViewFilters<IDataTable>
            canMultipleSelect={canMultipleSelect}
            headCells={headCells}
            numSelected={selectedIds.length}
            order={pagination.order}
            orderBy={pagination.orderBy}
            viewsComponent={viewsComponent}
            rowCount={disabledRowId
              ? items.length - 1
              : items.length}
            onOrder={onOrder}
            onRequestSort={onSort}
            onSelectAllClick={onSelectAll}
          />
        </Box>
        <Grid container spacing={{ xs: 8, sm: 8, lg: 2 }}>
          {items.length > 0 ? (
            items.map((data: IDataTable, index: number): ReactNode => {
              const isSelected = isItemSelected(data.id);

              return (
                (
                  <Grid
                    key={data.id + index}
                    sx={{ display: 'flex' }}
                    size={{
                      lg: 6,
                      md: 8,
                      sm: 12,
                      xl: 3,
                      xs: 12,
                    }}
                  >
                    <Card
                      className="flexColumn alignSelf flex1"
                      elevation={isSelected
                        ? 4
                        : 1}
                      sx={[{
                        borderRadius: { xs: 0, md: 4 },
                        cursor: disableRowClickEvent ? 'inherit' : 'pointer',
                      }, isSelected ? {
                        backgroundColor: grey[100],
                      } : {
                        backgroundColor: 'inherit',
                      }]}
                      onClick={() => onRowClick(data)}
                    >
                      <CardContent sx={{ p: { xs: 0, sm: 2, md: 4 }, alignSelf: 'stretch' }}>
                        <Stack spacing={1}>
                          {getFilteredData(data, true).map((key: string, cellIndex: number) => (
                            <Stack key={cellIndex + (data)[key]} spacing={1}>
                              <Stack alignItems="center" direction="row" justifyContent="space-between">
                                {/* label (left) */}
                                <Typography css={(theme: Theme) => ({ color: theme.palette.grey[500] })}>
                                  {headCells[cellIndex].label}
                                </Typography>
                                {/* value (right) */}
                                {isString((data)[key])
                                  ? (
                                    <Typography>{(data)[key]}</Typography>
                                  )
                                  : (
                                    <div>{(data)[key]}</div>
                                  )}
                              </Stack>
                              <Divider />
                            </Stack>
                          ))}
                        </Stack>
                      </CardContent>
                      <CardActions className="flexRow spaceBetween stretchSelf" css={{ flex: 1, alignItems: 'flex-end' }}>
                        {canMultipleSelect && (

                        /*
                         * checkbox (left)
                         * need a container to stop the card click propagation
                         */
                          (
                            <Box onClick={stopCheckboxPropagation}>
                              <Tooltip title={t('select')}>
                                <Checkbox
                                  disableRipple
                                  checked={isSelected}
                                  checkedIcon={<StyledCheckedCheckbox size={18} />}
                                  color="primary"
                                  icon={<StyledCheckbox size={18} />}
                                  inputProps={{ 'aria-labelledby': 'list-card-view-' + data.id }}
                                  onChange={() => onCheckedRow(data.id)}
                                />
                              </Tooltip>
                            </Box>
                          )
                        )}
                        {/* icon button actions (right) */}
                        {getActionsColumn(data)}
                      </CardActions>
                    </Card>
                  </Grid>
                )
              );
            })
          ) : (

          /*
           * center the cell with the cell (column) number (with the checkbox column)
           * <EmptyTableRow columnCount={headCells.length + 1} loading={loading} />
           */
            (<EmptyData sx={{ mt: 5, py: 5 }} />)
          )}
        </Grid>
      </div>
      {count > 0 && (
        <TablePagination
          component="div"
          count={count}
          page={pagination.currentPage}
          rowsPerPage={(pagination as any).rowsPerPage}
          rowsPerPageOptions={PAGINATION.rowsPerPageOptions}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangeRowsPerPage}
        />
      )}
    </Stack>
  );
};

export default ListCardsView;
