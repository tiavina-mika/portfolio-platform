import type { PaletteColorOptions, PaletteMode } from '@mui/material';

export type Locale = 'fr' | 'mg' | 'en' | '';
export enum Locales {
  FRENCH = 'fr',
  ENGLISH = 'en',
  MALAGASY = 'mg'
}

export interface ISettingState {
  locale: Locale;
  isAuthenticated?: boolean;
  theme: PaletteMode;
  themeColor: string;
  isSideBarOpen: boolean;
}

interface IReduxPersistDefaultValues {
  version: number;
  rehydrated: boolean;
}
export interface IStoredData {
  _persist: IReduxPersistDefaultValues;
  settings: ISettingState;
}

export interface IThemeColors {
  name: string;
  colors: PaletteColorOptions;
}

export enum SettingsTabEnum {
  BO = 'back-office', // default
  APP = 'app',
  WEBSITE = 'website'
}

export type SettingsTab = `${SettingsTabEnum}`;
