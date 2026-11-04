import { PaletteMode } from '@mui/material';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_COUNTRY_CODE } from '@shared/constants';

import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { DEFAULT_SIDEBAR_STYLE, DEFAULT_THEME_COLOR } from '@/constants/_core/theme.constants';
import {
  ISettingState, Locale, PreviewLayout, SidebarStyle,
} from '@/types/_core/setting.type';

const initialState: ISettingState = {
  locale: DEFAULT_LOCALE,
  moneyCountry: DEFAULT_COUNTRY_CODE,
  isAuthenticated: false,
  theme: 'light',
  themeColor: DEFAULT_THEME_COLOR,
  isSideBarOpen: true,
  sidebarStyle: DEFAULT_SIDEBAR_STYLE,
  // a detail page opens behind its summary: most visits are after one block, not the whole record
  previewLayout: 'sidebar',
  // and it opens with the names showing: the glyphs alone only read once the rail is already known
  isPreviewSummaryReduced: false,
};

export const settings: any = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLocaleSlice: (state: ISettingState, action: PayloadAction<Locale>) => {
      state.locale = action.payload;
    },
    changeMoneyCountrySlice: (state: ISettingState, action: PayloadAction<string>) => {
      state.moneyCountry = action.payload;
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
    changeSidebarStyleSlice: (state: ISettingState, action: PayloadAction<SidebarStyle>) => {
      state.sidebarStyle = action.payload;
    },
    changePreviewLayoutSlice: (state: ISettingState, action: PayloadAction<PreviewLayout>) => {
      state.previewLayout = action.payload;
    },
    changeIsPreviewSummaryReducedSlice: (state: ISettingState, action: PayloadAction<boolean>) => {
      state.isPreviewSummaryReduced = action.payload;
    },
    toggleIsAuthenticatedSlice: (state: ISettingState, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const {
  setLocaleSlice,
  changeMoneyCountrySlice,
  toggleIsAuthenticatedSlice,
  changeThemeSlice,
  changeThemeColorSlice,
  changeIsSideBarOpenSlice,
  changeSidebarStyleSlice,
  changePreviewLayoutSlice,
  changeIsPreviewSummaryReducedSlice,
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
export const getSettingsSidebarStyleSelector = (
  state: Record<string, any>
): SidebarStyle => state.settings.sidebarStyle;
/*
 * defaulted on read rather than only in `initialState`: the setting is persisted, so a session
 * opened before this preference existed rehydrates a state that has no value for it at all
 */
export const getSettingsPreviewLayoutSelector = (
  state: Record<string, any>
): PreviewLayout => state.settings.previewLayout ?? 'sidebar';
export const getSettingsIsPreviewSummaryReducedSelector = (
  state: Record<string, any>
): boolean => state.settings.isPreviewSummaryReduced ?? false;
/*
 * defaulted on read: the setting is persisted, so a session opened before it existed rehydrates a
 * state that has no value for it
 */
export const getSettingsMoneyCountrySelector = (state: Record<string, any>): string => (
  state.settings.moneyCountry ?? DEFAULT_COUNTRY_CODE
);
export const getSettingsLocaleSelector = (state: Record<string, any>): Locale => state.settings.locale;
export const getSettingsIsAuthenticatedSelector = (state: Record<string, any>): boolean =>
  state.settings.isAuthenticated;

export default settings.reducer;
