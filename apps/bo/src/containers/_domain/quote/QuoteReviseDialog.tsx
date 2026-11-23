import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import { IQuote } from '@/types/_domain/quote.type';

type Props = {
  // the sent quote about to be revised; the dialog is closed while there is none
  quote: IQuote | null;
  onClose: () => void;
  onConfirm: (quote: IQuote) => void;
};

/**
 * Asks before revising a sent quote: the revision cannot be undone, as the version the client received
 * expires at once and only the new draft version can be sent instead.
 */
const QuoteReviseDialog = ({ quote, onClose, onConfirm }: Props) => {
  const { t } = useTranslation(['project']);

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onPrimaryButtonAction={() => quote && onConfirm(quote)}
      open={!!quote}
      primaryButtonText={t('project:quote.actions.revise')}
      title={t('project:quote.reviseTitle', { number: quote?.number ?? '' })}
      toggle={onClose}
      description={t('project:quote.reviseDescription', {
        number: quote?.number ?? '',
        version: (quote?.version ?? 1) + 1,
      })}
    />
  );
};

export default QuoteReviseDialog;
