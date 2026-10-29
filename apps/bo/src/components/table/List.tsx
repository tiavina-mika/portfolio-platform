import { IconButton, Stack, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import { debounce } from 'lodash';
import {
  ChangeEvent, MouseEvent, ReactNode, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiList } from 'react-icons/fi';
import { MdDeleteSweep } from 'react-icons/md';
import { useSelector } from 'react-redux';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { getAppLoadingSelector } from '@/redux/reducers/app.reducer';
import {
  IListSelectionAction,
  IListTabValue, IMenu, IPagination, IQueriesInput, IRenderSearchProps,
  ISelectOption,
  ITableHeadCell,
  ListView,
} from '@/types/app.type';
import { convertSearchParamsToFilters } from '@/utils/app.utils';
import { DEFAULT_PAGINATION, DEFAULT_QUERIES_INPUT } from '@/utils/constants';
import { getLocalStorage, pagePaginationToQueryInput, setLocalStorage } from '@/utils/utils';

import ListCardsView from './ListCardsView';
import ListTabs from './ListTabs';
import SearchContainer from './SearchContainer';
import Table from './Table';
import TableToolbar from './TableToolbar';


const initializeQuery = <T extends IQueriesInput['filters'], I>(defaultFilters: ListProps<I, T>['defaultFilters'], tabs: ListProps<I, T>['tabs']) => (prev: IQueriesInput = DEFAULT_QUERIES_INPUT) => {
  const newFilters = convertSearchParamsToFilters({
    tabs: tabs || [],
    searchParams: { tab: defaultFilters?.tab },
    filters: prev?.filters ?? {},
  });

  return {
    ...prev,
    filters: {
      deleted: false, // important, by default get all non-deleted items
      ...prev?.filters,
      ...defaultFilters,
      ...newFilters,
    },
  };
};

export type ListProps<IDataTable, IQuery> = {
  tabs?: IListTabValue[];
  items: IDataTable[];
  headCells: ITableHeadCell<keyof IDataTable>[];
  count: number;
  disabledRowId?: string;
  onRowClick?: (id: string) => void;
  canDelete?: boolean;
  canUpdate?: boolean;
  canDestroy?: boolean;
  renderFilter?: (values: IRenderSearchProps) => ReactNode;
  border?: boolean;
  onUpdateData: any;
  defaultFilters?: IQuery;
  disableRowClickEvent?: boolean;
  toolbarMenus?: IMenu<string[]>[];
  selectionOptions?: IListSelectionAction[];
};

const List = <
  IDataTable extends Record<string, any>,
  // add = to make it optional
  IQuery extends IQueriesInput['filters'] = IQueriesInput['filters']
>({
  tabs = [],
  items,
  headCells,
  count,
  disabledRowId,
  onRowClick,
  onUpdateData,
  renderFilter,
  defaultFilters,
  canDestroy,
  disableRowClickEvent = true,
  border = false,
  selectionOptions = [],
}: ListProps<IDataTable, IQuery>) => {
  const [isInitPagination, setIsInitPagination] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination>(DEFAULT_PAGINATION);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [view, setView] = useState<ListView>(getLocalStorage('listView'));
  const [queries, setQueries] = useState<IQueriesInput>(DEFAULT_QUERIES_INPUT);
  const [initialQueries, setInitialQueries] = useState<IQueriesInput>(DEFAULT_QUERIES_INPUT);

  const isDesktopDown = useBreakpoint();
  const {
    t,
  } = useTranslation();
  const loading = useSelector(getAppLoadingSelector);

  useEffect(() => {
    if (isDesktopDown) return;
    // only load for the first time
    if (getLocalStorage('listView')) return;
    setView('list');

    setLocalStorage('listView', 'list');
  }, [isDesktopDown]);

  useEffect(() => {
    if (!defaultFilters) return;

    setQueries(initializeQuery<IQuery, unknown>(defaultFilters, tabs));
  }, [defaultFilters, tabs]);

  // run once
  useEffect(() => {
    if (!defaultFilters) return;
    setInitialQueries(initializeQuery<IQuery, unknown>(defaultFilters, tabs));

  }, []);

  useEffect(() => {
    if (isInitPagination) {
      setPagination(DEFAULT_PAGINATION);
    // setSelectedIds([]);
    }
  }, [isInitPagination]);

  const handleChangeTable = (values: IQueriesInput) => {
    const newQueries = {
      ...queries,
      ...values,
      filters: { ...queries.filters },
    };

    setQueries(newQueries);
    onUpdateData(newQueries);

    /*
     * dispatch(loadUsers(newQueries));
     * stay in the current page
     */
    setIsInitPagination(false);
  };

  const onAdvancedSearch = (values: Record<string, any>) => {
    /*
     * queries for database search
     * add the search values to the queries
     */
    const newQueries = {
      ...queries,
      search: values,
      filters: { ...queries.filters },
      skip: 0,
    };

    onUpdateData(newQueries);
    setQueries(newQueries);
    // stay in the current page
    setIsInitPagination(true);
  };

  const onInitFilters = () => {
    setQueries(initialQueries);
    onUpdateData(initialQueries);
    setIsInitPagination(true);
  };

  // input search on key up
  const onSearch = debounce((name: string, value: unknown) => {
    const newQueries = {
      ...queries,
      search: { ...queries.search, [name]: value },
      filters: { ...queries.filters },
      skip: 0,
    };

    setQueries(newQueries);
    onUpdateData(newQueries);
    setIsInitPagination(true);
  }, 500);

  /**
   * reload data for each tab change
   * it redirect to a new page with the same url but with a search params (ex: ?tab=new)
   * so the data are in onPageEnter
   * @param tabValue
   */
  const handleTabChange = (tabValue: string) => {
    // remove prev tab filters (only tab filters)
    if (queries.filters) {
      Object.keys(queries.filters).forEach((key: string) => {
        if (tabs.find((tab: IListTabValue): boolean => [tab.key, tab.tab].includes(key))) {
          delete queries.filters?.[key];
        }
      });
    }

    /*
     * change the tab name to queries
     * ex: ?tab=new to { seen: false }
     */
    const filters = convertSearchParamsToFilters({
      tabs,
      searchParams: { tab: tabValue },
      filters: queries.filters || {},
    });

    queries.filters = filters;
    queries.search = undefined;

    setQueries(queries);

    /*
     * NOTE:
     * here we do not need to update the onChange function
     * the url change will trigger the onPageEnter,
     * then there we change the url search params to filters for db queries
     * should always be in page 1 after the search
     */
    setIsInitPagination(true);
  };

  const handleSort = (_: MouseEvent<unknown> | null, property: any): void => {
    const isAsc = pagination.orderBy === property && pagination.order === 'asc';
    const defaultOrder = isAsc
      ? 'desc'
      : 'asc';
    const state = { ...pagination, order: defaultOrder, orderBy: property, currentPage: 0 };

    setPagination(state as any);
    handleChangeTable(pagePaginationToQueryInput(state as any));
  };

  const handleOrder = (order: 'asc' | 'desc'): void => {
    const state = { ...pagination, order };

    setPagination(state);
    handleChangeTable(pagePaginationToQueryInput(state));
  };

  const handleChangePage = (_: unknown, newPage: number): void => {
    const skip = newPage * (pagination.rowsPerPage || 1);

    setPagination({ ...pagination, currentPage: newPage });
    handleChangeTable(pagePaginationToQueryInput({ ...pagination, currentPage: skip }));
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(event.target.value, 10);
    const state = { ...pagination, rowsPerPage: limit };

    setPagination(state);
    handleChangeTable(pagePaginationToQueryInput(state));
  };

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>): void | undefined => {
    if (event.target.checked) {
      let selectedIds: string[] = items.map((item: any): string => item.id || item.objectId);

      // can not select the disabled row (id)
      if (disabledRowId) {
        selectedIds = selectedIds.filter((id: string): boolean => id !== disabledRowId);
      }

      setSelectedIds(selectedIds);
      return;
    }
    setSelectedIds([]);
  };

  const resetSelectedIds = (): void => setSelectedIds([]);

  const handleCheckedRow = (objectId: string): void | undefined => {
    if (objectId === disabledRowId) return; // can not be checked

    const selectedIndex = selectedIds.indexOf(objectId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, objectId);
    }
    else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedIds.slice(1));
    }
    else if (selectedIndex === selectedIds.length - 1) {
      newSelected = newSelected.concat(selectedIds.slice(0, -1));
    }
    else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1)
      );
    }

    setSelectedIds(newSelected);
  };

  const isSelected = (name: string): boolean => selectedIds.includes(name);

  const handleRowClick =
    (data: Record<string, any>) =>
      (event: MouseEvent<HTMLElement>): void | undefined => {
        if (disableRowClickEvent) {
          event?.preventDefault();
        }

        // custom click
        if (onRowClick) {
          onRowClick(data.id);
          return;
        }

        if (disableRowClickEvent) return;

        /*
         * props from Actions component
         * if enable row click, it will go to preview
         */
        if (data.actions.props.onPreview) {
          data.actions.props.onPreview(data.id);
          return;
        }

        // checked when the row is clicked
        handleCheckedRow(data.id);
      };

  const stopCheckboxPropagation = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
  };

  const handleListViewChange = (value: ListView): void => {
    setView(value);
    setLocalStorage('listView', value);
  };

  const views = (
    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
      {([
        {
          label: t('listViewTooltip'),
          icon: <FiList />,
          value: 'list',
        },
        {
          label: t('cardViewTooltip'),
          icon: <FiGrid />,
          value: 'grid',
        },
      ] as ISelectOption<ListView>[]).map(({ label, icon, value }) => (
        <Tooltip key={value} title={label}>
          <IconButton
            color={view === value ? 'primary' : 'default'}
            onClick={() => handleListViewChange(value)}
          >
            {icon}
          </IconButton>
        </Tooltip>
      ))}
    </Stack>
  );

  return (
    (
      <Box sx={{ width: '100%' }}>
        {/* tabs using search params */}
        {tabs.length > 0 && (
          <ListTabs
            canDestroy={canDestroy}
            onTabChange={handleTabChange}
            searchParams={{ tab: defaultFilters?.tab }}
            tabs={tabs}
          />
        )}
        {renderFilter && (
        // add spacing in right for the reset button (see below)
          (
            <SearchContainer css={{ paddingRight: 40, position: 'relative' }}>
              {/* see in AdvancedSearchForm.tsx */}
              {renderFilter({ onSearch, onAdvancedSearch })}
              {/* reset filter */}
              <Tooltip title={t('resetFilters')}>
                <IconButton onClick={onInitFilters} sx={{ position: 'absolute', right: 0 }}>
                  <MdDeleteSweep />
                </IconButton>
              </Tooltip>
            </SearchContainer>
          )
        )}
        {/* ------- search and filter ------- */}
        <TableToolbar
          resetSelectedIds={resetSelectedIds}
          selectedIds={selectedIds}
          selectionActions={selectionOptions}
        />
        {/* ------- view selection buttons ------- */}
        {view === 'list' && !isDesktopDown && views}
        {/* ------- list (list or grid) ------- */}
        {view === 'list'
          ? (
            <Table<IDataTable>
              border={border}
              canMultipleSelect={selectionOptions.length > 0}
              count={count}
              disabledRowId={disabledRowId}
              disableRowClickEvent={disableRowClickEvent}
              headCells={headCells}
              isItemSelected={isSelected}
              items={items}
              loading={loading}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              onCheckedRow={handleCheckedRow}
              onRowClick={handleRowClick}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              pagination={pagination}
              selectedIds={selectedIds}
              stopCheckboxPropagation={stopCheckboxPropagation}
            />
          )
          : (
            <ListCardsView
              canMultipleSelect={selectionOptions.length > 0}
              count={count}
              disabledRowId={disabledRowId}
              disableRowClickEvent={disableRowClickEvent}
              headCells={headCells}
              isItemSelected={isSelected}
              items={items}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              onCheckedRow={handleCheckedRow}
              onOrder={handleOrder}
              onRowClick={handleRowClick}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              pagination={pagination}
              selectedIds={selectedIds}
              stopCheckboxPropagation={stopCheckboxPropagation}
              viewsComponent={isDesktopDown
                ? null
                : views}
            />
          )}
      </Box>
    )
  );
};

export default List;
