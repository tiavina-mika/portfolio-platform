import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Items from '@/components/Items';
import { ISelectOption } from '@/types/_core/app.type';
import { IUserAuditLog } from '@/types/_core/auditLog.type';
import { IUser } from '@/types/_core/user.type';
import { DateType } from '@/types/_core/utils.type';
import { displayDate, getAgeByBirthday, getParseDateValue } from '@/utils/_core/date.utils';
import { getSexLabelByValue } from '@/utils/_core/user.utils';

type Props = {
  user: IUser;
  // what was kept of a deleted account when it was deleted — its name and original email are gone
  deletionAudit?: IUserAuditLog | null;
};

/**
 * Who the member says they are. Sex and date of birth also say how many times they were changed and
 * when last: they are the two fields a member could change to pass for someone else, and only the
 * count and the last date are kept, not the values they replaced.
 */
const UserDetails = ({ user, deletionAudit }: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const isDeleted = !!user.deleted;

  const getChangeHistory = (count: number | undefined, lastChangeAt: DateType | undefined): string => {
    if (!count) return t('user:detail.details.neverChanged');

    return t('user:detail.details.changedTimes', { count, date: displayDate(lastChangeAt, false) });
  };

  const withChangeHistory = (value: string, count?: number, lastChangeAt?: DateType): ReactNode => (
    value ? `${value} · ${getChangeHistory(count, lastChangeAt)}` : ''
  );

  const birthday = user.birthday ? getParseDateValue(user.birthday) as DateType : undefined;
  const birthdayLabel = birthday
    ? `${displayDate(birthday, false)} (${t('user:detail.details.age', {
      count: getAgeByBirthday(birthday),
    })})`
    : '';

  const items: ISelectOption<ReactNode>[] = [
    {
      label: t('user:firstName'),
      value: isDeleted ? deletionAudit?.fullNameBefore : user.firstName,
      hide: isDeleted && !deletionAudit?.fullNameBefore,
    },
    { label: t('user:lastName'), value: user.lastName, hide: isDeleted },
    {
      label: t('user:sex'),
      value: user.sex
        ? withChangeHistory(getSexLabelByValue(user.sex), user.sexChangeCount, user.lastSexChangeAt)
        : '',
    },
    {
      label: t('user:birthday'),
      value: withChangeHistory(birthdayLabel, user.birthdayChangeCount, user.lastBirthdayChangeAt),
    },
    { label: t('user:aboutTheUser'), value: user.aboutMe },
    { label: t('common:createdAt'), value: displayDate(user.createdAt) },
    { label: t('common:updatedAt'), value: displayDate(user.updatedAt) },
    { label: t('common:deletedAt'), value: displayDate(user.deletedAt), hide: !user.deletedAt },
    {
      label: t('user:originalEmail'),
      value: deletionAudit?.emailBefore,
      hide: !isDeleted || !deletionAudit?.emailBefore,
    },
    {
      label: t('user:deletionReason'),
      value: deletionAudit?.deletionReason ?? user.deletionReason,
      hide: !isDeleted && !user.deletionReason,
    },
  ];

  return <Items items={items} />;
};

export default UserDetails;
