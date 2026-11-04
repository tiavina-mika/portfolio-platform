import { Stack, FormHelperText } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import PasswordChecklistInput from '../inputs/PasswordChecklistInput';
import { CustomTextFieldInputProps } from '../inputs/TextFieldInput';

type Props = {
  name: string;
} & CustomTextFieldInputProps;

const PasswordChecklistField = ({
  name, ...inputProps
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
          <PasswordChecklistInput
            {...field}
            {...inputProps}
            error={!!errors[name]}
            hidePasswordIcon={<FiEyeOff />}
            showPasswordIcon={<FiEye />}
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

export default PasswordChecklistField;
