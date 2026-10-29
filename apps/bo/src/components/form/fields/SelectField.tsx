import { FormHelperText, Stack } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { ISelectOption } from '@/types/_core/app.type';
import { isString } from '@/utils/_core/utils';


import SelectInput, { ReactSelectProps } from '../inputs/SelectInput';

export type SelectProps = {
  name: string;
  options: ISelectOption[];
} & Omit<ReactSelectProps<unknown>, 'value' | 'onChange'>;

const SelectField = ({
  name,
  options,
  ...selectProps
}: SelectProps) => {
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
          value, onChange, onBlur,
        },
      }) => (
        <Stack>
          <SelectInput
            onBlur={onBlur}
            onChange={onChange}
            options={options}
            value={value}
            {...selectProps}
          />
          {errors[name] && (
            <FormHelperText error>
              {isString((errors as any)[name])
                ? (errors as any)[name]
                : (errors as any)[name].message}
            </FormHelperText>
          )}
        </Stack>
      )}
    />
  );
};

export default SelectField;
