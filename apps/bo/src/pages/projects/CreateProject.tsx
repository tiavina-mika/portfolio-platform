import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';


import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { createOrUpdateProject, goToProject, goToProjects } from '@/redux/actions/project.action';
import { getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { getProjectProjectSelector } from '@/redux/reducers/project.reducer';
import { IProjectInput } from '@/types/project.type';

import ProjectForm from '../../containers/projects/ProjectForm';

const CreateProject = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  const newProject = useSelector(getProjectProjectSelector);
  const error = useSelector(getAppErrorSelector);

  useEffect(() => {
    if (error) return;
    if (!newProject) return;
    navigate(goToProject(newProject.id));
  }, [newProject, navigate]);

  const handleGoToList = () => {
    navigate(goToProjects());
  };

  const handleSubmitProject = (values: IProjectInput) => {
    dispatch(createOrUpdateProject(null, values));
  };

  return (
    <Layout
      isCard={false}
      actions={
        <ActionsMenu goToList={handleGoToList} />
      }
      title={(
        <span css={{ marginRight: 10 }}>{t('project.newProject')}</span>
      )}
    >
      <Head title={t('project.createProject')} />
      <ProjectForm
        onSubmit={handleSubmitProject}
      />
    </Layout>
  );
};

export default CreateProject;
