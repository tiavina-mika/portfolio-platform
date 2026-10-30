import i18n from '@/config/i18n';
import { Errors } from '@/constants/_core/app.constants';
import {
  actionWithLoader, goToList, goToPreview, onEnterActionWithLoader,
} from '@/redux/actions/_core/util.action';
import { createCrudThunks } from '@/redux/factories/_core/crudThunks.factory';
import { setMessageSlice } from '@/redux/reducers/_core/app.reducer';
import {
  clearCategorySlice,
  deleteCategoryFromCategoriesSlice,
  deleteCategoriesSlice,
  loadCategorySlice,
  loadCategoriesSlice,
  setCategoriesCountSlice,
  addCategoryTCategoriesSlice,
  loadCategoriesOptionsSlice,
  setCategoryLoadingSlice,
  getCategoriesOptionsSelector,
  clearCategoriesSlice,
  clearCategoryCountSlice,
  getCategoryCategoriesSelector,
  setCategoryTabCountsSlice,
  updateCategoriesFieldSlice,
} from '@/redux/reducers/_core/category.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { fetchCurrentUserSessionToken } from '@/services/_core/auth.service';
import {
  createCategoryEntity, fetchCategory, fetchCategoryOptions, fetchCategoryTree, searchCategories,
  setCategoryActive, updateCategoryEntity,
} from '@/services/_core/category.service';
import { IExportColumn, ITabSearchParams } from '@/types/_core/app.type';
import {
  ICategory, ICategoryInput, ICategoryTranslatedFields, ICategoryTypeEntity,
} from '@/types/_core/category.type';
import { Locale } from '@/types/_core/setting.type';
import {
  getCategoryEntityLabel, getCategoryStatus, getCategoryTranslationsCount,
  getTranslatedCategoryStatusLabel,
} from '@/utils/_core/cms.utils';
import { displayDate } from '@/utils/_core/date.utils';
import { isUpdatedFileChanged, uploadFilesAPI } from '@/utils/_core/file.utils';
import { assertNoConcurrentEdit, convertIdToPointer } from '@/utils/_core/parse.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { categoryCodec } from '@/validations/_core/category.validations';


const collection = 'Category';

export const getCategory = fetchCategory;

export const searchCategoriesForAutocomplete = searchCategories;

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */
/**
 * the options of a form's category select. Read in the background of the page holding the form, so
 * under the category slice's own loading flag rather than the app-wide one: the select shows it is
 * still filling while the rest of the form is already usable
 * @param entity which kind of content the categories classify
 */
export const loadCategoriesOptions = (entity: ICategoryTypeEntity): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.();
    const locale = getSettingsLocaleSelector(state as any);
    const options = await fetchCategoryOptions(entity, locale);

    dispatch(loadCategoriesOptionsSlice(options));
  }, { localLoadingAction: setCategoryLoadingSlice });
};

/*
 * the whole category tree of an entity, held in the category list of the store — a form placing a
 * record in the tree reads its levels from there instead of querying one level at a time
 */
export const loadCategoryTree = (entity: ICategoryTypeEntity): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const categories = await fetchCategoryTree(entity);

    dispatch(loadCategoriesSlice(categories));
  });
};

const getCategoryExportColumns = (locale: Locale): IExportColumn<ICategory>[] => [
  {
    header: i18n.t('cms:name'),
    getValue: (category) => getTranslatedField<ICategoryTranslatedFields>(category.translated, locale, 'name'),
  },
  {
    header: i18n.t('cms:category.parentCategory'),
    getValue: (category) => (category.parentCategory
      ? getTranslatedField<ICategoryTranslatedFields>(category.parentCategory.translated, locale, 'name')
      : ''),
  },
  {
    header: i18n.t('cms:technicalCode'),
    getValue: (category) => category.code ?? '',
  },
  {
    header: i18n.t('cms:category.categoryFor'),
    getValue: (category) => getCategoryEntityLabel(category.entity),
  },
  {
    header: i18n.t('cms:author'),
    getValue: (category) => (category.user
      ? `${category.user.firstName ?? ''} ${category.user.lastName}`.trim()
      : ''),
  },
  {
    header: i18n.t('cms:category.subcategories'),
    getValue: (category) => category.subcategoriesCount ?? 0,
  },
  {
    header: i18n.t('cms:category.items'),
    getValue: (category) => category.itemsCount ?? 0,
  },
  {
    header: i18n.t('cms:category.publishedItems'),
    getValue: (category) => category.publishedItemsCount ?? 0,
  },
  {
    header: i18n.t('cms:translatedFields'),
    getValue: (category) => getCategoryTranslationsCount(category),
  },
  {
    header: i18n.t('common:status'),
    getValue: (category) => getTranslatedCategoryStatusLabel(getCategoryStatus(category)),
  },
  {
    header: i18n.t('common:createdAt'),
    getValue: (category) => displayDate(category.createdAt, false, true),
  },
  {
    header: i18n.t('common:updatedAt'),
    getValue: (category) => displayDate(category.updatedAt, false, true),
  },
];

/*
 * generic list/enter/leave/delete/bulk-toggle/export thunks
 * (proof of concept for a schema-driven CRUD factory, à la Forest Admin/AdminJS). Business-specific
 * mutations (create/edit — translated fields, image upload, parentCategory pointer) stay hand-written.
 */
const categoryCrud = createCrudThunks<ICategory>({
  collection,
  listCloudFunction: 'getCategories',
  getOne: (id: string) => getCategory(id),
  slice: {
    loadListSlice: loadCategoriesSlice,
    setCountSlice: setCategoriesCountSlice,
    clearOneSlice: clearCategorySlice,
    clearListSlice: clearCategoriesSlice,
    clearCountSlice: clearCategoryCountSlice,
    removeFromListSlice: deleteCategoryFromCategoriesSlice,
    removeManyFromListSlice: deleteCategoriesSlice,
    setTabCountsSlice: setCategoryTabCountsSlice,
    updateFieldInListSlice: updateCategoriesFieldSlice,
  },
  deletedMessage: (id: string) => i18n.t('cms:messages.articleDeletedSuccessfully', { value: id }),
  hasNoRightToDeleteMessage: i18n.t('common:errors.hasNoRightToDelete', { value: i18n.t('cms:category.categoryDeletedSuccessfully') }),
  getExportColumns: getCategoryExportColumns,
  exportFileNamePrefix: 'categories',
});

export const loadCategories: any = categoryCrud.loadList;
export const deleteCategory: any = categoryCrud.deleteOne;
export const toggleCategoriesByIds: any = categoryCrud.toggleByIds;
export const setCategoriesActiveByIds: any = categoryCrud.setFieldByIds;
export const exportCategories: any = categoryCrud.exportList;

export const createCategory = (
  values: ICategoryInput,
  loadOptions = false,
  onSuccess?: (category: ICategory) => void
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const categoriesOptions = getCategoriesOptionsSelector(state);
    const locale = getSettingsLocaleSelector(state);

    const sessionToken = await fetchCurrentUserSessionToken();

    if (!sessionToken) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }

    const newValues: Record<string, any> = {
      ...values,
      translated: categoryCodec.decode(values),
      parentCategory: values.parentCategory
        ? convertIdToPointer<any>('Category', values.parentCategory as string)
        : undefined,
    };

    if (values.image) {
      const uploadInput = {
        folder: 'categories',
        sessionToken,
        files: [values.image] as File[],
        locale,
      };
      const results = await uploadFilesAPI(uploadInput);

      [newValues.image] = results;
    }

    /*
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    const { category: newCategory, optionLabel } = await createCategoryEntity(newValues, locale);

    dispatch(addCategoryTCategoriesSlice(newCategory));
    dispatch(setMessageSlice(i18n.t('cms:category.categoryAddedSuccessfully')));
    onSuccess?.(newCategory);

    if (!loadOptions) return;

    const option = {
      value: newCategory.id,
      label: optionLabel,
    };

    dispatch(loadCategoriesOptionsSlice([option, ...categoriesOptions]));
  },
  // rights
  {
    collection,
    action: 'create',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToCreate', { value: i18n.t('cms:category.thisCategory') }),
  });
};

export const editCategory = (
  id: string,
  values: ICategoryInput,
  // `updatedAt` the admin last saw when opening the edit form — used for optimistic locking
  expectedUpdatedAt?: string
): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const categories = getCategoryCategoriesSelector(state);
    const sessionToken = await fetchCurrentUserSessionToken();

    if (!sessionToken) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }

    const category = await getCategory(id);

    if (!category) return;
    assertNoConcurrentEdit(category, expectedUpdatedAt);

    const newValues: Record<string, any> = {
      ...values,
      translated: categoryCodec.decode(values),
      parentCategory: values.parentCategory
        ? convertIdToPointer<any>('Category', values.parentCategory as string)
        : undefined,
    };

    // --------- update image --------- //
    const oldFieldValue = category.image;

    if (oldFieldValue) {
      const isNew = isUpdatedFileChanged(oldFieldValue, values.image as File);

      if (!isNew) {
        const uploadInput = {
          folder: 'categories',
          sessionToken,
          files: [values.image] as File[],
          locale,
        };
        const files = await uploadFilesAPI(uploadInput);

        [newValues.image] = files;
      }
      else {
        newValues.image = oldFieldValue;
      }
    }

    const updatedCategory = await updateCategoryEntity(category, newValues);

    // ------- update store ------ //
    dispatch(loadCategorySlice(updatedCategory));
    dispatch(setMessageSlice(i18n.t('cms:category.categoryEditedSuccessfully')));

    // update categories list
    const updatedCategories = categories.map((c) => {
      if (c.id === updatedCategory.id) return updatedCategory;

      return c;
    });

    dispatch(loadCategoriesSlice(updatedCategories));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:category.thisCategory') }),
  });
};

/**
 * switches a single category on or off from the list. The row is replaced where it stands rather
 * than moved to the front of the list: the reader toggled it to see the state change, not to lose
 * the place they were reading at.
 * @param category the row as the list holds it
 * @param value the state to switch it to
 */
export const toggleCategoryActive = (category: ICategory, value: boolean): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const categories = getCategoryCategoriesSelector(getState?.()!);

    const updatedCategory = await setCategoryActive(category, value);

    dispatch(loadCategoriesSlice(
      categories.map((c: ICategory) => (c.id === updatedCategory.id ? updatedCategory : c))
    ));
    dispatch(setMessageSlice(i18n.t('cms:category.categoryEditedSuccessfully')));
  },
  // rights
  {
    collection,
    action: 'update',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToUpdate', { value: i18n.t('cms:category.thisCategory') }),
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
export const onCategoriesEnter: any = categoryCrud.onListEnter;

/**
 * load category data by its id from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onCategoryEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const category = await getCategory(route.params.id, ['updatedBy', 'user', 'parentCategory']);

    if (!category) {
      throw new Error(Errors.notFound);
    }

    dispatch(loadCategorySlice(category));
  },
  // rights
  {
    collection,
    action: 'get',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page leave ------------ //
 * ---------------------------------------- //
 */
export const onCategoryLeave: any = categoryCrud.onOneLeave;

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToCategories = (search?: ITabSearchParams): any => goToList('categories', search);
export const goToCategory = (id: string): any => goToPreview('categories', id);
