import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import StatusDot from '@/components/StatusDot';
import { QUOTE_STATUS_TONES } from '@/constants/_domain/quote.constants';
import { IQuote } from '@/types/_domain/quote.type';

type Props = {
  quote: IQuote;
};

// where the quote stands: draft, sent, accepted, refused or expired
const QuoteStatusCell = ({ quote }: Props) => {
  const { t } = useTranslation(['project']);

  return (
    <Typography component="span" variant="subtitle1">
      <StatusDot
        color={QUOTE_STATUS_TONES[quote.status]}
        label={t(`project:quote.statuses.${quote.status}`)}
      />
    </Typography>
  );
};

export default QuoteStatusCell;
