import {
  PaletteColorOptions, PaletteMode, Theme, alpha,
} from '@mui/material';

import {
  DESIGN_TOKENS, SIDEBAR_BG_BLACK, SIDEBAR_BG_DARK, SIDEBAR_BG_LIGHT, SIDEBAR_BORDER_BLACK,
  SIDEBAR_BORDER_DARK, SIDEBAR_BORDER_LIGHT, SIDEBAR_GROUP_BLACK, SIDEBAR_GROUP_DARK,
  SIDEBAR_GROUP_LIGHT, SIDEBAR_HOVER_BG_BLACK, SIDEBAR_HOVER_BG_DARK, SIDEBAR_HOVER_BG_LIGHT,
  SIDEBAR_TEXT_ACTIVE_BLACK, SIDEBAR_TEXT_ACTIVE_DARK, SIDEBAR_TEXT_ACTIVE_LIGHT,
  SIDEBAR_TEXT_BLACK, SIDEBAR_TEXT_DARK, SIDEBAR_TEXT_HOVER_BLACK, SIDEBAR_TEXT_HOVER_DARK,
  SIDEBAR_TEXT_HOVER_LIGHT, SIDEBAR_TEXT_LIGHT, themeColorOptions,
} from '@/constants/_core/theme.constants';
import { IThemeColors, SidebarStyle } from '@/types/_core/setting.type';

export type DesignTokens = typeof DESIGN_TOKENS.light | typeof DESIGN_TOKENS.dark;

export const getDesignTokens = (theme: Theme): DesignTokens => (
  theme.palette.mode === 'dark'
    ? DESIGN_TOKENS.dark
    : DESIGN_TOKENS.light
);

/*
 * tinted background used by chips, alerts and the round/square icon slots of cards (the design's
 * `--<color>-lt` variables) — always go through this instead of `palette.<color>.light`, which is a
 * fixed opaque tone per theme color and stays the same in dark mode
 */
export const getTintedBackground = (theme: Theme, color: string): string => (
  alpha(color, getDesignTokens(theme).tintOpacity)
);

export type SosTones = {
  text: string;
  background: string;
  border: string;
  divider: string;
};

/** the red an SOS block is drawn in: its label, its ground, its outline and the rule between its bands */
export const getSosTones = (theme: Theme): SosTones => {
  const tokens = getDesignTokens(theme);
  const red = theme.palette.error.main;

  return {
    text: tokens.sosText,
    background: alpha(red, tokens.sosTintOpacity),
    border: alpha(red, tokens.sosBorderOpacity),
    divider: alpha(red, tokens.sosDividerOpacity),
  };
};

/*
 * the faintest tint the design draws: the ground of a marked table row and of the band naming the
 * current selection. It sits under the chip/alert tint on purpose — a selected row has to read as
 * a row that was marked, not as a colored block interrupting the grid.
 */
const SOFT_TINT_RATIO = 0.75;

export const getSoftTintedBackground = (theme: Theme, color: string): string => (
  alpha(color, getDesignTokens(theme).tintOpacity * SOFT_TINT_RATIO)
);

export type SidebarTokens = {
  bg: string;
  border: string;
  hoverBg: string;
  text: string;
  textHover: string;
  textActive: string;
  // group section label color (e.g. "OPERATIONS") — dimmer than the idle item text
  group: string;
  // true when the sidebar renders as a white surface — needs a dark logo/icon instead of a white one
  isLight: boolean;
};

export const getThemeColor = (color: string): PaletteColorOptions => {
  const selectColor = themeColorOptions.find(
    (themeColor: IThemeColors): boolean => themeColor.name === color
  );

  if (!selectColor) {
    return themeColorOptions[0].colors;
  }
  return selectColor.colors;
};

export const getSidebarTokens = (
  mode: PaletteMode,
  style: SidebarStyle,
  themeColor: string
): SidebarTokens => {
  // a white sidebar only makes sense while the app itself is in light mode — falls back to dark otherwise
  const effectiveStyle = style === 'light' && mode === 'dark'
    ? 'dark'
    : style;

  if (effectiveStyle === 'black') {
    return {
      bg: SIDEBAR_BG_BLACK,
      border: SIDEBAR_BORDER_BLACK,
      hoverBg: SIDEBAR_HOVER_BG_BLACK,
      text: SIDEBAR_TEXT_BLACK,
      textHover: SIDEBAR_TEXT_HOVER_BLACK,
      textActive: SIDEBAR_TEXT_ACTIVE_BLACK,
      group: SIDEBAR_GROUP_BLACK,
      isLight: false,
    };
  }

  if (effectiveStyle === 'light') {
    return {
      bg: SIDEBAR_BG_LIGHT,
      border: SIDEBAR_BORDER_LIGHT,
      hoverBg: SIDEBAR_HOVER_BG_LIGHT,
      text: SIDEBAR_TEXT_LIGHT,
      textHover: SIDEBAR_TEXT_HOVER_LIGHT,
      textActive: SIDEBAR_TEXT_ACTIVE_LIGHT,
      group: SIDEBAR_GROUP_LIGHT,
      isLight: true,
    };
  }

  if (effectiveStyle === 'brand') {
    const brandColor = getThemeColor(themeColor) as { main: string; dark?: string };
    const bg = brandColor.dark ?? brandColor.main;

    return {
      bg,
      border: alpha('#ffffff', 0.12),
      hoverBg: alpha('#ffffff', 0.08),
      text: alpha('#ffffff', 0.7),
      textHover: '#ffffff',
      textActive: '#ffffff',
      group: alpha('#ffffff', 0.5),
      isLight: false,
    };
  }

  return {
    bg: SIDEBAR_BG_DARK,
    border: SIDEBAR_BORDER_DARK,
    hoverBg: SIDEBAR_HOVER_BG_DARK,
    text: SIDEBAR_TEXT_DARK,
    textHover: SIDEBAR_TEXT_HOVER_DARK,
    textActive: SIDEBAR_TEXT_ACTIVE_DARK,
    group: SIDEBAR_GROUP_DARK,
    isLight: false,
  };
};
