import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import ArticleForm from '@/containers/articles/ArticleForm';
import { useProtect } from '@/hooks/useProtect';
import {
  createOrUpdateArticle,
  deleteArticle, goToAddArticle, goToArticle, goToArticles,
} from '@/redux/actions/article.action';
import { getArticleArticleSelector } from '@/redux/reducers/article.reducer';
import { IArticleInput } from '@/types/article.type';

const EditArticle = () => {
  const {
    t,
  } = useTranslation(['common', 'user', 'cms']);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const article = useSelector(getArticleArticleSelector);
  const {
    canPreview, canDelete, canCreate, canFind,
  } = useProtect('Article');

  if (!article) return null;

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
    if (!article) return;
    const error = await dispatch(createOrUpdateArticle(article.id, values));

    if (error) return;

    navigate(goToArticle(article.id));
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
        <span css={{ marginRight: 10 }}>{t('cms:editArticle', { title: article.id })}</span>
      )}
    >
      <Head title={t('cms:editArticle', { title: article.id })} />

      <ArticleForm
        article={article}
        onSubmit={handleSubmitArticle}
      />
    </Layout>
  );
};

export default EditArticle;
