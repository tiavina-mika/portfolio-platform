import { FormControl, FormHelperText } from '@mui/material';
import { useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ISelectOption } from '@/types/_core/app.type';

import AutocompleteInput, { AutocompleteInputProps } from '../inputs/AutocompleteInput';

export type AutocompleteProps<T extends Record<string, any>> = {
  name: string;
  label?: string;
  previewName?: string;
  fullWidth?: boolean;
  helperText?: string;
  onSearch?: (value: any) => void;
} & Omit<AutocompleteInputProps<T>, 'name' | 'onChange' | 'value'>;

const AutocompleteField = <T extends Record<string, any>>({
  name,
  label,
  fullWidth,
  helperText,
  previewName,
  onSearch,
  ...otherProps
}: AutocompleteProps<T>) => {
  const {
    control,
    formState: {
      errors,
    },
    setValue,
  } = useFormContext();

  const helperTextId = useId();
  const hasError = !!errors?.[name];

  return (
    <FormControl component="fieldset" error={hasError} fullWidth={fullWidth}>
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({
          field: {
            value, onChange,
          },
        }) => (
          <AutocompleteInput<T>
            {...otherProps}
            aria-describedby={helperTextId}
            aria-invalid={hasError}
            label={label}
            onChange={onChange}
            onInputChange={onSearch}
            value={value}
            onChangeList={(values: ISelectOption<T>[]) => {
              if (!previewName) return;
              setValue(previewName, values, { shouldValidate: true });
            }}
          />
        )}
      />
      {/*
        * only rendered when it carries something: an empty helper line still keeps its own margin,
        * which lifts the field off the baseline it shares with the plain fields next to it
        */}
      {errors[name] && (
        <FormHelperText error id={helperTextId}>{(errors as any)[name].message}</FormHelperText>
      )}
      {!errors[name] && !!helperText && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default AutocompleteField;
