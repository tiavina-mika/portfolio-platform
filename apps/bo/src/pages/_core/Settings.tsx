import {
  Box, Button, Typography, type Theme,
} from '@mui/material';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import {
  APP_CONTENTS_FORM_ID, APP_MAIN_IMAGES_FORM_ID, DEFAULT_SETTINGS_SECTION,
} from '@/constants/_core/settings.constants';
import { SETTINGS_RAIL_WIDTH } from '@/constants/_core/ui/entity.constants';
import { CONTENT_GAP } from '@/constants/_core/ui/page.constants';
import AppContentsForm from '@/containers/_core/settings/app/AppContentsForm';
import AppMainImagesForm from '@/containers/_core/settings/app/AppMainImagesForm';
import SettingsAppearancePanel from '@/containers/_core/settings/SettingsAppearancePanel';
import SettingsLanguagePanel from '@/containers/_core/settings/SettingsLanguagePanel';
import SettingsSectionsRail from '@/containers/_core/settings/SettingsSectionsRail';
import { getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import { settingsRoute } from '@/routes/protected/_core/private.routes';
import { ISettingsSearchParams } from '@/types/_core/app.type';
import { SettingsSection, SettingsSectionEnum } from '@/types/_core/setting.type';

// the form the page head's save button submits, per website section
const SECTION_FORM_IDS: Partial<Record<SettingsSection, string>> = {
  [SettingsSectionEnum.DETAILS]: APP_CONTENTS_FORM_ID,
  [SettingsSectionEnum.IMAGES]: APP_MAIN_IMAGES_FORM_ID,
};

const classes = {
  /*
   * the rail names the sections, the column beside it draws the open one. Under `md` there is not
   * enough width for both, so the rail becomes the band the panel is opened from and stacks on top
   */
  grid: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${SETTINGS_RAIL_WIDTH}px minmax(0, 1fr)`,
    gap: CONTENT_GAP,
    alignItems: 'start',
    [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
  }),
};

const Settings = () => {
  const {
    t,
  } = useTranslation();
  const navigate = useNavigate();
  const router = useRouterState();
  const loading = useSelector(getAppLoadingSelector);

  const searchParams: ISettingsSearchParams = settingsRoute.useSearch();
  // the URL carries a free string, so an unknown value falls back to the section the page opens on
  const section = (searchParams.section ?? DEFAULT_SETTINGS_SECTION) as SettingsSection;

  /*
   * only the website sections carry a form, so the head states whether it still holds changes. The
   * back-office ones apply the moment a choice is picked and have nothing to save.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const title = t('settings');
  const formId = SECTION_FORM_IDS[section];

  const handleSectionChange = (value: SettingsSection) => {
    const to = router.location.pathname;

    setHasUnsavedChanges(false);

    // the first section is the one the page opens on — it needs no search param of its own
    if (value === DEFAULT_SETTINGS_SECTION) {
      navigate({ to, search: null } as any);
      return;
    }
    navigate({ to, search: { section: value } } as any);
  };

  /*
   * stable so the panels' effect only runs when their own dirty state actually changes, instead of
   * on every render of the page
   */
  const handleDirtyChange = useCallback((isDirty: boolean) => setHasUnsavedChanges(isDirty), []);

  const renderSectionActions = () => {
    if (!formId) return null;

    return (
      <>
        <Typography variant="caption">
          {hasUnsavedChanges
            ? t('unsavedChanges')
            : t('allChangesSaved')}
        </Typography>
        <Button
          disabled={!hasUnsavedChanges}
          form={formId}
          loading={loading}
          type="submit"
          variant="contained"
        >
          {t('save')}
        </Button>
      </>
    );
  };

  return (
    <Layout
      actions={renderSectionActions()}
      description={t('settingsDescription')}
      isCard={false}
      title={title}
    >
      <Head title={title} />
      <Box css={classes.grid}>
        <SettingsSectionsRail onSectionChange={handleSectionChange} section={section} />
        <div>
          {section === SettingsSectionEnum.LANGUAGES && <SettingsLanguagePanel />}
          {section === SettingsSectionEnum.APPEARANCE && <SettingsAppearancePanel />}
          {section === SettingsSectionEnum.DETAILS && (
            <AppContentsForm onDirtyChange={handleDirtyChange} />
          )}
          {section === SettingsSectionEnum.IMAGES && (
            <AppMainImagesForm onDirtyChange={handleDirtyChange} />
          )}
        </div>
      </Box>
    </Layout>
  );
};

export default Settings;
