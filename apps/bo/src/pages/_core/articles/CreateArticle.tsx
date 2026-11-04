import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import ArticleForm from '@/containers/_core/articles/articleForms/ArticleForm';
import { useProtect } from '@/hooks/_core/useProtect';
import { createOrUpdateArticle, goToArticle, goToArticles } from '@/redux/actions/_core/article.action';
import { IArticleInput } from '@/types/_core/article.type';


const CreateArticle = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  const {
    canFind,
  } = useProtect('Article');

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToArticles());
  };

  const handleSubmitArticle = (values: IArticleInput) => {
    dispatch(createOrUpdateArticle({
      id: null,
      values,
      onSuccess: (id: string) => navigate(goToArticle(id)),
    }));
  };

  return (
    <Layout
      isCard={false}
      actions={
        <ActionsMenu goToList={handleGoToList} />
      }
      title={(
        <span css={{ marginRight: 10 }}>{t('cms:newArticle')}</span>
      )}
    >
      <Head title={t('cms:createArticle')} />
      <ArticleForm
        onSubmit={handleSubmitArticle}
      />
    </Layout>
  );
};

export default CreateArticle;
