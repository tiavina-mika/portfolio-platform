import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IArticle, IArticleState } from '@/types/_core/article.type';
import { ITranslatedFileCloud } from '@/types/_core/file.type';

const initialState: IArticleState = {
  loading: false,
  article: null,
  articles: [],
  editorTempFiles: [],
  count: 0,
};

export const article = createSlice({
  name: 'article',
  initialState,
  reducers: {
    loadArticlesSlice: (state: IArticleState, action: PayloadAction<IArticle[]>) => {
      state.articles = action.payload;
    },
    loadArticleSlice: (state: IArticleState, action: PayloadAction<IArticle>) => {
      state.article = action.payload;
    },
    addArticleToArticlesSlice: (state: IArticleState, action: PayloadAction<IArticle>) => {
      state.articles = [...state.articles, action.payload];
      state.count += 1;
    },
    deleteArticleFromArticlesSlice: (state: IArticleState, action: PayloadAction<string>) => {
      state.articles = state.articles.filter((article: IArticle) => article.id !== action.payload);
      state.count -= 1;
    },
    setArticlesCountSlice: (state: IArticleState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    loadArticleEditorTempFilesSlice: (state: IArticleState, action: PayloadAction<ITranslatedFileCloud>) => {
      state.editorTempFiles = [...state.editorTempFiles, action.payload];
    },
    clearArticleEditorTempFilesSlice: (state: IArticleState) => {
      state.editorTempFiles = [];
    },
    clearArticleSlice: (state: IArticleState) => {
      state.article = null;
    },
    clearArticlesSlice: (state: IArticleState) => {
      state.articles = [];
    },
    setArticleLoadingSlice: (state: IArticleState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearArticleCountSlice: (state: IArticleState) => {
      state.count = 0;
    },
    deleteArticlesSlice: (state: IArticleState, action: PayloadAction<string[]>) => {
      const newArticles = state.articles.filter(prevArticle => !action.payload.includes(prevArticle.id));

      state.articles = newArticles;
    },
  },
});

export const {
  setArticleLoadingSlice,
  clearArticleSlice,
  loadArticleSlice,
  loadArticlesSlice,
  setArticlesCountSlice,
  clearArticlesSlice,
  clearArticleCountSlice,
  addArticleToArticlesSlice,
  deleteArticleFromArticlesSlice,
  deleteArticlesSlice,
  loadArticleEditorTempFilesSlice,
  clearArticleEditorTempFilesSlice,
} = article.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getArticleSelector = (state: Record<string, any>): IArticleState => state.article;
export const getArticleArticleSelector = (state: Record<string, any>): IArticle => state.article.article;
export const getArticleLoadingSelector = (state: Record<string, any>): boolean => state.article.loading;
export const getArticleArticlesSelector = (state: Record<string, any>): IArticle[] => state.article.articles;
export const getArticleCountSelector = (state: Record<string, any>): number => state.article.count;
export const getArticleEditorTempFilesSelector = (
  state: Record<string, any>
): number => state.article.editorTempFiles;

export default article.reducer;
