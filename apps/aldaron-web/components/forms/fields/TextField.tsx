'use client';

import { Controller, useFormContext } from 'react-hook-form';

import FormField from '@/components/forms/FormField';
import { Input, InputProps } from '@/components/ui/Input';

type Props = {
  name: string;
  label?: string;
  description?: string;
  rootClassName?: string;
} & InputProps;

const TextField = ({
  name, label, description, rootClassName, ...inputProps
}: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const messageId = `${name}-message`;
  const errorMessage = (errors as any)[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={rootClassName}>
          <FormField
            description={description}
            error={errorMessage}
            errorId={messageId}
            htmlFor={name}
            label={label}
            required={inputProps.required}
          >
            <Input
              aria-describedby={errorMessage ? messageId : undefined}
              id={name}
              {...inputProps}
              {...field}
              error={!!errorMessage}
              placeholder={
                inputProps.placeholder && inputProps.required && !label
                  ? `${inputProps.placeholder} *`
                  : inputProps.placeholder
              }
            />
          </FormField>
        </div>
      )}
    />
  );
};

export default TextField;
