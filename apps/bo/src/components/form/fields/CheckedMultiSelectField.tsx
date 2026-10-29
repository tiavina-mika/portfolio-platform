import { Controller, useFormContext } from 'react-hook-form';

import { ISelectOption } from '@/types/app.type';

import CheckedMultiSelectInput from '../inputs/CheckedMultiSelectInput';

type Props = {
  name: string;
  options: ISelectOption[];
  helperText?: string;
};
const CheckedMultiSelectField = ({
  name, options, helperText,
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
        field: {
          value, onChange,
        },
      }) => (
        <CheckedMultiSelectInput
          error={(errors as any)[name]}
          helperText={helperText}
          onChange={onChange}
          options={options}
          value={value}
        />
      )}
    />
  );
};

export default CheckedMultiSelectField;
