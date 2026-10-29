import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import DateRangeInput from '../inputs/DateRangeInput';

type Props = {
  name: string;
  label?: string;
  helperText?: string;
  endDefaultsToToday?: boolean;
};

type FieldError = {
  message?: string;
  0?: { message?: string };
  1?: { message?: string };
};

const DateRangeField = ({
  name, label, helperText, endDefaultsToToday,
}: Props) => {
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  const fieldError = errors[name] as FieldError | undefined;
  const errorMessage = fieldError?.[0]?.message ?? fieldError?.[1]?.message ?? fieldError?.message;

  return (
    <FormControl fullWidth component="fieldset" error={!!fieldError}>
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
            endDefaultsToToday={endDefaultsToToday}
            hasError={!!fieldError}
            onChange={onChange}
            value={value}
          />
        )}
      />
      {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default DateRangeField;
