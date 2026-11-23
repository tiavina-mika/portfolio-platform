import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import DatePickerField from '@/components/form/fields/DatePickerField';
import Form from '@/components/form/Form';
import { PAYMENT_DUE_DATE_FORM_ID } from '@/constants/_domain/payment.constants';
import { IPayment } from '@/types/_domain/payment.type';
import { PaymentDueDateFormValues, paymentDueDateSchema } from '@/validations/_domain/payment.validation';

type Props = {
  // the unpaid payment being dated; the dialog is closed while there is none
  payment: IPayment | null;
  onClose: () => void;
  onSubmit: (values: PaymentDueDateFormValues) => void;
  loading?: boolean;
};

/**
 * Sets the day the milestone or the balance falls due, once it is known (the deposit is due on the day of
 * the acceptance). Emptying the date takes the payment back to planned.
 */
const PaymentDueDateDialog = ({
  payment, onClose, onSubmit, loading,
}: Props) => {
  const { t } = useTranslation(['project']);
  const form = useForm<PaymentDueDateFormValues>({
    resolver: zodResolver(paymentDueDateSchema),
    defaultValues: { dueDate: payment?.dueDate ? new Date(payment.dueDate) : null },
  });

  return (
    <Dialog
      fullWidth
      description={t('project:payment.dueDateDescription')}
      formId={PAYMENT_DUE_DATE_FORM_ID}
      loading={loading}
      maxWidth="xs"
      open={!!payment}
      primaryButtonText={t('project:payment.actions.saveDueDate')}
      toggle={onClose}
      title={t('project:payment.dueDateTitle', {
        kind: payment ? t(`project:payment.kinds.${payment.kind}`) : '',
      })}
    >
      <Form form={form} formId={PAYMENT_DUE_DATE_FORM_ID} onSubmit={onSubmit}>
        <DatePickerField label={t('project:payment.dueDate')} name="dueDate" />
      </Form>
    </Dialog>
  );
};

export default PaymentDueDateDialog;
