import {
  PaletteMode, PaletteOptions, Theme, createTheme,
} from '@mui/material';
import { teal } from '@mui/material/colors';

import {
  BODY_LINE_HEIGHT, DEFAULT_THEME_COLOR, DESIGN_TOKENS, PROSE_LINE_HEIGHT,
} from '@/constants/_core/theme.constants';
import {
  BUTTON_FONT_SIZE, FONT_SIZE_BODY, FONT_SIZE_CARD_TITLE, FONT_SIZE_META, FONT_SIZE_OVERLINE,
  FONT_SIZE_PAGE_TITLE, FONT_SIZE_SCREEN_TITLE, RADIUS_SM, THEME_BREAKPOINTS,
} from '@/constants/_core/ui/ui.constants';
import { actionsComponentOverrides } from '@/utils/_core/theme/overrides/actions.utils';
import { dataComponentOverrides } from '@/utils/_core/theme/overrides/data.utils';
import { inputsComponentOverrides } from '@/utils/_core/theme/overrides/inputs.utils';
import { surfacesComponentOverrides } from '@/utils/_core/theme/overrides/surfaces.utils';
import { DesignTokens, getThemeColor } from '@/utils/_core/theme/tokens.utils';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface BreakpointOverrides {
    xs: true; // adds the `xs` breakpoint
    sm: true; // adds the `sm` breakpoint
    md: true; // adds the `md` breakpoint
    lg: true; // adds the `lg` breakpoint
    xl: true; // adds the `xl` breakpoint
    '2xl': true; // adds the `2xl` breakpoint
  }
}

const defaultTheme = {
  palette: {
    /*
     * secondary is the design's seventh chip tone — a violet. It used to be a red one shade off
     * `error`, which made a "waiting" chip and a "cancelled" chip read as the same state; the
     * violet is the only tone in the palette that carries no severity of its own, which is exactly
     * what a neutral-but-distinct state (waiting, refund to passenger) needs.
     */
    secondary: {
      light: '#E9B8F4',
      main: '#AE3EC9',
      dark: '#8B2FA1',
      contrastText: '#fff',
    },
    /*
     * dark is explicit on every color a filled button can take: `contained` draws its 1px edge and
     * its hover ground from `dark`, and MUI's own generated tone (a flat 20% darkening of main)
     * lands off the design's edge colors
     */
    success: { main: '#2FB344', dark: '#1F8A32' },
    info: { main: '#066FD1', dark: '#0559A8' },
    /*
     * dark also serves as the text/icon tone on tinted warning surfaces (chips, alerts): #F59F00
     * on its own ~8% tint reads too light
     */
    warning: { main: '#F59F00', dark: '#B45309' },
    error: { main: '#D63939', dark: '#A32C2C' },
  },
  shape: { borderRadius: RADIUS_SM },
  typography: {
    fontFamily: [
      'DM Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    fontWeightMedium: 500,
    fontWeightBold: 600,
    /*
     * Every rung of the scale lives in ui.constants (FONT_SIZE_*) — see the block at the top of
     * that file for the scale itself and why it has exactly six sizes. What is set here is how the
     * MUI variants land on it: the variants a screen actually reaches for are h2 / h3 / h5 / h6 for
     * headings, subtitle1 / body1 / body2 for text, and caption / overline below them.
     */
    subtitle1: { fontSize: FONT_SIZE_BODY, fontWeight: 500 },
    subtitle2: { fontSize: FONT_SIZE_BODY, fontWeight: 500 },
    body1: {
      fontSize: FONT_SIZE_BODY,
      lineHeight: PROSE_LINE_HEIGHT,
    },
    body2: {
      fontSize: FONT_SIZE_BODY,
      lineHeight: BODY_LINE_HEIGHT,
    },
    caption: { fontSize: FONT_SIZE_META },
    /*
     * MUI leads an overline at 2.66× its own size — a label meant to sit tight above what it names
     * (a page pretitle, a sidebar group, a filter-bar caption) would stand in a 32px band of its
     * own instead. It is scanned, not read as a sentence, so it takes the scale's own leading.
     */
    overline: {
      fontSize: FONT_SIZE_OVERLINE,
      fontWeight: 600,
      letterSpacing: 0.4,
      lineHeight: BODY_LINE_HEIGHT,
    },
    /*
     * a button label is written the way it reads: the design forces no case of its own, where MUI's
     * own default would upper-case every action in the interface
     */
    button: { fontSize: BUTTON_FONT_SIZE, fontWeight: 500, textTransform: 'none' as const },
  },
  components: {
    ...actionsComponentOverrides,
    ...surfacesComponentOverrides,
    ...dataComponentOverrides,
    ...inputsComponentOverrides,
  },
};

export const websitePalette = {
  primary: {
    light: teal[50],
    main: '#1ABB9C',
    dark: '#169F85',
    contrastText: '#fff',
  },
  secondary: {
    light: '#ff7961',
    main: '#222222',
    dark: '#ba000d',
    contrastText: '#000',
  },
  success: { main: '#2FB344' },
  info: { main: '#4299E1' },
  error: { main: '#D63939' },
};

export const boPalette: PaletteOptions = {
  primary: {
    light: teal[50],
    main: '#1ABB9C',
    dark: '#169F85',
    contrastText: '#fff',
  },
  ...defaultTheme.palette,
};

/*
 * bakes each mode's muted-text tokens into the typography variants that carry a fixed color
 * (subtitle2/body2/caption/overline) — set on `theme.typography[variant]` rather than a
 * `MuiTypography` component override so an explicit `color` prop on a given <Typography> still
 * wins (the color-prop variants are resolved after the typography-variant styles)
 */
const getMutedTypography = (tokens: DesignTokens) => ({
  subtitle2: { ...defaultTheme.typography.subtitle2, color: tokens.textSecondary },
  body2: { ...defaultTheme.typography.body2, color: tokens.textSecondary },
  /*
   * captions and overlines sit in the same secondary tone as body2 rather than a fainter one: a
   * field label, a table head and a timestamp are read, not decoration, and the extra step down
   * the muted tint used to add left them below the contrast the design holds itself to
   */
  caption: { ...defaultTheme.typography.caption, color: tokens.textSecondary },
  overline: { ...defaultTheme.typography.overline, color: tokens.textSecondary },
});

const lightTheme = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    divider: DESIGN_TOKENS.light.border,
    background: {
      default: DESIGN_TOKENS.light.bodyBg,
      paper: DESIGN_TOKENS.light.surface,
    },
    text: {
      primary: DESIGN_TOKENS.light.text,
      secondary: DESIGN_TOKENS.light.textSecondary,
      disabled: DESIGN_TOKENS.light.textDisabled,
    },
  },
  typography: {
    ...defaultTheme.typography,
    ...getMutedTypography(DESIGN_TOKENS.light),
  },
};

const darkTheme = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    divider: DESIGN_TOKENS.dark.border,
    background: {
      default: DESIGN_TOKENS.dark.bodyBg,
      paper: DESIGN_TOKENS.dark.surface,
    },
    text: {
      primary: DESIGN_TOKENS.dark.text,
      secondary: DESIGN_TOKENS.dark.textSecondary,
      disabled: DESIGN_TOKENS.dark.textDisabled,
    },
  },
  typography: {
    ...defaultTheme.typography,
    ...getMutedTypography(DESIGN_TOKENS.dark),
  },
};

type FontConfig = {
  variant: string;
  fontSize: number;
};

/*
 * Fixed heading scale — no responsive size jump, hierarchy is the scale itself, not a mobile shrink.
 * Four rungs cover every heading in the back-office: page title, screen title, card/dialog title
 * and block title.
 *
 * The design drops h1 and h4 — h1 because nothing in the back-office outranks a page title, h4
 * because it landed on the card title h5 already holds. They stay mapped onto their neighbour so a
 * stray usage renders at the right size rather than at MUI's untouched 6rem default, but new code
 * reaches for h2 / h3 / h5 / h6 only.
 */
const fontsConfig: FontConfig[] = [
  { variant: 'h1', fontSize: FONT_SIZE_PAGE_TITLE },
  { variant: 'h2', fontSize: FONT_SIZE_PAGE_TITLE },
  { variant: 'h3', fontSize: FONT_SIZE_SCREEN_TITLE },
  { variant: 'h4', fontSize: FONT_SIZE_CARD_TITLE },
  { variant: 'h5', fontSize: FONT_SIZE_CARD_TITLE },
  { variant: 'h6', fontSize: FONT_SIZE_BODY },
];

export const getTheme = (mode: PaletteMode = 'light', color = DEFAULT_THEME_COLOR): Theme => {
  const defaultTheme = mode === 'light'
    ? lightTheme
    : darkTheme;

  // @ts-expect-error - unknown multiple
  const theme = createTheme({
    ...defaultTheme,
    palette: {
      mode,
      primary: getThemeColor(color),
      ...defaultTheme.palette,
    },
    breakpoints: { values: THEME_BREAKPOINTS },
  });

  fontsConfig.forEach((item: FontConfig) => {
    // e.g. theme.typography.h2 = { fontSize: FONT_SIZE_PAGE_TITLE }
    (theme.typography as any)[item.variant] = {
      ...(theme.typography as any)[item.variant],
      fontSize: item.fontSize,
      fontWeight: theme.typography.fontWeightBold,
      [theme.breakpoints.down('md')]: { textAlign: 'left' },
    };
  });

  ['body1', 'body2'].forEach((variant: string) => {
    (theme.typography as any)[variant] = {
      ...(theme.typography as any)[variant],
      [theme.breakpoints.down('md')]: { textAlign: 'left' },
    };
  });

  return theme;
};
