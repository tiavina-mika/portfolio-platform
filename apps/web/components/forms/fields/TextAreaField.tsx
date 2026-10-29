'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@/components/Stack';
import { FieldDescription, FieldError, FieldLabel } from '@/components/ui/Field';
import { Textarea, TextareaProps } from '@/components/ui/Textarea';

type Props = {
  name: string;
  label?: string;
  description?: string;
  rootClassName?: string;
} & TextareaProps;

const TextAreaField = ({
  name, label, description, rootClassName, ...inputProps
}: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const messageId = `${name}-message`;

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
          <Textarea
            aria-describedby={errors[name] ? messageId : undefined}
            id={name}
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
            <FieldError id={messageId}>{(errors as any)[name]?.message}</FieldError>
          )}
        </Stack>
      )}
    />
  );
};

export default TextAreaField;
