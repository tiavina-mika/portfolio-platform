import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import UserCell, { UserCellProps } from '@/components/UserCell';

type Props = {
} & Pick<UserCellProps, 'position' | 'user'>;

/**
 * One side of a payment: the member it concerns, or the platform's own account when there is none
 * — a payout has no payer, a collection no receiver.
 */
const PaymentUser = ({ user, position }: Props) => {
  const { t } = useTranslation(['user']);

  if (user) {
    return <UserCell position={position} user={user} />;
  }

  /*
   * named the way the rest of the ledger names it, and translated: this cell printed a bare "APP"
   * while the list header, the detail page and the refund dialog all said "compte marchand"
   */
  return <Typography variant="body2">{t('user:payments.merchantAccount')}</Typography>;
};

export default PaymentUser;
