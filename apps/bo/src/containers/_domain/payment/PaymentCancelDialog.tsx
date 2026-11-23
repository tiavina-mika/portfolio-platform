import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import { IPayment } from '@/types/_domain/payment.type';

type Props = {
  // the payment about to be cancelled; the dialog is closed while there is none
  payment: IPayment | null;
  onClose: () => void;
  onConfirm: (payment: IPayment) => void;
};

/**
 * Asks before correcting a payment: it cannot be undone. The payment stays in the history, cancelled, and
 * a new payment of the same part and the same amount, still to be paid, takes its place.
 */
const PaymentCancelDialog = ({ payment, onClose, onConfirm }: Props) => {
  const { t } = useTranslation(['project']);

  return (
    <Dialog
      fullWidth
      description={t('project:payment.cancelDescription')}
      maxWidth="xs"
      onPrimaryButtonAction={() => payment && onConfirm(payment)}
      open={!!payment}
      primaryButtonText={t('project:payment.actions.cancel')}
      toggle={onClose}
      title={t('project:payment.cancelTitle', {
        kind: payment ? t(`project:payment.kinds.${payment.kind}`) : '',
      })}
    />
  );
};

export default PaymentCancelDialog;
