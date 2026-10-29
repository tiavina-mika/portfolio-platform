'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@/components/Stack';
import { Checkbox } from '@/components/ui/Checkbox';
import { FieldDescription, FieldError, FieldLabel } from '@/components/ui/Field';

type Props = {
  name: string;
  label?: string;
  description?: string;
};

const CheckboxField = ({ name, label, description }: Props) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Stack
          align="center"
          className="rounded-md py-4"
          direction="row"
          spacing={3}
        >
          <Checkbox
            {...field}
            checked={field.value}
            onCheckedChange={field.onChange}
          />

          <div className="space-y-2 leading-none">
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
            {description && <FieldDescription>{description}</FieldDescription>}
            {errors[name] && (
              <FieldError>{(errors as any)[name]?.message}</FieldError>
            )}
          </div>
        </Stack>
      )}
    />
  );
};

export default CheckboxField;
