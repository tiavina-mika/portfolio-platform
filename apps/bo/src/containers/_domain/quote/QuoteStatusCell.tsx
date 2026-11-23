import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { FiPaperclip } from 'react-icons/fi';

import StatusDot from '@/components/StatusDot';
import { QUOTE_ACCEPTANCE_PROOF_ICON_SIZE, QUOTE_STATUS_TONES } from '@/constants/_domain/quote.constants';
import { IQuote } from '@/types/_domain/quote.type';

type Props = {
  quote: IQuote;
};

/*
 * where the quote stands: draft, sent, accepted, refused or expired; an accepted quote whose proof was
 * joined offers it right under its status, opened in a new tab
 */
const QuoteStatusCell = ({ quote }: Props) => {
  const { t } = useTranslation(['project']);

  return (
    <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
      <Typography component="span" variant="subtitle1">
        <StatusDot
          color={QUOTE_STATUS_TONES[quote.status]}
          label={t(`project:quote.statuses.${quote.status}`)}
        />
      </Typography>
      {quote.acceptanceProof?.url && (
        <Link
          aria-label={t('project:quote.openAcceptanceProof', { number: quote.number })}
          href={quote.acceptanceProof.url}
          rel="noopener noreferrer"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          target="_blank"
          variant="body2"
        >
          <FiPaperclip aria-hidden size={QUOTE_ACCEPTANCE_PROOF_ICON_SIZE} />
          {t('project:quote.acceptanceProof')}
        </Link>
      )}
    </Stack>
  );
};

export default QuoteStatusCell;
