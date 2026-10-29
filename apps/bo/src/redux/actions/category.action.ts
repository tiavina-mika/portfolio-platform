import Parse from 'parse';


import i18n, { locales } from '@/config/i18n';
import { recycleBinTabOptions } from '@/constants/app.constants';
import { actionWithLoader, onEnterActionWithLoader } from '@/redux/actions/util.action';
import { AppDispatch, AppThunkAction, RootState } from '@/redux/store';
import { IQueriesInput, ITabSearchParams } from '@/types/app.type';
import {
  CategoryEntityEnum, ICategory, ICategoryInput, ICategoryTypeEntity,
} from '@/types/category.type';
import { convertSearchParamsToFilters } from '@/utils/app.utils';
import { DEFAULT_PAGINATION, Errors, PAGINATION } from '@/utils/constants';
import { isUpdatedFileChanged, uploadFilesAPI } from '@/utils/file.utils';
import { setValues } from '@/utils/parse.utils';
import { PATH_NAMES } from '@/utils/pathnames';
import { getTranslatedField } from '@/utils/settings.utils';
import { escapeText } from '@/utils/utils';
import { categoryCodec } from '@/validations/category.validation';

import { setMessageSlice } from '../reducers/app.reducer';
import {
  clearCategorySlice,
  deleteCategoryFromCategoriesSlice,
  deleteCategoriesSlice,
  loadCategorySlice,
  loadCategoriesSlice,
  setCategoriesCountSlice,
  addCategoryTCategoriesSlice,
  loadCategoriesOptionsSlice,
  getCategoriesOptionsSelector,
  clearCategoriesSlice,
  clearCategoryCountSlice,
  getCategoryCategoriesSelector,
} from '../reducers/category.reducer';
import { getSettingsLocaleSelector } from '../reducers/settings.reducer';

const collection = 'Category';

export const Category = Parse.Object.extend(collection);

const CATEGORY_PROPERTIES = new Set(['translated', 'active', 'entity', 'image']);

export const getCategory = async (id: string, include: string[] = []): Promise<ICategory | undefined> => {
  const category = await Parse.Cloud.run('getCategory', { id, include });

  return category;
};

/**
 * search a category for an entity
 * ex: article, page, product
 * @param search
 * @param entity
 * @returns
 */
export const searchCategoriesForAutocomplete = async (
  search: string,
  entity: ICategoryTypeEntity = CategoryEntityEnum.ARTICLE
): Promise<ICategory[]> => {
  let query = new Parse.Query(Category);

  // search by translated texts
  if (search) {
    const text = escapeText(search);
    const or: any[] = [];

    locales.forEach((locale: string) => {
      or.push(
      // ex: translated.fr.name = "Sports"
        new Parse.Query(Category).matches('translated.' + locale + '.name', text)
      );
    });

    query = Parse.Query.or(...or);
  }

  const categories = await query
    .equalTo('deleted', false)
    .equalTo('active', true)
    .equalTo('entity', entity)
    .limit(100)
    .select('translated')
    .find();

  return categories as ICategory[];
};

/*
 * ----------------------------------------------------- //
 * ------------------- Redux Actions ------------------- //
 * ----------------------------------------------------- //
 */
export const loadCategoriesOptions = (entity: ICategoryTypeEntity): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.();
    const locale = getSettingsLocaleSelector(state as any);
    const categories = await new Parse.Query(Category)
      .equalTo('deleted', false)
      .equalTo('active', true)
      .equalTo('entity', entity)
      .limit(1000)
      .select('translated')
      .find();

    const options = categories.map((category: Parse.Object) => ({
      value: category.id!,
      label: getTranslatedField(category.get('translated'), locale, 'name'),
    }));

    dispatch(loadCategoriesOptionsSlice(options));
  });
};

export const loadCategories = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = 'updatedAt',
  order = 'desc',
  filters,
  search,
}: IQueriesInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    /*
     * result with count
     * we make it server side because we need to get user infos
     */
    const result: Record<string, any> = await Parse.Cloud.run('getCategories', {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      locales,
    });

    dispatch(loadCategoriesSlice(result.results));
    dispatch(setCategoriesCountSlice(result.count));
  });
};

export const createCategory = (values: ICategoryInput, loadOptions = false): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const categoriesOptions = getCategoriesOptionsSelector(state);
    const locale = getSettingsLocaleSelector(state);

    const currentUser = await Parse.User.currentAsync();

    if (!currentUser) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }

    const newValues: Record<string, any> = {
      ...values,
      translated: categoryCodec.decode(values),
    };

    const category = new Category();

    if (values.image) {
      const uploadInput = {
        folder: 'categories',
        sessionToken: currentUser.getSessionToken(),
        files: [values.image] as File[],
        locale,
      };
      const results = await uploadFilesAPI(uploadInput);

      [newValues.image] = results;
    }

    setValues(category, newValues, CATEGORY_PROPERTIES);

    /*
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    const savedCategory = await category.save();

    dispatch(addCategoryTCategoriesSlice(savedCategory));
    dispatch(setMessageSlice(i18n.t('cms:category.categoryAddedSuccessfully')));

    if (!loadOptions) return;

    const option = {
      value: savedCategory.id,
      label: getTranslatedField(savedCategory.get('translated'), locale, 'name'),
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

export const editCategory = (id: string, values: ICategoryInput): any => {
  return actionWithLoader(async (dispatch: AppDispatch, getState?: () => RootState): Promise<void> => {
    const state = getState?.()!;
    const locale = getSettingsLocaleSelector(state);
    const categories = getCategoryCategoriesSelector(state);
    const currentUser = await Parse.User.currentAsync();

    if (!currentUser) {
      throw Error(i18n.t('user:errors.userNotExist'));
    }

    const category = await getCategory(id);

    if (!category) return;

    const newValues: Record<string, any> = {
      ...values,
      translated: categoryCodec.decode(values),
    };

    // --------- update image --------- //
    const oldFieldValue = category.get('image');

    if (oldFieldValue) {
      const isNew = isUpdatedFileChanged(oldFieldValue, values.image as File);

      if (!isNew) {
        const uploadInput = {
          folder: 'categories',
          sessionToken: currentUser.getSessionToken(),
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

    setValues(category, newValues, CATEGORY_PROPERTIES);

    const updatedCategory = await category.save();

    // ------- update store ------ //
    dispatch(loadCategorySlice(updatedCategory));
    dispatch(setMessageSlice(i18n.t('cms:category.categoryEditedSuccessfully')));

    // update categories list
    const updatedCategories = categories.map((category) => {
      if (category.id === updatedCategory.id) return updatedCategory;

      return category;
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
 * for user security reason, we do not delete the data from db
 * instead we just add a field "deleted" = true
 * @param id
 * @param redirectToRecycleBin redirect to recycle bin after the request is deleted
 * @returns
 */
export const deleteCategory = (id: string): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
  // --------- request --------- //
    const category = await getCategory(id);

    if (!category) return;

    /*
     * --------- update database --------- //
     * only the user or the MasterKey can update or deleted its own account
     * the master key can only accessible in server side
     * so we use the parse cloud function to do that, instead of a REST API
     * you can sse the cloud function in server in the /cloud/hooks/users.js file
     */
    category.set('deleted', true);
    const deletedCategory = await category.save();

    // --------- update store --------- //
    dispatch(deleteCategoryFromCategoriesSlice(deletedCategory.id));
    dispatch(setMessageSlice(i18n.t('cms:messages.articleDeletedSuccessfully', { value: deletedCategory.id })));
  },
  // rights
  {
    collection,
    action: 'delete',
    hasNoRightErrorMessage: i18n.t('common:errors.hasNoRightToDelete', { value: i18n.t('cms:category.categoryDeletedSuccessfully') }),
  });
};

/**
 * mark seen field as true
 * so that its not more treated as notification
 * ex: (['xxx', 'yyy'], seen, false)
 * @param ids
 * @returns
 */
export const toggleCategoriesByIds = (ids: string[], field: string, value = true): any => {
  return actionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    await new Parse.Query(Category).containedIn('objectId', ids).each(async (category) => {
      category.set(field, value);

      await category.save();
    });
    // delete
    dispatch(deleteCategoriesSlice(ids));
  },
  // rights
  {
    collection,
    action: field === 'deleted'
      ? 'delete'
      : 'update',
  });
};

/*
 * ---------------------------------------- //
 * ------------- on page load ------------- //
 * ---------------------------------------- //
 */
/**
 * load categories data from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onCategoriesEnter = (route?: any): any => {
  return onEnterActionWithLoader((dispatch: AppDispatch): any => {
    const values: Record<string, any> = {
      skip: DEFAULT_PAGINATION.currentPage,
      limit: DEFAULT_PAGINATION.rowsPerPage,
      orderBy: DEFAULT_PAGINATION.orderBy,
      order: DEFAULT_PAGINATION.order,
    };

    const filters: Record<string, boolean | string> = { deleted: false };

    // convert the url search params tab to (db) filters
    const newFilters = convertSearchParamsToFilters({
      tabs: recycleBinTabOptions,
      searchParams: route.search,
      filters,
      acceptedFields: ['deleted'],
    });

    values.filters = newFilters;

    // clear the prev state first
    dispatch(clearCategorySlice());
    dispatch(loadCategories(values));
  },
  // rights
  {
    collection,
    action: 'find',
  });
};

/**
 * load category data by its id from database before the page is loaded (in route)
 * then load it to the store
 * @param route
 * @returns
 */
export const onCategoryEnter = (route?: any): AppThunkAction => {
  return onEnterActionWithLoader(async (dispatch: AppDispatch): Promise<void> => {
    const category = await getCategory(route.params.id, ['updatedBy', 'user']);

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
export const onCategoriesLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearCategoriesSlice());
    dispatch(clearCategoryCountSlice());
  };
};

export const onCategoryLeave = (): any => {
  return (dispatch: AppDispatch): void => {
    dispatch(clearCategorySlice());
  };
};

/*
 * --------------------------------------- //
 * ------------- redirection ------------- //
 * --------------------------------------- //
 */
export const goToCategories = (search?: ITabSearchParams): any => ({ to: PATH_NAMES.categories, search });

export const goToCategory = (id: string): any => ({ to: PATH_NAMES.categories + '/$id', params: { id } });
