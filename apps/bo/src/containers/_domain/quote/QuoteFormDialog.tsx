import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import { QUOTE_FORM_ID } from '@/constants/_domain/quote.constants';
import { IQuote, IQuoteFormValues } from '@/types/_domain/quote.type';

import QuoteForm from './QuoteForm';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IQuoteFormValues) => void;
  // the draft edited, left out to create one
  quote?: IQuote | null;
  loading?: boolean;
};

/**
 * The quote form in a dialog, shared by "New quote" and "Edit". The dialog stays open on a refusal, so
 * nothing typed is lost; the page closes it once saved.
 */
const QuoteFormDialog = ({
  open, onClose, onSubmit, quote, loading,
}: Props) => {
  const { t } = useTranslation(['project', 'common']);

  return (
    <Dialog
      fullWidth
      formId={QUOTE_FORM_ID}
      loading={loading}
      maxWidth="md"
      open={open}
      primaryButtonText={t('common:save')}
      title={quote ? t('project:quote.editQuote', { number: quote.number }) : t('project:quote.createQuote')}
      toggle={onClose}
    >
      {/* keyed on the quote, so the form starts again from it each time the dialog opens */}
      {open && <QuoteForm key={quote?.id ?? 'new'} onSubmit={onSubmit} quote={quote} />}
    </Dialog>
  );
};

export default QuoteFormDialog;
