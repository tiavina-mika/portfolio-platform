import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { useProtect } from '@/hooks/useProtect';
import { createOrUpdatePage, goToPage, goToPages } from '@/redux/actions/page.action';
import { getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { getPagePageSelector } from '@/redux/reducers/page.reducer';
import { IPageInput } from '@/types/page.type';

import PageForm from '../../containers/pages/pageForms/PageForm';

const CreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  const {
    canFind,
  } = useProtect('Page');

  const error = useSelector(getAppErrorSelector);
  const newPage = useSelector(getPagePageSelector);

  useEffect(() => {
    if (error) return;
    if (!newPage) return;

    navigate(goToPage(newPage.id));
  }, [newPage, navigate, error]);

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToPages());
  };

  const handleSubmitPage = (values: IPageInput) => {
    dispatch(createOrUpdatePage(null, values));
  };

  return (
    <Layout
      actions={<ActionsMenu goToList={handleGoToList} />}
      isCard={false}
      title={t('cms:newPage')}
    >
      <Head title={t('cms:createPage')} />
      <PageForm onSubmit={handleSubmitPage} />
    </Layout>
  );
};

export default CreatePage;
