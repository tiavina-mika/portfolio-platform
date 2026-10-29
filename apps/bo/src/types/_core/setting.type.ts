import { PaletteColorOptions, PaletteMode } from '@mui/material';

import type { LanguageCode } from '@shared/constants';


export type Locale = LanguageCode | '';

// whether a translated field holds a value in a given locale
export type TranslationState = 'translated' | 'missing';
export enum Locales {
  FRENCH = 'fr',
  ENGLISH = 'en',
  MALAGASY = 'mg'
}

// 'light' only renders while theme is 'light' — it falls back to 'dark' while the app is in dark mode
export type SidebarStyle = 'dark' | 'black' | 'light' | 'brand';

/*
 * the two ways a detail page can be read. 'sidebar' keeps the summary rail standing next to the
 * page and renders only the block it marks — the reader is after one fact and goes straight to
 * it. 'full' drops the rail and stacks every block instead, which is what someone reading a record
 * end to end, printing it, or searching it with the browser's own find actually needs.
 *
 * It is a preference rather than a per-page state: an administrator reads every record the same
 * way, so the choice is made once and kept.
 */
export type PreviewLayout = 'sidebar' | 'full';

export interface ISettingState {
  locale: Locale;
  /**
   * The country whose currency the money figures (dashboard, finance, payments, statistics) are read
   * in: amounts of two currencies are never added up. Optional: a state saved before it existed has none.
   */
  moneyCountry?: string;
  isAuthenticated?: boolean;
  theme: PaletteMode;
  themeColor: string;
  isSideBarOpen: boolean;
  sidebarStyle: SidebarStyle;
  previewLayout: PreviewLayout;
  /*
   * whether the summary rail stands collapsed to its glyphs. Kept the way `isSideBarOpen` is kept
   * for the app's own sidebar, and for the same reason: an administrator gives the page either the
   * width or the names once, not on every record they open.
   */
  isPreviewSummaryReduced: boolean;
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

/*
 * the sections the settings page is read as, in the order the rail lists them. The first two change
 * how the back-office looks for the person signed in; the last two edit what the public website
 * shows, so only those two are backed by a form that has to be saved.
 */
export enum SettingsSectionEnum {
  LANGUAGES = 'languages', // default
  APPEARANCE = 'appearance',
  DETAILS = 'details',
  IMAGES = 'images'
}

export type SettingsSection = `${SettingsSectionEnum}`;
