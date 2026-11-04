import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiTrash2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import CreateButton from '@/components/CreateButton';
import EmptyData from '@/components/EmptyData';
import Head from '@/components/Head';
import PageHeader from '@/components/layouts/PageHeader';
import DatesCell from '@/components/table/DatesCell';
import ListWithSelection from '@/components/table/ListWithSelection';
import UserCell from '@/components/UserCell';
import i18n from '@/config/i18n';
import { ALL_TAB_COUNT_KEY, recycleBinTabOptions } from '@/constants/_core/app.constants';
import { CMS_JSON_DOWNLOAD_IGNORED_FIELDS } from '@/constants/_core/cms.constants';
import { LIST_STATE_ICON_SIZE } from '@/constants/_core/ui/list.constants';
import PageBlocksCell from '@/containers/_core/pages/PageBlocksCell';
import PageCategoriesCell from '@/containers/_core/pages/PageCategoriesCell';
import SearchPages from '@/containers/_core/pages/pageForms/SearchPages';
import PageNameCell from '@/containers/_core/pages/PageNameCell';
import PageSectionsCell from '@/containers/_core/pages/PageSectionsCell';
import PageStatusCell from '@/containers/_core/pages/PageStatusCell';
import { useProtect } from '@/hooks/_core/useProtect';
import { destroyObjects } from '@/redux/actions/_core/app.action';
import {
  deletePage, exportPages, goToAddPage, goToPage, goToEditPage, loadPages, togglePagesByIds,
  goToPageOnWebsite,
} from '@/redux/actions/_core/page.action';
import {
  deletePagesSlice, getPageCountSelector, getPagePagesSelector, getPageTabCountsSelector,
  shiftPageTabCountsSlice,
} from '@/redux/reducers/_core/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { pagesRoute } from '@/routes/protected/_core/page.routes';
import {
  ExportFormat,
  IQueriesInput, IRenderSearchProps, ITableHeadCell, ITabAndCategorySearchParams,
} from '@/types/_core/app.type';
import { ICategory } from '@/types/_core/category.type';
import { IPage, IPageTranslatedFields } from '@/types/_core/page.type';
import { isCurrentTab } from '@/utils/_core/app.utils';
import { downloadObjectAsJson } from '@/utils/_core/download.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';

interface IData {
  page: ReactNode;
  categories: ReactNode;
  dates: ReactNode;
  user: ReactNode | null;
  sections: ReactNode;
  blocks: ReactNode;
  status: ReactNode;
  actions: ReactNode;
}

/*
 * The columns answer, in order, the questions an editor asks of a page: which page it is, where it
 * is filed, when it was written, who owns it, how much of it is built and live, what it is made of,
 * and whether it is on the site. The title and the technical code fold into the first cell, and the
 * languages into the blocks cell, so each reads as one fact rather than as two columns that only
 * make sense next to each other.
 */
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'page',
    label: i18n.t('cms:page'),
    width: 280,
    // the name lives under `translated.<locale>.name` - there is no one field to order on
    disableSorting: true,
  },
  {
    id: 'categories',
    label: i18n.t('cms:category.categories'),
    // a page carries several categories at once; ordering on the pointer array orders on nothing
    disableSorting: true,
  },
  {
    id: 'dates',
    label: `${i18n.t('common:createdAt')} / ${i18n.t('common:updatedAt')}`,
    sortFields: [
      { id: 'createdAt', label: i18n.t('common:createdAt') },
      { id: 'updatedAt', label: i18n.t('common:updatedAt') },
    ],
  },
  {
    id: 'user',
    label: i18n.t('cms:author'),
    align: 'left',
    // the author is a pointer; ordering on it orders on its id, which means nothing to a reader
    disableSorting: true,
  },
  {
    id: 'sections',
    label: i18n.t('cms:sections'),
    // summed over the sections pointing at the page - the page itself carries no field to order on
    disableSorting: true,
  },
  {
    id: 'blocks',
    label: i18n.t('cms:blocks'),
    align: 'right',
    // same as the sections beside it: the count is built per request, not stored on the page
    disableSorting: true,
  },
  {
    id: 'status',
    label: i18n.t('common:status'),
    // read off `active` and `deleted` together - neither of the two alone orders the column
    disableSorting: true,
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
  },
];

const collection = 'Page';

// the recycle bin scopes the list on `deleted`, which is what its tab and its count are keyed by
const RECYCLE_BIN_COUNT_KEY = 'deleted';

const Pages = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pages = useSelector(getPagePagesSelector);
  const locale = useSelector(getSettingsLocaleSelector);

  const count = useSelector(getPageCountSelector);
  // how many pages each tab holds — the strip states the recycle bin's total from the list tab too
  const tabCounts = useSelector(getPageTabCountsSelector);
  const searchParams: ITabAndCategorySearchParams = pagesRoute.useSearch();

  const {
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
    canCreate,
  } = useProtect(collection);

  const {
    t,
  } = useTranslation(['cms']);
  const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

  // destroy objects (in recycle bin)
  const handleDestroy = useCallback(
    (id: string | string[]): void => {
      const options = { collection, messageLabel: t('cms.pages'), updateListCallback: deletePagesSlice };
      const ids = Array.isArray(id) ? id : [id];

      dispatch(destroyObjects(ids, options));
      // destroyed for good — they leave the recycle bin without landing anywhere else
      dispatch(shiftPageTabCountsSlice({ from: RECYCLE_BIN_COUNT_KEY, amount: ids.length }));
    },
    [dispatch, t]
  );

  // delete a row
  const handleDelete = useCallback(
    (page: IPage): void => {
      dispatch(deletePage(page.id));
      dispatch(shiftPageTabCountsSlice({
        from: ALL_TAB_COUNT_KEY, to: RECYCLE_BIN_COUNT_KEY, amount: 1,
      }));
    },
    [dispatch]
  );

  /*
   * Puts a binned row back in the list. The recycle bin only ever offered "destroy permanently",
   * so a row deleted by mistake had no way back — this is the same soft-delete flag, flipped, and
   * the tab counters move with it.
   */
  const handleRestore = useCallback(
    (id: string): void => {
      dispatch(togglePagesByIds([id], RECYCLE_BIN_COUNT_KEY, false));
      dispatch(shiftPageTabCountsSlice({
        from: RECYCLE_BIN_COUNT_KEY, to: ALL_TAB_COUNT_KEY, amount: 1,
      }));
    },
    [dispatch]
  );

  // go to preview page
  const handlePreview = useCallback(
    (id: string): void => {
      navigate(goToPage(id));
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (page: IPage): void => {
      navigate(goToEditPage(page.id));
    },
    [navigate]
  );

  const handleDownloadJson = useCallback(
    (page: IPage): void => {
      downloadObjectAsJson(page, CMS_JSON_DOWNLOAD_IGNORED_FIELDS, `page-${page.code || page.id}`);
    },
    []
  );

  const handleCreate = (): void => {
    navigate(goToAddPage());
  };

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    if (isRecycleBin) {
      handleDestroy(ids);
      return;
    }
    dispatch(togglePagesByIds(ids, RECYCLE_BIN_COUNT_KEY, true));
    // binned, not destroyed: the rows move from the list tab into the recycle bin
    dispatch(shiftPageTabCountsSlice({
      from: ALL_TAB_COUNT_KEY, to: RECYCLE_BIN_COUNT_KEY, amount: ids.length,
    }));
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadPages(queries));
  };

  const handleExport = (format: ExportFormat, queries: IQueriesInput) => {
    dispatch(exportPages(queries, format));
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

    const pagesData = pages.map((page: IPage) => {
      const name = getTranslatedField<IPageTranslatedFields>(page.translated, locale, 'name');
      // the category field is moved to deletedCategory in the recycle bin
      const categoryFieldName = isRecycleBin ? 'deletedCategories' : 'categories';

      // default data
      const data: Record<string, any> = {
        id: page.id, // required even if not displayed
        page: <PageNameCell locale={locale} page={page} />,
        categories: (
          <PageCategoriesCell
            categories={(page as any)[categoryFieldName] as ICategory[]}
            locale={locale}
          />
        ),
        dates: <DatesCell createdAt={page.createdAt} updatedAt={page.updatedAt} />,
        user: (page.user !== undefined)
          ? <UserCell compact contactType="email" user={page.user} />
          : null,
        sections: <PageSectionsCell page={page} />,
        blocks: <PageBlocksCell page={page} />,
        status: <PageStatusCell page={page} />,
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={name}
              onDestroy={() => handleDestroy(page.id)}
              onDownloadJson={() => handleDownloadJson(page)}
              onPreview={() => handlePreview(page.id)}
              onRestore={() => handleRestore(page.id)}
              type="row"
            />
          )
          : (
            <ActionsMenu
              label={name}
              onDownloadJson={() => handleDownloadJson(page)}
              type="row"
              websiteUrl={goToPageOnWebsite(page.translated, locale)}
              onDelete={canDelete
                ? () => handleDelete(page)
                : undefined}
              onEdit={canEdit
                ? () => handleEdit(page)
                : undefined}
              onPreview={canPreview
                ? () => handlePreview(page.id)
                : undefined}
            />
          ),
      };

      return data as IData;
    });

    return pagesData;
  }, [
    pages,
    handleDelete,
    handlePreview,
    handleDestroy,
    handleEdit,
    handleDownloadJson,
    handleRestore,
    locale,
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
    searchParams?.tab,
  ]);

  return (
    <>
      <Head title={t('cms:pages')} />
      <PageHeader
        actions={canCreate && <CreateButton label={t('cms:createPage')} onClick={handleCreate} />}
        title={t('cms:pages')}
      />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        headCells={headCells}
        items={dataTable}
        onDeleteSelected={handleDeleteSelected}
        onExport={handleExport}
        onUpdateData={handleUpdateData}
        renderFilter={(prop: IRenderSearchProps) => <SearchPages {...prop} />}
        tabCounts={tabCounts}
        tabs={recycleBinTabOptions}
        /*
         * an empty recycle bin is not a search that found nothing: the generic state would tell an
         * editor that no page exists, when in fact none has been deleted
         */
        emptyState={isRecycleBin
          ? (
            <EmptyData
              description={t('cms:pagesRecycleBinEmptyDescription')}
              icon={<FiTrash2 size={LIST_STATE_ICON_SIZE} />}
              title={t('cms:pagesRecycleBinEmpty')}
            />
          )
          : undefined}
      />

    </>
  );
};

export default Pages;
