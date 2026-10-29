import {
  FormHelperText, Stack, type Theme, useTheme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import { ISelectOption } from '@/types/app.type';

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
    if (theme.palette.mode === 'light') {
      return '1px solid ' + grey[400];
    }

    return '1px solid #fff';
  }

  return 'none';
};

const getCustomStyles = ({
  theme,
  // default width if not full width and not specified
  width = 300,
  variant = 'outlined',
  styleProps,
  hasError,
}: CustomStyle) => ({
  container: (styles: any) => ({
    ...styles,
    ...(width !== '100%' && { display: 'flex', width }),
  }),
  menu: (styles: any) => ({
    ...styles,
    backgroundColor: theme.palette.mode === 'light'
      ? '#fff'
      : theme.palette.background.default,
    color: theme.palette.mode === 'light'
      ? 'none'
      : '#fff',
    zIndex: 9999,
    ...styleProps?.menu,
  }),
  control: (styles: any) => {
    const values = {
      ...styles,
      border: getControlBorder(variant, theme, hasError),
      borderRadius: 4,
      paddingTop: 5,
      paddingBottom: 5,
      backgroundColor: theme.palette.mode === 'light'
        ? 'none'
        : theme.palette.background.default,
      width,
      ...styleProps?.control,
    };

    if (variant !== 'outlined') {
      values.borderBottom = theme.palette.mode === 'light'
        ? '1px solid ' + grey[400]
        : '1px solid #fff';
    }

    return values;
  },
  option: (styles: any, state: any) => ({
    ...styles,
    color: state.isSelected
      ? theme.palette.primary.main
      : 'initial',

    backgroundColor: theme.palette.mode === 'light'
      ? 'none'
      : theme.palette.background.default,
    ...styleProps?.option,
  }),
  menuPortal: (styles: any) => ({ ...styles, zIndex: 5 }),
  singleValue: (styles: any, state: any) => {
    const opacity = state.isDisabled
      ? 0.5
      : 1;
    const transition = 'opacity 300ms';

    return {
      ...styles,
      opacity,
      transition,
      borderRadius: 4,
      color: theme.palette.mode === 'light'
        ? 'none'
        : '#fff',
      ...styleProps?.singleValue,
    };
  },
  multiValue: (styles: any) => ({
    ...styles,
    borderRadius: 4,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.mode === 'light'
      ? 'none'
      : '#fff',
    border: theme.palette.mode === 'light'
      ? '1px solid ' + grey[500]
      : '1px solid rgba(255, 255, 255, 0.2)',
    ...styleProps?.multiValue,
  }),
  multiValueLabel: (styles: any) => ({
    ...styles,
    color: theme.palette.mode === 'light'
      ? 'none'
      : '#fff',
  }),
});

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
          sx={{ color: '#000' }}
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
        options={options}
        placeholder={placeholder ?? `${t('select')}...`}
        value={formatValue(value)}
        styles={getCustomStyles({
          theme: muiTheme,
          width: fullWidth
            ? '100%'
            : width,
          variant,
          styleProps: styles,
          hasError: !!hasError,
        })}
        theme={(theme: any) => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            primary: muiTheme.palette.primary.main,
          },
        })}
        onBlur={onBlur}
        onChange={(inputValue: any) => {
          if (!inputValue) return;

          // get only the value, not the label
          if (isMulti) {
            const values = (inputValue)?.map((option: ICustomSelectOption) => option.value);

            onChange(values);
            return;
          }

          onChange((inputValue)?.value);
        }}
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
