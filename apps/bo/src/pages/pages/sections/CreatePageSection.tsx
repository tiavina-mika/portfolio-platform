import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiTable } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PageSectionForm from '@/containers/pages/pageSection/PageSectionForm';
import { useProtect } from '@/hooks/useProtect';
import { goToPage } from '@/redux/actions/page.action';
import { createOrUpdatePageSection, goToPageSections } from '@/redux/actions/pageSection.action';
import { getPagePageSelector } from '@/redux/reducers/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { PageSectionInput } from '@/types/page.type';
import { getTranslatedField } from '@/utils/settings.utils';

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
      title={t('cms:createSectionForPage', {
        title: getTranslatedField(page.get('translated'), locale, 'title') + ' (' + getTranslatedField(page.get('translated'), locale, 'name') + ')',
      })}
    >
      <Head title={t('cms:createPageSection')} />
      <PageSectionForm onSubmit={handleSubmit} />
    </Layout>
  );
};

export default CreatePageSection;
