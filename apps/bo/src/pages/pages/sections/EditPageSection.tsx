import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PageSectionForm from '@/containers/pages/pageSection/PageSectionForm';
import { useProtect } from '@/hooks/useProtect';
import {
  createOrUpdatePageSection,
  deletePageSection,
  goToAddPageSection,
  goToPageSection,
  goToPageSections,
} from '@/redux/actions/pageSection.action';
import { getPagePageSelector, getPageSectionSelector } from '@/redux/reducers/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { PageSectionInput } from '@/types/page.type';
import { getTranslatedField } from '@/utils/settings.utils';

const EditPageSection = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const section = useSelector(getPageSectionSelector);
  const page = useSelector(getPagePageSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const {
    canPreview, canDelete, canCreate, canFind,
  } = useProtect('Page');

  if (!section) return null;

  const handlePreview = () => {
    if (!canPreview) return;
    navigate(goToPageSection(section.id));
  };

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToPageSections());
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    await dispatch(deletePageSection(section.id, page.id));
    handleGoToList();
  };

  const handleCreate = () => {
    if (!canCreate) return;
    navigate(goToAddPageSection(page.id));
  };

  const handleSubmit = async (values: PageSectionInput) => {
    if (!section) return;
    await dispatch(createOrUpdatePageSection(page.id, section, values));
    navigate(goToPageSection(section.id));
  };

  return (
    <Layout
      isCard={false}
      actions={(
        <ActionsMenu
          goToList={handleGoToList}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onPreview={handlePreview}
        />
      )}
      title={(
        <span css={{ marginRight: 10 }}>
          {t('cms:editSectionForPage', {
            title: getTranslatedField(section.get('translated'), locale, 'title'),
            pageTitle: getTranslatedField(page.get('translated'), locale, 'title') + ' (' + getTranslatedField(page.get('translated'), locale, 'name') + ')',
          })}
        </span>
      )}
    >
      <Head title={t('cms:editPageSection', { title: section.id })} />

      <PageSectionForm
        onSubmit={handleSubmit}
        section={section}
      />
    </Layout>
  );
};

export default EditPageSection;
