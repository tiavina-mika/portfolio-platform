import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { TargetEnum } from '@shared/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFileText } from 'react-icons/fi';
import { useDispatch } from 'react-redux';

import Link from '@/components/Link';
import { QUOTE_COLLECTION } from '@/constants/_domain/quote.constants';
import { useProtect } from '@/hooks/_core/useProtect';
import {
  createQuoteFromContact, loadQuoteOfContact, prepareContactQuote,
} from '@/redux/actions/_domain/quote.action';
import { IContact } from '@/types/_core/contact.type';
import {
  IContactWithQuote, IQuote, IQuoteFormValues, IQuoteFromContact,
} from '@/types/_domain/quote.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';

import QuoteFormDialog from './QuoteFormDialog';

type Props = {
  contact: IContact;
};

/**
 * Under a quote request sent from the Aldaron site: "Create the client and the quote" opens the quote
 * form prefilled from the request (its client found by the e-mail or created, the product as the title,
 * the estimate as lines to price). Once saved, the request names its quote instead, and cannot become a
 * second one. Shown to an account that may create quotes; a request already converted is named to all.
 */
const ContactQuoteAction = ({ contact }: Props) => {
  const { t } = useTranslation(['project', 'common']);
  const dispatch = useDispatch();
  const { canCreate } = useProtect(QUOTE_COLLECTION);

  const quoteId = (contact as IContactWithQuote).quote?.objectId;
  const [quote, setQuote] = useState<IQuote | null>(null);
  const [prefill, setPrefill] = useState<IQuoteFromContact | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // the number of the quote the request became, read once: the message names it
  useEffect(() => {
    if (quoteId) dispatch(loadQuoteOfContact(quoteId, setQuote));
  }, [quoteId, dispatch]);

  // a message of the portfolio, or one in the bin, is not a quote request to convert
  if (contact.target !== TargetEnum.AGENCY || contact.deleted) return null;

  if (quoteId || quote) {
    return (
      <Alert
        severity="success"
        action={(
          <Link to={PATH_NAMES.quotes} underline="hover" variant="body2">
            {t('project:quote.seeQuotes')}
          </Link>
        )}
      >
        {quote
          ? t('project:quote.contactConverted', { number: quote.number })
          : t('project:quote.contactConvertedUnknown')}
      </Alert>
    );
  }

  if (!canCreate) return null;

  const handlePrepare = (): void => {
    dispatch(prepareContactQuote(contact.id, setPrefill));
  };

  // closed once saved only: a refusal keeps what was typed on screen
  const handleSubmit = async (values: IQuoteFormValues): Promise<void> => {
    setIsSaving(true);
    const error = await dispatch(createQuoteFromContact(values, contact.id, setQuote));

    setIsSaving(false);
    if (!error) setPrefill(null);
  };

  return (
    <>
      <Button
        onClick={handlePrepare}
        startIcon={<FiFileText aria-hidden />}
        sx={{ alignSelf: 'flex-start' }}
        variant="contained"
      >
        {t('project:quote.createFromContact')}
      </Button>
      <QuoteFormDialog
        loading={isSaving}
        onClose={() => setPrefill(null)}
        onSubmit={handleSubmit}
        open={!!prefill}
        prefill={prefill}
      />
    </>
  );
};

export default ContactQuoteAction;
