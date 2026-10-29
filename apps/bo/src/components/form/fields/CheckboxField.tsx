import {
  Checkbox, FormControl, FormControlLabel, FormHelperText, Switch,
} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

import InputLabel from '../InputLabel';

type Props = {
  name: string;
  label?: string;
  tooltip?: string;
  isSwitch?: boolean;
};

const CheckboxField = ({
  name, label, tooltip, isSwitch = false,
}: Props) => {
  // hooks
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  const Component = isSwitch
    ? Switch
    : Checkbox;

  return (
    <FormControl component="fieldset" error={!!errors?.[name]}>
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({
          field,
        }: any): any => (
          <FormControlLabel
            {...field}
            control={<Component checked={!!field.value} onChange={field.onChange} />}
            label={<InputLabel label={label} sx={{ mb: 0 }} tooltip={tooltip} />}
          />
        )}
      />
      <FormHelperText>{(errors as any)[name]?.message}</FormHelperText>
    </FormControl>
  );
};

export default CheckboxField;
