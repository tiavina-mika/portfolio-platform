import {
  FormControl,
  FormHelperText,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { CHIP_ICON_GAP } from '@/constants/_core/ui/ui.constants';
import { ISelectOption } from '@/types/_core/app.type';

const classes = {
  // an option's glyph sits beside its label rather than replacing it — the label is the value
  withIcon: {
    gap: `${CHIP_ICON_GAP}px`,
  },
};

type Props = {
  name: string;
  label?: string;
  helperText?: string;
  options: ISelectOption<string | boolean>[];
  isMulti?: boolean;
  /**
   * Keep the current choice when the button already holding it is clicked again. A group standing
   * for a filter has to be clearable — that is how the filter is removed — but one standing for a
   * mandatory choice has nothing to fall back to, and clearing it only produces a required error on
   * a control the user just pressed.
   */
  disableDeselect?: boolean;
} & ToggleButtonGroupProps;

const ToggleButtonsField = ({
  name, label, helperText, isMulti, options, disableDeselect, ...toggleButtonGroupProps
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
            exclusive={!isMulti}
            value={value}
            onChange={(_, newValue: string[] | string) => {
              if (disableDeselect && (newValue === null || newValue === undefined)) return;
              onChange(newValue);
            }}
          >
            {options.map((option, index: number) => (
              <ToggleButton
                aria-label={option.label}
                disabled={option.disabled}
                key={option.label + index}
                value={option.value}
                css={option.icon
                  ? classes.withIcon
                  : undefined}
              >
                {option.icon}
                {option.label}
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
