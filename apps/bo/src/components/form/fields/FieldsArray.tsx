import {
  Stack, FormHelperText, Button, Theme, IconButton, Tooltip,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import {
  FIELDS_ARRAY_GAP, FIELDS_ARRAY_MAX_WIDTH, FIELDS_ARRAY_REMOVE_BUTTON_WIDTH,
  FIELDS_ARRAY_ROW_PADDING, FIELDS_ARRAY_ROW_GAP,
} from '@/constants/_core/ui/entity.constants';
import { INPUT_HEIGHT, RADIUS } from '@/constants/_core/ui/ui.constants';
import { useToggle } from '@/hooks/_core/useToggle';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import ConfirmDeletionFormModal from '../ConfirmDeletionFormModal';
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
  /*
   * an entry of the list is a bordered row on the card surface holding its inputs and the control
   * that removes it — so the reader can tell where one entry ends and the next begins without
   * counting fields
   */
  card: (theme: Theme) => ({
    backgroundColor: theme.palette.background.paper,
    padding: FIELDS_ARRAY_ROW_PADDING,
    borderRadius: `${RADIUS}px`,
    border: `1px solid ${getDesignTokens(theme).border}`,
  }),
  /*
   * the column is capped well under the card width: an entry is one short value, and a delete
   * button parked at the far edge of a wide screen stops reading as belonging to its own row
   */
  list: { maxWidth: FIELDS_ARRAY_MAX_WIDTH },
  // a bare slot on the input row, not a button standing beside the field it removes
  removeButton: {
    width: FIELDS_ARRAY_REMOVE_BUTTON_WIDTH,
    height: INPUT_HEIGHT,
  },
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

  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
  const {
    open: isConfirmDeleteOpen, toggle: toggleConfirmDelete,
  } = useToggle();

  const handleConfirmDelete = () => {
    if (indexToDelete === null) return;
    remove(indexToDelete);
    setIndexToDelete(null);
  };

  return (
    (
      <Stack css={classes.list} spacing={1}>
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
            spacing={`${FIELDS_ARRAY_GAP}px`}
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
                  ? `${FIELDS_ARRAY_ROW_GAP}px`
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
                      css={classes.removeButton}
                      onClick={() => {
                        setIndexToDelete(index);
                        toggleConfirmDelete();
                      }}
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
            startIcon={<FiPlus />}
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
            {addButtonLabel}
          </Button>
        </div>
        {indexToDelete !== null && (
          <ConfirmDeletionFormModal
            label={`${label || name} #${indexToDelete + 1}`}
            onConfirmed={handleConfirmDelete}
            open={isConfirmDeleteOpen}
            toggle={toggleConfirmDelete}
            type={label || name}
            value={`${indexToDelete + 1}`}
          />
        )}
      </Stack>
    )
  );
};

export default FieldsArray;
