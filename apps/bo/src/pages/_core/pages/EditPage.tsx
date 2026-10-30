import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import PageForm from '@/containers/_core/pages/pageForms/PageForm';
import { useProtect } from '@/hooks/_core/useProtect';
import { loadContentVersions, restoreContentVersion } from '@/redux/actions/_core/contentVersion.action';
import {
  deletePage, createOrUpdatePage, goToAddPage, goToPage, goToPages,
} from '@/redux/actions/_core/page.action';
import { getContentVersionsSelector } from '@/redux/reducers/_core/contentVersion.reducer';
import { getPagePageSelector } from '@/redux/reducers/_core/page.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IPageInput } from '@/types/_core/page.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

const EditPage = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const page = useSelector(getPagePageSelector);
  const versions = useSelector(getContentVersionsSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const {
    canPreview, canDelete, canCreate, canFind, canEdit,
  } = useProtect('Page');

  /*
   * the history shares the form's preview column instead of standing as a tab of the whole screen,
   * so it is loaded with the page rather than when a tab is opened
   */
  useEffect(() => {
    if (!page) return;
    dispatch(loadContentVersions('Page', page.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.id, dispatch]);

  if (!page) return null;

  const pageName = getTranslatedField(page.translated, locale, 'name');

  const handleRestoreVersion = (versionId: string) => {
    dispatch(restoreContentVersion('Page', page.id, versionId));
  };

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
    await dispatch(createOrUpdatePage({
      id: page.id,
      values,
      expectedUpdatedAt: page.updatedAt,
      onSuccess: (id: string) => navigate(goToPage(id)),
    }));
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
        <>
          {t('cms:editPage', { title: pageName })}
          <PublishedChip published={page.active} />
        </>
      )}
    >
      <Head title={t('cms:editPage', { title: pageName })} />

      <PageForm
        canRestoreVersion={canEdit}
        onRestoreVersion={handleRestoreVersion}
        onSubmit={handleSubmitPage}
        page={page}
        versions={versions}
      />
    </Layout>
  );
};

export default EditPage;
