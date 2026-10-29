'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@/components/Stack';
import { FieldDescription, FieldError, FieldLabel } from '@/components/ui/Field';
import { Textarea, TextareaProps } from '@/components/ui/Textarea';

type Props = {
  name: string;
  label?: string;
  description?: string;
} & TextareaProps;

const TextAreaField = ({
  name, label, description, ...inputProps
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
        <Stack spacing={1.5}>
          {label && (
            <FieldLabel htmlFor={name}>
              {label} {inputProps.required && '*'}
            </FieldLabel>
          )}
          <Textarea
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

export default TextAreaField;
