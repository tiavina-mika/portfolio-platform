import {
  AlertColor, Theme, alpha, lighten,
} from '@mui/material';

import {
  SIDEBAR_SCROLL_THUMB_DARK, SIDEBAR_SCROLL_THUMB_HOVER_DARK, SIDEBAR_SCROLL_THUMB_HOVER_LIGHT,
  SIDEBAR_SCROLL_THUMB_LIGHT,
} from '@/constants/_core/theme.constants';
import {
  LIST_FILTERS_INPUT_ACTION_SIZE, LIST_FILTERS_TOGGLE_PADDING_X, LIST_TOOLBAR_CONTROL_HEIGHT,
  ROW_ACTIONS_BUTTON_SIZE, ROW_ACTIONS_GAP,
} from '@/constants/_core/ui/list.constants';
import { RADIUS_SM, UNSEEN_ROW_ACCENT_WIDTH } from '@/constants/_core/ui/ui.constants';
import {
  SidebarTokens, getDesignTokens, getSoftTintedBackground, getTintedBackground,
} from '@/utils/_core/theme/tokens.utils';

/**
 * How a row that nobody has opened yet is set apart from the rest of the list.
 *
 * Until now the only way to tell a new row from a handled one was to stand on the "Nouveautés"
 * tab, which is also the tab that hides everything else — so an operator working from "Tous" was
 * working blind. A tint plus an accent down the leading edge says it without adding a column.
 *
 * The accent is an inset shadow rather than a border: the table collapses its borders, and a
 * `border-left` on a body cell there is drawn over by the neighbouring cell's own edge.
 */
export const getUnseenRowStyles = (theme: Theme) => ({
  backgroundColor: getSoftTintedBackground(theme, theme.palette.primary.main),
  '& > .MuiTableCell-body:first-of-type': {
    boxShadow: `inset ${UNSEEN_ROW_ACCENT_WIDTH}px 0 0 ${theme.palette.primary.main}`,
  },
});

/**
 * The same mark on the card rendering of a list. A card is a box of its own, so the accent can be
 * a real border there — and it runs the full height rather than only the first cell.
 */
export const getUnseenCardStyles = (theme: Theme) => ({
  backgroundColor: getSoftTintedBackground(theme, theme.palette.primary.main),
  borderLeft: `${UNSEEN_ROW_ACCENT_WIDTH}px solid ${theme.palette.primary.main}`,
});

/*
 * the list toolbar compresses every control it hosts onto its own row — including the ones a page
 * hands it through `renderFilter`, which are ordinary form fields elsewhere in the app. It is
 * scoped to pointer devices: under `md` the controls go back to the theme's touch targets, since a
 * 34px slot is below the minimum a finger can reliably land on.
 */
export const getListToolbarControlStyles = (theme: Theme) => ({
  [theme.breakpoints.up('md')]: {
    '& .MuiIconButton-root': {
      width: LIST_TOOLBAR_CONTROL_HEIGHT,
      height: LIST_TOOLBAR_CONTROL_HEIGHT,
    },
    '& .MuiButton-root': { height: LIST_TOOLBAR_CONTROL_HEIGHT },
    '& .SearchInput-root': { height: LIST_TOOLBAR_CONTROL_HEIGHT },
  },
});

/*
 * the filter panel holds the same ordinary form fields the pages use in their edit forms, but as a
 * dense grid of quarter-width cells: every family it can host is brought down to the toolbar's
 * control row so a text field, a select, a date range and a segmented group standing side by side
 * in one grid row share a single baseline. Pointer devices only, for the same reason as the
 * toolbar — under `md` the fields go back to the theme's touch targets.
 */
export const getListFiltersControlStyles = (theme: Theme) => ({
  // a status group has as many segments as the domain has statuses: it wraps rather than overflows
  '& .MuiToggleButtonGroup-root': { flexWrap: 'wrap' as const },

  [theme.breakpoints.up('md')]: {
    '& .MuiOutlinedInput-root': { minHeight: LIST_TOOLBAR_CONTROL_HEIGHT },
    // react-select draws its own control rather than an MUI input
    '& .select__control': { minHeight: LIST_TOOLBAR_CONTROL_HEIGHT },
    '& .DateRangeInput-trigger': { height: LIST_TOOLBAR_CONTROL_HEIGHT },
    // the panel's own foot actions stand on that row too, so it reads as one band and not two
    '& .MuiButton-root': { height: LIST_TOOLBAR_CONTROL_HEIGHT, minHeight: LIST_TOOLBAR_CONTROL_HEIGHT },
    '& .MuiToggleButton-root': {
      height: LIST_TOOLBAR_CONTROL_HEIGHT,
      padding: `0 ${LIST_FILTERS_TOGGLE_PADDING_X}px`,
    },
    // an action drawn inside a field comes down with the row it sits on, or it holds the row open
    '& .MuiInputAdornment-root .MuiIconButton-root': {
      width: LIST_FILTERS_INPUT_ACTION_SIZE,
      height: LIST_FILTERS_INPUT_ACTION_SIZE,
    },
  },
});

/*
 * every form control (MUI or not — react-select, the custom date range trigger) marks focus with
 * the same tinted halo around a primary-colored outline; keep them going through this so a focused
 * select never glows differently from the text field next to it
 */
export const getInputFocusRing = (theme: Theme): string => (
  `0 0 0 3px ${getTintedBackground(theme, theme.palette.primary.main)}`
);

/*
 * focus halo of the button family. A filled button carries a stronger ring than an outlined or bare
 * one: it already sits on a saturated ground, so a 20% halo around it barely separates from the
 * fill itself.
 */
const BUTTON_FOCUS_RING_OPACITY = 0.2;
const BUTTON_FILLED_FOCUS_RING_OPACITY = 0.3;

export const getButtonFocusRing = (color: string, filled = false): string => (
  `0 0 0 3px ${alpha(color, filled
    ? BUTTON_FILLED_FOCUS_RING_OPACITY
    : BUTTON_FOCUS_RING_OPACITY)}`
);

// the colored outline is drawn on a translucent edge so it reads softer than a filled button's
export const OUTLINED_COLOR_BORDER_OPACITY = 0.35;
export const OUTLINED_COLOR_HOVER_OPACITY = 0.06;

/*
 * an icon action drawn as a real control rather than as a bare hit slot: a bordered square on the
 * card surface whose edge turns primary under the pointer. A lone glyph carries no label and no
 * shape of its own, so without the box a reader has to hover the thing to find out it is a button
 * — which is exactly the case in the two places this is used, the toolbar of a list and the strip
 * of actions at the end of each of its rows.
 *
 * `size` is what separates the two: the toolbar's control row, and the tighter row a table repeats
 * on every line. It only applies above `md` — under it, the theme's touch target takes over, since
 * a 30px slot is well below what a finger can reliably land on.
 */
export const getOutlinedIconButtonStyles = (theme: Theme, size: number) => {
  const tokens = getDesignTokens(theme);

  return {
    borderRadius: RADIUS_SM,
    border: `1px solid ${tokens.border}`,
    backgroundColor: tokens.surface,
    color: tokens.textSecondary,
    [theme.breakpoints.up('md')]: { width: size, height: size },
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: tokens.surface,
      color: theme.palette.primary.dark,
    },
    '&.Mui-focusVisible': {
      borderColor: theme.palette.primary.main,
      boxShadow: getInputFocusRing(theme),
    },
    // a destructive slot keeps its own tone rather than turning primary, edge included
    '&.MuiIconButton-colorError': {
      color: theme.palette.error.main,
      borderColor: alpha(theme.palette.error.main, OUTLINED_COLOR_BORDER_OPACITY),
      '&:hover': {
        color: theme.palette.error.main,
        borderColor: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, OUTLINED_COLOR_HOVER_OPACITY),
      },
    },
    '&.Mui-disabled': {
      color: tokens.textDisabled,
      backgroundColor: tokens.surfaceSecondary,
      borderColor: tokens.border,
    },
  };
};

/*
 * the strip of actions a row carries, in a table cell or in the foot of a card: the same bordered
 * slot the toolbar above it uses, one step smaller — a ten-row list must not read as two columns
 * of full-size buttons with the data behind them.
 */
/**
 * A native button that carries no look of its own — the slot it wraps is the whole appearance of the
 * control — with the app's focus ring put back, since resetting the button takes the browser's away.
 */
export const getBareButtonStyles = (theme: Theme) => ({
  display: 'inline-flex',
  padding: 0,
  border: 'none',
  background: 'none',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:focus-visible': {
    outline: 'none',
    boxShadow: getInputFocusRing(theme),
  },
});

export const getRowActionsStyles = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: `${ROW_ACTIONS_GAP}px`,
  '& .MuiIconButton-root': getOutlinedIconButtonStyles(theme, ROW_ACTIONS_BUTTON_SIZE),
});

/*
 * a destructive entry in a dropdown colors its whole row, glyph included: tinting only the icon
 * leaves "Delete" reading like every other action until the eye reaches the far left of the row
 */
export const getDestructiveMenuItemStyles = (theme: Theme) => ({
  color: theme.palette.error.main,
  '& .MuiListItemIcon-root': { color: 'inherit' },
  '&:hover': { backgroundColor: alpha(theme.palette.error.main, OUTLINED_COLOR_HOVER_OPACITY) },
});

/*
 * tone a severity uses whenever it colors text, an icon or a filled surface: `warning.main` is a
 * bright amber that fails contrast both as text on its own tint and under white text, so it is the
 * one severity that falls back to its explicit `dark` step
 */
export const getSeverityToneColor = (theme: Theme, severity: AlertColor): string => (
  severity === 'warning'
    ? theme.palette.warning.dark
    : theme.palette[severity].main
);

/*
 * a missing translation is flagged in amber, not red: it does not block saving, and red stays
 * reserved for a field that actually fails validation. The bright main only reads on the dark ground.
 */
export const getMissingTranslationColor = (theme: Theme): string => (
  theme.palette.mode === 'dark'
    ? theme.palette.warning.main
    : theme.palette.warning.dark
);

/*
 * a chip's border is drawn one step stronger than the wash behind it, so the pill keeps an edge on
 * the recessed grounds (table rows, filter bars) where its own tint nearly matches the surface
 */
const CHIP_BORDER_OPACITY = 0.2;

/*
 * every tone a state can be drawn in. `primary` is not an alert level but the app's own accent,
 * which some states are marked with (a value the reader is being pointed at rather than warned
 * about), so it belongs to the same set as the four severities and the neutral one.
 */
export type StatusTone = AlertColor | 'primary' | 'default';

/**
 * A state drawn as colored mark on a wash of its own color: the tint every chip, pill and slot in
 * the app that carries a status is painted with. Unlike the chip wrapper below, the neutral state
 * is spelled out rather than left to the surface underneath — a lone tinted square in a table cell
 * has no chip root behind it to fall back on, and an unpainted one reads as a missing value.
 */
export const getStatusTintStyles = (theme: Theme, color: StatusTone) => {
  const tokens = getDesignTokens(theme);

  if (color === 'default') {
    return {
      color: tokens.textSecondary,
      backgroundColor: tokens.surfaceSecondary,
      borderColor: tokens.border,
    };
  }

  const main = theme.palette[color]?.main;

  if (!main) return {};

  return {
    // warning's main is too light for text on its own tint — use its explicit dark instead
    color: color === 'warning'
      ? theme.palette.warning.dark
      : main,
    backgroundColor: getTintedBackground(theme, main),
    borderColor: alpha(main, CHIP_BORDER_OPACITY),
  };
};

/**
 * The solid tone of a state, for the marks that are read as a dot rather than as a wash — the disc
 * pinned to a channel slot, the bullet in front of a label.
 */
export const getStatusSolidColor = (theme: Theme, color: StatusTone): string => (
  color === 'default'
    ? getDesignTokens(theme).textMuted
    : theme.palette[color][color === 'warning'
      ? 'dark'
      : 'main']
);

/*
 * discreet sidebar scrollbar: a hairline thumb tinted from the sidebar's own chrome so it reads as
 * part of the surface instead of cutting a bright gutter down it. Shared by the drawer paper and
 * the nav list — both scroll against the same background, so they must not drift apart.
 */
export const getSidebarScrollbarStyles = (tokens: SidebarTokens) => {
  const thumb = tokens.isLight ? SIDEBAR_SCROLL_THUMB_LIGHT : SIDEBAR_SCROLL_THUMB_DARK;
  const thumbHover = tokens.isLight
    ? SIDEBAR_SCROLL_THUMB_HOVER_LIGHT
    : SIDEBAR_SCROLL_THUMB_HOVER_DARK;

  return {
    // Firefox/Safari have no width control — `thin` plus a blended color is the closest they get
    scrollbarWidth: 'thin' as const,
    scrollbarColor: `${thumb} transparent`,
    '&::-webkit-scrollbar': { width: 1 },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': { background: thumb, borderRadius: 3 },
    '&::-webkit-scrollbar-thumb:hover': { background: thumbHover },
  };
};

/*
 * the accent as *text*: the darkened tone rather than `primary.main`, which is what the accent was
 * picked for as a *surface* (a filled button, a selected row) and sits under the contrast a label
 * has to hold on a light card. On a dark surface the relationship inverts — there the darkened tone
 * is the one that disappears, so the tone is lightened out of the accent instead. Used by links and
 * by anything else that states the accent in words (the open item of a settings rail).
 */
export const getAccentTextColor = (theme: Theme): string => (
  theme.palette.mode === 'dark'
    ? lighten(theme.palette.primary.main, 0.2)
    : theme.palette.primary.dark
);

export const getLinkStyles = (theme: Theme) => ({
  fontWeight: 500,
  textDecoration: 'none',
  color: getAccentTextColor(theme),
  '&:hover': { textDecoration: 'underline', color: theme.palette.primary.main },
});

/*
 * the name a table row is identified by — the vehicle, the person — where that name also opens the
 * object's page. It keeps the row's own text tone instead of the accent every other link takes: a
 * column of names is the content of the list, and tinting every one of them turns the table into a
 * wall of coloured text with nothing left to stand out against. The underline on hover is what
 * still says it is a link.
 */
export const getRowTitleLinkStyles = (theme: Theme) => ({
  color: theme.palette.text.primary,
  '&:hover': { color: theme.palette.text.primary },
});
