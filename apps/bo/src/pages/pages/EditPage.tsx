import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PageForm from '@/containers/pages/pageForms/PageForm';
import { useProtect } from '@/hooks/useProtect';
import {
  deletePage, createOrUpdatePage, goToAddPage, goToPage, goToPages,
} from '@/redux/actions/page.action';
import { getPagePageSelector } from '@/redux/reducers/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { IPageInput } from '@/types/page.type';
import { getTranslatedField } from '@/utils/settings.utils';

const EditPage = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const page = useSelector(getPagePageSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const {
    canPreview, canDelete, canCreate, canFind,
  } = useProtect('Page');

  if (!page) return null;

  const handlePreview = () => {
    if (!canPreview) return;
    navigate(goToPage(page.id));
  };

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToPages());
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    await dispatch(deletePage(page.id));
    handleGoToList();
  };

  const handleCreate = () => {
    if (!canCreate) return;
    navigate(goToAddPage());
  };

  const handleSubmitPage = async (values: IPageInput) => {
    if (!page) return;
    const error = await dispatch(createOrUpdatePage(page.id, values));

    if (error) return;
    navigate(goToPage(page.id));
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
        <span css={{ marginRight: 10 }}>{t('cms:editPage', { title: getTranslatedField(page.get('translated'), locale, 'name') })}</span>
      )}
    >
      <Head title={t('cms:editPage', { title: page.id })} />

      <PageForm
        page={page}
        onSubmit={handleSubmitPage}
      />
    </Layout>
  );
};

export default EditPage;
