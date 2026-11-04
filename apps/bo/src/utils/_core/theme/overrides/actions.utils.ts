import {
  AlertColor, BadgeProps, ButtonProps, ChipProps, CircularProgress, IconButtonProps, PaletteColor,
  Theme, alpha, buttonClasses, darken,
} from '@mui/material';
import { createElement } from 'react';

import { ChipDeleteIcon } from '@/components/icons/ChipIcons';
import {
  BADGE_FONT_SIZE, BADGE_HEIGHT, BADGE_PADDING_X, BUTTON_FONT_SIZE, BUTTON_HEIGHT, BUTTON_ICON_GAP,
  BUTTON_LARGE_FONT_SIZE, BUTTON_LARGE_HEIGHT, BUTTON_LARGE_PADDING_X, BUTTON_LARGE_TOUCH_HEIGHT,
  BUTTON_LOADING_OPACITY, BUTTON_PADDING_X, BUTTON_SMALL_FONT_SIZE, BUTTON_SMALL_HEIGHT,
  BUTTON_SMALL_PADDING_X, BUTTON_SMALL_TOUCH_HEIGHT, BUTTON_SPINNER_SIZE, BUTTON_SPINNER_THICKNESS,
  BUTTON_TEXT_PADDING_X, BUTTON_TOUCH_FONT_SIZE, BUTTON_TOUCH_HEIGHT, CHIP_DELETABLE_HEIGHT,
  CHIP_DELETABLE_PADDING_LEFT, CHIP_DELETABLE_PADDING_RIGHT, CHIP_DELETE_BUTTON_SIZE,
  CHIP_DELETE_GAP, CHIP_DELETE_ICON_OPACITY, CHIP_FONT_SIZE, CHIP_HEIGHT, CHIP_ICON_GAP,
  CHIP_ICON_SIZE, CHIP_PADDING_X, ICON_BUTTON_SIZE, ICON_BUTTON_TOUCH_SIZE, RADIUS, RADIUS_SM,
} from '@/constants/_core/ui/ui.constants';
import {
  OUTLINED_COLOR_BORDER_OPACITY, OUTLINED_COLOR_HOVER_OPACITY, getButtonFocusRing, getLinkStyles,
  getStatusTintStyles,
} from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

/*
 * the palette entry a filled button draws its edge and hover ground from. `inherit` — and any
 * color the palette doesn't spell out — has no main/dark/contrastText triplet to read, so those
 * keep MUI's own filled styling instead of being forced into an arbitrary tone
 */
const getButtonPaletteColor = (
  theme: Theme, color: ButtonProps['color']
): PaletteColor | undefined => {
  if (!color || color === 'inherit') return undefined;

  return theme.palette[color];
};

/*
 * the palette tone a bare icon slot tints its hover ground from. `default` has none, and `inherit`
 * deliberately takes the tone of whatever surface it was dropped on — both fall back to the neutral
 * ground rather than being forced into a color
 */
const getIconButtonPaletteColor = (
  theme: Theme, color: IconButtonProps['color']
): string | undefined => {
  if (!color || color === 'inherit' || color === 'default') return undefined;

  return theme.palette[color]?.main;
};

/*
 * a filled button darkens twice: once to its `dark` edge tone on hover, then one further step while
 * the pointer is held. Derived from `dark` rather than typed in per palette color so the third tone
 * follows whichever brand color the user has picked in the settings.
 */
const BUTTON_ACTIVE_DARKEN = 0.12;

/*
 * pressed ground of the variants that have no fill of their own (outlined, text, icon slot): one
 * step past their hover ground so a held button is distinguishable from a hovered one
 */
const BUTTON_ACTIVE_TINT_OPACITY = 0.1;

const getButtonActiveColor = (color: string): string => darken(color, BUTTON_ACTIVE_DARKEN);

/*
 * the outlined variant is the page's neutral chrome — a grey-edged surface — unless it is asked to
 * carry a severity, in which case it becomes a colored outline on a wash of its own color (the
 * design's danger outline). `primary` stays neutral because it is MUI's default color: an
 * unqualified `variant="outlined"` must render as chrome, not as a branded button.
 */
const isNeutralOutlinedButton = (color: ButtonProps['color']): boolean => (
  !color || color === 'inherit' || color === 'primary'
);
const OUTLINED_COLOR_ACTIVE_OPACITY = 0.1;

/*
 * a colored chip is tinted, never solid: colored text on a wash of its own color. `default` — and
 * any color the palette does not spell out — falls through to the neutral surface the chip root
 * already paints, which is what makes a plain chip read as a value rather than as a state.
 * Shared by both variants: `outlined` and `filled` are the same drawing in this design.
 */
const getChipTintStyles = (theme: Theme, color: ChipProps['color']) => {
  if (!color || color === 'default') return {};

  return getStatusTintStyles(theme, color as AlertColor);
};

/*
 * the delete cross gets its round slot from a hover ground pulled out of the surface underneath
 * rather than out of the chip's own color, so one rule covers all seven tints without any of them
 * turning into a second colored shape inside the pill
 */
const getChipDeleteHoverBackground = (theme: Theme): string => (
  theme.palette.mode === 'dark'
    ? alpha('#ffffff', 0.12)
    : alpha('#000000', 0.08)
);

export const actionsComponentOverrides = {
  MuiChip: {
    defaultProps: { deleteIcon: createElement(ChipDeleteIcon) },
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          height: CHIP_HEIGHT,
          fontWeight: theme.typography.fontWeightMedium,
          fontSize: CHIP_FONT_SIZE,
          // fully rounded at every height, so a chip never reads as a small button
          borderRadius: CHIP_HEIGHT / 2,
          color: tokens.textSecondary,
          backgroundColor: tokens.surfaceSecondary,
          border: `1px solid ${tokens.border}`,
          // a leading glyph belongs to the label: same tone, same size, hugging it
          '& .MuiChip-icon': {
            marginLeft: CHIP_PADDING_X,
            marginRight: CHIP_ICON_GAP - CHIP_PADDING_X,
            fontSize: CHIP_ICON_SIZE,
            color: 'inherit',
          },
          /*
           * a deletable chip carries a hit target instead of ending on a label: it stands one
           * step taller, and its right side is trimmed so the cross clears the pill edge without
           * pushing the chip wider than the label needs. A chip picked inside a field (the
           * Autocomplete tag) is exempt — it is sized to the input row it sits in, and keeps the
           * metrics the MuiAutocomplete `tag` slot gives it.
           */
          '&.MuiChip-deletable:not(.MuiAutocomplete-tag)': {
            height: CHIP_DELETABLE_HEIGHT,
            borderRadius: CHIP_DELETABLE_HEIGHT / 2,
            paddingRight: CHIP_DELETABLE_PADDING_RIGHT,
            '& .MuiChip-label': {
              paddingLeft: CHIP_DELETABLE_PADDING_LEFT,
              paddingRight: CHIP_DELETE_GAP,
            },
          },
          /*
           * the cross gets its round slot from this hover ground rather than from a drawn shape,
           * so it stays invisible until the chip is actually being aimed at
           */
          '& .MuiChip-deleteIcon': {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: CHIP_DELETE_BUTTON_SIZE,
            height: CHIP_DELETE_BUTTON_SIZE,
            margin: 0,
            borderRadius: '50%',
            color: 'inherit',
            opacity: CHIP_DELETE_ICON_OPACITY,
            '&:hover': {
              color: 'inherit',
              opacity: 1,
              backgroundColor: getChipDeleteHoverBackground(theme),
            },
          },
          /*
           * a deletable chip is a real focus stop (MUI renders it as a ButtonBase so Delete and
           * Backspace remove it) — the keyboard ring goes on the chip itself, since the cross
           * inside it is an svg and never takes focus
           */
          '&.Mui-focusVisible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 1,
            '& .MuiChip-deleteIcon': { opacity: 1 },
          },
        };
      },
      /*
       * the design draws one chip size: a `size="small"` chip has to keep the same box as the one
       * in the next table cell, so the small variant only re-states the metrics MUI shrinks
       */
      sizeSmall: {
        height: CHIP_HEIGHT,
        fontSize: CHIP_FONT_SIZE,
        borderRadius: CHIP_HEIGHT / 2,
        '&.MuiChip-deletable:not(.MuiAutocomplete-tag)': {
          height: CHIP_DELETABLE_HEIGHT,
          borderRadius: CHIP_DELETABLE_HEIGHT / 2,
        },
      },
      // both variants are the same drawing here — a tinted chip is never filled solid
      filled: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: ChipProps;
      }) => getChipTintStyles(theme, ownerState.color),
      outlined: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: ChipProps;
      }) => {
        const tokens = getDesignTokens(theme);

        /*
         * MUI's outlined variant clears the background and repaints the border from its own grey
         * scale — a default outlined chip has to be pulled back onto the neutral surface, or it
         * sits transparent next to the filled chip it is supposed to match
         */
        if (!ownerState.color || ownerState.color === 'default') {
          return {
            backgroundColor: tokens.surfaceSecondary,
            borderColor: tokens.border,
          };
        }

        return getChipTintStyles(theme, ownerState.color);
      },
      label: {
        paddingLeft: CHIP_PADDING_X,
        paddingRight: CHIP_PADDING_X,
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      /*
       * a counter is a compact rounded rectangle, not a pill: pinned to an icon or an avatar
       * corner it has to stay inside that element's own footprint, and a two-digit count must not
       * stretch it into a lozenge wider than the thing it counts
       */
      standard: {
        height: BADGE_HEIGHT,
        minWidth: BADGE_HEIGHT,
        padding: `0 ${BADGE_PADDING_X}px`,
        borderRadius: RADIUS_SM,
        fontSize: BADGE_FONT_SIZE,
        fontWeight: 600,
      },
      badge: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: BadgeProps;
      }) => {
        if (ownerState.overlap === 'rectangular') {
          return {
            color: '#fff',
            top: -2,
            left: 0,
            border: `1px solid ${theme.palette.background.paper}`,
          };
        }
      },
    },
  },
  MuiButton: {
    defaultProps: {
      // no variant carries an elevation: the outlined one is the only button drawn with a shadow
      disableElevation: true,
      /*
       * the running action keeps its label and swaps only its leading glyph, so a submitting form
       * never blanks out the word the user is waiting on
       */
      loadingPosition: 'start',
      loadingIndicator: createElement(CircularProgress, {
        /*
         * the button keeps its own label while it runs, so the spinner adds nothing to read: left
         * announced it would be one more unnamed progress bar in every form of the back-office
         */
        'aria-hidden': true,
        color: 'inherit',
        size: BUTTON_SPINNER_SIZE,
        thickness: BUTTON_SPINNER_THICKNESS,
      }),
    },
    styleOverrides: {
      root: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: ButtonProps;
      }) => {
        const color = getButtonPaletteColor(theme, ownerState.color);
        const isFilled = ownerState.variant === 'contained';

        return {
          height: BUTTON_HEIGHT,
          minHeight: BUTTON_HEIGHT,
          padding: `0 ${BUTTON_PADDING_X}px`,
          fontSize: BUTTON_FONT_SIZE,
          fontWeight: theme.typography.fontWeightMedium,
          fontStyle: 'normal',
          lineHeight: 1.2,
          // labels are written the way they read — the design forces no case of its own
          textTransform: 'initial',
          borderRadius: RADIUS,
          whiteSpace: 'nowrap',
          /*
           * every variant carries a 1px edge, transparent where it draws none, so a footer row
           * mixing contained/outlined/text buttons stands on one box instead of 2px out of line
           */
          border: '1px solid transparent',
          /*
           * the disabled button keeps taking the pointer so the cursor can state why it does not
           * respond; the native `disabled` attribute is what still blocks the click
           */
          '&.Mui-disabled': {
            pointerEvents: 'auto',
            cursor: 'not-allowed',
          },
          /*
           * keyboard focus is marked with a halo around the button rather than by re-drawing its
           * edge: every variant already owns that edge, so coloring it would shift the shape
           */
          '&.Mui-focusVisible': {
            boxShadow: getButtonFocusRing(color?.main ?? theme.palette.primary.main, isFilled),
          },
          /*
           * a running action dims just enough to read as busy without reading as disabled; the
           * spinner stands in the leading glyph's slot, which MUI keeps reserved, so the label
           * neither moves nor changes the button's width
           */
          [`&.${buttonClasses.loading}`]: {
            opacity: BUTTON_LOADING_OPACITY,
            cursor: 'progress',
          },
          [[
            `&.${buttonClasses.loadingPositionStart} .${buttonClasses.loadingIndicator}`,
            `&.${buttonClasses.loadingPositionEnd} .${buttonClasses.loadingIndicator}`,
          ].join(', ')]: { color: 'inherit' },
          /*
           * the centered position is the one case the label is hidden behind the spinner, so the
           * spinner cannot inherit the (transparent) label color the way the two others do
           */
          [`&.${buttonClasses.loadingPositionCenter} .${buttonClasses.loadingIndicator}`]: {
            color: theme.palette.action.disabled,
          },
          '& .MuiButton-startIcon': { marginLeft: 0, marginRight: BUTTON_ICON_GAP },
          '& .MuiButton-endIcon': { marginRight: 0, marginLeft: BUTTON_ICON_GAP },
          /*
           * touch screens: the row grows to the 44px minimum target and the label grows with it,
           * so the taller box does not read as a small label floating inside an empty slab
           */
          [theme.breakpoints.down('md')]: {
            height: BUTTON_TOUCH_HEIGHT,
            minHeight: BUTTON_TOUCH_HEIGHT,
            fontSize: BUTTON_TOUCH_FONT_SIZE,
          },
        };
      },
      /*
       * a filled button is drawn one step darker at its edge than at its center, and darkens to
       * that same edge tone on hover — so the shape stays readable on a white card without a
       * shadow, whichever palette color it carries
       */
      contained: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: ButtonProps;
      }) => {
        const tokens = getDesignTokens(theme);
        const color = getButtonPaletteColor(theme, ownerState.color);

        return {
          ...(color && {
            color: color.contrastText,
            borderColor: color.dark,
            '&:hover': {
              backgroundColor: color.dark,
              borderColor: getButtonActiveColor(color.dark),
            },
            // held one step past the hover ground, so a press reads as a press and not as a hover
            '&:active': { backgroundColor: getButtonActiveColor(color.dark) },
          }),
          /*
           * disabled drops the fill entirely rather than greying it: a muted filled slab still
           * reads as the page's main action, which is exactly what it no longer is
           */
          '&.Mui-disabled': {
            color: tokens.textDisabled,
            backgroundColor: tokens.surfaceSecondary,
            borderColor: tokens.border,
          },
        };
      },
      outlined: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: ButtonProps;
      }) => {
        const tokens = getDesignTokens(theme);
        const color = getButtonPaletteColor(theme, ownerState.color);

        /*
         * carrying a severity turns the neutral chrome into a colored outline: a destructive
         * action ("delete selection", "decline request") has to be findable at a glance without
         * being drawn as a filled slab competing with the page's own primary action
         */
        if (color && !isNeutralOutlinedButton(ownerState.color)) {
          return {
            color: color.main,
            backgroundColor: 'transparent',
            borderColor: alpha(color.main, OUTLINED_COLOR_BORDER_OPACITY),
            '&:hover': {
              backgroundColor: alpha(color.main, OUTLINED_COLOR_HOVER_OPACITY),
              borderColor: color.main,
            },
            '&:active': { backgroundColor: alpha(color.main, OUTLINED_COLOR_ACTIVE_OPACITY) },
            '&.Mui-disabled': {
              color: tokens.textDisabled,
              backgroundColor: tokens.surfaceSecondary,
              borderColor: tokens.border,
            },
          };
        }

        return {
          backgroundColor: tokens.surface,
          color: tokens.textSecondary,
          borderColor: tokens.border,
          boxShadow: tokens.shadow,
          '&:hover': {
            backgroundColor: tokens.surfaceSecondary,
            color: tokens.text,
            // the edge firms up with the ground, so a hovered button gains a shape and not just a tint
            borderColor: tokens.textDisabled,
          },
          '&:active': { backgroundColor: tokens.borderLight },
          // focus re-colors the edge here: the neutral variant carries no color to halo against
          '&.Mui-focusVisible': {
            borderColor: theme.palette.primary.main,
            boxShadow: getButtonFocusRing(theme.palette.primary.main),
          },
          '&.Mui-disabled': {
            color: tokens.textDisabled,
            backgroundColor: tokens.surfaceSecondary,
            borderColor: tokens.border,
            boxShadow: 'none',
          },
        };
      },
      /*
       * the lightest step of the family: no ground and no edge until it is hovered, so it can sit
       * beside a real button without reading as a second action
       */
      text: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          color: tokens.textSecondary,
          // a label with no surface behind it does not need the full button inset
          padding: `0 ${BUTTON_TEXT_PADDING_X}px`,
          '&:hover': {
            backgroundColor: tokens.surfaceSecondary,
            color: tokens.text,
          },
          '&:active': { backgroundColor: tokens.borderLight },
          '&.Mui-focusVisible': {
            borderColor: theme.palette.primary.main,
            boxShadow: getButtonFocusRing(theme.palette.primary.main),
          },
          // no surface to drop, so a disabled text button only dims its label
          '&.Mui-disabled': { color: tokens.textDisabled },
        };
      },
      sizeSmall: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        height: BUTTON_SMALL_HEIGHT,
        minHeight: BUTTON_SMALL_HEIGHT,
        padding: `0 ${BUTTON_SMALL_PADDING_X}px`,
        fontSize: BUTTON_SMALL_FONT_SIZE,
        [theme.breakpoints.down('md')]: {
          height: BUTTON_SMALL_TOUCH_HEIGHT,
          minHeight: BUTTON_SMALL_TOUCH_HEIGHT,
        },
      }),
      sizeLarge: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        height: BUTTON_LARGE_HEIGHT,
        minHeight: BUTTON_LARGE_HEIGHT,
        padding: `0 ${BUTTON_LARGE_PADDING_X}px`,
        fontSize: BUTTON_LARGE_FONT_SIZE,
        [theme.breakpoints.down('md')]: {
          height: BUTTON_LARGE_TOUCH_HEIGHT,
          minHeight: BUTTON_LARGE_TOUCH_HEIGHT,
        },
      }),
    },
  },
  MuiButtonGroup: {
    // the segmented group is a row of buttons sharing one edge, not a control with its own frame
    defaultProps: { disableElevation: true },
    styleOverrides: {
      grouped: {
        /*
         * each segment keeps its own full radius and the row is squared off from the inside, so
         * the group ends up with rounded outer corners and flat joints — and the shared edge is
         * pulled in by 1px so two adjacent borders read as one line
         */
        '&:not(:last-of-type)': {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          marginRight: -1,
        },
        '&:not(:first-of-type)': {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
        /*
         * the focus halo and the hovered edge are drawn outside the button's own box; without
         * this they slide under the adjacent segment whose border overlaps them by that same 1px
         */
        '&:hover, &.Mui-focusVisible': { zIndex: 1 },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      /*
       * a square hit slot rather than MUI's round ripple target: it shares the buttons' corner
       * radius and row height so a bare icon action sitting next to a real button reads as the
       * same family. The slot size is a default — the app bar and the dialog header set their own
       */
      root: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: IconButtonProps;
      }) => {
        const tokens = getDesignTokens(theme);
        const color = getIconButtonPaletteColor(theme, ownerState.color);

        return {
          width: ICON_BUTTON_SIZE,
          height: ICON_BUTTON_SIZE,
          padding: 0,
          borderRadius: RADIUS,
          // the transparent edge reserves the same box the focus ring will color in
          border: '1px solid transparent',
          /*
           * only the unqualified slot takes the muted tone — `color="error"` keeps its palette
           * tone and `color="inherit"` keeps whatever surface it was dropped on gives it
           */
          ...(!ownerState.color || ownerState.color === 'default'
            ? { color: tokens.textSecondary }
            : {}),
          ...(color
            ? {
              /*
               * a colored slot hovers into a wash of its own color instead of the neutral ground:
               * a red trash icon landing on grey reads as disabled for the split second it takes
               * to notice the glyph is still red
               */
              '&:hover': { backgroundColor: alpha(color, OUTLINED_COLOR_HOVER_OPACITY) },
              '&:active': { backgroundColor: alpha(color, BUTTON_ACTIVE_TINT_OPACITY) },
              '&.Mui-focusVisible': {
                borderColor: color,
                boxShadow: getButtonFocusRing(color),
              },
            }
            : {
              '&:hover': {
                backgroundColor: tokens.surfaceSecondary,
                // `inherit` owns its own glyph tone, so only the unqualified slot firms up on hover
                ...(!ownerState.color || ownerState.color === 'default'
                  ? { color: tokens.text }
                  : {}),
              },
              '&:active': { backgroundColor: tokens.borderLight },
              '&.Mui-focusVisible': {
                borderColor: theme.palette.primary.main,
                boxShadow: getButtonFocusRing(theme.palette.primary.main),
              },
            }),
          '&.Mui-disabled': {
            color: tokens.textDisabled,
            // states why it does not respond instead of just ignoring the pointer, like the buttons do
            pointerEvents: 'auto',
            cursor: 'not-allowed',
          },
          // touch screens: the bare slot grows to the same 44px minimum target as a real button
          [theme.breakpoints.down('md')]: {
            width: ICON_BUTTON_TOUCH_SIZE,
            height: ICON_BUTTON_TOUCH_SIZE,
          },
        };
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => getLinkStyles(theme),
    },
  },
};
