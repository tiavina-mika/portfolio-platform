import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import AddFab from '@/components/AddFab';
import Head from '@/components/Head';
import ListWithSelection from '@/components/table/ListWithSelection';
import UserCell from '@/components/UserCell';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import SearchPages from '@/containers/pages/pageForms/SearchPages';
import { useProtect } from '@/hooks/useProtect';
import { destroyObjects } from '@/redux/actions/app.action';
import {
  deletePage, goToAddPage, goToPage, goToEditPage, loadPages, togglePagesByIds, goToPageOnWebsite,
} from '@/redux/actions/page.action';
import { deletePagesSlice, getPageCountSelector, getPagePagesSelector } from '@/redux/reducers/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { pagesRoute } from '@/routes/protected/page.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/app.type';
import { IPage, IPageTranslatedFields } from '@/types/page.type';
import { isCurrentTab } from '@/utils/app.utils';
import { getTranslatedCategoriesName } from '@/utils/cms.utils';
import { displayDate } from '@/utils/date.utils';
import { getTranslatedField } from '@/utils/settings.utils';

interface IData {
  name: string;
  title: string;
  categories: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  actions: ReactNode;
}

const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'name',
    label: i18n.t('cms:name'),
  },
  {
    id: 'title',
    label: i18n.t('cms:title'),
    align: 'left',
  },
  {
    id: 'categories',
    label: i18n.t('cms:category.categories'),
    align: 'center',
  },
  {
    id: 'user',
    label: i18n.t('cms:author'),
    align: 'right',
  },
  {
    id: 'createdAt',
    label: i18n.t('common:createdAt'),
    align: 'right',
  },
  {
    id: 'updatedAt',
    label: i18n.t('common:updatedAt'),
    align: 'right',
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'right',
  },
];

const collection = 'Page';

const Pages = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pages = useSelector(getPagePagesSelector);
  const locale = useSelector(getSettingsLocaleSelector);

  const count = useSelector(getPageCountSelector);
  const searchParams = pagesRoute.useSearch();

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
    },
    [dispatch, t]
  );

  // delete a row
  const handleDelete = useCallback(
    (page: IPage): void => {
      dispatch(deletePage(page.id));
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

  const handleCreate = (): void => {
    navigate(goToAddPage());
  };

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    if (isRecycleBin) {
      handleDestroy(ids);
      return;
    }
    dispatch(togglePagesByIds(ids, 'deleted', true));
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadPages(queries));
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

    const pagesData = pages.map((page: IPage) => {
      const title = getTranslatedField<IPageTranslatedFields>(page.get('translated'), locale, 'title');
      const name = getTranslatedField<IPageTranslatedFields>(page.get('translated'), locale, 'name');
      // the category field is moved to deletedCategory in the recycle bin
      const categoryFieldName = isRecycleBin ? 'deletedCategories' : 'categories';

      // default data
      const data: Record<string, any> = {
        id: page.id, // required even if not displayed
        name,
        title,
        categories: getTranslatedCategoriesName(page.get(categoryFieldName), locale),

        user: <UserCell user={page.get('user')} />,
        createdAt: displayDate(page.createdAt, false, true),
        updatedAt: displayDate(page.updatedAt, false, true),
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={name}
              type="icon"
              onDestroy={() => handleDestroy(page.id)}
              onPreview={() => handlePreview(page.id)}
            />
          )
          : (
            <ActionsMenu
              label={name}
              websiteUrl={goToPageOnWebsite(page.get('translated'), locale)}
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
    locale,
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
    searchParams?.tab,
  ]);

  return (
    <>
      <Head title="Pages" />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        headCells={headCells}
        items={dataTable}
        renderFilter={(prop: IRenderSearchProps) => <SearchPages {...prop} />}
        tabs={recycleBinTabOptions}
        onDeleteSelected={handleDeleteSelected}
        onUpdateData={handleUpdateData}
      />

      {canCreate && (
        <AddFab onClick={handleCreate} />
      )}
    </>
  );
};

export default Pages;
