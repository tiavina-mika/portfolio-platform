import {
  Box, Button, FormHelperText, IconButton, Stack, Typography,
} from '@mui/material';
import { QUOTE_LINES_MAX } from '@shared/domain-constants';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import TextFieldInput from '@/components/form/inputs/TextFieldInput';
import { QUOTE_EMPTY_LINE } from '@/constants/_domain/quote.constants';
import { IQuoteFormValues } from '@/types/_domain/quote.type';

// one line reads as a row on a wide screen and as a stack of its three boxes on a phone
const lineRow = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr 1fr', md: 'minmax(0, 3fr) minmax(0, 1fr) minmax(0, 1.5fr) auto' },
  gap: 1.5,
  alignItems: 'start',
};

const labelCell = { gridColumn: { xs: '1 / -1', md: 'auto' } };

const LINE_FIELDS = [
  { name: 'label', labelKey: 'project:quote.lineLabel', type: 'text' },
  { name: 'quantity', labelKey: 'project:quote.quantity', type: 'number' },
  { name: 'unitAmount', labelKey: 'project:quote.unitAmount', type: 'number' },
] as const;

/**
 * The priced lines of the quote: a description, a quantity (half a day is 0.5) and a unit price typed
 * in the currency of the quote. A quote holds at least one line.
 */
const QuoteLinesField = () => {
  const { t } = useTranslation(['project']);
  const { control, formState: { errors } } = useFormContext<IQuoteFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  // the error of the list itself (no line at all, too many lines), not of one of its boxes
  const listError = errors.lines?.message ?? errors.lines?.root?.message;

  return (
    <Stack component="fieldset" spacing={1.5} sx={{ border: 0, m: 0, p: 0 }}>
      <Typography component="legend" variant="subtitle2">{t('project:quote.lines')}</Typography>
      {fields.map((field, index) => (
        <Box
          aria-label={t('project:quote.lineNumber', { index: index + 1 })}
          key={field.id}
          role="group"
          sx={lineRow}
        >
          {LINE_FIELDS.map(({ name, labelKey, type }) => {
            const error = errors.lines?.[index]?.[name]?.message;

            return (
              <Box key={name} sx={name === 'label' ? labelCell : undefined}>
                <Controller
                  control={control}
                  name={`lines.${index}.${name}`}
                  render={({ field: input }) => (
                    <TextFieldInput
                      {...input}
                      fullWidth
                      required
                      error={!!error}
                      label={t(labelKey)}
                      slotProps={type === 'number' ? { htmlInput: { min: 0, step: 'any' } } : undefined}
                      type={type}
                    />
                  )}
                />
                {error && <FormHelperText error>{error}</FormHelperText>}
              </Box>
            );
          })}
          <IconButton
            aria-label={t('project:quote.removeLine', { index: index + 1 })}
            color="error"
            disabled={fields.length === 1}
            onClick={() => remove(index)}
          >
            <FiTrash2 aria-hidden />
          </IconButton>
        </Box>
      ))}
      {listError && <FormHelperText error>{listError}</FormHelperText>}
      <div>
        <Button
          disabled={fields.length >= QUOTE_LINES_MAX}
          onClick={() => append({ ...QUOTE_EMPTY_LINE })}
          startIcon={<FiPlus aria-hidden />}
          variant="outlined"
        >
          {t('project:quote.addLine')}
        </Button>
      </div>
    </Stack>
  );
};

export default QuoteLinesField;
