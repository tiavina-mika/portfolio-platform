import { css } from '@emotion/css';
import {
  Autocomplete,
  Card,
  IconButton,
  type AutocompleteProps as MUIAutocompleteProps,
  Paper,
  type PaperProps,
  Stack,
  type Theme,
  Typography,
} from '@mui/material';
import {
  type ReactNode, type SyntheticEvent, useEffect, useMemo, useState,
} from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

import type { ISelectOption } from '@/types/app.type';

import TextFieldInput from './TextFieldInput';

const classes = {
  autocomplete: (theme: Theme) => ({
    '& .MuiFormControl-root': {
      padding: '0px !important',
      borderRadius: 6,
      '& label': {
        fontSize: 14,
        color: theme.palette.grey[600],
      },
      '& label.Mui-focused': { color: theme.palette.grey[800] },
    },
    '& .MuiInputBase-input': {
      fontSize: '14px !important',
      color: theme.palette.grey[800],
      '&::placeholder': {
        color: theme.palette.grey[300],
        fontSize: 14,
      },
    },
    '& fieldset': {
      fontSize: 14,
      color: theme.palette.grey[800],
      border: `1px solid ${theme.palette.grey[300]}`,
    },
    '&.Mui-focused fieldset': {
      fontSize: 14,
      border: `1px solid ${theme.palette.grey[300]}`,
    },
    '& .MuiOutlinedInput-root': { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: `1px solid ${theme.palette.grey[300]}` } },
    '& .MuiAutocomplete-option': {
      backgroundColor: '#000 !important',
      color: 'blue',
    },
    '& .Mui-focused': { backgroundColor: theme.palette.grey[50] },
  }),
  paper: (theme: Theme) => ({
    '& .MuiAutocomplete-listbox': {
      margin: '-8px 0',
      '& .MuiAutocomplete-option': {
        fontFamily: 'Product Sans Regular',
        fontSize: 14,
        padding: 16,
        borderTop: `1px solid ${theme.palette.grey[100]}`,
      },
    },
  }),
  input: css({ '& .MuiInputBase-root': { padding: 8 } }),
};

const AutocompletePaper = (props: PaperProps) => {
  return (
    <Paper elevation={0} variant="outlined" {...props} />
  );
};

export type AutocompleteInputProps<T extends Record<string, any>> = {
  value: any;
  label?: string;
  options: any[];
  onChange: (value: any) => void;
  placeholder?: string;
  onChangeList?: (value: ISelectOption<T>[]) => void; // update the data in the preview list
  loading?: boolean;
  withPreview?: boolean; // preview the selected options
  left?: ReactNode | string;
  right?: ReactNode;
  renderPreviews?: (values: ISelectOption<T>[], handleDelete?: (id: string) => void) => ReactNode;
  onInputChange?: (value: string) => void;
  fullWidth?: boolean;
  className?: string;
  disableNoOptions?: boolean; // no options message where no option found (mainly for search)
  multiple?: boolean;
  isSearch?: boolean; // to display a search icon
} & Omit<MUIAutocompleteProps<any, any, any, any>, 'renderInput' | 'onChange' | 'onInputChange'>;

type RightProps = {
  onClear: () => void;
} & Pick<AutocompleteInputProps<Record<string, any>>, 'right' | 'multiple'>;

const Right = ({
  right, multiple, onClear,
}: RightProps) => {
  if (right) return right;
  if (multiple) return null;
  return (
    <IconButton onClick={onClear}>
      <FiX size={16} />
    </IconButton>
  );
};
const AutocompleteInput = <T extends Record<string, any>>({
  value,
  label,
  onChange,
  placeholder,
  onChangeList,
  options = [],
  loading,
  withPreview,
  left,
  right,
  renderPreviews,
  onInputChange,
  fullWidth,
  className,
  isSearch = false,
  multiple = false,
  disableNoOptions = true,
  ...props
}: AutocompleteInputProps<T>) => {
  const [singleSelectionSelectedValues, setSingleSelectionSelectedValues] = useState<ISelectOption<T>[]>([]);
  const [dynamicOptions, setDynamicOptions] = useState<ISelectOption<T>[]>([]);

  const originalOptions = useMemo(() => [...options], [options]);

  useEffect(() => {
    setDynamicOptions(options);
  }, [options]);

  // when selecting an option
  const handleChange = (
    _: SyntheticEvent,
    value: (string | ISelectOption<T>)[] | NonNullable<string | ISelectOption<T>> | null
  ) => {
    if (withPreview && value && !Array.isArray(value)) {
      const newValues = [value, ...singleSelectionSelectedValues] as ISelectOption<T>[];

      setSingleSelectionSelectedValues(newValues);
      onChangeList?.(newValues);
      onChange(value);

      const index = options.findIndex((option: ISelectOption<T>) => {
        const optionValue = value as ISelectOption<T>;

        return option.value === optionValue.value;
      });

      options.splice(index, 1);
      setDynamicOptions(options);

      return;
    }

    onChange(value);
  };

  const handleDelete = (id: string) => {
    const newValues = singleSelectionSelectedValues.filter(
      (value: ISelectOption<T>) => value.value.objectId !== id
    );

    setSingleSelectionSelectedValues(newValues);
    onChangeList?.(newValues);

    // --------- update options --------- //
    const removedValue = singleSelectionSelectedValues.find(
      (value: ISelectOption<T>) => value.value.objectId === id
    );

    if (!removedValue) return;

    // add the removed value to options
    setDynamicOptions((prev: ISelectOption<T>[]): ISelectOption<T>[] => [removedValue, ...prev]);
  };

  const handleMultipleDelete = (id: string) => {
    const newValues = value.filter((value: ISelectOption<T>) => value.value.objectId !== id);

    onChange(newValues);
  };

  const handleClearSingleValue = () => {
    onInputChange?.('');
    onChange(null);
  };

  // when taping
  const handleInputChange = (_: SyntheticEvent, value: string, reason?: string) => {
    if (!onInputChange) return;
    if (reason === 'reset') {
      onInputChange('');
      return;
    }
    onInputChange(value);
  };

  return (
    <Stack
      spacing={1.6}
      className={fullWidth
        ? 'stretchSelf flex1'
        : ''}
    >
      <Stack direction="row">
        <Autocomplete
          blurOnSelect // https://github.com/mui/material-ui/issues/21019
          clearOnBlur
          disableClearable
          disablePortal
          handleHomeEndKeys
          selectOnFocus
          className={className}
          css={classes.autocomplete}
          loading={loading}
          multiple={multiple}
          slots={{ paper: AutocompletePaper }}
          sx={{ flex: 1 }}
          value={value}
          getOptionLabel={(option: ISelectOption<T> | string): string => {
            return typeof option === 'string' ? option : option.label;
          }}
          isOptionEqualToValue={(_: ISelectOption<T>, value: ISelectOption<T>) => {
            const currentOptions = withPreview
              ? dynamicOptions
              : originalOptions;

            return currentOptions.find(
              (option: ISelectOption<T>) => option.value.objectId === value.value?.objectId
            );
          }}
          options={withPreview
            ? dynamicOptions
            : originalOptions}
          renderInput={params => (
            <TextFieldInput
              {...params}
              className={classes.input}
              label={label}
              placeholder={placeholder}
              right={<Right multiple={multiple} right={right} onClear={handleClearSingleValue} />}
              left={isSearch
                ? <FiSearch />
                : left}
            />
          )}
          slotProps={{
            popper: {
              sx: {
                zIndex: 1000,
                '& .MuiAutocomplete-noOptions': {
                  display: disableNoOptions
                    ? 'none'
                    : 'block',
                },
              },
              disablePortal: disableNoOptions,
              placement: 'bottom',
            },
          }}
          onChange={handleChange}
          onInputChange={handleInputChange}
          {...props}
        />
      </Stack>

      {/* preview selected values in single select */}
      {withPreview && singleSelectionSelectedValues.length > 0 &&
        renderPreviews?.(singleSelectionSelectedValues, handleDelete)}

      {/* preview selected when multi select */}
      {multiple && value.length > 0 && (
        <Stack direction="row" spacing={1}>
          {value.map((value: ISelectOption<T>) => (
            <Card key={value.value.objectId} className="flexRow center" css={{ padding: 4, paddingLeft: 12 }}>
              <Typography>{value.label}</Typography>
              <IconButton css={{ marginLeft: 4 }} onClick={() => handleMultipleDelete(value.value.objectId)}>
                <FiX size={16} />
              </IconButton>
            </Card>
          ))}
        </Stack>
      )}

    </Stack>
  );
};

export default AutocompleteInput;
