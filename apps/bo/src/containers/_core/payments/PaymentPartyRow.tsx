import MuiAvatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiBriefcase } from 'react-icons/fi';

import Avatar from '@/components/Avatar';
import { PAYMENT_PARTY_AVATAR_SIZE, PAYMENT_PARTY_GAP } from '@/constants/_core/ui/page.constants';
import { ICON_BUTTON_SMALL_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import { PaymentService } from '@/types/_core/payment.type';
import { IPhone, IUser } from '@/types/_core/user.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getPaymentServiceLabel } from '@/utils/_core/payment.utils';
import { getFullPhoneNumber, getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: `${PAYMENT_PARTY_GAP}px`,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
};

type Props = {
  // absent for the platform's own merchant account, which is nobody's account to open
  user?: IUser;
  phone?: IPhone;
  service?: PaymentService;
};

/**
 * One side of a payment: who it is, and the mobile money account the money left or reached — the
 * account is what a failure is taken up against, so it is stated with the name rather than on the
 * person's own page.
 */
const PaymentPartyRow = ({ user, phone, service }: Props) => {
  const { t } = useTranslation(['user']);

  const userId = user?.id ?? user?.objectId;
  const account = [
    user ? (phone && getFullPhoneNumber(phone)) : t('user:payments.merchantAccount'),
    getPaymentServiceLabel(service),
  ].filter(Boolean).join(' · ');

  return (
    <Box css={classes.root}>
      {user
        ? <Avatar size={PAYMENT_PARTY_AVATAR_SIZE} user={user} />
        : (
          <MuiAvatar sx={{ width: PAYMENT_PARTY_AVATAR_SIZE, height: PAYMENT_PARTY_AVATAR_SIZE }}>
            <FiBriefcase size={ICON_BUTTON_SMALL_ICON_SIZE} />
          </MuiAvatar>
        )}
      <Box css={classes.main}>
        <Typography noWrap variant="subtitle1">
          {user ? getUserFullName(user) : t('user:payments.merchantAccountName')}
        </Typography>
        <Typography noWrap variant="body2">{account || '—'}</Typography>
      </Box>
      {userId && (
        <Button
          component={RouterLink as any}
          params={{ id: userId }}
          size="small"
          to={`${PATH_NAMES.users}/$id`}
          variant="outlined"
        >
          {t('user:payments.viewAccount')}
        </Button>
      )}
    </Box>
  );
};

export default PaymentPartyRow;
