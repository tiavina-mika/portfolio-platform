import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import { QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB } from '@shared/domain-constants';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import SelectField from '@/components/form/fields/SelectField';
import Form from '@/components/form/Form';
import {
  QUOTE_ACCEPT_FORM_ID, QUOTE_ACCEPTANCE_METHOD_OPTIONS, QUOTE_ACCEPTANCE_PROOF_ACCEPT,
  QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_BYTES,
} from '@/constants/_domain/quote.constants';
import { IQuote } from '@/types/_domain/quote.type';
import { QuoteAcceptInput, quoteAcceptSchema } from '@/validations/_domain/quote.validation';

type Props = {
  // the quote being accepted; the dialog is closed while there is none
  quote: IQuote | null;
  onClose: () => void;
  onSubmit: (values: QuoteAcceptInput) => void;
  loading?: boolean;
};

/**
 * Records that the client said yes, and how, with the file that shows it if there is one (a signed
 * quote, the client's e-mail). The date is the day it is recorded, set by the server.
 */
const QuoteAcceptDialog = ({
  quote, onClose, onSubmit, loading,
}: Props) => {
  const { t } = useTranslation(['project', 'common']);
  const form = useForm<QuoteAcceptInput>({ resolver: zodResolver(quoteAcceptSchema) });

  return (
    <Dialog
      fullWidth
      description={t('project:quote.acceptDescription')}
      formId={QUOTE_ACCEPT_FORM_ID}
      loading={loading}
      maxWidth="xs"
      open={!!quote}
      primaryButtonText={t('project:quote.actions.accept')}
      title={t('project:quote.acceptTitle', { number: quote?.number ?? '' })}
      toggle={onClose}
    >
      <Form form={form} formId={QUOTE_ACCEPT_FORM_ID} onSubmit={onSubmit}>
        <Stack spacing={2}>
          <SelectField
            required
            label={t('project:quote.acceptanceMethod')}
            name="acceptanceMethod"
            options={QUOTE_ACCEPTANCE_METHOD_OPTIONS}
            variant="outlined"
          />
          <DropzoneField
            accept={QUOTE_ACCEPTANCE_PROOF_ACCEPT}
            helperText={t('project:quote.acceptanceProofHelper', { size: QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_MB })}
            inputLabel={t('project:quote.acceptanceProofDrop')}
            label={t('project:quote.acceptanceProof')}
            maxFiles={1}
            maxSize={QUOTE_ACCEPTANCE_PROOF_MAX_SIZE_BYTES}
            name="acceptanceProof"
          />
        </Stack>
      </Form>
    </Dialog>
  );
};

export default QuoteAcceptDialog;
