import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import { QUOTE_FORM_ID } from '@/constants/_domain/quote.constants';
import { IQuote, IQuoteFormValues, IQuoteFromContact } from '@/types/_domain/quote.type';

import QuoteForm from './QuoteForm';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IQuoteFormValues) => void;
  // the draft edited, left out to create one
  quote?: IQuote | null;
  // on a new quote, the accepted quote it amends
  amendedQuote?: IQuote | null;
  // on a new quote, what a quote request of the site prefills
  prefill?: IQuoteFromContact | null;
  loading?: boolean;
};

/**
 * The quote form in a dialog, shared by "New quote", "Edit" and "Create an amendment". The dialog stays
 * open on a refusal, so nothing typed is lost; the page closes it once saved.
 */
const QuoteFormDialog = ({
  open, onClose, onSubmit, quote, amendedQuote, prefill, loading,
}: Props) => {
  const { t } = useTranslation(['project', 'common']);

  const getTitle = (): string => {
    if (quote) return t('project:quote.editQuote', { number: quote.number });
    if (amendedQuote) return t('project:quote.createAmendment', { number: amendedQuote.number });
    if (prefill) return t('project:quote.createQuoteFromContact', { name: prefill.client.name });

    return t('project:quote.createQuote');
  };

  return (
    <Dialog
      fullWidth
      formId={QUOTE_FORM_ID}
      loading={loading}
      maxWidth="md"
      open={open}
      primaryButtonText={t('common:save')}
      title={getTitle()}
      toggle={onClose}
    >
      {/* keyed on the quote, so the form starts again from it each time the dialog opens */}
      {open && (
        <QuoteForm
          amendedQuote={amendedQuote}
          key={quote?.id ?? `new-${amendedQuote?.id ?? ''}`}
          onSubmit={onSubmit}
          prefill={prefill}
          quote={quote}
        />
      )}
    </Dialog>
  );
};

export default QuoteFormDialog;
