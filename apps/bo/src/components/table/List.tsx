import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import {
  ChangeEvent, Fragment, MouseEvent, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import ExportButton from '@/components/ExportButton';
import { DEFAULT_PAGINATION, DEFAULT_QUERIES_INPUT } from '@/constants/_core/app.constants';
import { LIST_FILTERS_DRAWER_Z_INDEX, NO_LIST_TABS } from '@/constants/_core/ui/list.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { IListFilters, ListFiltersContext } from '@/hooks/_core/useListFilters';
import { getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import {
  ExportFormat,
  ExportScope,
  IExportScopeCounts,
  IListSelectionAction,
  IListTabCounts,
  IListTabValue, IMenu, IPagination, IQueriesInput, IRenderSearchProps,
  ITableHeadCell,
  ITableSortField,
  ListView,
  OrderType,
  TableDensity,
} from '@/types/_core/app.type';
import { convertSearchParamsToFilters } from '@/utils/_core/app.utils';
import { getLocalStorage, pagePaginationToQueryInput, setLocalStorage } from '@/utils/_core/utils';

import ListCardsView from './ListCardsView';
import ListPagination from './ListPagination';
import ListSelectionBar from './ListSelectionBar';
import ListTabs from './ListTabs';
import ListToolbar from './ListToolbar';
import ListViewToggle from './ListViewToggle';
import MarkAllAsSeenButton from './MarkAllAsSeenButton';
import SavedViewsMenu from './SavedViewsMenu';
import SortMenu from './SortMenu';
import Table from './Table';


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

const classes = {
  /*
   * `:empty` rather than a conditional mount: the slot has to be in the tree for the filter form to
   * portal into it, but an always-on absolute layer over the card would intercept every click meant
   * for the rows underneath it
   */
  filtersOverlay: {
    position: 'absolute' as const,
    inset: 0,
    zIndex: LIST_FILTERS_DRAWER_Z_INDEX,
    '&:empty': { display: 'none' },
  },
};

// module-level, so the memoized rows always receive the same function
const stopCheckboxPropagation = (event: MouseEvent<HTMLElement>): void => {
  event.stopPropagation();
};

export type ListProps<IDataTable, IQuery> = {
  tabs?: IListTabValue[];
  /*
   * how many rows each tab holds, keyed by its database field with `all` for the unscoped tab.
   * The figures are the totals of each scope, not of the current search — they say how much there
   * is to switch to. Omit it and the strip carries labels only.
   */
  tabCounts?: IListTabCounts;
  items: IDataTable[];
  headCells: ITableHeadCell<keyof IDataTable>[];
  /*
   * orderings offered in the sort menu that no column stands for — for a list whose columns all
   * describe the row itself but which is still worth reading newest-first, or by what moved last
   */
  extraSortFields?: ITableSortField[];
  count: number;
  disabledRowId?: string;
  onRowClick?: (id: string) => void;
  canDelete?: boolean;
  canUpdate?: boolean;
  canDestroy?: boolean;
  renderFilter?: (values: IRenderSearchProps) => ReactNode;
  onUpdateData: any;
  defaultFilters?: IQuery;
  disableRowClickEvent?: boolean;
  toolbarMenus?: IMenu<string[]>[];
  selectionOptions?: IListSelectionAction[];
  // enables the saved-filters/views menu, namespacing it in localStorage — omit to keep it disabled
  listId?: string;
  /*
   * enables the export button (CSV/Excel) — omit to keep it disabled.
   * receives the current filters/search/order already narrowed to the scope the reader picked in
   * the export menu, so the caller re-fetches exactly those rows before flattening them into a
   * file: no pagination for the whole filtered set, a page for what is on screen, and that page
   * plus `ids` for what was ticked — see apps/bo/src/utils/_core/export.utils.ts
   */
  onExport?: (format: ExportFormat, queries: IQueriesInput) => void;
  /*
   * initial sort column/direction, when the generic `updatedAt desc` is not the right entry point
   * for this list — e.g. a processing queue that must open on its oldest item, not its newest
   */
  defaultOrderBy?: string;
  defaultOrder?: OrderType;
  /*
   * what the list says in place of its rows when the current scope holds none. Left out, it falls
   * back to the generic "no data" state — pass it when the scope explains the emptiness better
   * than that does (an empty recycle bin is not a list that failed to find anything).
   */
  emptyState?: ReactNode;
  /*
   * what a row states when it is opened, drawn in a band under it (in the table) or inside the
   * card (in the grid). Pass it when the reader has to decide on a row without leaving the list —
   * a payment ledger where the failure message and the actions on it are what the decision needs.
   * Left out, rows do not open at all and no caret gutter is drawn.
   */
  renderRowDetail?: (data: IDataTable) => ReactNode;
  /*
   * clears everything still unseen in the collection, from the toolbar. Pass it on the lists whose
   * rows queue up for someone to handle — leave it out and no such control is drawn, which is the
   * right answer for a list that tracks no `seen` state at all.
   */
  onMarkAllAsSeen?: () => void;
  // width under which the grid stops shrinking and scrolls sideways instead
  tableMinWidth?: number;
};

const List = <
  IDataTable extends Record<string, any>,
  // add = to make it optional
  IQuery extends IQueriesInput['filters'] = IQueriesInput['filters']
>({
  tabs = NO_LIST_TABS,
  tabCounts,
  items,
  headCells,
  extraSortFields,
  count,
  disabledRowId,
  onRowClick,
  onUpdateData,
  renderFilter,
  defaultFilters,
  canDestroy,
  disableRowClickEvent = true,
  selectionOptions = [],
  listId,
  onExport,
  defaultOrderBy,
  defaultOrder,
  emptyState,
  renderRowDetail,
  onMarkAllAsSeen,
  tableMinWidth,
}: ListProps<IDataTable, IQuery>) => {
  const initialPagination = useMemo((): IPagination => ({
    ...DEFAULT_PAGINATION,
    orderBy: defaultOrderBy ?? DEFAULT_PAGINATION.orderBy,
    order: defaultOrder ?? DEFAULT_PAGINATION.order,
  }), [defaultOrderBy, defaultOrder]);

  const [isInitPagination, setIsInitPagination] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination>(initialPagination);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  /*
   * which rows are currently open, held by the list rather than by each row: a row is remounted on
   * every fetch, so state owned by the row would close every open band whenever the page reloads
   */
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  /*
   * the rendering the reader picked on a pointer device, kept even while a narrow screen overrides
   * it below — it is theirs, and it has to be there again when they come back to a wide screen
   */
  const [view, setView] = useState<ListView>(getLocalStorage('listView'));
  /*
   * kept apart from the rendering above it: the reader who picked the airy row is still the one who
   * picked it after a trip through the card grid and back
   */
  const [density, setDensity] = useState<TableDensity>(getLocalStorage('tableDensity') ?? 'compact');
  const [queries, setQueries] = useState<IQueriesInput>(DEFAULT_QUERIES_INPUT);
  // first paint only — avoids a flash of "no data" before the loading state settles
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  /*
   * bumped on "reset filters" to remount renderFilter's subtree (advanced search dialog, search
   * inputs) and clear their own internal state, which lives outside the queries state managed here
   */
  const [filterResetKey, setFilterResetKey] = useState<number>(0);
  /*
   * the filter panel folds under the toolbar and the active-filter chips sit under it, but the
   * fields they hold come from the page through `renderFilter` — the card owns the two bands and
   * hands them to that node as slots to render into (see useListFilters)
   */
  const [filtersPanelSlot, setFiltersPanelSlot] = useState<HTMLDivElement | null>(null);
  /*
   * the same filter set, on touch: a phone has no room to show the rows behind the fields that
   * narrow them, so it covers the card instead of folding out of it. The slot stands over every
   * band at once and disappears while nothing is rendered into it — an empty overlay left in place
   * would swallow every click meant for the list under it.
   */
  const [filtersOverlaySlot, setFiltersOverlaySlot] = useState<HTMLDivElement | null>(null);
  const [filterChipsSlot, setFilterChipsSlot] = useState<HTMLDivElement | null>(null);
  /*
   * kept here rather than in the filter form itself: resetting the filters remounts that form, and
   * the panel must not fold away under the reader's hands while they are still narrowing the list
   */
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState<boolean>(false);

  const {
    t,
  } = useTranslation();
  const isDesktopDown = useBreakpoint();
  /*
   * under `lg` the cards are the list, whatever was last picked: a table of eight columns no longer
   * fits, and the switcher that would swap it back is not offered at that width either — a stored
   * `list` from a wide screen would otherwise strand the reader in a table they cannot leave
   */
  const displayedView: ListView = isDesktopDown
    ? 'grid'
    : view;
  const loading = useSelector(getAppLoadingSelector);

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

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

  useEffect(() => {
    if (isInitPagination) {
      setPagination(initialPagination);
    // setSelectedIds([]);
    }
  }, [isInitPagination, initialPagination]);

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

  const onInitFilters = useCallback((): void => {
    /*
     * recompute from the currently active tab (defaultFilters), not a stale mount-time snapshot,
     * so resetting filters while in the recycle bin tab keeps deleted: true
     */
    const newQueries = initializeQuery<IQuery, unknown>(defaultFilters, tabs)();

    setQueries(newQueries);
    onUpdateData(newQueries);
    setIsInitPagination(true);
    setFilterResetKey((prev) => prev + 1);
  }, [defaultFilters, tabs, onUpdateData]);

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
    const nextOrder: OrderType = isAsc
      ? 'desc'
      : 'asc';
    const state = { ...pagination, order: nextOrder, orderBy: property, currentPage: 0 };

    setPagination(state);
    handleChangeTable(pagePaginationToQueryInput(state));
  };

  /*
   * back to the order the list opens on. The reader is dropped on the first page with it: the row
   * that was on screen at page 40 of one ordering means nothing in another.
   */
  const handleResetOrder = (): void => {
    const state = {
      ...pagination,
      order: initialPagination.order,
      orderBy: initialPagination.orderBy,
      currentPage: 0,
    };

    setPagination(state);
    handleChangeTable(pagePaginationToQueryInput(state));
  };

  const handleChangePage = (_: unknown, newPage: number): void => {
    const skip = newPage * (pagination.rowsPerPage || 1);

    setPagination({ ...pagination, currentPage: newPage });
    handleChangeTable(pagePaginationToQueryInput({ ...pagination, currentPage: skip }));
  };

  const handleChangeRowsPerPage = (limit: number) => {
    const state = { ...pagination, rowsPerPage: limit };
    // same offset fix as handleOrder above
    const skip = pagination.currentPage * limit;

    setPagination(state);
    handleChangeTable(pagePaginationToQueryInput({ ...state, currentPage: skip }));
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

  /*
   * The row callbacks below are handed to every row of the table, which is memoized: they keep the
   * same identity across renders (functional state updates, no dependency on the selection), so
   * ticking one row or opening one band re-renders that row only.
   */

  /*
   * an open band is per row rather than one at a time: an operator comparing two failures against
   * the same operator reads them side by side, and closing the first as they open the second would
   * take away the one they were comparing against
   */
  const handleToggleRowDetail = useCallback((id: string): void => {
    setExpandedIds((previousIds: string[]): string[] => (previousIds.includes(id)
      ? previousIds.filter((expandedId: string): boolean => expandedId !== id)
      : [...previousIds, id]));
  }, []);

  const handleCheckedRow = useCallback((objectId: string): void => {
    if (objectId === disabledRowId) return; // can not be checked

    setSelectedIds((previousIds: string[]): string[] => (previousIds.includes(objectId)
      ? previousIds.filter((selectedId: string): boolean => selectedId !== objectId)
      : [...previousIds, objectId]));
  }, [disabledRowId]);

  const isSelected = (name: string): boolean => selectedIds.includes(name);

  /*
   * the page's own row click is read through a ref: pages are free to pass a new function on every
   * render, and depending on it here would hand every row a new callback each time
   */
  const onRowClickRef = useRef(onRowClick);

  useLayoutEffect(() => {
    onRowClickRef.current = onRowClick;
  }, [onRowClick]);

  // the event is optional: the card view opens a row from its own button, with no row event to stop
  const handleRowClick = useCallback((data: Record<string, any>, event?: MouseEvent<HTMLElement>): void => {
    if (disableRowClickEvent) {
      event?.preventDefault();
    }

    // custom click
    if (onRowClickRef.current) {
      onRowClickRef.current(data.id);
      return;
    }

    if (disableRowClickEvent) return;

    /*
     * props from Actions component
     * if enable row click, it will go to preview
     */
    if (data.actions?.props.onPreview) {
      data.actions.props.onPreview(data.id);
      return;
    }

    // checked when the row is clicked
    handleCheckedRow(data.id);
  }, [disableRowClickEvent, handleCheckedRow]);

  const handleListViewChange = (nextView: ListView, nextDensity: TableDensity): void => {
    setView(nextView);
    setLocalStorage('listView', nextView);
    setDensity(nextDensity);
    setLocalStorage('tableDensity', nextDensity);
  };

  const toggleFiltersPanel = useCallback((): void => setIsFiltersPanelOpen((prev) => !prev), []);

  /*
   * a row is only tickable when there is something to do with the ticked rows: an action the
   * caller left out (no delete right, no "mark as read" handler) must not put a column of
   * checkboxes in front of a list that would then open a band holding no action at all
   */
  const displayedSelectionActions = useMemo(
    (): IListSelectionAction[] => selectionOptions.filter((action) => action.display),
    [selectionOptions]
  );

  // the table drops the lines that only the cards give their own row, header and cell together
  const tableHeadCells = useMemo(
    () => headCells.filter((cell) => !cell.cardOnly),
    [headCells]
  );
  const tableItems = useMemo(() => {
    const cardOnlyKeys = headCells.filter((cell) => cell.cardOnly).map((cell) => String(cell.id));

    return cardOnlyKeys.length === 0
      ? items
      : items.map((item) => omit(item, cardOnlyKeys) as IDataTable);
  }, [headCells, items]);

  /*
   * the three sizes the export can be taken at, as the reader sees them on screen: the rows of the
   * page in front of them, the ones they have ticked, and everything the current filters leave
   */
  const exportScopeCounts = useMemo((): IExportScopeCounts => ({
    currentPage: items.length,
    selection: selectedIds.length,
    allFiltered: count,
  }), [items.length, selectedIds.length, count]);

  /*
   * the scope is applied here rather than by the page: only the list knows which slice of the
   * result set is on screen and which rows are ticked. `allFiltered` drops the pagination the
   * queries carry, which is what lets the export thunk fetch past the current page.
   */
  const getExportQueries = (scope: ExportScope): IQueriesInput => {
    if (scope === 'allFiltered') return { ...queries, limit: undefined, skip: undefined };

    const pageQueries: IQueriesInput = {
      ...queries,
      limit: pagination.rowsPerPage,
      skip: pagination.currentPage * pagination.rowsPerPage,
    };

    return scope === 'selection'
      ? { ...pageQueries, ids: selectedIds }
      : pageQueries;
  };

  /*
   * what the filter form the page hands the toolbar renders into and reads from: the two bands of
   * the card it belongs to, how many rows its filters currently leave, and the way back to the
   * unfiltered list — which clears the toolbar search boxes and the pagination too, so it can only
   * come from here
   */
  const listFilters = useMemo((): IListFilters => ({
    panelSlot: filtersPanelSlot,
    overlaySlot: filtersOverlaySlot,
    chipsSlot: filterChipsSlot,
    resultCount: count,
    isPanelOpen: isFiltersPanelOpen,
    togglePanel: toggleFiltersPanel,
    resetFilters: onInitFilters,
  }), [
    filtersPanelSlot, filtersOverlaySlot, filterChipsSlot, count, isFiltersPanelOpen,
    toggleFiltersPanel, onInitFilters,
  ]);

  /*
   * everything that acts on the list as a whole, read from the right end of the toolbar: how it is
   * sorted, the saved filter sets, the export, and which of the two renderings is on screen
   */
  const toolbarActions = (
    <>
      {/* sort by field + direction — placed first so it sits left of the other slots */}
      <SortMenu<IDataTable>
        extraSortFields={extraSortFields}
        headCells={headCells}
        onOrderByChange={(property) => handleSort(null, property)}
        onReset={handleResetOrder}
        order={pagination.order}
        orderBy={pagination.orderBy}
      />
      {/* saved filters / custom views */}
      {listId && (
        <SavedViewsMenu
          currentSearch={queries.search ?? {}}
          listId={listId}
          onApply={onAdvancedSearch}
        />
      )}
      {onExport && (
        <ExportButton
          disabled={loading}
          onExport={(format, scope) => onExport(format, getExportQueries(scope))}
          scopeCounts={exportScopeCounts}
        />
      )}
      {onMarkAllAsSeen && (
        <MarkAllAsSeenButton disabled={loading} onConfirm={onMarkAllAsSeen} />
      )}
      {/* the rendering mode is a pointer-device choice: on a narrow screen the cards are the list */}
      {!isDesktopDown && (
        <ListViewToggle density={density} onChange={handleListViewChange} view={view} />
      )}
    </>
  );

  return (
    <ListFiltersContext value={listFilters}>
      <Box sx={{ width: '100%' }}>
        {/* tabs using search params — they scope the list, so they stand above the card */}
        {tabs.length > 0 && (
          <ListTabs
            canDestroy={canDestroy}
            mb={2}
            onTabChange={handleTabChange}
            searchParams={{ tab: defaultFilters?.tab }}
            tabCounts={tabCounts}
            tabs={tabs}
          />
        )}
        {/*
          * one card, six bands: what narrows the list — the toolbar, the filter panel folded under
          * it and the chips naming what it applies — then what is currently selected, the list
          * itself, and where the reader is in it
          */}
        {/* the touch filter drawer covers this card and nothing else, hence the stacking ground */}
        <Card sx={{ position: 'relative' }}>
          <ListToolbar
            actions={toolbarActions}
            total={(
              <Typography noWrap variant="caption">
                {t('listTotal', { count })}
              </Typography>
            )}
          >
            {/* see in AdvancedSearchForm.tsx */}
            {/* keyed so "reset filters" remounts it, clearing its own internal state too */}
            {renderFilter && (
              <Fragment key={filterResetKey}>
                {renderFilter({ onSearch, onAdvancedSearch })}
              </Fragment>
            )}
          </ListToolbar>
          {/*
            * the two filter bands are empty slots here: the panel and the chips are rendered into
            * them by the filter form the page hands the toolbar above, which is the only place the
            * fields and their applied values are known
            */}
          <Collapse in={isFiltersPanelOpen}>
            <div ref={setFiltersPanelSlot} />
          </Collapse>
          <div ref={setFilterChipsSlot} />
          <ListSelectionBar
            resetSelectedIds={resetSelectedIds}
            selectedIds={selectedIds}
            selectionActions={displayedSelectionActions}
          />
          {displayedView === 'list'
            ? (
              <Table<IDataTable>
                canMultipleSelect={displayedSelectionActions.length > 0}
                density={density}
                disabledRowId={disabledRowId}
                disableRowClickEvent={disableRowClickEvent}
                emptyState={emptyState}
                expandedIds={expandedIds}
                headCells={tableHeadCells}
                isItemSelected={isSelected}
                items={tableItems}
                loading={loading || isInitialRender}
                onCheckedRow={handleCheckedRow}
                onRowClick={handleRowClick}
                onSelectAll={handleSelectAll}
                onSort={handleSort}
                onToggleRowDetail={handleToggleRowDetail}
                pagination={pagination}
                renderRowDetail={renderRowDetail}
                selectedIds={selectedIds}
                stopCheckboxPropagation={stopCheckboxPropagation}
                tableMinWidth={tableMinWidth}
              />
            )
            : (
              <ListCardsView
                canMultipleSelect={displayedSelectionActions.length > 0}
                disabledRowId={disabledRowId}
                disableRowClickEvent={disableRowClickEvent}
                emptyState={emptyState}
                headCells={headCells}
                isItemSelected={isSelected}
                items={items}
                loading={loading || isInitialRender}
                onCheckedRow={handleCheckedRow}
                onRowClick={handleRowClick}
                onSelectAll={handleSelectAll}
                renderRowDetail={renderRowDetail}
                selectedIds={selectedIds}
                stopCheckboxPropagation={stopCheckboxPropagation}
              />
            )}
          {count > 0 && (
            <ListPagination
              count={count}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              page={pagination.currentPage}
              rowsPerPage={pagination.rowsPerPage}
            />
          )}
          <Box css={classes.filtersOverlay} ref={setFiltersOverlaySlot} />
        </Card>
      </Box>
    </ListFiltersContext>
  );
};

export default List;
