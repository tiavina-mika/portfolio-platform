import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { PROJECT_COLLECTION } from '@/constants/_domain/project.constants';
import ProjectForm from '@/containers/_domain/project/form/ProjectForm';
import { useProtect } from '@/hooks/_core/useProtect';
import { createOrUpdateProject, goToProject, goToProjects } from '@/redux/actions/_domain/project.action';
import { IProjectInput } from '@/types/_domain/project.type';

const CreateProject = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation(['project']);

  const { canFind } = useProtect(PROJECT_COLLECTION);

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToProjects());
  };

  const handleSubmitProject = (values: IProjectInput) => {
    dispatch(createOrUpdateProject({
      id: null,
      values,
      onSuccess: (id: string) => navigate(goToProject(id)),
    }));
  };

  return (
    <Layout
      actions={<ActionsMenu goToList={handleGoToList} />}
      isCard={false}
      title={t('project:project.newProject')}
    >
      <Head title={t('project:project.createProject')} />
      <ProjectForm onSubmit={handleSubmitProject} />
    </Layout>
  );
};

export default CreateProject;
