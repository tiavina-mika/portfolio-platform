import { Box, type Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { PROFILE_ASIDE_WIDTH, PROFILE_MAX_WIDTH } from '@/constants/_core/ui/entity.constants';
import { CONTENT_GAP } from '@/constants/_core/ui/page.constants';
import ProfileAccountCard from '@/containers/_core/profile/ProfileAccountCard';
import ProfileActivityCard from '@/containers/_core/profile/ProfileActivityCard';
import ProfileDetailsCard from '@/containers/_core/profile/ProfileDetailsCard';
import ProfileIdentityCard from '@/containers/_core/profile/ProfileIdentityCard';
import ProfileRolesCard from '@/containers/_core/profile/ProfileRolesCard';

const classes = {
  /*
   * what the account holds on the left, who holds it on the right. The two columns stop well before
   * a wide screen's right edge — a row of text stretched over the whole zone is read by moving the
   * head, and the identity column would drift away from the cards it belongs to. Under `lg` there
   * is no room for both, and the identity column goes back on top of what it names.
   */
  grid: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `minmax(0, 1fr) ${PROFILE_ASIDE_WIDTH}px`,
    gap: CONTENT_GAP,
    alignItems: 'start',
    width: '100%',
    maxWidth: PROFILE_MAX_WIDTH,
    [theme.breakpoints.down('lg')]: { gridTemplateColumns: '1fr' },
  }),
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: CONTENT_GAP,
    minWidth: 0,
  },
  aside: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: CONTENT_GAP,
    minWidth: 0,
    [theme.breakpoints.down('lg')]: { order: -1 },
  }),
};

const Profile = () => {
  const {
    t,
  } = useTranslation();

  const title = t('myProfile');

  return (
    <Layout
      description={t('user:profileDescription')}
      isCard={false}
      pretitle={t('account')}
      title={title}
    >
      <Head title={title} />
      <Box css={classes.grid}>
        <div css={classes.column}>
          <ProfileDetailsCard />
          <ProfileAccountCard />
        </div>
        <div css={classes.aside}>
          <ProfileIdentityCard />
          <ProfileRolesCard />
          <ProfileActivityCard />
        </div>
      </Box>
    </Layout>
  );
};

export default Profile;
