import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { IQuote } from '@/types/_domain/quote.type';

type Props = {
  quote: IQuote;
};

/*
 * which quote it is: the number it is referred to by (with its version once it was revised), what it
 * proposes, and the quote it revises or amends. A revision shares the number of the quote it revises;
 * an amendment has its own
 */
const QuoteTitleCell = ({ quote }: Props) => {
  const { t } = useTranslation(['project']);
  const { parentQuote } = quote;

  const getParentLabel = (): string | null => {
    if (!parentQuote) return null;
    if (parentQuote.number === quote.number) {
      return t('project:quote.revises', { number: parentQuote.number, version: parentQuote.version });
    }

    return t('project:quote.amends', { number: parentQuote.number });
  };

  const parentLabel = getParentLabel();

  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
      <Typography component="span" sx={{ fontWeight: 'fontWeightMedium' }} variant="body2">
        {quote.version > 1
          ? t('project:quote.numberWithVersion', { number: quote.number, version: quote.version })
          : quote.number}
      </Typography>
      <Typography
        noWrap
        color="text.secondary"
        component="span"
        variant="caption"
      >
        {quote.title}
      </Typography>
      {parentLabel && (
        <Typography color="text.secondary" component="span" variant="caption">
          {parentLabel}
        </Typography>
      )}
    </Stack>
  );
};

export default QuoteTitleCell;
