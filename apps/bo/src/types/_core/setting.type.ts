import { PaletteColorOptions, PaletteMode } from '@mui/material';

import type { LanguageCode } from '@shared/constants';
import type { TargetEnum } from '@shared/types';


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
   * The country whose currency the money figures (dashboard, statistics) are read
   * in: amounts of two currencies are never added up. Optional: a state saved before it existed has none.
   */
  moneyCountry?: string;
  isAuthenticated?: boolean;
  /**
   * The workspace the signed-in person works in — a local preference like the theme, never stored on
   * the server. Optional: a state saved before it existed has none and is read as the portfolio.
   */
  workspace?: TargetEnum;
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

/**
 * What a workspace changes in the back-office: the brand the sidebar wears and the settings sections
 * that make no sense in it. The one place to edit to add a workspace or hide a section.
 */
export interface IWorkspaceConfig {
  /** the translation key of the workspace's name */
  labelKey: string;
  /** the logo of the open sidebar: for a light surface, and for a dark one */
  logo: { default: string; white: string };
  /** how wide that logo is drawn in the sidebar, in px */
  logoWidth: number;
  /** the symbol of the collapsed sidebar: for a light surface, and for a dark one */
  icon: { black: string; white: string };
  /** the settings sections hidden while working in this workspace */
  hiddenSettingsSections: SettingsSection[];
}

/*
 * the sections the settings page is read as, in the order the rail lists them. The first three change
 * how the back-office looks or what it shows for the person signed in; the last three edit what the
 * public website shows, so only those three are backed by a form that has to be saved.
 */
export enum SettingsSectionEnum {
  LANGUAGES = 'languages', // default
  APPEARANCE = 'appearance',
  WORKSPACE = 'workspace',
  DETAILS = 'details',
  IMAGES = 'images',
  CV = 'cv'
}

export type SettingsSection = `${SettingsSectionEnum}`;
