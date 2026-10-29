import {
  FormControl,
  FormHelperText,
  FormLabel,
  type Theme,
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
  Typography,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { ISelectOption } from '@/types/app.type';

const classes = {
  toggleButtonGroup: (theme: Theme) => ({
    '& .MuiToggleButtonGroup-grouped': {
      textTransform: 'capitalize' as const,
      borderColor: '#BDBDBD',
      '&:first-of-type': {
        borderTopLeftRadius: theme.shape.borderRadius,
        borderBottomLeftRadius: theme.shape.borderRadius,
      } as const,
      '&:last-of-type': {
        borderTopRightRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
      } as const,
    },
  }),
  toggleButton: (theme: Theme) => ({
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
    },
  }),
};

type Props = {
  name: string;
  label?: string;
  helperText?: string;
  options: ISelectOption<string | boolean>[];
  isMulti?: boolean;
} & ToggleButtonGroupProps;

const ToggleButtonsField = ({
  name, label, helperText, isMulti, options, ...toggleButtonGroupProps
}: Props) => {
  // hooks
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  return (
    <FormControl component="fieldset" error={!!errors[name]}>
      {label && (
        <FormLabel component="legend" sx={{ mb: 1 }}>
          {label}
        </FormLabel>
      )}
      <Controller
        control={control}
        name={name}
        render={({
          field: {
            onChange, value,
          },
        }) => (
          <ToggleButtonGroup
            {...toggleButtonGroupProps}
            aria-label="text formatting"
            color="primary"
            css={classes.toggleButtonGroup}
            exclusive={!isMulti}
            value={value}
            onChange={(_, value: string[] | string) => onChange(value)}
          >
            {options.map((option, index: number) => (
              <ToggleButton
                key={option.label + index}
                aria-label={option.label}
                css={classes.toggleButton}
                value={option.value}
              >
                <Typography>{option.label}</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      />
      {errors[name] && <FormHelperText error>{(errors as any)[name].message}</FormHelperText>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ToggleButtonsField;
