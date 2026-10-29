import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import ProjectForm from '@/containers/projects/ProjectForm';
import { useProtect } from '@/hooks/useProtect';
import {
  deleteProject, createOrUpdateProject, goToAddProject, goToProject, goToProjects,
} from '@/redux/actions/project.action';
import { getProjectProjectSelector } from '@/redux/reducers/project.reducer';
import { IProjectInput } from '@/types/project.type';

const EditProject = () => {
  const {
    t,
  } = useTranslation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const project = useSelector(getProjectProjectSelector);
  const {
    canPreview, canDelete, canCreate, canFind,
  } = useProtect('Project');

  if (!project) return null;

  const handlePreview = () => {
    if (!canPreview) return;
    navigate(goToProject(project.id));
  };

  const handleGoToList = () => {
    if (!canFind) return;
    navigate(goToProjects());
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    await dispatch(deleteProject(project.id));
    handleGoToList();
  };

  const handleCreate = () => {
    if (!canCreate) return;
    navigate(goToAddProject());
  };

  const handleSubmitProject = async (values: IProjectInput) => {
    if (!project) return;
    const error =await dispatch(createOrUpdateProject(project.id, values));

    if (error) return;

    navigate(goToProject(project.id));
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
        <span css={{ marginRight: 10 }}>{t('project.editProject', { title: project.id })}</span>
      )}
    >
      <Head title={t('project.editProject', { title: project.id })} />

      <ProjectForm
        onSubmit={handleSubmitProject}
        project={project}
      />
    </Layout>
  );
};

export default EditProject;
