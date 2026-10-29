import { Typography } from '@mui/material';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Avatar from '@/components/Avatar';
import Head from '@/components/Head';
import Items from '@/components/Items';
import Layout from '@/components/layouts/Layout';
import ProfileEditUserInfo from '@/containers/profile/ProfileEditUserInfo';
import ProfileEditUserPassword from '@/containers/profile/ProfileEditUserPassword';
import ProfilePicUploadButton from '@/containers/profile/ProfilePicUploadButton';
import { getAppCurrentUserSelector } from '@/redux/reducers/app.reducer';
import { ISelectOption } from '@/types/app.type';
import { PREVIEW_PAGE_GRID } from '@/utils/constants';

const Profile = () => {
  const user = useSelector(getAppCurrentUserSelector);
  const {
    t,
  } = useTranslation();

  const title = t('common:myProfile');

  const userDetailsItems: ISelectOption<string | undefined>[] = [
    {
      label: t('user:lastName'),
      value: user.get('lastName'),
    },
    {
      label: t('user:firstName'),
      value: user.get('firstName'),
    },
  ];

  const accountInformationItems: ISelectOption<string | ReactNode>[] = [
    {
      label: t('user:email'),
      value: user.get('email'),
    },
    {
      label: t('user:password'),
      value: (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>********</Typography>
          <ProfileEditUserPassword />
        </Stack>
      ),
    },
  ];

  return (
    <Layout isCard={false} title={title}>
      <Head title={title} />
      <Grid container spacing={PREVIEW_PAGE_GRID.spacing}>
        <Grid
          size={PREVIEW_PAGE_GRID.left}
        >
          <Stack spacing={3}>
            <Layout
              actions={<ProfileEditUserInfo />}
              actionsEmplacement="content"
              cardTitle={t('user:detailsAboutYou')}
            >
              <Items items={userDetailsItems} />
            </Layout>
            <Layout cardTitle={t('user:accountInformation')}>
              <Items items={accountInformationItems} />
            </Layout>
          </Stack>
        </Grid>

        <Grid
          size={PREVIEW_PAGE_GRID.right}
          sx={{ order: { xs: -1, lg: 1 } }}
        >
          <Layout>
            <Box className="flexCenter">
              <Badge
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={<ProfilePicUploadButton />}
                overlap="circular"
              >
                <Avatar size={64} user={user} />
              </Badge>
            </Box>
          </Layout>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Profile;
