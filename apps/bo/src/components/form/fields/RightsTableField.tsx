import { Box, FormHelperText, InputLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import RightsTableInput from '../inputs/RightsTableInput';

type Props = {
  name: string;
  label?: string;
  description?: string;
};

const RightsTableField = ({
  name,
  // options,
  label,
  description,
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
      name={name}
      render={({
        field: {
          value, onChange,
        },
      }) => (
        <Box>
          {label && <InputLabel sx={{ mb: 0.8, color: '#000' }}>{label}</InputLabel>}
          {description && <FormHelperText>{description}</FormHelperText>}

          <RightsTableInput
            onChange={onChange}
            value={value}
          />
          {errors[name] && <FormHelperText error>{(errors as any)[name]}</FormHelperText>}
        </Box>
      )}
    />
  );
};

export default RightsTableField;
