import { Stack, Typography } from '@mui/material';
import { computeQuoteAmounts, toMinorUnits } from '@shared/domain-utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IQuoteFormValues } from '@/types/_domain/quote.type';
import { formatQuoteAmount } from '@/utils/_domain/quote.utils';

// a box still being typed in may hold anything: what is not a number counts as nothing
const toNumber = (value: unknown): number => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

/**
 * The subtotal, the VAT and the total of the quote, computed while the lines are typed with the same
 * rule the server applies when it saves them. The server's total remains the one stored.
 */
const QuoteTotal = () => {
  const { t } = useTranslation(['project']);
  const locale = useSelector(getSettingsLocaleSelector);
  const { control } = useFormContext<IQuoteFormValues>();
  const [lines, taxRate, currency] = useWatch({ control, name: ['lines', 'taxRate', 'currency'] });

  const rate = toNumber(taxRate);
  const amounts = computeQuoteAmounts(
    (lines ?? []).map((line) => ({
      quantity: toNumber(line?.quantity),
      unitAmount: toMinorUnits(toNumber(line?.unitAmount), currency),
    })),
    rate
  );
  const format = (amount: number) => formatQuoteAmount(amount, currency, locale);

  return (
    <Stack aria-live="polite" spacing={0.5} sx={{ alignItems: 'flex-end' }}>
      <Typography component="p" variant="body2">
        {t('project:quote.subtotal')} : {format(amounts.subtotalAmount)}
      </Typography>
      {!!rate && (
        <Typography component="p" variant="body2">
          {t('project:quote.tax', { rate })} : {format(amounts.taxAmount)}
        </Typography>
      )}
      <Typography component="p" sx={{ fontWeight: 'fontWeightBold' }} variant="subtitle1">
        {t('project:quote.total')} : {format(amounts.totalAmount)}
      </Typography>
      <Typography color="text.secondary" component="p" variant="caption">
        {t('project:quote.totalHelper')}
      </Typography>
    </Stack>
  );
};

export default QuoteTotal;
