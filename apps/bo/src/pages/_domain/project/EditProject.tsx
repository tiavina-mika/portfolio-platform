import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionsMenu from '@/components/ActionsMenu';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { PROJECT_COLLECTION } from '@/constants/_domain/project.constants';
import PublishedChip from '@/containers/_core/cms/PublishedChip';
import ProjectForm from '@/containers/_domain/project/form/ProjectForm';
import { useProtect } from '@/hooks/_core/useProtect';
import {
  createOrUpdateProject,
  deleteProject, goToAddProject, goToProject, goToProjects,
} from '@/redux/actions/_domain/project.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { getProjectProjectSelector } from '@/redux/reducers/_domain/project.reducer';
import { IProjectInput } from '@/types/_domain/project.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

const EditProject = () => {
  const { t } = useTranslation(['common', 'project']);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const project = useSelector(getProjectProjectSelector);
  const locale = useSelector(getSettingsLocaleSelector);
  const {
    canPreview, canDelete, canCreate, canFind,
  } = useProtect(PROJECT_COLLECTION);

  if (!project) return null;

  const projectName = getTranslatedField(project.translated, locale, 'name');

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
    await dispatch(createOrUpdateProject({
      id: project.id,
      values,
      expectedUpdatedAt: project.updatedAt,
      onSuccess: (id: string) => navigate(goToProject(id)),
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
          {t('project:project.editProject', { name: projectName })}
          <PublishedChip published={project.active} />
        </>
      )}
    >
      <Head title={t('project:project.editProject', { name: projectName })} />
      <ProjectForm onSubmit={handleSubmitProject} project={project} />
    </Layout>
  );
};

export default EditProject;
