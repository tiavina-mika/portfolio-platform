import {
  Box, FormHelperText, InputLabel, SxProps, Theme,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { ICardRadio } from '@/types/_core/app.type';

import CardRadioInput from '../inputs/CardRadioInput';

type Props = {
  name: string;
  label?: string;
  helperText?: string;
  sx?: SxProps<Theme>;
  options: ICardRadio[];
};

const CardRadioField = ({
  name, label, helperText, sx, options, ...rest
}: Props) => {
  // hooks
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  return (
    <Box sx={sx}>
      {/* ----------- label ----------- */}
      {label && <InputLabel sx={{ mb: 1 }}>{label}</InputLabel>}

      <Controller
        control={control}
        name={name}
        render={({
          field: {
            onChange, value,
          },
        }) => (
          <Box>
            <CardRadioInput
              onChange={onChange}
              options={options}
              value={value}
              {...rest}
            />

            {/* ----------- errors ----------- */}
            {errors[name] && (
              <FormHelperText error sx={{ my: 1 }}>
                {(errors as any)[name]?.message}
              </FormHelperText>
            )}

            {/* ----------- helper text ----------- */}
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </Box>
        )}
      />
    </Box>
  );
};

export default CardRadioField;
