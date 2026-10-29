import { BadgeProps, Theme } from '@mui/material';
import { createElement } from 'react';

import {
  CheckboxCheckedIcon, CheckboxIcon, CheckboxIndeterminateIcon, RadioCheckedIcon, RadioIcon,
} from '@/components/icons/FormIcons';
import { INPUT_LABEL_OFFSET_Y, RATING_COLOR } from '@/constants/_core/theme.constants';
import {
  BUTTON_FONT_SIZE, BUTTON_HEIGHT, BUTTON_PADDING_X, BUTTON_TOUCH_HEIGHT, CHECKBOX_LABEL_GAP,
  CHECKBOX_RADIUS, CHECKBOX_ROW_MIN_HEIGHT, CHECKBOX_SIZE, CHECKBOX_TOUCH_SIZE,
  INPUT_CHIP_FONT_SIZE, INPUT_CHIP_HEIGHT, INPUT_CHIP_PADDING_X, INPUT_CHIP_RADIUS, INPUT_FONT_SIZE,
  INPUT_HEIGHT, INPUT_HEIGHT_SMALL, INPUT_HELPER_FONT_SIZE, INPUT_LABEL_FONT_SIZE,
  INPUT_MULTI_VALUE_PADDING, INPUT_OPTION_PADDING_X, INPUT_OPTION_PADDING_Y, INPUT_PADDING_X,
  RADIUS, RADIUS_SM, RATING_ICON_SIZE, TOGGLE_BUTTON_PADDING_X,
} from '@/constants/_core/ui/ui.constants';
import { getButtonFocusRing, getInputFocusRing } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

export const inputsComponentOverrides = {
  MuiSwitch: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme; ownerState: BadgeProps;
      }) => ({
        width: 38,
        height: 20,
        padding: 0,
        display: 'flex',
        '&:active': {
          '& .MuiSwitch-thumb': { width: 19 },
          '& .MuiSwitch-switchBase.Mui-checked': { transform: 'translateX(9px)' },
        },
        '& .MuiSwitch-switchBase': {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: theme.palette.primary.main,
            },
          },
        },
        '& .MuiSwitch-thumb': {
          boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
          width: 18,
          height: 18,
          borderRadius: 20 / 2,
          transition: theme.transitions.create(['width'], { duration: 200 }),
        },
        '& .MuiSwitch-track': {
          borderRadius: 20 / 2,
          opacity: 1,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,.35)'
              : 'rgba(0,0,0,.25)',
          boxSizing: 'border-box',
        },
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          borderRadius: RADIUS,
          fontSize: INPUT_FONT_SIZE,
          backgroundColor: tokens.surface,
          /*
           * a floor rather than a fixed height: a single-line control lands exactly on the row
           * (the flex row centers its input), while a textarea or a multi-select holding wrapped
           * chips grows past it instead of clipping its own content
           */
          minHeight: INPUT_HEIGHT,
          // the select renders a div, which does not center its text the way an input does
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.borderInput },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.textMuted },
          '&.Mui-focused': { boxShadow: getInputFocusRing(theme) },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
          // an error outline never also glows: the red edge is the whole signal
          '&.Mui-error': { boxShadow: 'none' },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.error.main },
          '&.Mui-disabled': {
            backgroundColor: tokens.surfaceSecondary,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.borderInput },
            '& .MuiInputBase-input': {
              color: tokens.textDisabled,
              WebkitTextFillColor: tokens.textDisabled,
            },
          },
        };
      },
      /*
       * the row height comes from the root, which centers the field on it — the field itself
       * only owns its horizontal inset. Never give this a height or an `alignSelf`: the input
       * carries a definite `1.4375em` height, so any align-self (`stretch` included) resolves to
       * flex-start and drops the text and its placeholder against the top edge of the row.
       */
      input: { padding: `0 ${INPUT_PADDING_X}px` },
      multiline: { padding: `8px ${INPUT_PADDING_X}px` },
      inputMultiline: { padding: 0 },
      /*
       * the denser row: a field packed into a grid of filters rather than filled in as a value.
       * Only the row changes — the type size, the outline and the focus ring stay the form's, so
       * a compressed field still reads as the same control
       */
      sizeSmall: { minHeight: INPUT_HEIGHT_SMALL },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      /*
       * MUI centers a floating label against its default 56px row — on our shorter row it would
       * sit below the middle, and its shrunk position would float too far above the outline
       */
      outlined: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        fontSize: INPUT_FONT_SIZE,
        /*
         * a floating label sits inside the field while it is empty, where it stands in for the
         * placeholder — so it keeps the secondary tone rather than the body tone a label written
         * above the control takes: at full strength it reads as a value that is already there
         */
        color: getDesignTokens(theme).textSecondary,
        '&.Mui-focused': { color: getDesignTokens(theme).textSecondary },
        transform: `translate(${INPUT_PADDING_X}px, ${INPUT_LABEL_OFFSET_Y}px) scale(1)`,
        '&.MuiInputLabel-shrink': { transform: `translate(${INPUT_PADDING_X}px, -8px) scale(0.75)` },
      }),
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        fontSize: INPUT_LABEL_FONT_SIZE,
        fontWeight: theme.typography.fontWeightRegular,
        /*
         * a label names the field, so it is read before anything is typed into it: it takes the
         * body size and tone, and stays there while the field is focused — only the outline
         * reacts. What separates it from the value below is position, not weight or tint.
         */
        color: getDesignTokens(theme).text,
        '&.Mui-focused': { color: getDesignTokens(theme).text },
        '&.Mui-error': { color: theme.palette.error.main },
        '&.Mui-disabled': { color: getDesignTokens(theme).textDisabled },
      }),
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        gap: CHECKBOX_LABEL_GAP,
        minHeight: CHECKBOX_ROW_MIN_HEIGHT,
        marginLeft: 0,
        marginRight: 0,
      },
      /*
       * the label of a checkbox, switch or radio is the value itself rather than the name of a
       * field, so it reads at body size — it is not the caption-sized label that sits above a
       * text input
       */
      label: { fontSize: INPUT_FONT_SIZE },
    },
  },
  MuiCheckbox: {
    defaultProps: {
      checkedIcon: createElement(CheckboxCheckedIcon),
      icon: createElement(CheckboxIcon),
      indeterminateIcon: createElement(CheckboxIndeterminateIcon),
      // the box is the whole control — a ripple would bleed a circle out of its 18px square
      disableRipple: true,
    },
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        /*
         * the glyph draws its own 18px box, so the control is exactly that box — the gap to the
         * label is owned by FormControlLabel instead of by a padding ring around the checkbox
         */
        padding: 0,
        color: getDesignTokens(theme).borderInput,
        '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: theme.palette.primary.main },
        '&.Mui-disabled': { color: getDesignTokens(theme).textDisabled },
        '&.Mui-focusVisible': {
          borderRadius: CHECKBOX_RADIUS,
          boxShadow: getButtonFocusRing(theme.palette.primary.main),
        },
        '& > svg': { width: CHECKBOX_SIZE, height: CHECKBOX_SIZE },
        /*
         * touch screens: the box itself grows rather than gaining padding — the row it sits in
         * (FormControlLabel, a table cell) already provides the 44px the finger needs
         */
        [theme.breakpoints.down('md')]: {
          '& > svg': { width: CHECKBOX_TOUCH_SIZE, height: CHECKBOX_TOUCH_SIZE },
        },
      }),
    },
  },
  MuiRadio: {
    defaultProps: {
      checkedIcon: createElement(RadioCheckedIcon),
      icon: createElement(RadioIcon),
      // same reason as the checkbox: the circle is the whole control, a ripple would spill out of it
      disableRipple: true,
    },
    styleOverrides: {
      // the radio is the checkbox's round form and shares its drawing, down to the touch step
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        padding: 0,
        color: getDesignTokens(theme).borderInput,
        '&.Mui-checked': { color: theme.palette.primary.main },
        '&.Mui-disabled': { color: getDesignTokens(theme).textDisabled },
        '&.Mui-focusVisible': {
          borderRadius: '50%',
          boxShadow: getButtonFocusRing(theme.palette.primary.main),
        },
        '& > svg': { width: CHECKBOX_SIZE, height: CHECKBOX_SIZE },
        [theme.breakpoints.down('md')]: {
          '& > svg': { width: CHECKBOX_TOUCH_SIZE, height: CHECKBOX_TOUCH_SIZE },
        },
      }),
    },
  },
  MuiInputAdornment: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        color: getDesignTokens(theme).textSecondary,
        /*
         * a unit suffix ("Ar", "km") is part of the value rather than a note about it, so it
         * reads at the field's own size and separates itself from the number by tone alone
         */
        '& .MuiTypography-root': {
          fontSize: INPUT_FONT_SIZE,
          color: getDesignTokens(theme).textSecondary,
        },
      }),
    },
  },
  MuiRating: {
    styleOverrides: {
      root: {
        fontSize: RATING_ICON_SIZE,
        gap: 4,
        color: RATING_COLOR,
      },
      // an unfilled star is the same amber outline, not a grey ghost of the filled one
      iconEmpty: { color: RATING_COLOR },
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        borderRadius: RADIUS,
        // hugs its options even inside a stretching form column — it is a control, not a field
        alignSelf: 'flex-start',
      },
      /*
       * the outline belongs to each segment rather than to a frame around the row: the selected
       * one takes a primary edge, which a group-owned border with `overflow: hidden` would clip
       */
      grouped: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        border: `1px solid ${getDesignTokens(theme).borderInput}`,
        // the shared edge is pulled in by 1px so two adjacent borders read as one line
        '&:not(:last-of-type)': {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          marginRight: -1,
        },
        '&:not(:first-of-type)': {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderLeftColor: getDesignTokens(theme).borderInput,
        },
        // the selected edge and the focus halo are drawn over the segment that overlaps them
        '&.Mui-selected, &:hover, &.Mui-focusVisible': { zIndex: 1 },
      }),
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          /*
           * the default size stands on the input row: a segmented group holds a value the way a
           * field does, so it must not sit 2px off the select next to it in the same form
           */
          height: INPUT_HEIGHT,
          padding: `0 ${TOGGLE_BUTTON_PADDING_X}px`,
          // the group no longer clips its children, so the outer corners come from the segments
          borderRadius: RADIUS,
          fontSize: INPUT_FONT_SIZE,
          fontWeight: theme.typography.fontWeightMedium,
          textTransform: 'none' as const,
          color: tokens.textSecondary,
          backgroundColor: tokens.surface,
          '&:hover': { backgroundColor: tokens.surfaceSecondary, color: tokens.text },
          /*
           * the picked segment is tinted rather than filled: a solid slab inside a row of outlined
           * segments reads as a button that was just pressed, not as the state the group is in
           */
          '&.Mui-selected, &.Mui-selected:hover': {
            color: theme.palette.primary.main,
            backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focusVisible': { boxShadow: getButtonFocusRing(theme.palette.primary.main) },
          '&.Mui-disabled': { color: tokens.textDisabled, backgroundColor: tokens.surfaceSecondary },
        };
      },
      /*
       * the small size is the toolbar view switcher rather than a form control: it stands on the
       * button row and takes the button type size, so it lines up with the actions beside it
       */
      sizeSmall: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        height: BUTTON_HEIGHT,
        padding: `0 ${BUTTON_PADDING_X}px`,
        fontSize: BUTTON_FONT_SIZE,
        [theme.breakpoints.down('md')]: { height: BUTTON_TOUCH_HEIGHT },
      }),
    },
  },
  MuiTextField: { styleOverrides: { root: { '& .MuiFormHelperText-root': { marginLeft: 0 } } } },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: INPUT_HELPER_FONT_SIZE,
        marginTop: 4,
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      /*
       * MUI pads the outlined row it hosts, and the input inside that row, on top of the height
       * every field already takes from the theme — which leaves an autocomplete standing several
       * pixels taller than the text field next to it, and taller still than the compressed row of
       * a filter panel. The row keeps owning its height and centering its input, like the other
       * outlined controls; only a field holding chips pads itself, so they clear the outline when
       * they wrap onto a second line.
       */
      root: {
        '& .MuiOutlinedInput-root': {
          paddingTop: 0,
          paddingBottom: 0,
          '& .MuiAutocomplete-input': {
            paddingTop: 0,
            paddingBottom: 0,
          },
          '&:has(.MuiAutocomplete-tag)': {
            paddingTop: INPUT_MULTI_VALUE_PADDING,
            paddingBottom: INPUT_MULTI_VALUE_PADDING,
          },
        },
      },
      popper: ({
        theme,
      }: {
        theme: Theme;
      }) => {
        const tokens = getDesignTokens(theme);

        return {
          '& .MuiAutocomplete-paper': {
            border: `1px solid ${tokens.border}`,
            borderRadius: RADIUS,
            boxShadow: tokens.shadowPopover,
          },
          '& .MuiAutocomplete-listbox': {
            padding: 4,
            '& li': {
              // an option reads at the same size as the value it will put in the field
              fontSize: INPUT_FONT_SIZE,
              borderRadius: RADIUS_SM,
              padding: `${INPUT_OPTION_PADDING_Y}px ${INPUT_OPTION_PADDING_X}px`,
              fontFamily: theme.typography.fontFamily,
            },
          },
        };
      },
      /*
       * a picked value inside the field is a tinted pill, not the neutral outlined chip used in
       * tables — it has to read as "selected" against the input ground it sits on
       */
      tag: ({
        theme,
      }: {
        theme: Theme;
      }) => ({
        height: INPUT_CHIP_HEIGHT,
        borderRadius: INPUT_CHIP_RADIUS,
        fontSize: INPUT_CHIP_FONT_SIZE,
        color: theme.palette.primary.dark,
        backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
        border: 'none',
        '& .MuiChip-label': {
          paddingLeft: INPUT_CHIP_PADDING_X,
          paddingRight: INPUT_CHIP_PADDING_X,
        },
      }),
    },
  },
};
