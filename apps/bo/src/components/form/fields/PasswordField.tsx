import { Stack, FormHelperText } from '@mui/material';
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
            error={!!errors[name] || !!errorMessage}
            variant="outlined"
          />

          {/* errors */}
          {errors[name] && typeof (errors as any)[name].message === 'string' && (
            <FormHelperText error>
              {(errors as any)[name].message}
            </FormHelperText>
          )}
        </Stack>
      )}
    />
  );
};

export default PasswordField;
