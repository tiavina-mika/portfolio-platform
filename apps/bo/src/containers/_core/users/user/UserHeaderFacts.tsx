import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import StatusDot from '@/components/StatusDot';
import { USER_PAGE_FACTS_GAP } from '@/constants/_core/ui/entity.constants';
import { IUser } from '@/types/_core/user.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getFullPhoneNumber } from '@/utils/_core/user.utils';

type Props = {
  user: IUser;
  // what a domain adds about the member (driver, passenger or both), drawn after the contacts
  domainFacts?: ReactNode;
};

const classes = {
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: USER_PAGE_FACTS_GAP,
  },
};

/**
 * The line under the name: whether the member is reachable right now, how to reach them (and
 * whether that way is verified), what they use the platform for and since when. A deleted account
 * has no contact left to show — only the fact that it was hidden.
 */
const UserHeaderFacts = ({ user, domainFacts }: Props) => {
  const { t } = useTranslation(['user']);
  const isDeleted = !!user.deleted;
  const isOnline = !!user.isOnline && !isDeleted;
  const { email } = user;
  const phone = user.phone ? getFullPhoneNumber(user.phone) : '';

  const renderContact = (value: string, isVerified: boolean) => (
    <Typography component="span" variant="body2">
      {value}
      {!isVerified && (
        <Typography color="warning.main" component="span" variant="body2">
          {' · '}
          {t('user:detail.header.notVerified')}
        </Typography>
      )}
    </Typography>
  );

  return (
    <Box css={classes.root}>
      <StatusDot
        color={isOnline ? 'success' : 'default'}
        label={isOnline ? t('user:detail.header.online') : t('user:detail.header.offline')}
      />
      {isDeleted
        ? <Typography color="textSecondary" variant="body2">{t('user:detail.header.emailHidden')}</Typography>
        : (
          <>
            {!!email && renderContact(email, !!user.emailVerified)}
            {!!phone && renderContact(phone, !!user.phoneVerified)}
          </>
        )}
      {domainFacts}
      <Typography color="textSecondary" variant="body2">
        {t('user:detail.header.memberSince', { date: displayDate(user.createdAt, false) })}
      </Typography>
    </Box>
  );
};

export default UserHeaderFacts;
