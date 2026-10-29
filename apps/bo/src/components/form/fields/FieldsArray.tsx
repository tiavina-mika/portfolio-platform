import {
  Stack, FormHelperText, Button, type Theme, IconButton, Tooltip,
} from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import InputLabel from '../InputLabel';
import TextFieldInput, { CustomTextFieldInputProps } from '../inputs/TextFieldInput';


type SubName = {
  name: string;
  type?: 'text' | 'number' | 'url';
  placeholder?: string;
  defaultValue?: string | number;
  label?: string;
  required?: boolean;
} & CustomTextFieldInputProps;

const isOnlyOneField = (subNames: SubName[]): boolean => subNames.length === 1;

const classes = {
  card: (theme: Theme) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  }),
};

type Props = {
  label?: string;
  name: string;
  subNames: SubName[];
  required?: boolean;
  addButtonLabel?: string;
  subFieldsDirection?: 'row' | 'column';
};

const FieldsArray = ({
  label,
  name,
  addButtonLabel,
  subFieldsDirection = 'column',
  subNames = [],
  required = false,
}: Props) => {
  const {
    t,
  } = useTranslation();

  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();

  const {
    fields, append, remove,
  } = useFieldArray({
    control,
    name,
  });

  return (
    (
      <Stack spacing={1}>
        {/* label */}
        {label && (
          <InputLabel
            required={required}
            label={fields.length > 0
              ? `${label} (${fields.length})`
              : label}
          />
        )}
        {/* fields */}
        {fields.length > 0 && (
          <Stack
            spacing={2}
            // use parent level card if there is only one field, otherwise use card for each block (see below)
            css={isOnlyOneField(subNames)
              ? classes.card
              : null}
          >
            {fields.map((field, index) => (
              <Stack
                key={field.id}
                css={[

                  /*
                   * use card for each block if there are more than one field,
                   * otherwise use parent level card (see above)
                   */
                  isOnlyOneField(subNames)
                    ? null
                    : classes.card,
                  isOnlyOneField(subNames)
                    ? { alignItems: 'center' }
                    : null]}
                direction={isOnlyOneField(subNames)
                  ? 'row'
                  : subFieldsDirection}
                spacing={isOnlyOneField(subNames)
                  ? 1
                  : 2} // one field = display in row
              >
                {/* subfields */}
                {subNames.map((subName, subIndex) => (
                  <Controller
                    control={control}
                    defaultValue=""
                    key={field.id + subIndex}
                    name={`${name}.${index}.${subName.name}`}
                    render={({
                      field,
                    }) => (
                    // if only one field, the field should take all the space
                      (
                        <Stack css={isOnlyOneField(subNames)
                          ? { flex: 1 }
                          : null}
                        >
                          <TextFieldInput
                            {...field}
                            {...subName}
                            // add index to placeholder if there is a placeholder
                            error={!!errors[name] || !!errors[name]?.[index]?.[subName.name]}
                            fullWidth={subFieldsDirection === 'column'}
                            type={subName.type || 'text'}
                            placeholder={subName.placeholder
                              ? (subName.placeholder + ' #' + (index + 1))
                              : ''}
                          />
                          {(errors as any)[name]?.[index]?.[subName.name] && (
                            <FormHelperText error>
                              {(errors as any)[name]?.[index]?.[subName.name].message}
                            </FormHelperText>
                          )}
                        </Stack>
                      )
                    )}
                  />
                ))}
                {/* remove button */}
                <div>
                  <Tooltip title={t('infoMessages.removeFields', { index: index + 1 })}>
                    <IconButton
                      color="error"
                      css={{ alignSelf: 'flex-end' }}
                      onClick={() => remove(index)}
                    >
                      <FiTrash2 />
                    </IconButton>
                  </Tooltip>
                </div>
              </Stack>
            ))}
          </Stack>
        )}
        <div>
          <Button
            css={{ display: 'flex', gap: 8 }}
            type="button"
            variant="outlined"
            onClick={() =>
              append(
                subNames.reduce(
                  (
                    acc: Record<string, string | number>,
                    subName: SubName
                  ): Record<string, string | number> => {
                    acc[subName.name] = subName.defaultValue || '';
                    return acc;
                  }, {})
              )}
          >
            <FiPlus />
            {addButtonLabel}
          </Button>
        </div>
      </Stack>
    )
  );
};

export default FieldsArray;
