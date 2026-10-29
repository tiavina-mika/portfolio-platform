import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { useProtect } from '@/hooks/useProtect';
import { createOrUpdateArticle, goToArticle, goToArticles } from '@/redux/actions/article.action';
import { getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { getArticleArticleSelector } from '@/redux/reducers/article.reducer';
import { IArticleInput } from '@/types/article.type';

import ArticleForm from '../../containers/articles/ArticleForm';

const CreateArticle = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  const {
    canFind,
  } = useProtect('Article');

  const newArticle = useSelector(getArticleArticleSelector);
  const error = useSelector(getAppErrorSelector);

  useEffect(() => {
    if (error) return;
    if (!newArticle) return;
    navigate(goToArticle(newArticle.id));
  }, [newArticle, navigate]);

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToArticles());
  };

  const handleSubmitArticle = (values: IArticleInput) => {
    dispatch(createOrUpdateArticle(null, values));
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
