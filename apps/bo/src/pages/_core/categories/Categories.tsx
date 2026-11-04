import { type Theme } from '@mui/material';
import { CategoryEntityEnum } from '@shared/types';
import { useNavigate } from '@tanstack/react-router';
import {
  type ReactNode, useCallback, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiClipboard, FiSlash, FiCheckCircle, FiTrash2,
} from 'react-icons/fi';
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
import { LIST_STATE_ICON_SIZE } from '@/constants/_core/ui/list.constants';
import { MENU_ITEM_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import CategoryEntityCell from '@/containers/_core/categories/CategoryEntityCell';
import CategoryFormDialog from '@/containers/_core/categories/categoryForm/CategoryFormDialog';
import CategoryItemsCell from '@/containers/_core/categories/CategoryItemsCell';
import CategoryNameCell from '@/containers/_core/categories/CategoryNameCell';
import CategoryStatusCell from '@/containers/_core/categories/CategoryStatusCell';
import CategorySubcategoriesCell from '@/containers/_core/categories/CategorySubcategoriesCell';
import SearchCategories from '@/containers/_core/categories/SearchCategories';
import { useProtect } from '@/hooks/_core/useProtect';
import { useToggle } from '@/hooks/_core/useToggle';
import { destroyObjects } from '@/redux/actions/_core/app.action';
import { goToArticles } from '@/redux/actions/_core/article.action';
import {
  createCategory, deleteCategory, editCategory, exportCategories, goToCategory, loadCategories,
  setCategoriesActiveByIds, toggleCategoriesByIds, toggleCategoryActive,
} from '@/redux/actions/_core/category.action';
import { goToPages } from '@/redux/actions/_core/page.action';
import {
  getCategoryCountSelector, getCategoryCategoriesSelector, getCategoryTabCountsSelector,
  deleteCategoriesSlice, shiftCategoryTabCountsSlice,
} from '@/redux/reducers/_core/category.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { categoriesRoute } from '@/routes/protected/_core/category.routes';
import {
  ExportFormat,
  IQueriesInput, IRenderSearchProps, ITableHeadCell, ITabAndCategorySearchParams,
} from '@/types/_core/app.type';
import {
  ICategory, ICategoryInput, ICategoryTranslatedFields,
} from '@/types/_core/category.type';
import { isCurrentTab } from '@/utils/_core/app.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';


interface IData {
  category: ReactNode;
  entity: ReactNode;
  dates: ReactNode;
  user: ReactNode | null;
  subcategories: ReactNode;
  items: ReactNode;
  status: ReactNode;
  actions: ReactNode;
}

/*
 * The columns answer, in order, the questions an editor asks of a category: which shelf it is and
 * where it hangs, what it files and in how many languages, when it was opened, who owns it, how it
 * branches, how much it actually holds, and whether it is in use. The ancestor path and the
 * technical code fold into the first cell, and the languages into the entity cell, so each reads
 * as one fact rather than as two columns that only make sense next to each other.
 */
const headCells: ITableHeadCell<keyof IData>[] = [
  {
    id: 'category',
    label: i18n.t('cms:category.category'),
    width: 280,
    // the name lives under `translated.<locale>.name` - there is no one field to order on
    disableSorting: true,
  },
  {
    id: 'entity',
    label: i18n.t('cms:category.categoryFor'),
    align: 'left',
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
    id: 'subcategories',
    label: i18n.t('cms:category.subcategories'),
    // counted over the categories pointing at this one - it carries no field of its own to order on
    disableSorting: true,
  },
  {
    id: 'items',
    label: i18n.t('cms:category.items'),
    align: 'right',
    // summed over the articles and pages filed here, per request rather than stored on the category
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

const collection = 'Category';

// the recycle bin scopes the list on `deleted`, which is what its tab and its count are keyed by
const RECYCLE_BIN_COUNT_KEY = 'deleted';

const Categories = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation(['cms', 'common']);
  const categories = useSelector(getCategoryCategoriesSelector);
  const {
    open: isOpenCreation, toggle: toggleOpenCreation,
  } = useToggle();
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const searchParams: ITabAndCategorySearchParams = categoriesRoute.useSearch();

  const locale = useSelector(getSettingsLocaleSelector);

  const count = useSelector(getCategoryCountSelector);
  // how many categories each tab holds — the strip states the recycle bin's total from the list tab too
  const tabCounts = useSelector(getCategoryTabCountsSelector);

  const {
    canDelete,
    canPreview,
    canEdit,
    canDestroy,
    canCreate,
  } = useProtect(collection);
  const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

  // destroy objects (in recycle bin)
  const handleDestroy = useCallback(
    (id: string | string[]): void => {
      const options = { collection, messageLabel: t('cms:category.theseCategories'), updateListCallback: deleteCategoriesSlice };

      const ids = Array.isArray(id) ? id : [id];

      dispatch(destroyObjects(ids, options));
      // destroyed for good — they leave the recycle bin without landing anywhere else
      dispatch(shiftCategoryTabCountsSlice({ from: RECYCLE_BIN_COUNT_KEY, amount: ids.length }));
    },
    [dispatch, t]
  );

  /*
   * Puts a binned row back in the list. The recycle bin only ever offered "destroy permanently",
   * so a row deleted by mistake had no way back — this is the same soft-delete flag, flipped, and
   * the tab counters move with it.
   */
  const handleRestore = useCallback(
    (id: string): void => {
      dispatch(toggleCategoriesByIds([id], RECYCLE_BIN_COUNT_KEY, false));
      dispatch(shiftCategoryTabCountsSlice({
        from: RECYCLE_BIN_COUNT_KEY, to: ALL_TAB_COUNT_KEY, amount: 1,
      }));
    },
    [dispatch]
  );

  // delete a row
  const handleDelete = useCallback(
    (id: string): void => {
      dispatch(deleteCategory(id));
      dispatch(shiftCategoryTabCountsSlice({
        from: ALL_TAB_COUNT_KEY, to: RECYCLE_BIN_COUNT_KEY, amount: 1,
      }));
    },
    [dispatch]
  );

  // go to preview page
  const handlePreview = useCallback(
    (id: string): void => {
      navigate(goToCategory(id));
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (category: ICategory): void => {
      setSelectedCategory(category);
      toggleOpenCreation();
    },
    [toggleOpenCreation]
  );

  // switch a single category on or off without opening the edit dialog for that one field
  const handleToggleActive = useCallback(
    (category: ICategory): void => {
      dispatch(toggleCategoryActive(category, !category.active));
    },
    [dispatch]
  );

  const handleCloseDialog = () => {
    setSelectedCategory(null);
    toggleOpenCreation();
  };

  // the dialog is shared with the edit action, so creating means opening it on no category
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    toggleOpenCreation();
  };

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    if (isRecycleBin) {
      handleDestroy(ids);
      return;
    }
    dispatch(toggleCategoriesByIds(ids, RECYCLE_BIN_COUNT_KEY, true));
    // binned, not destroyed: the rows move from the list tab into the recycle bin
    dispatch(shiftCategoryTabCountsSlice({
      from: ALL_TAB_COUNT_KEY, to: RECYCLE_BIN_COUNT_KEY, amount: ids.length,
    }));
  };

  // switch every ticked row on or off at once, without taking them out of the list they sit in
  const handleSetActiveSelected = (ids: string[], value: boolean) => {
    dispatch(setCategoriesActiveByIds(ids, 'active', value));
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadCategories(queries));
  };

  const handleExport = (format: ExportFormat, queries: IQueriesInput) => {
    dispatch(exportCategories(queries, format));
  };

  const handleGoToArticlesOrPages = useCallback((id: string, entity: CategoryEntityEnum) => {
    if (entity === 'article') {
      navigate(goToArticles({ category: id }));
      return;
    }

    navigate(goToPages({ category: id }));
  }, [navigate]);

  const handleSubmitCategory = (values: ICategoryInput) => {
    if (selectedCategory) {
      dispatch(editCategory(selectedCategory.id, values, selectedCategory.updatedAt));
      handleCloseDialog();
      return;
    }

    dispatch(createCategory(values));
    handleCloseDialog();
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    const categoriesData = categories.map((category: ICategory) => {
      const name = getTranslatedField<ICategoryTranslatedFields>(category.translated, locale, 'name');
      const entity = category.entity;
      const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

      // default data
      const data: Record<string, any> = {
        id: category.id, // required even if not displayed
        category: <CategoryNameCell category={category} locale={locale} />,
        entity: <CategoryEntityCell category={category} />,
        dates: <DatesCell createdAt={category.createdAt} updatedAt={category.updatedAt} />,
        user: (category.user !== undefined)
          ? <UserCell compact contactType="email" user={category.user} />
          : null,
        subcategories: <CategorySubcategoriesCell category={category} />,
        items: <CategoryItemsCell category={category} />,
        status: <CategoryStatusCell category={category} />,
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={t('cms:category.thisCategory')}
              onDestroy={() => handleDestroy(category.id)}
              onPreview={() => handlePreview(category.id)}
              onRestore={() => handleRestore(category.id)}
              type="row"
            />
          )
          : (
            <ActionsMenu
              label={name}
              type="row"
              dialogDescription={category.itemCount
                ? t('cms:category.deleteWarningWithLinkedItems', { count: category.itemCount })
                : undefined}
              menus={[
                {
                  onClick: () => handleGoToArticlesOrPages(category.id, entity),
                  display: true,
                  label: entity === CategoryEntityEnum.ARTICLE
                    ? t('cms:category.seeArticlesForThisCategory')
                    : t('cms:category.seePagesForThisCategory'),
                  icon: (
                    <FiClipboard
                      css={(theme: Theme) => ({ color: theme.palette.primary.main })}
                      size={MENU_ITEM_ICON_SIZE}
                    />
                  ),
                },
                {
                  onClick: () => handleToggleActive(category),
                  // turning a shelf off is an edit of it, so it is gated by the same right
                  display: !!canEdit,
                  label: category.active
                    ? t('cms:category.deactivateCategory')
                    : t('cms:category.activateCategory'),
                  icon: category.active
                    ? <FiSlash size={MENU_ITEM_ICON_SIZE} />
                    : <FiCheckCircle size={MENU_ITEM_ICON_SIZE} />,
                },
              ]}
              onDelete={canDelete
                ? () => handleDelete(category.id)
                : undefined}
              onEdit={canEdit
                ? () => handleEdit(category)
                : undefined}
              onPreview={canPreview
                ? () => handlePreview(category.id)
                : undefined}
            />
          ),
      };

      return data as IData;
    });

    return categoriesData;
  }, [
    categories,
    handleDelete,
    handlePreview,
    handleEdit,
    handleToggleActive,
    locale,
    t,
    handleDestroy,
    handleRestore,
    handleGoToArticlesOrPages,
    canEdit,
    canDelete,
    canPreview,
    canDestroy,
    searchParams?.tab,
  ]);

  return (
    <>
      <Head title={t('cms:category.categories')} />
      <PageHeader
        title={t('cms:category.categories')}
        actions={canCreate && (
          <CreateButton label={t('cms:category.createCategory')} onClick={handleCreateCategory} />
        )}
      />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        enableMultipleSelect={!canDestroy}
        headCells={headCells}
        items={dataTable}
        onDeleteSelected={handleDeleteSelected}
        onExport={handleExport}
        onSetActiveSelected={isRecycleBin ? undefined : handleSetActiveSelected}
        onUpdateData={handleUpdateData}
        renderFilter={(prop: IRenderSearchProps) => <SearchCategories {...prop} />}
        tabCounts={tabCounts}
        tabs={recycleBinTabOptions}
        /*
         * an empty recycle bin is not a search that found nothing: the generic state would tell an
         * editor that no category exists, when in fact none has been deleted
         */
        emptyState={isRecycleBin
          ? (
            <EmptyData
              description={t('cms:category.categoriesRecycleBinEmptyDescription')}
              icon={<FiTrash2 size={LIST_STATE_ICON_SIZE} />}
              title={t('cms:category.categoriesRecycleBinEmpty')}
            />
          )
          : undefined}
      />


      <CategoryFormDialog
        category={selectedCategory}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitCategory}
        open={!!selectedCategory || isOpenCreation}
      />
    </>
  );
};

export default Categories;
