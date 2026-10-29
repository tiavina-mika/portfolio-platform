import {
  FormHelperText, Stack, Theme, useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import {
  INPUT_ADORNMENT_INSET, INPUT_CHIP_FONT_SIZE, INPUT_CHIP_HEIGHT, INPUT_CHIP_PADDING_X,
  INPUT_CHIP_RADIUS, INPUT_FONT_SIZE, INPUT_HEIGHT, INPUT_MULTI_VALUE_PADDING,
  INPUT_OPTION_PADDING_X, INPUT_OPTION_PADDING_Y, INPUT_PADDING_X, RADIUS, RADIUS_SM,
} from '@/constants/_core/ui/ui.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { getInputFocusRing } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

import InputLabel from '../InputLabel';

type CustomStyleProps = {
  menu?: Record<string, any>;
  option?: Record<string, any>;
  control?: Record<string, any>;
  singleValue?: Record<string, any>;
  multiValue?: Record<string, any>;
};

type CustomStyle = {
  theme: Theme;
  width?: number | string;
  variant: 'standard' | 'outlined';
  styleProps?: CustomStyleProps;
  hasError?: boolean;
  isMulti?: boolean;
};

const getControlBorder = (
  variant: CustomStyle['variant'],
  theme: CustomStyle['theme'],
  hasError: CustomStyle['hasError']
) => {
  if (hasError) {
    return '1px solid ' + theme.palette.error.main;
  }
  if (variant === 'outlined') {
    return '1px solid ' + getDesignTokens(theme).borderInput;
  }

  return 'none';
};

/*
 * react-select is not a MUI component, so the theme's MuiOutlinedInput / MuiMenu overrides don't
 * reach it — mirror them here from the same palette + design tokens
 */
const getCustomStyles = ({
  theme,
  // default width if not full width and not specified
  width = 300,
  variant = 'outlined',
  styleProps,
  hasError,
  isMulti,
}: CustomStyle) => {
  const tokens = getDesignTokens(theme);

  return {
    container: (styles: any) => ({
      ...styles,
      ...(width !== '100%' && { display: 'flex', width }),
    }),
    /*
     * the open menu is welded to the control rather than floating over it: the control squares off
     * its bottom corners, the menu drops its top border and reuses the bottom two — so the pair
     * reads as one expanded field instead of a popover that happens to be nearby
     */
    menu: (styles: any) => ({
      ...styles,
      marginTop: 0,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: `1px solid ${tokens.border}`,
      borderTop: 'none',
      borderRadius: `0 0 ${RADIUS}px ${RADIUS}px`,
      boxShadow: tokens.shadowPopover,
      zIndex: 9999,
      ...styleProps?.menu,
    }),
    control: (styles: any, state: any) => {
      const values = {
        ...styles,
        minHeight: INPUT_HEIGHT,
        fontSize: INPUT_FONT_SIZE,
        border: getControlBorder(variant, theme, hasError),
        borderRadius: state.menuIsOpen
          ? `${RADIUS}px ${RADIUS}px 0 0`
          : RADIUS,
        backgroundColor: theme.palette.background.paper,
        boxShadow: state.isFocused
          ? getInputFocusRing(theme)
          : 'none',
        '&:hover': { borderColor: state.isFocused ? theme.palette.primary.main : tokens.textMuted },
        width,
        ...styleProps?.control,
      };

      if (state.isFocused && !hasError) {
        values.borderColor = theme.palette.primary.main;
      }
      if (variant !== 'outlined') {
        values.borderBottom = '1px solid ' + theme.palette.divider;
      }

      return values;
    },
    /*
     * a single value is text, so it takes the field's text inset; a set of chips is content, so the
     * container pads itself on all four sides instead and lets the chips clear the outline evenly
     */
    valueContainer: (styles: any) => ({
      ...styles,
      padding: isMulti
        ? INPUT_MULTI_VALUE_PADDING
        : `0 ${INPUT_PADDING_X}px`,
      gap: 6,
    }),
    option: (styles: any, state: any) => ({
      ...styles,
      fontSize: INPUT_FONT_SIZE,
      padding: `${INPUT_OPTION_PADDING_Y}px ${INPUT_OPTION_PADDING_X}px`,
      borderRadius: RADIUS_SM,
      // the picked option is tinted and set one weight up, like a selected row of an MUI menu
      fontWeight: state.isSelected
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
      color: state.isSelected
        ? theme.palette.primary.dark
        : theme.palette.text.primary,
      backgroundColor: state.isSelected
        ? getTintedBackground(theme, theme.palette.primary.main)
        : state.isFocused
          ? tokens.surfaceSecondary
          : theme.palette.background.paper,
      ...styleProps?.option,
    }),
    menuPortal: (styles: any) => ({ ...styles, zIndex: 5 }),
    // the design draws a single chevron at the icon inset — no separator rule before it
    indicatorSeparator: () => ({ display: 'none' }),
    indicatorsContainer: (styles: any) => ({
      ...styles,
      paddingRight: INPUT_ADORNMENT_INSET,
      color: tokens.textMuted,
    }),
    dropdownIndicator: (styles: any) => ({
      ...styles,
      padding: 0,
      color: 'inherit',
      '&:hover': { color: 'inherit' },
    }),
    singleValue: (styles: any, state: any) => {
      const opacity = state.isDisabled
        ? 0.5
        : 1;
      const transition = 'opacity 300ms';

      return {
        ...styles,
        opacity,
        transition,
        color: theme.palette.text.primary,
        ...styleProps?.singleValue,
      };
    },
    /*
     * react-select keeps a hidden text input beside the values; left at its default margins it is
     * a couple of pixels taller than the chips and quietly pushes a multi-value field off the row
     */
    input: (styles: any) => ({
      ...styles,
      margin: 0,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    // picked values read as tinted pills, matching the tags an Autocomplete puts in its field
    multiValue: (styles: any) => ({
      ...styles,
      margin: 0,
      height: INPUT_CHIP_HEIGHT,
      alignItems: 'center',
      borderRadius: INPUT_CHIP_RADIUS,
      backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
      border: 'none',
      ...styleProps?.multiValue,
    }),
    multiValueLabel: (styles: any) => ({
      ...styles,
      padding: 0,
      paddingLeft: INPUT_CHIP_PADDING_X,
      fontSize: INPUT_CHIP_FONT_SIZE,
      color: theme.palette.primary.dark,
    }),
    multiValueRemove: (styles: any) => ({
      ...styles,
      paddingLeft: 4,
      paddingRight: INPUT_CHIP_PADDING_X,
      color: theme.palette.primary.dark,
      borderRadius: INPUT_CHIP_RADIUS,
      '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
      },
    }),
    placeholder: (styles: any) => ({
      ...styles,
      color: theme.palette.text.disabled,
    }),
  };
};

type ICustomSelectOption = ISelectOption<string | number>;

export type ReactSelectProps<V> = {
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  options: ICustomSelectOption[];
  isMulti?: boolean;
  label?: string;
  width?: number | string;
  fullWidth?: boolean;
  tooltip?: string;
  placeholder?: string;
  required?: boolean;
  onBlur?: () => void;
  variant?: 'standard' | 'outlined';
  value: V;
  helperText?: string;
  onChange: (values: V) => void;
  direction?: 'row' | 'column';
  styles?: Record<string, any>;
  hasError?: string;
};

const SelectInput = <V = unknown>({
  value,
  isDisabled,
  isLoading,
  isClearable,
  options,
  isSearchable,
  label,
  tooltip,
  required,
  onBlur,
  onChange,
  placeholder,
  styles,
  helperText,
  variant = 'outlined',
  direction = 'column',
  width,
  isMulti = false,
  fullWidth = true,
  hasError,
}: ReactSelectProps<V>) => {
  const muiTheme = useTheme();
  const {
    t,
  } = useTranslation();

  /**
   * get only the value without the label
   * @param value
   * @returns
   */
  const formatValue = (value: V) => {
    if (isMulti) {
      const selectedOptions = options.filter((option: ICustomSelectOption) =>
        (value as unknown as any[])?.includes(option.value)
      );

      return selectedOptions;
    }
    const selectedOption = options.find((option: ICustomSelectOption) => option.value === value);

    return selectedOption;
  };

  return (
    <Stack direction={direction}>
      {label && (
        <InputLabel
          label={label}
          required={required}
          sx={{ color: 'text.primary' }}
          tooltip={tooltip}
        />
      )}
      <Select
        classNamePrefix="select"
        defaultValue={formatValue(value)}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isMulti={isMulti}
        isSearchable={isSearchable}
        menuPosition="fixed"
        onBlur={onBlur}
        options={options}
        placeholder={placeholder ?? `${t('select')}...`}
        value={formatValue(value)}
        onChange={(inputValue: any) => {
          // get only the value, not the label
          if (isMulti) {
            const values = (inputValue)?.map((option: ICustomSelectOption) => option.value) ?? [];

            onChange(values);
            return;
          }

          // cleared via the "x" button (isClearable) — inputValue is null, propagate as undefined
          onChange((inputValue)?.value ?? undefined);
        }}
        styles={getCustomStyles({
          theme: muiTheme,
          width: fullWidth
            ? '100%'
            : width,
          variant,
          styleProps: styles,
          hasError: !!hasError,
          isMulti,
        })}
        theme={(theme: any) => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            primary: muiTheme.palette.primary.main,
          },
        })}
      />
      {helperText && (
        <FormHelperText>
          {helperText}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default SelectInput;
