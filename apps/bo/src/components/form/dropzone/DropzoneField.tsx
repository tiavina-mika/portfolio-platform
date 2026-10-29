import {
  Box, Stack, type SxProps, type Theme,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import InputLabel from '../InputLabel';
import DropzoneInput, { type CustomDropzoneInputProps } from './input/DropzoneInput';

type Props = {
  name: string;
  label?: string;
  inputLabel?: string;
  sx?: SxProps<Theme>;
  shouldReset?: boolean;
  tooltip?: string;
  required?: boolean;
  error?: string;
  onFieldChange?: () => void;
} & Omit<CustomDropzoneInputProps, 'error' | 'onChange' | 'onBlur' | 'onError' | 'value' | 'type'>;

const DropzoneField = ({
  name,
  label,
  inputLabel,
  sx,
  shouldReset,
  required,
  tooltip,
  onFieldChange,
  error,
  ...rest
}: Props) => {
  // hooks
  const {
    control,
    trigger,
    setError,
    clearErrors,
    formState: {
      errors,
    },
  } = useFormContext();

  return (
    <Box sx={sx}>
      {/* ----------- label ----------- */}
      {label && (
        <InputLabel
          label={label}
          required={required}
          sx={{ mb: 1, color: '#000' }}
          tooltip={tooltip}
        />
      )}

      <Controller
        control={control}
        name={name}
        render={({
          field: {
            onChange, value, onBlur,
          },
        }) => (
          <Stack>
            <DropzoneInput
              error={error || (errors as any)[name]?.message}
              inputLabel={inputLabel}
              shouldReset={shouldReset}
              value={value}
              onBlur={onBlur}
              onChange={(...e) => {
                onChange(...e);
                onFieldChange?.();

                // should trigger manually
                trigger(name);
              }}
              onError={(error: any) => {
                if (!error) {
                  clearErrors(name);
                  return;
                }
                setError(name, { type: 'custom', message: error });
              }}
              {...rest}
            />
          </Stack>
        )}
      />
    </Box>
  );
};

export default DropzoneField;
