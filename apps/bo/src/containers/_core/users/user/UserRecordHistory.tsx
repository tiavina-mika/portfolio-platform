import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Items from '@/components/Items';
import SectionFooter from '@/components/SectionFooter';
import { IUser } from '@/types/_core/user.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

type Props = {
  user: IUser;
};

/**
 * The life of the record itself: when and by whom it was created, when it last changed, and how
 * often it was read. What the team did to the account is not here — it is in the audit log, which
 * is what the note under it says.
 */
const UserRecordHistory = ({ user }: Props) => {
  const { t } = useTranslation(['user']);

  // the pointers arrive as the JSON of the account they point at, not as Parse objects
  const creator = (user as IUser & { createdBy?: IUser }).createdBy;
  const createdBy = creator && creator.id !== user.id
    ? t('user:detail.history.byAdmin', { name: getUserFullName(creator) })
    : t('user:detail.history.byMember');

  const views = user.seenCount
    ? t('user:detail.history.viewsSummary', {
      count: user.seenCount,
      date: displayDate(user.lastSeenAt ?? user.seenAt),
    })
    : t('user:detail.history.noView');

  return (
    <Stack>
      <Items
        items={[
          {
            label: t('user:detail.history.creation'),
            value: `${displayDate(user.createdAt)} · ${createdBy}`,
          },
          { label: t('user:detail.history.lastUpdate'), value: displayDate(user.updatedAt) },
          { label: t('user:detail.history.views'), value: views },
        ]}
      />
      <SectionFooter note={t('user:detail.history.note')} />
    </Stack>
  );
};

export default UserRecordHistory;
