import { teal } from '@mui/material/colors';

import { INPUT_FONT_SIZE, INPUT_HEIGHT } from '@/constants/_core/ui/ui.constants';
import { IThemeColors, SidebarStyle } from '@/types/_core/setting.type';

/*
 * Gentelella v4 design tokens — the single source of truth for surfaces, borders, text tints and
 * shadows, per palette mode. Every MUI component override of the theme (and any component that needs a
 * shadow or surface tint the MUI palette doesn't expose) reads from here via getDesignTokens();
 * never hard-code one of these values inside an individual override or component.
 */
export const DESIGN_TOKENS = {
  light: {
    // body is noticeably darker than the white cards so card surfaces read as raised blocks
    bodyBg: '#F5F7FB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F9FAFB',
    /*
     * ground of a panel that sits directly next to another full-height panel and must read as the
     * recessed one: bodyBg and surfaceSecondary are only a few points of luminance apart, so two
     * panels using them side by side look like a single flat block with no seam between them
     */
    surfaceSunken: '#E9EDF4',
    /*
     * the ground a slot of a recessed track takes while hovered — a fraction of the body tone, well
     * under the surface the open slot is raised onto, so passing over a closed tab never reads as
     * having opened it
     */
    tabHover: '#1e26330a',
    /*
     * borders sit well below the surface luminance so input outlines and card edges stay visible
     * on a white surface (a near-white border is invisible against #FFFFFF)
     */
    border: '#E6E7EB',
    borderLight: '#EFF0F3',
    /*
     * form controls need a stronger edge than cards: they sit inside a white card, on white, so
     * their outline is one step darker than a card edge — enough that an empty field still reads
     * as a field, without the outline itself becoming the loudest thing in a dense form
     */
    borderInput: '#CCD2DA',
    /*
     * text tints sit darker than the usual grey scale: body copy, table cells and captions mostly
     * use textSecondary/textMuted, which on a white surface must stay well above AA contrast or
     * the whole page reads as washed out
     */
    text: '#1E2633',
    textSecondary: '#626D7D',
    textMuted: '#7E8896',
    textDisabled: '#C0C7CF',
    shadow: '0 2px 4px 0 #1e26330a',
    /*
     * cast downwards only, by a band that opened between two others inside the same card (the
     * filter panel over the rows it narrows): it has the card's own surface above and below it, so
     * the shadow is what says the band is in front rather than part of what follows it
     */
    shadowBand: '0 4px 6px -4px #1e263326',
    shadowPopover: '0 8px 24px #0f172a1f',
    shadowModal: '0 24px 48px rgba(15,23,42,.26)',
    // tinted chip/alert backgrounds are ~8% of the base color on light surfaces
    tintOpacity: 0.08,
    /*
     * an SOS is drawn in its own muted red rather than in the error palette's alert tone: it is read
     * for minutes while the agent works the ticket, so its label is a darker red that stays calm on
     * the tinted ground, and its edges are the error red at fixed strengths — a full outline, a
     * fainter rule between its bands, and a ground just under the chip tint
     */
    sosText: '#9D3B3B',
    sosTintOpacity: 0.06,
    sosBorderOpacity: 0.4,
    sosDividerOpacity: 0.15,
  },
  dark: {
    bodyBg: '#0F1623',
    surface: '#1A2332',
    surfaceSecondary: '#141D2B',
    surfaceSunken: '#0A101A',
    tabHover: '#ffffff14',
    border: '#ffffff14',
    borderLight: '#ffffff0d',
    // opaque on dark: a translucent white outline washes out over the two different input grounds
    borderInput: '#4A5568',
    text: '#E6EBF2',
    textSecondary: '#B3BCCB',
    textMuted: '#8A93A3',
    textDisabled: '#5A6473',
    shadow: '0 2px 4px 0 #00000066, 0 0 0 1px #ffffff14',
    // no outlining ring here, unlike the shadows above: the band has edges of its own on both sides
    shadowBand: '0 4px 6px -4px #00000073',
    shadowPopover: '0 8px 24px #00000080, 0 0 0 1px #ffffff14',
    shadowModal: '0 24px 48px #000000a6, 0 0 0 1px #ffffff1f',
    // dark surfaces need a stronger tint (~16%) for the color to stay readable
    tintOpacity: 0.16,
    sosText: '#F2A0A0',
    sosTintOpacity: 0.15,
    sosBorderOpacity: 0.5,
    sosDividerOpacity: 0.24,
  },
} as const;

/*
 * stars keep their own amber in both modes: they rate a thing rather than warn about it, so they
 * must not shift with the warning palette (whose `main` is reserved for alert surfaces)
 */
export const RATING_COLOR = '#E0A800';
/*
 * a score low enough to matter is drawn in its own muted red rather than in the error palette: it
 * reports a standing built over months, not a failure the operator has to act on right now, and
 * the alert red beside it would read as the louder of the two
 */
export const RATING_LOW_COLOR = '#9D3B3B';

// unitless, so every size in the scale keeps the same proportion between its glyphs and its leading
export const BODY_LINE_HEIGHT = 1.4286;
/*
 * body copy leads wider than the rest of the scale: it is the only level read as sentences rather
 * than scanned as a label or a cell, and at 15px the row leading of a table is too tight for it
 */
export const PROSE_LINE_HEIGHT = 1.55;

/*
 * a floating label is positioned absolutely, so unlike the input it gets no flex centring to
 * inherit — it has to be pushed down by half of whatever the row has left once its own line box is
 * taken out. Derived rather than typed in so it follows the row height instead of drifting from it.
 * It measures against the input size, not the label size: at rest a floating label stands in for
 * the placeholder, so it is drawn at the size of the text that will replace it.
 */
export const INPUT_LABEL_OFFSET_Y = Math.round(
  (INPUT_HEIGHT - (INPUT_FONT_SIZE * BODY_LINE_HEIGHT)) / 2
);

export const DASHBOARD_BACKGROUND_COLOR = DESIGN_TOKENS.light.bodyBg;
export const DEFAULT_THEME_COLOR = 'green';

/*
 * the sidebar defaults to this dark navy chrome regardless of the app's light/dark mode — matches
 * the Gentelella design reference. Users can pick a different sidebar style instead
 * (see getSidebarTokens / the sidebarStyle setting).
 */
export const SIDEBAR_BG_DARK = '#1a2332';
export const SIDEBAR_BORDER_DARK = '#ffffff0f';
export const SIDEBAR_HOVER_BG_DARK = '#ffffff14';
export const SIDEBAR_TEXT_DARK = '#c3ccd9';
export const SIDEBAR_TEXT_HOVER_DARK = '#eef1f6';
export const SIDEBAR_TEXT_ACTIVE_DARK = '#ffffff';
export const SIDEBAR_GROUP_DARK = '#93a1b8';

// neutral near-black variant — distinct from the (slightly blue-tinted) navy default
export const SIDEBAR_BG_BLACK = '#0B0D10';
export const SIDEBAR_BORDER_BLACK = '#ffffff0f';
export const SIDEBAR_HOVER_BG_BLACK = '#ffffff14';
export const SIDEBAR_TEXT_BLACK = '#c7ccd3';
export const SIDEBAR_TEXT_HOVER_BLACK = '#f0f1f4';
export const SIDEBAR_TEXT_ACTIVE_BLACK = '#ffffff';
export const SIDEBAR_GROUP_BLACK = '#9aa3b0';

// white surface variant — reuses the light-mode surface tokens so it matches the rest of the UI
export const SIDEBAR_BG_LIGHT = DESIGN_TOKENS.light.surface;
export const SIDEBAR_BORDER_LIGHT = DESIGN_TOKENS.light.border;
export const SIDEBAR_HOVER_BG_LIGHT = DESIGN_TOKENS.light.surfaceSecondary;
// full text color (not textMuted/textSecondary) — those read as too faint for idle nav items on white
export const SIDEBAR_TEXT_LIGHT = DESIGN_TOKENS.light.text;
export const SIDEBAR_TEXT_HOVER_LIGHT = DESIGN_TOKENS.light.text;
export const SIDEBAR_TEXT_ACTIVE_LIGHT = DESIGN_TOKENS.light.text;
export const SIDEBAR_GROUP_LIGHT = DESIGN_TOKENS.light.textMuted;

/*
 * scrollbar thumb tints — a translucent white reads correctly over the dark sidebar variants, but
 * disappears on the white one, which needs an opaque grey instead
 */
export const SIDEBAR_SCROLL_THUMB_DARK = '#ffffff33';
export const SIDEBAR_SCROLL_THUMB_HOVER_DARK = '#ffffff4d';
export const SIDEBAR_SCROLL_THUMB_LIGHT = '#c0c7cf';
export const SIDEBAR_SCROLL_THUMB_HOVER_LIGHT = '#a9b1bc';

export const themeColorOptions: IThemeColors[] = [
  {
    name: DEFAULT_THEME_COLOR,
    colors: {
      light: teal[50],
      main: '#1ABB9C',
      dark: '#169F85',
      contrastText: '#fff',
    },
  },
  {
    name: 'blue',
    colors: {
      light: '#aadbff',
      main: '#1A9BFC',
      dark: '#0a446d',
      contrastText: '#fff',
    },
  },
  {
    name: 'purple',
    colors: {
      light: '#bcadff',
      main: '#7352ff',
      dark: '#342772',
      contrastText: '#fff',
    },
  },
  {
    name: 'red',
    colors: {
      light: '#ffc6d7',
      main: '#ff5c8e',
      dark: '#72293f',
      contrastText: '#fff',
    },
  },
  {
    name: 'indigo',
    colors: {
      light: '#798cb5',
      main: '#1e4db7',
      dark: '#0e2963',
      contrastText: '#fff',
    },
  },
  {
    name: 'orange',
    colors: {
      light: '#ffdfd6',
      main: '#fb9678',
      dark: '#7c4c3e',
      contrastText: '#fff',
    },
  },
  {
    name: 'yellow',
    colors: {
      light: '#ffff91',
      main: '#a8aa00',
      dark: '#565600',
      contrastText: '#fff',
    },
  },
];

export const SIDEBAR_STYLE_OPTIONS: SidebarStyle[] = ['dark', 'black', 'light', 'brand'];
export const DEFAULT_SIDEBAR_STYLE: SidebarStyle = 'dark';
