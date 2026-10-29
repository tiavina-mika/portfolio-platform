import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ISettingState, Locale } from '@/types/setting.type';
import type { PaletteMode } from '@mui/material';

import { DEFAULT_LOCALE } from '@/utils/constants';
import { DEFAULT_THEME_COLOR } from '@/utils/theme.utils';

const initialState: ISettingState = {
  locale: DEFAULT_LOCALE,
  isAuthenticated: false,
  theme: 'light',
  themeColor: DEFAULT_THEME_COLOR,
  isSideBarOpen: true,
};

export const settings: any = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLocaleSlice: (state: ISettingState, action: PayloadAction<Locale>) => {
      state.locale = action.payload;
    },
    changeThemeSlice: (state: ISettingState, action: PayloadAction<PaletteMode>) => {
      state.theme = action.payload;
    },
    changeThemeColorSlice: (state: ISettingState, action: PayloadAction<string>) => {
      state.themeColor = action.payload;
    },
    changeIsSideBarOpenSlice: (state: ISettingState, action: PayloadAction<boolean>) => {
      state.isSideBarOpen = action.payload;
    },
    toggleIsAuthenticatedSlice: (state: ISettingState, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const {
  setLocaleSlice,
  toggleIsAuthenticatedSlice,
  changeThemeSlice,
  changeThemeColorSlice,
  changeIsSideBarOpenSlice,
  setCurrentCooperativeSlice,
  clearCurrentCooperativeSlice,
} = settings.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getSettingsSelector = (state: Record<string, any>): ISettingState => state.settings;
export const getSettingsThemeSelector = (state: Record<string, any>): PaletteMode => state.settings.theme;
export const getSettingsThemeColorSelector =
  (state: Record<string, any>): string => state.settings.themeColor;
export const getSettingsIsSideBarOpenSelector = (
  state: Record<string, any>
): boolean => state.settings.isSideBarOpen;
export const getSettingsLocaleSelector = (state: Record<string, any>): Locale => state.settings.locale;
export const getSettingsIsAuthenticatedSelector = (state: Record<string, any>): boolean =>
  state.settings.isAuthenticated;

export default settings.reducer;
