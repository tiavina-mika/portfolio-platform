import { Controller, useFormContext } from 'react-hook-form';

import { joinCommaSeparatedValues, splitCommaSeparatedValues } from '@/utils/_core/utils';

import TextToChipsInput, { TextToChipsInputProps } from '../inputs/TextToChipsInput';

type Props = {
  name: string;
} & Omit<TextToChipsInputProps, 'value' | 'onChange' | 'onBlur' | 'name' | 'error' | 'errorMessage'>;

/**
 * the form keeps the chips as the one comma-separated string the entity stores (e.g. the CMS tags),
 * so the schema, the saved data and the website that reads it are unchanged
 */
const TextToChipsField = ({ name, ...inputProps }: Props) => {
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
        <TextToChipsInput
          {...inputProps}
          error={!!errors[name]}
          errorMessage={errors[name]?.message as string | undefined}
          name={field.name}
          onBlur={field.onBlur}
          onChange={values => field.onChange(joinCommaSeparatedValues(values))}
          value={splitCommaSeparatedValues(field.value ?? '')}
        />
      )}
    />
  );
};

export default TextToChipsField;
