import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ITranslatedFileCloud } from '@/types/file.type';
import type { IProject, IProjectState } from '@/types/project.type';

const initialState: IProjectState = {
  loading: false,
  project: null,
  projects: [],
  editorTempFiles: [],
  count: 0,
};

export const project = createSlice({
  name: 'project',
  initialState,
  reducers: {
    loadProjectsSlice: (state: IProjectState, action: PayloadAction<IProject[]>) => {
      state.projects = action.payload;
    },
    loadProjectSlice: (state: IProjectState, action: PayloadAction<IProject>) => {
      state.project = action.payload;
    },
    addProjectToProjectsSlice: (state: IProjectState, action: PayloadAction<IProject>) => {
      state.projects = [...state.projects, action.payload];
      state.count += 1;
    },
    deleteProjectFromProjectsSlice: (state: IProjectState, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((project: IProject) => project.id !== action.payload);
      state.count -= 1;
    },
    setProjectsCountSlice: (state: IProjectState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    loadProjectEditorTempFilesSlice: (state: IProjectState, action: PayloadAction<ITranslatedFileCloud>) => {
      state.editorTempFiles = [...state.editorTempFiles, action.payload];
    },
    clearProjectEditorTempFilesSlice: (state: IProjectState) => {
      state.editorTempFiles = [];
    },
    clearProjectSlice: (state: IProjectState) => {
      state.project = null;
    },
    clearProjectsSlice: (state: IProjectState) => {
      state.projects = [];
    },
    setProjectLoadingSlice: (state: IProjectState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearProjectCountSlice: (state: IProjectState) => {
      state.count = 0;
    },
    deleteProjectsSlice: (state: IProjectState, action: PayloadAction<string[]>) => {
      const newProjects = state.projects.filter(prevProject => !action.payload.includes(prevProject.id));

      state.projects = newProjects;
    },
  },
});

export const {
  setProjectLoadingSlice,
  clearProjectSlice,
  loadProjectSlice,
  loadProjectsSlice,
  setProjectsCountSlice,
  clearProjectsSlice,
  clearProjectCountSlice,
  addProjectToProjectsSlice,
  deleteProjectFromProjectsSlice,
  deleteProjectsSlice,
  loadProjectEditorTempFilesSlice,
  clearProjectEditorTempFilesSlice,
} = project.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getProjectSelector = (state: Record<string, any>): IProjectState => state.project;
export const getProjectProjectSelector = (state: Record<string, any>): IProject => state.project.project;
export const getProjectLoadingSelector = (state: Record<string, any>): boolean => state.project.loading;
export const getProjectProjectsSelector = (state: Record<string, any>): IProject[] => state.project.projects;
export const getProjectCountSelector = (state: Record<string, any>): number => state.project.count;
export const getProjectEditorTempFilesSelector = (
  state: Record<string, any>
): number => state.project.editorTempFiles;

export default project.reducer;
