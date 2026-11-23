import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Stack } from '@mui/material';
import { fromMinorUnits } from '@shared/domain-utils';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import DatePickerField from '@/components/form/fields/DatePickerField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { QUOTE_CURRENCY_OPTIONS, QUOTE_EMPTY_LINE, QUOTE_FORM_ID } from '@/constants/_domain/quote.constants';
import { getSettingsDefaultCurrencySelector } from '@/redux/reducers/_core/settings.reducer';
import { IQuote, IQuoteFormValues } from '@/types/_domain/quote.type';
import { getNewQuoteCurrency } from '@/utils/_domain/quote.utils';
import { quoteSchema } from '@/validations/_domain/quote.validation';

import QuoteClientField from './QuoteClientField';
import QuoteLinesField from './QuoteLinesField';
import QuoteTotal from './QuoteTotal';

type Props = {
  onSubmit: (values: IQuoteFormValues) => void;
  // the draft edited, left out to create one
  quote?: IQuote | null;
};

const twoColumns = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 };

// the stored quote as the form types it: unit amounts back in the main unit of its currency
const toFormValues = (quote: IQuote): IQuoteFormValues => ({
  client: quote.client.id,
  title: quote.title,
  currency: quote.currency,
  // an empty box, not `null`: a text box given `null` stops being controlled by the form
  taxRate: quote.taxRate ?? '',
  validUntil: quote.validUntil ? new Date(quote.validUntil) : null,
  notes: quote.notes ?? '',
  lines: quote.lines.map((line) => ({
    ...line,
    unitAmount: fromMinorUnits(line.unitAmount, quote.currency),
  })),
});

/**
 * What is proposed to the client and at what price. A new quote starts in the default currency of the
 * settings; once created, the currency is the quote's own, so changing that default never touches it.
 * Mounted each time the dialog opens, so it starts from the draft edited or from an empty quote.
 */
const QuoteForm = ({ onSubmit, quote }: Props) => {
  const { t } = useTranslation(['project', 'common']);
  const defaultCurrency = getNewQuoteCurrency(useSelector(getSettingsDefaultCurrencySelector));

  const form = useForm<IQuoteFormValues>({
    // the boxes hold text that the schema reads as numbers: its input and output types differ
    resolver: zodResolver(quoteSchema) as any,
    defaultValues: quote
      ? toFormValues(quote)
      : { currency: defaultCurrency, lines: [{ ...QUOTE_EMPTY_LINE }], taxRate: '', validUntil: null },
  });

  return (
    <Form form={form} formId={QUOTE_FORM_ID} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <QuoteClientField initialClient={quote?.client} />
        <TextField
          fullWidth
          required
          label={t('project:quote.title')}
          name="title"
        />
        <QuoteLinesField />
        <Box sx={twoColumns}>
          <SelectField
            label={t('project:quote.currency')}
            name="currency"
            options={QUOTE_CURRENCY_OPTIONS}
            variant="outlined"
          />
          <TextField
            fullWidth
            helperText={t('project:quote.taxRateHelper')}
            label={t('project:quote.taxRate')}
            name="taxRate"
            slotProps={{ htmlInput: { min: 0, max: 100, step: 'any' } }}
            type="number"
          />
        </Box>
        <DatePickerField label={t('project:quote.validUntil')} name="validUntil" />
        <TextField
          fullWidth
          multiline
          helperText={t('project:quote.notesHelper')}
          label={t('project:quote.notes')}
          minRows={3}
          name="notes"
        />
        <QuoteTotal />
      </Stack>
    </Form>
  );
};

export default QuoteForm;
