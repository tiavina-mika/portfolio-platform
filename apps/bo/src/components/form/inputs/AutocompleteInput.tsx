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
import debounce from 'lodash/debounce';
import {
  type ReactNode, type SyntheticEvent, useEffect, useMemo, useRef, useState,
} from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

import type { ISelectOption } from '@/types/_core/app.type';

import { AUTOCOMPLETE_SEARCH_DEBOUNCE_MS } from '@/constants/_core/app.constants';

import TextFieldInput from './TextFieldInput';

/*
 * outline, row height, focus halo and the option list all come from the theme's MuiOutlinedInput /
 * MuiAutocomplete overrides — only the bits MUI hard-codes per instance are set here: the padding
 * the multiple-value layout needs, and the placeholder tone
 */
const classes = {
  autocomplete: (theme: Theme) => ({
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1,
    },
  }),
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
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: AutocompleteInputProps<T>) => {
  const [singleSelectionSelectedValues, setSingleSelectionSelectedValues] = useState<ISelectOption<T>[]>([]);
  const [dynamicOptions, setDynamicOptions] = useState<ISelectOption<T>[]>([]);
  // mirrors the selection so the field still reflects a pick when used outside RHF (Storybook, no-op onChange)
  const [internalValue, setInternalValue] = useState(value);

  const currentValue = value ?? internalValue;

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
      setInternalValue(value);
      onChange(value);

      const index = options.findIndex((option: ISelectOption<T>) => {
        const optionValue = value as ISelectOption<T>;

        return option.value === optionValue.value;
      });

      setDynamicOptions(options.filter((_, optionIndex) => optionIndex !== index));

      return;
    }

    setInternalValue(value);
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
    setInternalValue(null);
    onChange(null);
  };

  // keep the latest onInputChange without recreating the debounced function below
  const onInputChangeRef = useRef(onInputChange);

  onInputChangeRef.current = onInputChange;

  const debouncedInputChange = useMemo(
    () => debounce((value: string) => onInputChangeRef.current?.(value), AUTOCOMPLETE_SEARCH_DEBOUNCE_MS),
    []
  );

  useEffect(() => () => debouncedInputChange.cancel(), [debouncedInputChange]);

  // when taping
  const handleInputChange = (_: SyntheticEvent, value: string, reason?: string) => {
    if (!onInputChange) return;
    if (reason === 'reset') {
      debouncedInputChange.cancel();
      onInputChange('');
      return;
    }
    debouncedInputChange(value);
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
          onChange={handleChange}
          onInputChange={handleInputChange}
          slots={{ paper: AutocompletePaper }}
          sx={{ flex: 1 }}
          value={currentValue}
          getOptionLabel={(option: ISelectOption<T> | string): string => {
            return typeof option === 'string' ? option : option.label;
          }}
          isOptionEqualToValue={(_: ISelectOption<T>, value: ISelectOption<T> | string) => {
            if (typeof value === 'string') return false;

            const currentOptions = withPreview
              ? dynamicOptions
              : originalOptions;

            return !!currentOptions.find(
              (option: ISelectOption<T>) => option.value.objectId === value.value?.objectId
            );
          }}
          options={withPreview
            ? dynamicOptions
            : originalOptions}
          renderInput={params => (
            <TextFieldInput
              {...params}
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid}
              label={label}
              placeholder={placeholder}
              right={<Right multiple={multiple} onClear={handleClearSingleValue} right={right} />}
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
            <Card className="flexRow center" css={{ padding: 4, paddingLeft: 12 }} key={value.value.objectId}>
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
