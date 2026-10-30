import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import PageForm from '@/containers/_core/pages/pageForms/PageForm';
import { useProtect } from '@/hooks/_core/useProtect';
import { createOrUpdatePage, goToPage, goToPages } from '@/redux/actions/_core/page.action';
import { IPageInput } from '@/types/_core/page.type';

const CreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  const {
    canFind,
  } = useProtect('Page');


  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToPages());
  };

  const handleSubmitPage = (values: IPageInput) => {
    dispatch(createOrUpdatePage({
      id: null,
      values,
      onSuccess: (id: string) => navigate(goToPage(id)),
    }));
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
