import { FormHelperText, Stack } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { ISelectOption } from '@/types/app.type';
import { isString } from '@/utils/utils';


import SelectInput, { ReactSelectProps } from '../inputs/SelectInput';

export type SelectProps = {
  name: string;
  options: ISelectOption[];
} & Omit<ReactSelectProps, 'value' | 'onChange'>;

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
            options={options}
            value={value}
            onBlur={onBlur}
            onChange={onChange}
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
