import Chip from '@mui/material/Chip';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiTable } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PageSectionForm from '@/containers/_core/pages/pageSection/PageSectionForm';
import { useProtect } from '@/hooks/_core/useProtect';
import { goToPage } from '@/redux/actions/_core/page.action';
import { createOrUpdatePageSection, goToPageSections } from '@/redux/actions/_core/pageSection.action';
import { getPagePageSelector } from '@/redux/reducers/_core/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { PageSectionInput } from '@/types/_core/page.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

const CreatePageSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  const {
    canFind,
  } = useProtect('Page');

  const page = useSelector(getPagePageSelector);
  const locale = useSelector(getSettingsLocaleSelector);

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToPageSections());
  };

  const handleSubmit = async (values: PageSectionInput) => {
    if (!page.id) return;
    await dispatch(createOrUpdatePageSection(page.id, null, values));
    navigate(goToPage(page.id));
  };

  const handleGoToPage = () => {
    if (!canFind) return;
    navigate(goToPage(page.id));
  };

  return (
    <Layout
      isCard={false}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          menus={[
            {
              label: t('cms:goToPage'),
              onClick: handleGoToPage,
              display: true,
              icon: <FiTable />,
            },
          ]}
        />
      )}
      title={(
        <>
          {t('cms:createSectionForPage', {
            title: getTranslatedField(page.translated, locale, 'title') + ' (' + getTranslatedField(page.translated, locale, 'name') + ')',
          })}
          {/* nothing is on the site yet: the section is a draft until it is first saved */}
          <Chip color="warning" label={t('cms:articleStatus.draft')} size="small" />
        </>
      )}
    >
      <Head title={t('cms:createPageSection')} />
      <PageSectionForm onCancel={handleGoToPage} onSubmit={handleSubmit} />
    </Layout>
  );
};

export default CreatePageSection;
