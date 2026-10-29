import { FormControl, FormHelperText, type TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import InputLabel from '../InputLabel';
import DatePickerInput from '../inputs/DatePickerInput';

type Props = {
  name: string;
  label?: string;
  fixedLabel?: string;
  helperText?: string;
  inputFormat?: string;
  disableFuture?: boolean;
  withHour?: boolean;
  tooltip?: string;
} & TextFieldProps;

const DatePickerField = ({
  name,
  label,
  helperText,
  disableFuture,
  fixedLabel,
  inputFormat,
  tooltip,
  withHour = false,
  ...inputProps
}: Props) => {
  // hooks
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  return (
    <FormControl component="fieldset" error={!!errors[name]}>
      {fixedLabel && <InputLabel label={fixedLabel} required={inputProps.required} tooltip={tooltip} />}
      <Controller
        control={control}
        name={name}
        render={({
          field: {
            value,
            onChange,
          },
        }) => (
          <DatePickerInput
            disableFuture={disableFuture}
            inputFormat={inputFormat}
            label={label}
            value={value}
            withHour={withHour}
            onChange={onChange}
            {...inputProps}
          />
        )}
      />
      {errors[name] && <FormHelperText error>{(errors as any)[name].message}</FormHelperText>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default DatePickerField;
