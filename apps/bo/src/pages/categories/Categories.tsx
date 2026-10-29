import { Chip, type Theme } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import {
  type ReactNode, useCallback, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FiClipboard } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import AddFab from '@/components/AddFab';
import Dialog from '@/components/Dialog';
import Head from '@/components/Head';
import ListWithSelection from '@/components/table/ListWithSelection';
import i18n from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import CategoryForm from '@/containers/categories/CategoryForm';
import SearchCategories from '@/containers/categories/SearchCategories';
import { useProtect } from '@/hooks/useProtect';
import { useToggle } from '@/hooks/useToggle';
import { destroyObjects } from '@/redux/actions/app.action';
import { goToArticles } from '@/redux/actions/article.action';
import {
  createCategory, deleteCategory, editCategory, goToCategory, loadCategories, toggleCategoriesByIds,
} from '@/redux/actions/category.action';
import { goToPages } from '@/redux/actions/page.action';
import { getCategoryCountSelector, getCategoryCategoriesSelector, deleteCategoriesSlice } from '@/redux/reducers/category.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { categoriesRoute } from '@/routes/protected/category.routes';
import { IQueriesInput, IRenderSearchProps, ITableHeadCell } from '@/types/app.type';
import {
  CategoryEntityEnum, ICategory, ICategoryInput, ICategoryTranslatedFields,
} from '@/types/category.type';
import { isCurrentTab } from '@/utils/app.utils';
import { getCategoryEntityLabel, getCategoryLabelColor } from '@/utils/cms.utils';
import { displayDate } from '@/utils/date.utils';
import { getTranslatedField } from '@/utils/settings.utils';

const CATEGORY_FORM_ID = 'category-form-id';

interface IData {
  name: string;
  entity: string;
  item: number;
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
    id: 'entity',
    label: i18n.t('cms:category.categoryFor'),
    align: 'left',
  },
  {
    id: 'item',
    label: 'Item',
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

const collection = 'Category';

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
  const searchParams = categoriesRoute.useSearch();

  const locale = useSelector(getSettingsLocaleSelector);

  const count = useSelector(getCategoryCountSelector);

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
    },
    [dispatch, t]
  );

  // delete a row
  const handleDelete = useCallback(
    (id: string): void => {
      dispatch(deleteCategory(id));
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

  const handleCloseDialog = () => {
    setSelectedCategory(null);
    toggleOpenCreation();
  };

  // delete selected rows
  const handleDeleteSelected = (ids: string[]) => {
    if (isRecycleBin) {
      handleDestroy(ids);
      return;
    }
    dispatch(toggleCategoriesByIds(ids, 'deleted', true));
  };

  const handleUpdateData = (queries: IQueriesInput) => {
    // the on tab change is not used here, we use it in on page enter with search params
    dispatch(loadCategories(queries));
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
      dispatch(editCategory(selectedCategory.id, values));
      handleCloseDialog();
      return;
    }

    dispatch(createCategory(values));
    handleCloseDialog();
  };

  // table data
  const dataTable = useMemo((): IData[] => {
    const categoriesData = categories.map((category: ICategory) => {
      const name = getTranslatedField<ICategoryTranslatedFields>(category.get('translated'), locale, 'name');
      const entity = category.get('entity');
      const isRecycleBin = canDestroy && isCurrentTab(searchParams?.tab);

      // default data
      const data: Record<string, any> = {
        id: category.id, // required even if not displayed
        name,
        entity: (
          <Chip
            color={getCategoryLabelColor(entity)}
            label={getCategoryEntityLabel(entity)}
            variant="outlined"
          />
        ),
        item: category.get('itemCount') || 0,
        createdAt: displayDate(category.createdAt, false, true),
        updatedAt: displayDate(category.updatedAt, false, true),
        actions: isRecycleBin
          ? (
            <ActionsMenu
              label={t('cms:category.thisCategory')}
              type="icon"
              onDestroy={() => handleDestroy(category.id)}
              onPreview={() => handlePreview(category.id)}
            />
          )
          : (
            <ActionsMenu
              label={name}
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
                      size={20}
                    />
                  ),
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
    locale,
    t,
    handleDestroy,
    handleGoToArticlesOrPages,
    canEdit,
    canDelete,
    canPreview,
    canDestroy,
    searchParams?.tab,
  ]);

  return (
    <>
      <Head title="Categories" />
      <ListWithSelection<IData>
        canDelete={canDelete}
        canDestroy={canDestroy}
        canUpdate={canEdit}
        count={count}
        defaultFilters={searchParams}
        enableMultipleSelect={!canDestroy}
        headCells={headCells}
        items={dataTable}
        renderFilter={(prop: IRenderSearchProps) => <SearchCategories {...prop} />}
        tabs={recycleBinTabOptions}
        onDeleteSelected={handleDeleteSelected}
        onUpdateData={handleUpdateData}
      />

      {canCreate && (
        <AddFab
          onClick={() => {
            setSelectedCategory(null);
            toggleOpenCreation();
          }}
        />
      )}

      <Dialog
        fullWidth
        formId={CATEGORY_FORM_ID}
        maxWidth="md"
        open={!!selectedCategory || isOpenCreation}
        toggle={handleCloseDialog}
        title={selectedCategory
          ? t('cms:category.editCategory')
          : t('cms:category.createCategory')}
      >
        <CategoryForm
          category={selectedCategory}
          formId={CATEGORY_FORM_ID}
          onSubmit={handleSubmitCategory}
        />
      </Dialog>
    </>
  );
};

export default Categories;
