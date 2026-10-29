import { FormControl, FormHelperText } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { ISelectOption } from '@/types/app.type';

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

  return (
    <FormControl component="fieldset" error={!!errors?.[name]} fullWidth={fullWidth}>
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
            label={label}
            value={value}
            onChange={onChange}
            onInputChange={onSearch}
            onChangeList={(values: ISelectOption<T>[]) => {
              if (!previewName) return;
              setValue(previewName, values, { shouldValidate: true });
            }}
          />
        )}
      />
      {errors[name]
        ? (
          <FormHelperText error>{(errors as any)[name].message}</FormHelperText>
        )
        : (
          <FormHelperText>{helperText}</FormHelperText>
        )}
    </FormControl>
  );
};

export default AutocompleteField;
