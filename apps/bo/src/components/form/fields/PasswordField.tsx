import { Stack, FormHelperText } from '@mui/material';
import { useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import PasswordInput from '../inputs/PasswordInput';
import { CustomTextFieldInputProps } from '../inputs/TextFieldInput';


type Props = {
  name: string;
  errorMessage?: string;
} & CustomTextFieldInputProps;

const PasswordField = ({
  name, errorMessage, ...inputProps
}: Props) => {
  // hooks
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  const helperTextId = useId();
  const hasError = !!errors[name] || !!errorMessage;

  return (
    <Controller
      control={control}
      defaultValue=""
      name={name}
      render={({
        field,
      }) => (
        <Stack>
          <PasswordInput
            {...field}
            {...inputProps}
            aria-describedby={hasError ? helperTextId : undefined}
            aria-invalid={hasError}
            error={hasError}
            variant="outlined"
          />

          {/* errors */}
          {errors[name] && typeof (errors as any)[name].message === 'string' && (
            <FormHelperText error id={helperTextId}>
              {(errors as any)[name].message}
            </FormHelperText>
          )}
        </Stack>
      )}
    />
  );
};

export default PasswordField;
