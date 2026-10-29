import { FormControl, FormHelperText } from '@mui/material';
import { ReactNode } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { ICreatableSelectOption } from '@/types/_core/utils.type';

import InputLabel from '../InputLabel';
import CreatableAutoCompleteInput from '../inputs/CreatableAutoCompleteInput';

type Props = {
  name: string;
  label?: string;
  tooltip?: string;
  required?: boolean;
  options: ICreatableSelectOption[];
  fixedLabel?: string;
  renderForm: (formId: string, value: any, toggle: () => void) => ReactNode;
  formId: string;
  dialogTitle: string;
  fullWidth?: boolean;
  helperText?: string;
  placeholder?: string;
  isCreateOnInputChange?: boolean;
};

const CreatableAutoCompleteField = ({
  name,
  label,
  tooltip,
  fixedLabel,
  required,
  renderForm,
  formId,
  dialogTitle,
  fullWidth,
  helperText,
  placeholder,
  isCreateOnInputChange,
  options = [],
}: Props) => {
  // hooks
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  return (
    <FormControl component="fieldset" error={!!errors?.[name]} fullWidth={fullWidth}>
      {fixedLabel && (
        <InputLabel
          label={fixedLabel}
          required={required}
          sx={{ color: 'text.primary' }}
          tooltip={tooltip}
        />
      )}
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({
          field: {
            value, onChange,
          },
        }: any): any => (
          <CreatableAutoCompleteInput
            dialogTitle={dialogTitle}
            formId={formId}
            isCreateOnInputChange={isCreateOnInputChange}
            label={label}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            renderForm={renderForm}
            value={value}
          />
        )}
      />
      {errors[name]
        ? (
          <FormHelperText error>{(errors as any)[name].message}</FormHelperText>
        )
        : (
          <FormHelperText>{helperText}</FormHelperText>
        )}
    </FormControl>
  );
};

export default CreatableAutoCompleteField;
