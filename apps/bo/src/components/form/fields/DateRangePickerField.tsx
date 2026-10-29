import {
  FormControl, FormHelperText, FormLabel, type TextFieldProps,
} from '@mui/material';
import { type ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import DateRangeInput from '../inputs/DateRangePickerInput';

type Props = {
  name: string;
  label?: string;
  helperText?: string;
  inputFormat?: string;
  separator?: string | ReactNode;
} & TextFieldProps;

const DateRangePickerField = ({
  name, label, separator, inputFormat, helperText, ...textfieldProps
}: Props) => {
  // hooks
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  return (
    <FormControl fullWidth component="fieldset" error={!!errors[name]}>
      {label && (
        <FormLabel component="legend" sx={{ mb: 1 }}>
          {label}
        </FormLabel>
      )}
      <Controller
        control={control}
        name={name}
        render={({
          field: {
            onChange, value,
          },
        }) => (
          <DateRangeInput
            {...textfieldProps}
            hasError={!!errors[name]}
            inputFormat={inputFormat}
            onChange={onChange}
            separator={separator}
            value={value}
          />
        )}
      />
      {errors[name] && (
        <FormHelperText error>
          {(errors as any)[name][0].message || (errors as any)[name][1]?.message}
        </FormHelperText>
      )}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default DateRangePickerField;
