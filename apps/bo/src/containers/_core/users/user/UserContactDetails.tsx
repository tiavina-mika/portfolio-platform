import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Items from '@/components/Items';
import StatusDot from '@/components/StatusDot';
import { USER_DETAIL_VALUE_GAP } from '@/constants/_core/ui/entity.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { IUser } from '@/types/_core/user.type';
import { getFullAddressName } from '@/utils/_core/address.utils';
import { getFullPhoneNumber } from '@/utils/_core/user.utils';

type Props = {
  user: IUser;
};

const classes = {
  value: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: USER_DETAIL_VALUE_GAP,
  },
};

/**
 * How to reach the member, and whether each way was proven theirs: support writes to an unverified
 * email or calls an unverified number knowing it may not be them. The payment numbers are the ones
 * payouts and refunds are sent to — not necessarily the contact number. A deleted account's contacts
 * were erased with it.
 */
const UserContactDetails = ({ user }: Props) => {
  const { t } = useTranslation(['user']);
  const isDeleted = !!user.deleted;

  const renderVerified = (
    value: string,
    isVerified: boolean,
    verifiedLabel: string,
    notVerifiedLabel: string
  ) => (
    <Box component="span" css={classes.value}>
      <span>{value}</span>
      <StatusDot
        color={isVerified ? 'success' : 'warning'}
        label={isVerified ? verifiedLabel : notVerifiedLabel}
      />
    </Box>
  );

  const paymentPhones = (user.paymentPhones ?? []).map(getFullPhoneNumber).filter(Boolean);

  const items: ISelectOption<ReactNode>[] = [
    {
      label: t('user:email'),
      /*
       * never the username: a member who signed up by phone has no email, and says so rather than
       * showing their number twice under a label that is not theirs
       */
      value: isDeleted
        ? t('user:detail.header.emailHidden')
        : user.email
          ? renderVerified(
            user.email, !!user.emailVerified, t('user:emailVerified'), t('user:emailNotVerified')
          )
          : t('user:detail.contact.noEmail'),
    },
    {
      label: t('user:contactPhone'),
      value: user.phone && renderVerified(
        getFullPhoneNumber(user.phone),
        !!user.phoneVerified,
        t('user:phoneVerified'),
        t('user:phoneNotVerified')
      ),
      hide: isDeleted,
    },
    {
      label: t('user:paymentPhone'),
      value: paymentPhones.length > 0 ? paymentPhones.join(', ') : t('user:detail.contact.noPaymentPhone'),
      hide: isDeleted,
    },
    {
      label: t('user:address'),
      value: user.address ? getFullAddressName(user.address, true) : '',
      hide: isDeleted,
    },
  ];

  return <Items items={items} />;
};

export default UserContactDetails;
