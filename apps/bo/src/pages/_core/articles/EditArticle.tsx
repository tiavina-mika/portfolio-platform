import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import ArticleForm from '@/containers/_core/articles/articleForms/ArticleForm';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import { useProtect } from '@/hooks/_core/useProtect';
import {
  createOrUpdateArticle,
  deleteArticle, goToAddArticle, goToArticle, goToArticles,
} from '@/redux/actions/_core/article.action';
import { loadContentVersions, restoreContentVersion } from '@/redux/actions/_core/contentVersion.action';
import { getArticleArticleSelector } from '@/redux/reducers/_core/article.reducer';
import { getContentVersionsSelector } from '@/redux/reducers/_core/contentVersion.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IArticleInput } from '@/types/_core/article.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

const EditArticle = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const article = useSelector(getArticleArticleSelector);
  const versions = useSelector(getContentVersionsSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const {
    canPreview, canDelete, canCreate, canFind, canEdit,
  } = useProtect('Article');

  /*
   * the history shares the form's preview column instead of standing as a tab of the whole screen,
   * so it is loaded with the article rather than when a tab is opened
   */
  useEffect(() => {
    if (!article) return;
    dispatch(loadContentVersions('Article', article.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id, dispatch]);

  if (!article) return null;

  const articleTitle = getTranslatedField(article.translated, locale, 'title');

  const handleRestoreVersion = (versionId: string) => {
    dispatch(restoreContentVersion('Article', article.id, versionId));
  };

  const handlePreview = () => {
    if (!canPreview) return;
    navigate(goToArticle(article.id));
  };

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToArticles());
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    await dispatch(deleteArticle(article.id));
    handleGoToList();
  };

  const handleCreate = () => {
    if (!canCreate) return;
    navigate(goToAddArticle());
  };

  const handleSubmitArticle = async (values: IArticleInput) => {
    await dispatch(createOrUpdateArticle({
      id: article.id,
      values,
      expectedUpdatedAt: article.updatedAt,
      onSuccess: (id: string) => navigate(goToArticle(id)),
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
          {t('cms:editArticle', { title: articleTitle })}
          <PublishedChip published={article.active} />
        </>
      )}
    >
      <Head title={t('cms:editArticle', { title: articleTitle })} />

      <ArticleForm
        article={article}
        canRestoreVersion={canEdit}
        onRestoreVersion={handleRestoreVersion}
        onSubmit={handleSubmitArticle}
        versions={versions}
      />
    </Layout>
  );
};

export default EditArticle;
