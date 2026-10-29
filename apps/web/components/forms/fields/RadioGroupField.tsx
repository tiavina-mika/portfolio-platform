'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Stack from '@/components/Stack';
import { FieldError, FieldLabel } from '@/components/ui/Field';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { ISelectOption } from '@/types/app.type';

type Props = {
  name: string;
  label?: string;
  options: ISelectOption[];
  labelClassName?: string;
};

const RadioGroupField = ({
  name, label, options, labelClassName,
}: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      control={control}
      defaultValue=""
      name={name}
      render={({ field }) => (
        <Stack spacing={1}>
          <Label className={labelClassName}>{label}</Label>
          <RadioGroup
            {...field}
            className="flex flex-col space-y-1"
            defaultValue={field.value}
            onValueChange={field.onChange}
          >
            {options.map(({ value, label }) => (
              <Stack
                key={value}
                align="center"
                direction="row"
                spacing={0.5}
              >
                <RadioGroupItem value={value} />
                <FieldLabel className="font-normal">{label}</FieldLabel>
              </Stack>
            ))}
          </RadioGroup>
          {errors[name] && (
            <FieldError>{(errors as any)[name]?.message}</FieldError>
          )}
        </Stack>
      )}
    />
  );
};

export default RadioGroupField;
