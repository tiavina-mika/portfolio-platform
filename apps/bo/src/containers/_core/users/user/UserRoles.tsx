import {
  Alert, Button, Chip, Skeleton, Stack, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FiPlus } from 'react-icons/fi';

import SectionFooter from '@/components/SectionFooter';
import {
  ROLE_ADD_CHIP_FONT_SIZE, ROLE_CHIP_SKELETON_COUNT, ROLE_CHIP_SKELETON_WIDTH,
} from '@/constants/_core/ui/entity.constants';
import { CHIP_HEIGHT } from '@/constants/_core/ui/ui.constants';
import RolesChip from '@/containers/_core/users/RolesChip';
import { IRole, IRolesDelegation } from '@/types/_core/role.type';

type Props = {
  roles: IRole[];
  loading: boolean;
  // left out for an account that cannot change posts: no "+" and no cross are drawn
  onAdd?: () => void;
  onRemove?: (role: IRole) => void;
  // why the posts cannot be changed by the signed-in account, when it could otherwise give posts
  lock?: IRolesDelegation['lock'];
  // the posts of the signed-in account that give it that right, named in the notice of a locked account
  staffRoleLabels?: string[];
};

/**
 * The posts a back-office account holds. They are read after the account is on screen: until they
 * are in, placeholders stand where they will sit rather than the "holds no post" line.
 */
const UserRoles = ({
  roles, loading, onAdd, onRemove, lock, staffRoleLabels = [],
}: Props) => {
  const { t } = useTranslation(['user']);

  const renderRoles = () => {
    if (loading) {
      return (
        <Stack direction="row" spacing={1}>
          {Array.from({ length: ROLE_CHIP_SKELETON_COUNT }).map((_, index) => (
            <Skeleton
              height={CHIP_HEIGHT}
              key={index}
              variant="rounded"
              width={ROLE_CHIP_SKELETON_WIDTH}
            />
          ))}
        </Stack>
      );
    }

    if (roles.length > 0) {
      return (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <RolesChip onRemove={onRemove} roles={roles} />
          {onAdd && (
            <Chip
              color="primary"
              label="+"
              onClick={onAdd}
              sx={{ fontSize: ROLE_ADD_CHIP_FONT_SIZE }}
            />
          )}
        </Stack>
      );
    }

    return (
      <Stack spacing={1}>
        <Typography color="textSecondary" variant="body2">{t('user:role.userHasNotPost')}</Typography>
        {onAdd && (
          <div>
            <Button onClick={onAdd} size="small" startIcon={<FiPlus />}>{t('user:role.addPost')}</Button>
          </div>
        )}
      </Stack>
    );
  };

  const getLockMessage = (reason: NonNullable<Props['lock']>): string => {
    if (reason === 'ownAccount') return t('user:detail.roles.lockOwnAccount');
    if (reason === 'staffAccount') return t('user:detail.roles.lockStaffAccount');

    return t('user:detail.roles.lockHighestRoleAccount', {
      count: staffRoleLabels.length,
      roles: staffRoleLabels.join(', '),
    });
  };

  // said once the posts are in, so the notice does not stand over placeholders
  const renderLock = () => {
    if (!lock || loading) return null;

    return <Alert role="status" severity="info">{getLockMessage(lock)}</Alert>;
  };

  return (
    <Stack spacing={1}>
      {renderLock()}
      {renderRoles()}
      <SectionFooter note={t('user:detail.roles.note')} />
    </Stack>
  );
};

export default UserRoles;
