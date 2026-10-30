import { Box, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Avatar from '@/components/Avatar';
import { USER_PAGE_AVATAR_SIZE, USER_PAGE_TITLE_GAP } from '@/constants/_core/ui/entity.constants';
import { IUser } from '@/types/_core/user.type';

type Props = {
  user: IUser;
  // the name the page is titled by — the one held before deletion, for a deleted account
  name: string;
  isVerified: boolean;
  isSuspended: boolean;
  isPermanentlyBanned: boolean;
  isFromBO: boolean;
};

const classes = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: USER_PAGE_TITLE_GAP,
  },
};

/**
 * Who the record is about, and the few facts that change how every block under it is read: whether
 * the account is verified, whether it is kept out of the platform, whether it was deleted, and
 * whether it is a back-office account.
 */
const UserPageTitle = ({
  user, name, isVerified, isSuspended, isPermanentlyBanned, isFromBO,
}: Props) => {
  const { t } = useTranslation(['user']);
  const isDeleted = !!user.deleted;

  const renderVerification = () => (isVerified
    ? (
      <Chip
        color="success"
        label={t('user:detail.header.verified')}
        size="small"
        variant="outlined"
      />
    )
    : (
      <Chip
        color="warning"
        label={t('user:detail.header.unverified')}
        size="small"
        variant="outlined"
      />
    ));

  return (
    <Box component="span" css={classes.root}>
      <Avatar size={USER_PAGE_AVATAR_SIZE} user={user} />
      <span>{name}</span>
      {!isDeleted && renderVerification()}
      {isDeleted && <Chip color="error" label={t('user:accountDeleted')} size="small" />}
      {isPermanentlyBanned && <Chip color="error" label={t('user:detail.header.banned')} size="small" />}
      {isSuspended && !isPermanentlyBanned && (
        <Chip color="warning" label={t('user:detail.header.suspended')} size="small" />
      )}
      {isFromBO && <Chip label={t('user:detail.header.backOffice')} size="small" variant="outlined" />}
    </Box>
  );
};

export default UserPageTitle;
