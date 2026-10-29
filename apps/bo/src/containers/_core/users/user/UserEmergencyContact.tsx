import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import EmptyData from '@/components/EmptyData';
import Items from '@/components/Items';
import SectionFooter from '@/components/SectionFooter';
import { IUser } from '@/types/_core/user.type';
import { getFullPhoneNumber } from '@/utils/_core/user.utils';

type Props = {
  emergencyContact: IUser['emergencyContact'];
};

/**
 * Who support calls if a trip goes wrong. Read-only here: the member alone chooses who is warned,
 * support only needs to know who to call.
 */
const UserEmergencyContact = ({ emergencyContact }: Props) => {
  const { t } = useTranslation(['user']);

  if (!emergencyContact) return <EmptyData title={t('user:emergencyContact.none')} />;

  return (
    <Stack>
      <Items
        items={[
          { label: t('user:emergencyContact.name'), value: emergencyContact.name },
          {
            label: t('user:emergencyContact.relationship'),
            value: t(`user:emergencyContact.relationships.${emergencyContact.relationship}`),
          },
          { label: t('user:emergencyContact.phone'), value: getFullPhoneNumber(emergencyContact.phone) },
        ]}
      />
      <SectionFooter note={t('user:detail.emergencyContact.note')} />
    </Stack>
  );
};

export default UserEmergencyContact;
