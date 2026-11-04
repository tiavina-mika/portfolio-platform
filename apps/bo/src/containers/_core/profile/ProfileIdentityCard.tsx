import {
  Badge, Card, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Avatar from '@/components/Avatar';
import {
  PROFILE_AVATAR_FONT_SIZE, PROFILE_AVATAR_SIZE, PROFILE_IDENTITY_GAP, PROFILE_IDENTITY_PADDING_Y,
  SETTINGS_ROW_LABEL_GAP, SETTINGS_ROW_PADDING_X,
} from '@/constants/_core/ui/entity.constants';
import ProfilePicUploadButton from '@/containers/_core/profile/ProfilePicUploadButton';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  // the one place the reader is looked at rather than read: picture, name, address, nothing else
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: `${PROFILE_IDENTITY_GAP}px`,
    padding: `${PROFILE_IDENTITY_PADDING_Y}px ${SETTINGS_ROW_PADDING_X}px`,
  },
  identity: { textAlign: 'center' as const },
  // caption renders as a span — the address is its own line under the name, not a continuation of it
  email: { display: 'block', marginTop: `${SETTINGS_ROW_LABEL_GAP}px` },
  avatar: { fontSize: PROFILE_AVATAR_FONT_SIZE, fontWeight: 600 },
};

/**
 * Who the reader is, drawn once at the top of the column beside the account: the picture the rest
 * of the back-office shows them by, and the name and address it is attached to.
 */
const ProfileIdentityCard = () => {
  const {
    t,
  } = useTranslation();
  const user = useSelector(getAppCurrentUserSelector);

  return (
    <Card css={classes.card}>
      <Badge
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={<ProfilePicUploadButton />}
        overlap="circular"
      >
        <Avatar size={PROFILE_AVATAR_SIZE} sx={classes.avatar} user={user} />
      </Badge>
      <div css={classes.identity}>
        <Typography variant="h5">{getUserFullName(user)}</Typography>
        <Typography css={classes.email} variant="caption">{user.email}</Typography>
      </div>
      <Typography variant="caption">{t('user:profilePicture')}</Typography>
    </Card>
  );
};

export default ProfileIdentityCard;
