import {
  Box, Card, CardContent, CardHeader, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { CHIP_ROW_GAP } from '@/constants/_core/ui/ui.constants';
import RolesChip from '@/containers/_core/users/RolesChip';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';

const classes = {
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${CHIP_ROW_GAP}px`,
  },
  hint: { textWrap: 'pretty' as const },
};

/**
 * The roles the reader holds. They are shown and not offered: a role is granted from the roles page
 * by someone who administers the back-office, never by the account it applies to — so the card ends
 * on the sentence saying where that happens instead of on an action.
 */
const ProfileRolesCard = () => {
  const {
    t,
  } = useTranslation();
  const roles = useSelector(getRoleCurrentUserRolesSelector);

  return (
    <Card>
      <CardHeader title={t('user:role.roles')} />
      <CardContent>
        <Box css={classes.content}>
          <RolesChip roles={roles} />
          <Typography css={classes.hint} variant="caption">
            {t('user:role.rolesAssignedByAdmin')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileRolesCard;
