import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card, Grid, Stack, styled,
} from '@mui/material';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import SelectField from '@/components/form/fields/SelectField';
import Form from '@/components/form/Form';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { locales } from '@/config/i18n';
import { loadZodI18nLocale } from '@/config/i18n/zod-i18n';
import AppContentsForm from '@/containers/settings/app/AppContentsForm';
import AppMainImagesForm from '@/containers/settings/app/AppMainImagesForm';
import UploadCVForm from '@/containers/settings/app/UploadCVForm';
import SettingsTabs from '@/containers/settings/SettingsTabs';
import SettingsTheme from '@/containers/settings/SettingsTheme';
import { changeSettings } from '@/redux/actions/app.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { settingsRoute } from '@/routes/protected/private.routes';
import { ISettingsInput } from '@/types/app.type';
import { Locale, SettingsTab, SettingsTabEnum } from '@/types/setting.type';
import { RESPONSIVE_BREAKPOINT } from '@/utils/constants';
import { renderLocaleLabel } from '@/utils/settings.utils';
import { settingsSchema } from '@/validations/app.validations';

const StyledGridContainer = styled(Grid)(({
  theme,
}) => ({ '& .MuiGrid-item': { [theme.breakpoints.down(RESPONSIVE_BREAKPOINT)]: { paddingLeft: 0 } } }));

const classes = {
  card: {
    padding: 18,
    paddingTop: 12,
  },
};
const Settings = () => {
  const {
    t,
  } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const router = useRouterState();
  const searchParams = settingsRoute.useSearch();
  const {
    tab = SettingsTabEnum.BO,
  } = searchParams;

  const title = t('settings');
  const locale = useSelector(getSettingsLocaleSelector);

  const form = useForm<ISettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { locale },
  });

  const {
    handleSubmit,
  } = form;

  const handleTabChange = (value: SettingsTab) => {
    const to = router.location.pathname;

    // not to change the tab if the value is the first tab
    if (value === SettingsTabEnum.BO) {
      navigate({ to, search: null } as any);
      return;
    }
    // add the tab value to url search params
    navigate({ to, search: { tab: value } } as any);
  };

  const onSubmitHandler: SubmitHandler<ISettingsInput> = async (values) => {
    await dispatch(changeSettings(values));
    await loadZodI18nLocale(values.locale as Locale);
  };

  const options = locales.map((locale: any) => ({ value: locale, label: renderLocaleLabel(locale) }));

  return (
    <Layout isCard={false} title={title}>
      <Head title={title} />
      <Stack spacing={2}>
        <SettingsTabs tab={tab as SettingsTab} onTabChange={handleTabChange} />
        <StyledGridContainer container spacing={2}>
          {tab === SettingsTabEnum.BO && (
            <>
              <Grid
                size={{
                  lg: 6,
                  xs: 12,
                }}
              >
                <Card css={classes.card}>
                  <Form
                    buttonDirection="row"
                    buttonFullWidth={false}
                    form={form}
                    onSubmit={handleSubmit(onSubmitHandler)}
                  >
                    <SelectField label={t('languages')} name="locale" options={options} />
                  </Form>
                </Card>
              </Grid>
              <Grid
                size={{
                  lg: 6,
                  xs: 12,
                }}
              >
                <Card css={classes.card}>
                  <SettingsTheme />
                </Card>
              </Grid>
            </>
          )}
          {tab === SettingsTabEnum.APP && (
            <Grid
              size={{
                lg: 6,
                xs: 12,
              }}
            >
              <Card css={classes.card}>
                <UploadCVForm />
              </Card>
            </Grid>
          )}
          {tab === SettingsTabEnum.WEBSITE && (
            <>
              <Grid
                size={{
                  lg: 6,
                  xs: 12,
                }}
              >
                <AppContentsForm />
              </Grid>
              <Grid
                size={{
                  lg: 6,
                  xs: 12,
                }}
              >
                <AppMainImagesForm />
              </Grid>
            </>
          )}
        </StyledGridContainer>
      </Stack>
    </Layout>
  );
};

export default Settings;
