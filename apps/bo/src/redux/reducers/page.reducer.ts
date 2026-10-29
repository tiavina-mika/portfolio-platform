import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ITranslatedFileCloud } from '@/types/file.type';
import type { IPage, IPageSection, IPageState } from '@/types/page.type';

const initialState: IPageState = {
  loading: false,
  page: null,
  pages: [],
  editorTempFiles: [],
  count: 0,
  pageSections: [],
  pageSection: null,
  pageSectionCount: 0,
  sectionsByPage: [],
};

export const page = createSlice({
  name: 'page',
  initialState,
  reducers: {
    loadPagesSlice: (state: IPageState, action: PayloadAction<IPage[]>) => {
      state.pages = action.payload;
    },
    loadPageSlice: (state: IPageState, action: PayloadAction<IPage>) => {
      state.page = action.payload;
    },
    loadSectionsByPageSlice: (state: IPageState, action: PayloadAction<IPageSection[]>) => {
      state.sectionsByPage = action.payload;
    },
    loadPageSectionsSlice: (state: IPageState, action: PayloadAction<IPageSection[]>) => {
      state.pageSections = action.payload;
    },
    loadPageSectionSlice: (state: IPageState, action: PayloadAction<IPageSection | null>) => {
      state.pageSection = action.payload;
    },
    addPageToPagesSlice: (state: IPageState, action: PayloadAction<IPage>) => {
      state.pages = [...state.pages, action.payload];
      state.count += 1;
    },
    deletePageFromPagesSlice: (state: IPageState, action: PayloadAction<string>) => {
      state.pages = state.pages.filter((page: IPage) => page.id !== action.payload);
      state.count -= 1;
    },
    clearPageSectionsSlice: (state: IPageState) => {
      state.pageSections = [];
    },
    setPagesCountSlice: (state: IPageState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setPageSectionCountSlice: (state: IPageState, action: PayloadAction<number>) => {
      state.pageSectionCount = action.payload;
    },
    clearPageSectionCountSlice: (state: IPageState) => {
      state.pageSectionCount = 0;
    },
    clearPageSlice: (state: IPageState) => {
      state.page = null;
    },
    clearPageSectionSlice: (state: IPageState) => {
      state.pageSection = null;
    },
    clearPagesSlice: (state: IPageState) => {
      state.pages = [];
    },
    setPageLoadingSlice: (state: IPageState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearPageCountSlice: (state: IPageState) => {
      state.count = 0;
    },
    loadPageEditorTempFilesSlice: (state: IPageState, action: PayloadAction<ITranslatedFileCloud>) => {
      state.editorTempFiles = [...state.editorTempFiles, action.payload];
    },
    clearPageEditorTempFilesSlice: (state: IPageState) => {
      state.editorTempFiles = [];
    },
    deletePagesSlice: (state: IPageState, action: PayloadAction<string[]>) => {
      const newPages = state.pages.filter(prevPage => !action.payload.includes(prevPage.id));

      state.pages = newPages;
    },
    deletePageSectionsSlice: (state: IPageState, action: PayloadAction<string[]>) => {
      const newPageSections = state.pageSections.filter(
        prevPageSection => !action.payload.includes(prevPageSection.id)
      );

      state.pageSections = newPageSections;
    },
  },
});

export const {
  setPageLoadingSlice,
  clearPageSlice,
  loadPageSlice,
  loadPagesSlice,
  setPagesCountSlice,
  clearPagesSlice,
  clearPageCountSlice,
  addPageToPagesSlice,
  deletePageFromPagesSlice,
  deletePagesSlice,
  loadPageEditorTempFilesSlice,
  clearPageEditorTempFilesSlice,
  loadPageSectionsSlice,
  loadPageSectionSlice,
  setPageSectionCountSlice,
  clearPageSectionCountSlice,
  deletePageSectionsSlice,
  clearPageSectionsSlice,
  clearPageSectionSlice,
  loadSectionsByPageSlice,
} = page.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getPageSelector = (state: Record<string, any>): IPageState => state.page;
export const getPagePageSelector = (state: Record<string, any>): IPage => state.page.page;
export const getPageLoadingSelector = (state: Record<string, any>): boolean => state.page.loading;
export const getPagePagesSelector = (state: Record<string, any>): IPage[] => state.page.pages;
export const getPageCountSelector = (state: Record<string, any>): number => state.page.count;
export const getPageEditorTempFilesSelector = (
  state: Record<string, any>
): number => state.page.editorTempFiles;

// page sections
export const getPageSectionsSelector = (
  state: Record<string, any>
): IPageSection[] => state.page.pageSections;
export const getPageSectionSelector = (
  state: Record<string, any>
): IPageSection | null => state.page.pageSection;
export const getPageSectionCountSelector = (
  state: Record<string, any>
): number => state.page.pageSectionCount;
export const getSectionsByPageSelector = (
  state: Record<string, any>
): IPageSection[] => state.page.sectionsByPage;

export default page.reducer;
