'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@/components/Stack';
import { FieldDescription, FieldError, FieldLabel } from '@/components/ui/Field';
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

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Stack className={rootClassName} spacing={1.5}>
          {label && (
            <FieldLabel htmlFor={name}>
              {label} {inputProps.required && '*'}
            </FieldLabel>
          )}
          <Input
            {...inputProps}
            {...field}
            error={!!errors[name]?.message}
            placeholder={
              inputProps.placeholder && inputProps.required && !label
                ? `${inputProps.placeholder} *`
                : inputProps.placeholder
            }
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {errors[name] && (
            <FieldError>{(errors as any)[name]?.message}</FieldError>
          )}
        </Stack>
      )}
    />
  );
};

export default TextField;
