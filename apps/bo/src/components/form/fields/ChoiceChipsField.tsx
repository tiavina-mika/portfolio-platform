import { Controller, useFormContext } from 'react-hook-form';

import ChoiceChipsInput, { ChoiceChipsInputBaseProps } from '../inputs/ChoiceChipsInput';

type Props = {
  name: string;
  /** holds a list of values rather than a single one — each pill toggles on its own */
  multiple?: boolean;
} & Omit<ChoiceChipsInputBaseProps, 'errorMessage'>;

const ChoiceChipsField = ({
  name, multiple, ...inputProps
}: Props) => {
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  const errorMessage = (errors as any)[name]?.message;

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: {
          value, onChange,
        },
      }) => (multiple
        ? (
          <ChoiceChipsInput
            {...inputProps}
            multiple
            errorMessage={errorMessage}
            onChange={onChange}
            // an empty list rather than undefined once controlled, so the input never falls back to its own state
            value={value ?? []}
          />
        )
        : (
          <ChoiceChipsInput
            {...inputProps}
            errorMessage={errorMessage}
            onChange={onChange}
            // null rather than undefined once controlled, so the input never falls back to its own state
            value={value ?? null}
          />
        ))}
    />
  );
};

export default ChoiceChipsField;
