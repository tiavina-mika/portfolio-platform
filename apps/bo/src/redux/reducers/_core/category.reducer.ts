import { createEntitySlice } from '@/redux/factories/_core/entitySlice.factory';
import { IListTabCounts, ISelectOption } from '@/types/_core/app.type';
import { ICategory, ICategoryState } from '@/types/_core/category.type';

const category = createEntitySlice<ICategory>('category');

export const {
  setLoadingSlice: setCategoryLoadingSlice,
  clearOneSlice: clearCategorySlice,
  loadOneSlice: loadCategorySlice,
  loadListSlice: loadCategoriesSlice,
  setCountSlice: setCategoriesCountSlice,
  setTabCountsSlice: setCategoryTabCountsSlice,
  shiftTabCountsSlice: shiftCategoryTabCountsSlice,
  clearListSlice: clearCategoriesSlice,
  clearCountSlice: clearCategoryCountSlice,
  addToListSlice: addCategoryTCategoriesSlice,
  removeFromListSlice: deleteCategoryFromCategoriesSlice,
  removeManyFromListSlice: deleteCategoriesSlice,
  updateFieldInListSlice: updateCategoriesFieldSlice,
  updateInListSlice: updateCategoriesByCategorySlice,
  loadOptionsSlice: loadCategoriesOptionsSlice,
  clearOptionsSlice: clearCategoriesOptionsSlice,
} = category.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getCategorySelector = (state: Record<string, any>): ICategoryState => state.category;
export const getCategoryCategorySelector = (state: Record<string, any>): ICategory => state.category.entity;
export const getCategoryLoadingSelector = (state: Record<string, any>): boolean => state.category.loading;
export const getCategoryCategoriesSelector = (
  state: Record<string, any>
): ICategory[] => state.category.entities;
export const getCategoryCountSelector = (state: Record<string, any>): number => state.category.count;
export const getCategoryTabCountsSelector = (
  state: Record<string, any>
): IListTabCounts => state.category.tabCounts;
export const getCategoriesOptionsSelector = (
  state: Record<string, any>
): ISelectOption[] => state.category.entitiesOptions;

export default category.reducer;
