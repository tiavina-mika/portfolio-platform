import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import DatePickerField from '@/components/form/fields/DatePickerField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_PAY_FORM_ID } from '@/constants/_domain/payment.constants';
import { IPayment } from '@/types/_domain/payment.type';
import { PaymentPaidFormValues, paymentPaidSchema } from '@/validations/_domain/payment.validation';

type Props = {
  // the payment being recorded as paid; the dialog is closed while there is none
  payment: IPayment | null;
  // the amount of the payment, already written in the quote's currency
  amountLabel: string;
  onClose: () => void;
  onSubmit: (values: PaymentPaidFormValues) => void;
  loading?: boolean;
};

/**
 * Records that the client paid one payment: how, the transfer reference if there is one, and the day the
 * money came in (today when left empty). Nothing is collected online: this only records what happened.
 */
const PaymentPayDialog = ({
  payment, amountLabel, onClose, onSubmit, loading,
}: Props) => {
  const { t } = useTranslation(['project', 'common']);
  const form = useForm<PaymentPaidFormValues>({ resolver: zodResolver(paymentPaidSchema) });

  return (
    <Dialog
      fullWidth
      formId={PAYMENT_PAY_FORM_ID}
      loading={loading}
      maxWidth="xs"
      open={!!payment}
      primaryButtonText={t('project:payment.actions.markAsPaid')}
      title={t('project:payment.payTitle')}
      toggle={onClose}
      description={t('project:payment.payDescription', {
        kind: payment ? t(`project:payment.kinds.${payment.kind}`) : '',
        amount: amountLabel,
      })}
    >
      <Form form={form} formId={PAYMENT_PAY_FORM_ID} onSubmit={onSubmit}>
        <Stack spacing={2}>
          <SelectField
            required
            label={t('project:payment.method')}
            name="method"
            options={PAYMENT_METHOD_OPTIONS}
            variant="outlined"
          />
          <TextField
            fullWidth
            helperText={t('project:payment.referenceHelper')}
            label={t('project:payment.reference')}
            name="reference"
          />
          <DatePickerField
            disableFuture
            helperText={t('project:payment.paidAtHelper')}
            label={t('project:payment.paidAt')}
            name="paidAt"
          />
        </Stack>
      </Form>
    </Dialog>
  );
};

export default PaymentPayDialog;
