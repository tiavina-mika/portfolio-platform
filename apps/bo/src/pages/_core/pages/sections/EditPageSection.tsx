import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiTable } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import PageSectionForm from '@/containers/_core/pages/pageSection/PageSectionForm';
import { useProtect } from '@/hooks/_core/useProtect';
import { goToPage } from '@/redux/actions/_core/page.action';
import {
  createOrUpdatePageSection,
  deletePageSection,
  goToAddPageSection,
  goToPageSection,
  goToPageSections,
} from '@/redux/actions/_core/pageSection.action';
import { getPagePageSelector, getPageSectionSelector } from '@/redux/reducers/_core/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { PageSectionInput } from '@/types/_core/page.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

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

  const sectionTitle = getTranslatedField(section.translated, locale, 'title');

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
    await dispatch(deletePageSection(section.id));
    handleGoToList();
  };

  const handleGoToPage = () => {
    if (!canFind) return;
    navigate(goToPage(page.id));
  };

  // leaving without saving goes back to where the section is read, as saving does
  const handleCancel = () => {
    navigate(goToPageSection(section.id));
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
          label={sectionTitle}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onPreview={handlePreview}
          menus={[
            {
              label: t('cms:goToPage'),
              onClick: handleGoToPage,
              display: canFind,
              icon: <FiTable />,
            },
          ]}
        />
      )}
      title={(
        <>
          {t('cms:editSectionForPage', {
            title: sectionTitle,
            pageTitle: getTranslatedField(page.translated, locale, 'title') + ' (' + getTranslatedField(page.translated, locale, 'name') + ')',
          })}
          <PublishedChip published={section.active} />
        </>
      )}
    >
      <Head title={t('cms:editPageSection', { title: sectionTitle })} />

      <PageSectionForm
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        section={section}
      />
    </Layout>
  );
};

export default EditPageSection;
