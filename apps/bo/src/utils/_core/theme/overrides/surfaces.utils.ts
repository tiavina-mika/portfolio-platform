import {
  AlertColor, AlertProps, Theme, alpha,
} from '@mui/material';
import { createElement } from 'react';

import {
  AlertCloseIcon, AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon,
} from '@/components/icons/AlertIcons';
import { PROSE_LINE_HEIGHT } from '@/constants/_core/theme.constants';
import {
  CARD_ACTIONS_GAP, CARD_ACTIONS_PADDING_Y, CARD_CONTENT_PADDING, CARD_HEADER_ICON_GAP,
  CARD_HEADER_MIN_HEIGHT, CARD_HEADER_PADDING_Y, CARD_PADDING_X,
} from '@/constants/_core/ui/page.constants';
import {
  DIALOG_PADDING, FONT_SIZE_BODY, FONT_SIZE_CARD_TITLE, FONT_SIZE_META, INPUT_OPTION_PADDING_X,
  INPUT_OPTION_PADDING_Y, MENU_ITEM_FONT_SIZE, MENU_ITEM_HEIGHT, MENU_ITEM_ICON_GAP,
  MENU_ITEM_PADDING_X, MENU_ITEM_PADDING_Y, MENU_PADDING, RADIUS, RADIUS_LG, RADIUS_SM,
} from '@/constants/_core/ui/ui.constants';
import { getSeverityToneColor } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

/*
 * `color` overrides `severity` on an Alert (it is what MUI itself keys the palette off) and both
 * are optional — MUI falls back to "success" when neither is set
 */
const getAlertSeverity = (ownerState: AlertProps): AlertColor => (
  ownerState.color ?? ownerState.severity ?? 'success'
);

export const surfacesComponentOverrides = {
  MuiPaper: {
    // no elevation gradient overlay in dark mode — surfaces stay flat like the design
    styleOverrides: { root: { backgroundImage: 'none' } },
  },
  MuiStack: {
    defaultProps: { useFlexGap: true },

    /*
     * mui stack has no, so overrides in the variants instead
     * ISSUE: https://stackoverflow.com/questions/72382224/styleoverrides-not-being-applied
     * with-styled-components-in-mui
     */
    styleOverrides: {
      root: {
        variants: [
          {
            props: {},
            style: { flexWrap: 'wrap' },
          },
        ],
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      /*
       * the modal card is detached from the dimmed backdrop by its shadow alone — no border:
       * the dark `shadowModal` already carries the hairline ring dark surfaces need, and adding
       * one in light mode draws a second edge the design doesn't have
       */
      paper: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        borderRadius: RADIUS_LG,
        boxShadow: getDesignTokens(theme).shadowModal,
      }),
    },
  },
  MuiDialogTitle: {
    // header is a toolbar row: title on the left, close cross pushed to the right edge
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: `14px ${DIALOG_PADDING}px`,
        fontSize: FONT_SIZE_CARD_TITLE,
        fontWeight: theme.typography.fontWeightBold,
        borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
      }),
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        padding: DIALOG_PADDING,
        fontSize: FONT_SIZE_BODY,
        lineHeight: PROSE_LINE_HEIGHT,
        color: getDesignTokens(theme).textSecondary,
        /*
         * MUI zeroes the content's top padding when a title precedes it, assuming the title is a
         * heading glued to the body — here it is a bordered toolbar row, so the content keeps
         * the same padding on all four sides
         */
        '.MuiDialogTitle-root + &': { paddingTop: DIALOG_PADDING },
      }),
    },
  },
  MuiDialogContentText: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        fontSize: FONT_SIZE_BODY,
        lineHeight: PROSE_LINE_HEIGHT,
        color: getDesignTokens(theme).textSecondary,
      }),
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        padding: `12px ${DIALOG_PADDING}px`,
        gap: 8,
        borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
        // gap owns the spacing between the footer actions — drop MUI's per-child margin
        '& > :not(style) ~ :not(style)': { marginLeft: 0 },
        /*
         * on a phone the footer stacks and every action takes the full width: a row of three
         * touch-sized buttons does not fit, and the one that wraps ends up as the odd one out
         */
        [theme.breakpoints.down('sm')]: {
          flexDirection: 'column',
          alignItems: 'stretch',
          '& > .MuiButton-root': { width: '100%', marginRight: 0 },
        },
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          border: `1px solid ${tokens.border}`,
          borderRadius: RADIUS_LG,
          transition: 'box-shadow .15s',
          [theme.breakpoints.up('sm')]: { boxShadow: tokens.shadow },
          [theme.breakpoints.down('sm')]: { boxShadow: 'none' },
        };
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        minHeight: CARD_HEADER_MIN_HEIGHT,
        padding: `${CARD_HEADER_PADDING_Y}px ${CARD_PADDING_X}px`,
        borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
      }),
      // the icon slot sits tighter to the title block than MUI's own 16px default
      avatar: { marginRight: CARD_HEADER_ICON_GAP },
      title: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        fontSize: FONT_SIZE_CARD_TITLE,
        fontWeight: theme.typography.fontWeightBold,
      }),
      subheader: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        marginTop: 1,
        fontSize: FONT_SIZE_META,
        color: getDesignTokens(theme).textSecondary,
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: CARD_CONTENT_PADDING,
        // MUI pads the last child an extra step; a card body is inset evenly on all four sides
        '&:last-child': { paddingBottom: CARD_CONTENT_PADDING },
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        padding: `${CARD_ACTIONS_PADDING_Y}px ${CARD_PADDING_X}px`,
        borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
        justifyContent: 'flex-end',
        gap: CARD_ACTIONS_GAP,
        // gap owns the spacing between the footer actions — drop MUI's per-child margin
        '& > :not(style) ~ :not(style)': { marginLeft: 0 },
      }),
    },
  },
  MuiAlert: {
    defaultProps: {
      iconMapping: {
        success: createElement(AlertSuccessIcon),
        info: createElement(AlertInfoIcon),
        warning: createElement(AlertWarningIcon),
        error: createElement(AlertErrorIcon),
      },
      slots: { closeIcon: AlertCloseIcon },
    },
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          borderRadius: RADIUS,
          padding: '10px 12px',
          fontSize: FONT_SIZE_BODY,
          alignItems: 'center',
          '& .MuiAlert-icon': {
            padding: 0,
            marginRight: 10,
            alignItems: 'center',
            /*
             * MUI tints the icon with the severity's `main` and mutes it to .9 — the design draws
             * icon and text in exactly the same tone, which the root already carries
             */
            color: 'inherit',
            opacity: 1,
          },
          '& .MuiAlert-message': { padding: 0 },
          /*
           * a titled alert is a two-line block: the icon sits on the title line rather than being
           * centered against the whole card, and the design draws it one step larger there
           */
          '&:has(.MuiAlertTitle-root)': {
            alignItems: 'flex-start',
            padding: '12px 14px',
            '& .MuiAlert-icon': { alignItems: 'flex-start', paddingTop: 1 },
            '& .MuiAlert-icon svg': { width: 18, height: 18 },
          },
          // the description line under the title drops to the neutral body tint
          '& .MuiAlertTitle-root + *': { fontSize: FONT_SIZE_META, color: tokens.textSecondary },
          '& .MuiAlert-action': {
            padding: 0,
            margin: 0,
            marginLeft: 'auto',
            alignItems: 'center',
            gap: 4,
          },
          // an inline action ("Recharger", "Réessayer") reads as emphasised text, not as a button
          '& .MuiAlert-action .MuiButton-root': {
            minWidth: 0,
            padding: 0,
            // a text run, so it takes the line's height rather than the button family's row
            height: 'auto',
            minHeight: 0,
            fontSize: FONT_SIZE_META,
            fontWeight: 600,
            color: 'inherit',
            backgroundColor: 'transparent',
            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
          },
          '& .MuiAlert-action .MuiIconButton-root': {
            width: 22,
            height: 22,
            padding: 0,
            borderRadius: RADIUS_SM,
            color: 'inherit',
            opacity: 0.7,
            '&:hover': { opacity: 1, backgroundColor: 'transparent' },
          },
        };
      },
      // tinted wash + a 20 % border of the same tone, the same recipe colored chips use
      standard: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: AlertProps;
      }) => {
        const severity = getAlertSeverity(ownerState);
        const main = theme.palette[severity].main;

        return {
          color: getSeverityToneColor(theme, severity),
          backgroundColor: getTintedBackground(theme, main),
          border: `1px solid ${alpha(main, 0.2)}`,
        };
      },
      /*
       * outlined keeps the card surface and draws the severity color at full strength on the
       * border — MUI's own outlined alert borders with `palette[color].light`, which is nearly
       * invisible on a white surface
       */
      outlined: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: AlertProps;
      }) => {
        const tone = getSeverityToneColor(theme, getAlertSeverity(ownerState));

        return {
          color: tone,
          backgroundColor: getDesignTokens(theme).surface,
          border: `1px solid ${tone}`,
        };
      },
      filled: ({
        theme, ownerState,
      }: {
        theme: Theme; ownerState: AlertProps;
      }) => ({
        color: '#fff',
        /*
         * the filled surface reuses the tone rather than `main`: white text on warning's `main`
         * fails contrast, and MUI's own filled variant would pick `dark` only in dark mode
         */
        backgroundColor: getSeverityToneColor(theme, getAlertSeverity(ownerState)),
        fontWeight: 400,
      }),
    },
  },
  MuiAlertTitle: {
    styleOverrides: {
      root: {
        margin: 0,
        marginBottom: 2,
        fontSize: FONT_SIZE_BODY,
        fontWeight: 600,
        // inherits the severity tone the alert root already carries
        color: 'inherit',
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          /*
           * a floating panel, not a field: it takes the large radius and pads itself so the
           * rounded highlight of an item clears the paper edge instead of touching it. No minimum
           * width here — a select's dropdown is sized by the field it drops from; action menus
           * set MENU_MIN_WIDTH themselves
           */
          border: `1px solid ${tokens.border}`,
          borderRadius: RADIUS_LG,
          boxShadow: tokens.shadowPopover,
        };
      },
      list: { padding: MENU_PADDING },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          minHeight: MENU_ITEM_HEIGHT,
          padding: `${MENU_ITEM_PADDING_Y}px ${MENU_ITEM_PADDING_X}px`,
          /*
           * an option of an open select is a value being picked, not a command being issued: it
           * is scanned against the ones around it before it is clicked, so it takes the roomier
           * inset every other dropdown option in the app already uses instead of the action row's.
           * `role="option"` is what MUI puts on the items a Select owns — a menu's rows are
           * `menuitem`, so they keep the tighter one
           */
          '&[role="option"]': {
            padding: `${INPUT_OPTION_PADDING_Y}px ${INPUT_OPTION_PADDING_X}px`,
          },
          fontSize: MENU_ITEM_FONT_SIZE,
          color: tokens.text,
          borderRadius: RADIUS,
          '&:hover': { backgroundColor: tokens.surfaceSecondary },
          /*
           * the picked option states which value the field is holding, so it is tinted in the
           * primary and set one weight up — the neutral grey MUI marks a selection with is not
           * separable from the hover ground the pointer leaves on the row above it
           */
          '&.Mui-selected, &.Mui-selected:hover': {
            color: theme.palette.primary.dark,
            backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
            fontWeight: theme.typography.fontWeightMedium,
          },
          '& .MuiListItemIcon-root': {
            minWidth: 0,
            marginRight: MENU_ITEM_ICON_GAP,
            color: tokens.textSecondary,
          },
        };
      },
    },
  },
};
